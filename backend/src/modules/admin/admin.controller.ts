import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import { ReviewApplicationDto } from './dto/review-application.dto';
import { SuspendUserDto } from './dto/suspend-user.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { BlogService } from '../blog/blog.service';
import { Delete } from '@nestjs/common';

@Controller('admin')
export class AdminController {
    constructor(
    private readonly adminService: AdminService,
    private readonly blogService: BlogService,
  ) {}

  // ADM-2: key metrics — active requests, pending applications, GMV, new users.
  @Get('overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  overview() {
    return this.adminService.overview();
  }

  // EXP-4: pending expert applications with document viewer.
  @Get('expert-applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  listApplications(@Query('status') status?: string) {
    return this.adminService.listExpertApplications(status);
  }

  // EXP-5: approve/reject application endpoint + email notification.
  @Patch('expert-applications/:expertId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  reviewApplication(@Param('expertId') expertId: string, @Body() dto: ReviewApplicationDto) {
    return this.adminService.reviewApplication(expertId, dto);
  }

  // ADM-3: searchable/filterable users directory, suspend/ban action.
  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  listUsers(@Query('search') search?: string) {
    return this.adminService.listUsers(search);
  }

  @Patch('users/:userId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  suspendUser(@Param('userId') userId: string, @Body() dto: SuspendUserDto) {
    return this.adminService.setUserStatus(userId, dto);
  }

  // ADM-4: filterable requests table, read-only chat transcript viewer.
  @Get('requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  listRequests(@Query('status') status?: string) {
    return this.adminService.listRequests(status);
  }

  @Get('requests/:id/transcript')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  requestTranscript(@Param('id') id: string) {
    return this.adminService.getRequestTranscript(id);
  }

  // SEC-6: User report submission endpoint
  @Post('reports')
  @UseGuards(JwtAuthGuard)
  createReport(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReportDto,
  ) {
    return this.adminService.createReport(user.id, dto);
  }

  // ADM-5: reported conversations queue.
  @Get('moderation')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  moderationQueue(@Query('status') status?: string) {
    return this.adminService.moderationQueue(status);
  }

  // ADM-5: Resolve/action moderation report
  @Patch('moderation/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
    resolveReport(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') reportId: string,
    @Body() dto: ResolveReportDto,
  ) {
    return this.adminService.resolveReport(user.id, reportId, dto.actionTaken, dto.status);
  }

  // BLOG-2: CMS — list all posts including drafts.
  @Get('blog')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  listBlogPosts() {
    return this.blogService.findAllForAdmin();
  }

  @Get('blog/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getBlogPost(@Param('id') id: string) {
    return this.blogService.findOneForAdmin(id);
  }

  @Post('blog')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  createBlogPost(@Body() dto: CreateBlogPostDto) {
    return this.blogService.create(dto);
  }

  @Patch('blog/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateBlogPost(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.blogService.update(id, dto);
  }

  @Delete('blog/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  deleteBlogPost(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
