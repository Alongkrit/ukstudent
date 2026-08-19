import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async listConversationsForUser(user: AuthenticatedUser) {
    const where: any = {};
    if (user.role === 'student') {
      where.studentId = user.id;
    } else if (user.role === 'expert') {
      where.expertId = user.id;
    }

    return this.prisma.conversation.findMany({
      where,
      include: {
        request: {
          select: { title: true, subject: true, status: true },
        },
                student: {
          select: { id: true, email: true, studentProfile: { select: { fullName: true } } },
        },
        expert: {
          select: { id: true, email: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listMessages(user: AuthenticatedUser, conversationId: string, query: PaginationQueryDto) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (
      user.role !== 'admin' &&
      conversation.studentId !== user.id &&
      conversation.expertId !== user.id
    ) {
      throw new ForbiddenException('Access denied to conversation');
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;

        return this.prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, email: true, role: true, studentProfile: { select: { fullName: true } } },
        },
      },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

    async sendMessage(
    user: AuthenticatedUser,
    conversationId: string,
    body?: string,
    attachmentUrl?: string,
  ) {
    if (!body?.trim() && !attachmentUrl) {
      throw new ForbiddenException('Message must include text or an attachment.');
    }

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (
      user.role !== 'admin' &&
      conversation.studentId !== user.id &&
      conversation.expertId !== user.id
    ) {
      throw new ForbiddenException('Access denied to conversation');
    }

        const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        body: body || null,
        attachmentUrl: attachmentUrl || null,
      },
      include: {
        sender: {
          select: { id: true, email: true, role: true, studentProfile: { select: { fullName: true } } },
        },
      },
    });

    return message;
  }

  async markAsRead(user: AuthenticatedUser, conversationId: string) {
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: user.id },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return { status: 'success' };
  }
}