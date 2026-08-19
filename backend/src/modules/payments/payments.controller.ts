import { Body, Controller, Get, Headers, Post, Req, UseGuards, Param } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { CreatePaypalOrderDto } from './dto/create-paypal-order.dto';
import { CapturePaypalOrderDto } from './dto/capture-paypal-order.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // PAY-1: POST /payments/create-order
  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  createOrder(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreatePaypalOrderDto) {
    return this.paymentsService.createPaypalOrder(user.id, dto);
  }

  // PAY-2: POST /payments/capture-order
  @Post('capture-order')
  @UseGuards(JwtAuthGuard)
  captureOrder(@CurrentUser() user: AuthenticatedUser, @Body() dto: CapturePaypalOrderDto) {
    return this.paymentsService.capturePaypalOrder(user.id, dto);
  }

  // PAY-3: PayPal webhook endpoint
  @Post('webhook')
  handleWebhook(@Req() req: Request, @Headers() headers: Record<string, string>) {
    return this.paymentsService.handleWebhook(headers, req.body);
  }

  // PAY-4: Student view of past charges/receipts
  @Get('history')
  @UseGuards(JwtAuthGuard)
  history(@CurrentUser() user: AuthenticatedUser) {
    return this.paymentsService.historyForUser(user.id);
  }

  // PAY-5: Expert view of earnings
  @Get('earnings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('expert')
  earnings(@CurrentUser() user: AuthenticatedUser) {
    return this.paymentsService.getEarnings(user.id);
  }

  // PAY-6: Execute payout batch (Admin)
  @Post('payout/:expertId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  payout(@Param('expertId') expertId: string, @Body('amount') amount: number) {
    return this.paymentsService.processPayoutBatch(expertId, amount || 100.0);
  }

  // PAY-7: Admin-triggered refund on a request
  @Post('refund/:requestId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  refund(@Param('requestId') requestId: string) {
    return this.paymentsService.refundPayment(requestId);
  }
}
