import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RegisterDeviceDto } from './dto/register-device.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });

    return { status: 'success' };
  }

  // NOTE: not yet persisted anywhere — there's no Device table in the schema
  // yet, so this can't actually enable push notifications. Flagging as a
  // follow-up alongside the OneSignal/email integration gap.
  async registerDevice(userId: string, dto: RegisterDeviceDto) {
    return { status: 'registered', userId, deviceToken: dto.deviceToken, platform: dto.platform };
  }
}