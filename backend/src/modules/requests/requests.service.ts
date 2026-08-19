import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CreateRequestDto } from './dto/create-request.dto';
import { ListRequestsQueryDto } from './dto/list-requests-query.dto';
import { AddAttachmentDto } from './dto/add-attachment.dto';
import { MatchingService } from '../matching/matching.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class RequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matchingService: MatchingService,
    private readonly uploadService: UploadService,
  ) {}

  async create(studentId: string, dto: CreateRequestDto) {
    const request = await this.prisma.request.create({
      data: {
        studentId,
        serviceId: dto.serviceId,
        subject: dto.subject,
        title: dto.title,
        description: dto.description,
        deadlineAt: new Date(dto.deadlineAt),
        status: 'matching',
        ...(dto.attachments && dto.attachments.length > 0 && {
          attachments: {
            create: dto.attachments.map((att) => ({
              fileUrl: att.fileUrl,
              fileName: att.fileName,
              storageKey: att.storageKey || null,
              mimeType: att.mimeType || null,
              sizeBytes: att.sizeBytes || null,
              uploadedBy: studentId,
            })),
          },
        }),
      },
      include: {
        service: true,
        attachments: true,
      },
    });

    await this.matchingService.broadcastRequest(request.id, request.subject);

    return request;
  }

  async findAllForUser(user: AuthenticatedUser, query: ListRequestsQueryDto) {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (user.role === 'student') {
      where.studentId = user.id;
        } else if (user.role === 'expert') {
      where.OR = [
        { matchedExpertId: user.id },
        { status: 'matching' },
      ];
    }

    return this.prisma.request.findMany({
      where,
      include: {
        service: true,
        student: {
          select: { id: true, email: true, studentProfile: true },
        },
        matchedExpert: {
          select: { id: true, email: true, expertProfile: true },
        },
        attachments: true,
        conversation: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneForUser(user: AuthenticatedUser, id: string) {
    const request = await this.prisma.request.findUnique({
      where: { id },
      include: {
        service: true,
        student: {
          select: {
            id: true,
            email: true,
            studentProfile: true,
          },
        },
        matchedExpert: {
          select: {
            id: true,
            email: true,
            expertProfile: true,
          },
        },
        attachments: true,
        conversation: true,
        payment: true,
        review: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (
      user.role !== 'admin' &&
      request.studentId !== user.id &&
      request.matchedExpertId !== user.id &&
      request.status !== 'matching'
    ) {
      throw new ForbiddenException('Access denied to this request');
    }

    return request;
  }

  async addAttachment(user: AuthenticatedUser, requestId: string, dto: AddAttachmentDto) {
    const request = await this.prisma.request.findUnique({ where: { id: requestId } });
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (user.role !== 'admin' && request.studentId !== user.id && request.matchedExpertId !== user.id) {
      throw new ForbiddenException('Access denied to request');
    }

    return this.prisma.requestAttachment.create({
      data: {
        requestId,
        fileUrl: dto.fileUrl,
        fileName: dto.fileName,
        storageKey: dto.storageKey || null,
        mimeType: dto.mimeType || null,
        sizeBytes: dto.sizeBytes || null,
        uploadedBy: user.id,
      },
    });
  }

  async deleteAttachment(user: AuthenticatedUser, requestId: string, attachmentId: string) {
    const attachment = await this.prisma.requestAttachment.findUnique({
      where: { id: attachmentId },
      include: { request: true },
    });

    if (!attachment || attachment.requestId !== requestId) {
      throw new NotFoundException('Attachment not found');
    }

    if (
      user.role !== 'admin' &&
      attachment.uploadedBy !== user.id &&
      attachment.request.studentId !== user.id
    ) {
      throw new ForbiddenException('You do not have permission to delete this attachment.');
    }

    if (attachment.storageKey) {
      await this.uploadService.deleteFile(attachment.storageKey);
    }

    await this.prisma.requestAttachment.delete({
      where: { id: attachmentId },
    });

    return { status: 'deleted', attachmentId };
  }

  async accept(user: AuthenticatedUser, requestId: string) {
    if (user.role !== 'expert') {
      throw new ForbiddenException('Only experts can accept requests');
    }

    const expertProfile = await this.prisma.expertProfile.findUnique({
      where: { userId: user.id },
    });

    if (!expertProfile || expertProfile.verificationStatus !== 'approved') {
      throw new ForbiddenException('Your account must be verified and approved by the Admin team before accepting student requests.');
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const request = await tx.request.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        throw new NotFoundException('Request not found');
      }

      if (request.status !== 'matching' && request.status !== 'submitted') {
        throw new BadRequestException('Request is no longer available for matching');
      }

      const updatedRequest = await tx.request.update({
        where: { id: requestId },
        data: {
          status: 'in_progress',
          matchedExpertId: user.id,
        },
        include: {
          student: true,
          matchedExpert: true,
        },
      });

      const conversation = await tx.conversation.create({
        data: {
          requestId: updatedRequest.id,
          studentId: updatedRequest.studentId,
          expertId: user.id,
          status: 'active',
        },
      });

      await tx.notification.create({
        data: {
          userId: updatedRequest.studentId,
          type: 'request_matched',
          payload: {
            requestId: updatedRequest.id,
            conversationId: conversation.id,
            expertId: user.id,
            message: 'Your expert has accepted your request! Chat is now open.',
          },
        },
      });

      return { request: updatedRequest, conversation };
    });
  }

  async decline(user: AuthenticatedUser, requestId: string) {
    return { status: 'declined', requestId };
  }

  async complete(user: AuthenticatedUser, requestId: string) {
    const request = await this.prisma.request.findUnique({ where: { id: requestId } });
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (user.role !== 'admin' && request.studentId !== user.id && request.matchedExpertId !== user.id) {
      throw new ForbiddenException('Only the student or assigned expert can complete the request');
    }

    const updated = await this.prisma.request.update({
      where: { id: requestId },
      data: { status: 'completed' },
    });

    const notifyUser = user.id === request.studentId ? request.matchedExpertId : request.studentId;
    if (notifyUser) {
      await this.prisma.notification.create({
        data: {
          userId: notifyUser,
          type: 'moderation_action',
          payload: {
            requestId,
            message: 'Request marked as completed.',
          },
        },
      });
    }

    return updated;
  }

  async cancel(user: AuthenticatedUser, requestId: string) {
    const request = await this.prisma.request.findUnique({ where: { id: requestId } });
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (user.role !== 'admin' && request.studentId !== user.id) {
      throw new ForbiddenException('Only the student or admin can cancel the request');
    }

    return this.prisma.request.update({
      where: { id: requestId },
      data: { status: 'cancelled' },
    });
  }
}
