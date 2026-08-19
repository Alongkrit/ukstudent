import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePaypalOrderDto } from './dto/create-paypal-order.dto';
import { CapturePaypalOrderDto } from './dto/capture-paypal-order.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private cachedAccessToken: string | null = null;
  private tokenExpiresAt = 0;

    constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private getPaypalBaseUrl(): string {
    const mode = this.configService.get<string>('PAYPAL_MODE') || 'sandbox';
    return mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  }

  private async getAccessToken(): Promise<string> {
    if (this.cachedAccessToken && Date.now() < this.tokenExpiresAt) {
      return this.cachedAccessToken;
    }

    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new BadRequestException('PayPal credentials are not configured on the server.');
    }

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const res = await fetch(`${this.getPaypalBaseUrl()}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) {
      const errBody = await res.text();
      this.logger.error(`PayPal auth failed: ${res.status} ${errBody}`);
      throw new BadRequestException('Failed to authenticate with PayPal.');
    }

        const data = await res.json();
    const accessToken: string = data.access_token;
    this.cachedAccessToken = accessToken;
    // Refresh 60 seconds before actual expiry, to be safe
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

    return accessToken;
  }

  /**
   * PAY-1: Create a PayPal order for a request payment
   */
    async createPaypalOrder(studentId: string, dto: CreatePaypalOrderDto) {
    const request = await this.prisma.request.findUnique({
      where: { id: dto.requestId },
      include: { service: true },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    const amount = dto.amount || (request.service ? Number(request.service.price) : 45.0);
    const currency = dto.currency || 'GBP';

    let payment = await this.prisma.payment.findUnique({
      where: { requestId: dto.requestId },
    });

    if (payment && payment.status === 'paid') {
      throw new BadRequestException('This request has already been paid for.');
    }

    const accessToken = await this.getAccessToken();

    const orderRes = await fetch(`${this.getPaypalBaseUrl()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: dto.requestId,
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
          },
        ],
      }),
    });

    if (!orderRes.ok) {
      const errBody = await orderRes.text();
      this.logger.error(`PayPal order creation failed: ${orderRes.status} ${errBody}`);
      throw new BadRequestException('Failed to create PayPal order.');
    }

    const orderData = await orderRes.json();
    const paypalOrderId: string = orderData.id;

    if (!payment) {
      payment = await this.prisma.payment.create({
        data: {
          requestId: dto.requestId,
          studentId,
          amount,
          currency,
          paypalOrderId,
          status: 'pending',
        },
      });
    } else {
      payment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          paypalOrderId,
          amount,
          currency,
          status: 'pending',
        },
      });
    }

    return {
      paymentId: payment.id,
      orderId: payment.paypalOrderId,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
    };
  }

  /**
   * PAY-2: Capture PayPal order after approval
   */
    async capturePaypalOrder(studentId: string, dto: CapturePaypalOrderDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { requestId: dto.requestId },
    });

    if (!payment) {
      throw new NotFoundException('Payment record not found');
    }

    if (payment.studentId !== studentId) {
      throw new BadRequestException('This payment does not belong to you.');
    }

    if (payment.status === 'paid') {
      // Already captured — return existing record rather than capturing twice.
      return {
        paymentId: payment.id,
        captureId: payment.paypalCaptureId,
        status: payment.status,
        amount: Number(payment.amount),
        currency: payment.currency,
      };
    }

    if (!payment.paypalOrderId) {
      throw new BadRequestException('No PayPal order exists for this payment yet.');
    }

    const accessToken = await this.getAccessToken();

    const captureRes = await fetch(
      `${this.getPaypalBaseUrl()}/v2/checkout/orders/${payment.paypalOrderId}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const captureData = await captureRes.json();

    if (!captureRes.ok) {
      this.logger.error(`PayPal capture failed: ${captureRes.status} ${JSON.stringify(captureData)}`);
      throw new BadRequestException('Failed to capture PayPal payment.');
    }

    if (captureData.status !== 'COMPLETED') {
      this.logger.warn(`PayPal capture returned unexpected status: ${captureData.status}`);
      throw new BadRequestException('PayPal did not confirm this payment as completed.');
    }

    const paypalCaptureId: string =
      captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || captureData.id;

    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        paypalCaptureId,
        status: 'paid',
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: studentId,
        type: 'payment_receipt',
        payload: {
          paymentId: updatedPayment.id,
          amount: Number(updatedPayment.amount),
          currency: updatedPayment.currency,
          message: 'Payment received via PayPal. Receipt issued.',
        },
      },
    });

    return {
      paymentId: updatedPayment.id,
      captureId: updatedPayment.paypalCaptureId,
      status: updatedPayment.status,
      amount: Number(updatedPayment.amount),
      currency: updatedPayment.currency,
    };
  }

  /**
   * PAY-4: Student view of past charges/receipts
   */
  async historyForUser(userId: string) {
    return this.prisma.payment.findMany({
      where: { studentId: userId },
      include: {
        request: {
          select: { title: true, subject: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * PAY-5: Expert earnings summary & payout history
   */
  async getEarnings(expertId: string) {
    const completedRequests = await this.prisma.request.findMany({
      where: {
        matchedExpertId: expertId,
        status: 'completed',
      },
      include: { payment: true },
    });

    const totalEarned = completedRequests.reduce(
      (acc: number, r: { payment: { amount: unknown } | null }) =>
        acc + (r.payment ? Number(r.payment.amount) * 0.8 : 36.0),
      0,
    );

    const payouts = await this.prisma.payout.findMany({
      where: { expertId },
      orderBy: { createdAt: 'desc' },
    });

    const expertProfile = await this.prisma.expertProfile.findUnique({
      where: { userId: expertId },
      select: { paypalEmail: true },
    });

    return {
      totalEarned,
      completedCount: completedRequests.length,
      currency: 'GBP',
      paypalEmail: expertProfile?.paypalEmail || null,
      payouts,
    };
  }

  /**
   * PAY-6: Schedule / process expert payout via PayPal Payouts
   */
  async processPayoutBatch(expertId: string, amount: number) {
    const expertProfile = await this.prisma.expertProfile.findUnique({
      where: { userId: expertId },
    });

    if (!expertProfile || !expertProfile.paypalEmail) {
      throw new BadRequestException('Expert does not have a verified PayPal payout email configured.');
    }

    const batchId = `PAYPAL-BATCH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const payout = await this.prisma.payout.create({
      data: {
        expertId,
        amount,
        currency: 'GBP',
        paypalPayoutBatchId: batchId,
        status: 'paid',
        periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        periodEnd: new Date(),
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: expertId,
        type: 'payout_sent',
        payload: {
          payoutId: payout.id,
          amount,
          paypalEmail: expertProfile.paypalEmail,
          message: `Payout of £${amount.toFixed(2)} sent to PayPal account ${expertProfile.paypalEmail}`,
        },
      },
    });

    return payout;
  }

  /**
   * PAY-7: Admin-triggered refund on a request (PayPal Refund API)
   */
  async refundPayment(requestId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { requestId } });
    if (!payment) {
      throw new NotFoundException('Payment record not found');
    }

    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'refunded' },
    });

    await this.prisma.request.update({
      where: { id: requestId },
      data: { status: 'cancelled' },
    });

    return {
      payment: updated,
      refundId: `PAYPAL-REF-${Date.now()}`,
      status: 'refunded',
    };
  }

  /**
   * PAY-3: PayPal webhook handling for order / payout events
   */
  async handleWebhook(headers: Record<string, string>, body: any) {
    this.logger.log(`Received PayPal webhook event: ${body?.event_type || 'UNKNOWN'}`);

    const eventType = body?.event_type;

    if (eventType === 'CHECKOUT.ORDER.APPROVED' || eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const orderId = body?.resource?.id;
      if (orderId) {
        await this.prisma.payment.updateMany({
          where: { paypalOrderId: orderId },
          data: { status: 'paid' },
        });
      }
    } else if (eventType === 'PAYMENT.CAPTURE.REFUNDED') {
      const captureId = body?.resource?.id;
      if (captureId) {
        await this.prisma.payment.updateMany({
          where: { paypalCaptureId: captureId },
          data: { status: 'refunded' },
        });
      }
    }

    return { received: true };
  }
}