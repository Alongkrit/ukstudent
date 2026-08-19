import { Injectable, NotFoundException } from '@nestjs/common';
import { ReportStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ReviewApplicationDto } from './dto/review-application.dto';
import { SuspendUserDto } from './dto/suspend-user.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const totalStudents = await this.prisma.user.count({ where: { role: 'student' } });
    const totalExperts = await this.prisma.user.count({ where: { role: 'expert' } });
    const pendingExpertsCount = await this.prisma.expertProfile.count({
      where: { verificationStatus: 'pending' },
    });
    const activeRequestsCount = await this.prisma.request.count({
      where: { status: { in: ['submitted', 'matching', 'matched', 'in_progress'] } },
    });
    const completedRequestsCount = await this.prisma.request.count({
      where: { status: 'completed' },
    });

    const payments = await this.prisma.payment.findMany({
      where: { status: 'paid' },
    });
    const gmv = payments.reduce((acc: number, p: { amount: unknown }) => acc + Number(p.amount), 0);

    return {
      totalStudents,
      totalExperts,
      pendingExpertsCount,
      activeRequestsCount,
      completedRequestsCount,
      gmv,
      currency: 'GBP',
    };
  }

  async listExpertApplications(status?: string) {
    return this.prisma.expertProfile.findMany({
      where: status ? { verificationStatus: status as any } : {},
      include: {
        user: {
          select: { id: true, email: true, phone: true, createdAt: true, studentProfile: true },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { userId: 'desc' },
    });
  }

  async reviewApplication(expertId: string, dto: ReviewApplicationDto) {
    const profile = await this.prisma.expertProfile.findUnique({
      where: { userId: expertId },
    });

    if (!profile) {
      throw new NotFoundException('Expert profile not found');
    }

    const updated = await this.prisma.expertProfile.update({
      where: { userId: expertId },
      data: {
        verificationStatus: dto.status,
        rejectionReason: dto.status === 'rejected' ? (dto.rejectionReason || 'Documents did not meet verification requirements.') : null,
        // If rejected, set available to false so expert cannot receive matches
        ...(dto.status === 'rejected' && { isAvailable: false }),
      },
      include: {
        documents: true,
      },
    });

    await this.prisma.expertDocument.updateMany({
      where: { expertId },
      data: {
        status: dto.status as any,
        rejectionReason: dto.status === 'rejected' ? (dto.rejectionReason || null) : null,
        reviewedAt: new Date(),
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: expertId,
        type: dto.status === 'approved' ? 'application_approved' : 'application_rejected',
        payload: {
          status: dto.status,
          rejectionReason: dto.rejectionReason,
          message:
            dto.status === 'approved'
              ? 'Congratulations! Your expert application has been approved. You are now eligible to receive request matches.'
              : `Your application was rejected: ${dto.rejectionReason || 'Documents missing or invalid'}`,
        },
      },
    });

    return updated;
  }

  async listUsers(search?: string) {
    const where: any = {};
    if (search) {
      where.email = { contains: search, mode: 'insensitive' };
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        createdAt: true,
        studentProfile: true,
        expertProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async setUserStatus(userId: string, dto: SuspendUserDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: dto.status },
    });
  }

  async listRequests(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    return this.prisma.request.findMany({
      where,
      include: {
        service: true,
        student: { select: { id: true, email: true } },
        matchedExpert: { select: { id: true, email: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRequestTranscript(requestId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { requestId },
      include: {
        messages: {
          include: {
            sender: { select: { id: true, email: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        student: { select: { email: true } },
        expert: { select: { email: true } },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation transcript not found');
    }

    return conversation;
  }

  // SEC-6: In-app report content submission
  async createReport(reporterId: string, dto: { requestId?: string; conversationId?: string; reason: string; details?: string }) {
    const report = await this.prisma.report.create({
      data: {
        reporterId,
        requestId: dto.requestId,
        conversationId: dto.conversationId,
        reason: dto.reason,
        details: dto.details,
        status: 'pending',
      },
    });

    return report;
  }

  // ADM-5 / SEC-6: reported conversations queue
  async moderationQueue(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    return this.prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: { id: true, email: true, role: true },
        },
        request: {
          select: { id: true, title: true, subject: true, status: true },
        },
        conversation: {
          select: { id: true, requestId: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ADM-5: Take action on reported content / user
  async resolveReport(adminId: string, reportId: string, actionTaken: string, newStatus: ReportStatus = ReportStatus.resolved) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: newStatus as any,
        actionTaken,
        resolvedById: adminId,
        resolvedAt: new Date(),
      },
    });

    // SEC-4: Write to AuditLog
    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'RESOLVE_MODERATION_REPORT',
        targetId: reportId,
        details: { actionTaken, newStatus },
      },
    });

    return updated;
  }
}