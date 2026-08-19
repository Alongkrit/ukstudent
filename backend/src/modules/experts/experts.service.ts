import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ExpertDocumentType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { S3Service } from '../../common/s3/s3.service';
import { UploadService } from '../upload/upload.service';
import { ApplyExpertDto } from './dto/apply-expert.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Injectable()
export class ExpertsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
    private readonly uploadService: UploadService,
  ) {}

  async apply(userId: string, dto: ApplyExpertDto) {
    const profile = await this.prisma.expertProfile.upsert({
      where: { userId },
      create: {
        userId,
        subjects: dto.subjects,
        qualifications: dto.qualifications,
        bio: dto.bio,
        paypalEmail: dto.paypalEmail,
        verificationStatus: 'pending',
      },
      update: {
        subjects: dto.subjects,
        qualifications: dto.qualifications,
        bio: dto.bio,
        paypalEmail: dto.paypalEmail,
        verificationStatus: 'pending',
      },
    });

    return profile;
  }

  async updatePayPalAccount(userId: string, paypalEmail: string) {
    let profile = await this.prisma.expertProfile.findUnique({ where: { userId } });
    if (!profile) {
      profile = await this.prisma.expertProfile.create({
        data: {
          userId,
          qualifications: 'Higher Education Degree',
          subjects: [],
          paypalEmail,
          verificationStatus: 'pending',
        },
      });
    } else {
      profile = await this.prisma.expertProfile.update({
        where: { userId },
        data: { paypalEmail },
      });
    }
    return profile;
  }

  async uploadExpertDocument(userId: string, file: Express.Multer.File, docType: string) {
    if (!file) {
      throw new BadRequestException('No document file provided.');
    }

    let profile = await this.prisma.expertProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await this.prisma.expertProfile.create({
        data: {
          userId,
          subjects: [],
          qualifications: 'Higher Education Degree',
          verificationStatus: 'pending',
        },
      });
    }

    const fileResult = await this.uploadService.processAndSaveFile(file, userId);

    const isIdentity = docType === 'identity' || docType === 'government_id';
    const finalDocType: ExpertDocumentType = isIdentity ? 'identity' : 'qualification';

    const doc = await this.prisma.expertDocument.create({
      data: {
        expertId: userId,
        docType: finalDocType,
        fileUrl: fileResult.fileUrl,
        fileName: fileResult.fileName,
        mimeType: fileResult.mimeType,
        sizeBytes: fileResult.sizeBytes,
        storageKey: fileResult.storageKey,
        status: 'pending',
      },
    });

    // If application was previously rejected, uploading new proof resets status to pending
    if (profile.verificationStatus === 'rejected') {
      await this.prisma.expertProfile.update({
        where: { userId },
        data: {
          verificationStatus: 'pending',
          rejectionReason: null,
        },
      });
    }

    return doc;
  }

  async resubmitApplication(userId: string) {
    const profile = await this.prisma.expertProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Expert profile not found');
    }

    return this.prisma.expertProfile.update({
      where: { userId },
      data: {
        verificationStatus: 'pending',
        rejectionReason: null,
      },
    });
  }

  // EXP-2: issue a signed S3 upload URL and record a pending ExpertDocument
  async requestDocumentUploadUrl(userId: string, dto: UploadDocumentDto) {
    let profile = await this.prisma.expertProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await this.prisma.expertProfile.create({
        data: {
          userId,
          subjects: [],
          qualifications: '',
          verificationStatus: 'pending',
        },
      });
    }

    const { uploadUrl, fileUrl } = await this.s3.createUploadUrl(
      `expert-documents/${userId}`,
      dto.fileName,
      dto.mimeType,
    );

    const doc = await this.prisma.expertDocument.create({
      data: {
        expertId: userId,
        docType: dto.docType,
        fileUrl,
        fileName: dto.fileName,
        mimeType: dto.mimeType,
        status: 'pending',
      },
    });

    return { document: doc, uploadUrl };
  }

  async getStatus(userId: string) {
    const profile = await this.prisma.expertProfile.findUnique({
      where: { userId },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!profile) {
      return { verificationStatus: 'none', documents: [] };
    }

    return {
      verificationStatus: profile.verificationStatus,
      rejectionReason: profile.rejectionReason,
      isAvailable: profile.isAvailable,
      ratingAvg: profile.ratingAvg,
      paypalEmail: profile.paypalEmail,
      qualifications: profile.qualifications,
      subjects: profile.subjects,
      bio: profile.bio,
      documents: profile.documents,
    };
  }

  async updateAvailability(userId: string, dto: UpdateAvailabilityDto) {
    const profile = await this.prisma.expertProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Expert profile not found. Please complete your application first.');
    }

    if (profile.verificationStatus !== 'approved') {
      throw new BadRequestException('You must be verified by the Admin team before going online.');
    }

    return this.prisma.expertProfile.update({
      where: { userId },
      data: { isAvailable: dto.isAvailable },
    });
  }

  async findPublicProfile(expertId: string) {
    const expert = await this.prisma.user.findUnique({
      where: { id: expertId },
      select: {
        id: true,
        email: true,
        expertProfile: {
          include: {
            documents: true,
          },
        },
        reviewsReceived: {
          include: {
            student: {
              select: { email: true },
            },
          },
          take: 10,
        },
      },
    });

    if (!expert) {
      throw new NotFoundException('Expert not found');
    }

    return expert;
  }
}