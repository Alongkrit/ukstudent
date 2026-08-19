import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // RATE-2: POST review, recompute expert rating_avg.
  @Post('requests/:requestId/review')
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('requestId') requestId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(user.id, requestId, dto);
  }

  // RATE-3: list of reviews on an expert's public profile.
  @Get('experts/:expertId/reviews')
  findForExpert(@Param('expertId') expertId: string) {
    return this.reviewsService.findForExpert(expertId);
  }
}
