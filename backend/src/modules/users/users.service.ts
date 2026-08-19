import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        createdAt: true,
        studentProfile: true,
        expertProfile: {
          include: {
            documents: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true, expertProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.phone !== undefined) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { phone: dto.phone },
      });
    }

    if (user.role === 'student') {
      const defaultName = user.email.split('@')[0].replace('.', ' ');
      const formattedDefaultName = defaultName
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      await this.prisma.studentProfile.upsert({
        where: { userId },
        create: {
          userId,
          fullName: dto.fullName || formattedDefaultName,
          university: dto.university || 'University',
          course: dto.course || 'General Studies',
          yearOfStudy: dto.yearOfStudy || 'First-Year',
        },
        update: {
          ...(dto.fullName !== undefined && { fullName: dto.fullName }),
          ...(dto.university && { university: dto.university }),
          ...(dto.course && { course: dto.course }),
          ...(dto.yearOfStudy && { yearOfStudy: dto.yearOfStudy }),
        },
      });
    }

    if (user.role === 'expert') {
      await this.prisma.expertProfile.upsert({
        where: { userId },
        create: {
          userId,
          subjects: dto.subjects || [],
          qualifications: dto.qualifications || '',
          bio: dto.bio || '',
          paypalEmail: dto.paypalEmail || user.email,
        },
        update: {
          ...(dto.subjects && { subjects: dto.subjects }),
          ...(dto.qualifications && { qualifications: dto.qualifications }),
          ...(dto.bio !== undefined && { bio: dto.bio }),
          ...(dto.paypalEmail && { paypalEmail: dto.paypalEmail }),
        },
      });
    }

    return this.findById(userId);
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new NotFoundException('No file provided');
    }
    const avatarUrl = `/api/v1/uploads/${file.filename || file.originalname}`;
    return { status: 'received', avatarUrl };
  }
}