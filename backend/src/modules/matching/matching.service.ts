import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Broadcast a newly created request to eligible experts based on subject & availability (REQ-5)
   */
  async broadcastRequest(requestId: string, subject: string) {
    this.logger.log(`Broadcasting request ${requestId} for subject: ${subject}`);

    // Query eligible experts: approved verification status & available
    const experts = await this.prisma.expertProfile.findMany({
      where: {
        verificationStatus: 'approved',
        isAvailable: true,
        subjects: {
          has: subject,
        },
      },
      include: {
        user: true,
      },
      take: 5,
    });

    // Fallback: if no exact subject match, find any available approved expert
    let candidateExperts = experts;
    if (candidateExperts.length === 0) {
      candidateExperts = await this.prisma.expertProfile.findMany({
        where: {
          verificationStatus: 'approved',
          isAvailable: true,
        },
        include: {
          user: true,
        },
        take: 5,
      });
    }

    // Create notifications for matched candidate experts
    for (const expert of candidateExperts) {
      await this.prisma.notification.create({
        data: {
          userId: expert.userId,
          type: 'request_matched',
          payload: {
            requestId,
            subject,
            message: `New request available in ${subject}`,
          },
        },
      });
    }

    return candidateExperts;
  }

  /**
   * Widen matching pool if timeout reached (REQ-8)
   */
  async widenMatchingPool(requestId: string) {
    await this.prisma.request.update({
      where: { id: requestId },
      data: {
        matchingWidenedAt: new Date(),
      },
    });

    const allExperts = await this.prisma.expertProfile.findMany({
      where: {
        verificationStatus: 'approved',
        isAvailable: true,
      },
      take: 10,
    });

    for (const expert of allExperts) {
      await this.prisma.notification.create({
        data: {
          userId: expert.userId,
          type: 'request_matched',
          payload: {
            requestId,
            message: `Widened matching pool: new request available!`,
          },
        },
      });
    }

    return allExperts;
  }
}
