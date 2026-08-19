import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(studentId: string, requestId: string, dto: CreateReviewDto) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (!request.matchedExpertId) {
      throw new BadRequestException('Request does not have a matched expert');
    }

    if (request.studentId !== studentId) {
      throw new BadRequestException('Only the student on this request can leave a review');
    }

    const review = await this.prisma.review.create({
      data: {
        requestId,
        studentId,
        expertId: request.matchedExpertId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });

    const expertReviews = await this.prisma.review.findMany({
      where: { expertId: request.matchedExpertId },
    });

    const avg: number =
      expertReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) /
      expertReviews.length;

    await this.prisma.expertProfile.update({
      where: { userId: request.matchedExpertId },
      data: { ratingAvg: avg },
    });

    return review;
  }

  async findForExpert(expertId: string) {
    return this.prisma.review.findMany({
      where: { expertId },
      include: {
        student: {
          select: { id: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}