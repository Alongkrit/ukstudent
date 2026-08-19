import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { ExpertsService } from './experts.service';
import { ApplyExpertDto } from './dto/apply-expert.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { UpdatePayPalDto } from './dto/update-paypal.dto';

import { DirectUploadDocDto } from './dto/direct-upload-doc.dto';

// Epic 2 — Expert Onboarding & Verification
@Controller('experts')
export class ExpertsController {
  constructor(private readonly expertsService: ExpertsService) {}

  // EXP-1: application form (subjects, qualifications, bio, paypalEmail).
  @Post('apply')
  @UseGuards(JwtAuthGuard)
  apply(@CurrentUser() user: AuthenticatedUser, @Body() dto: ApplyExpertDto) {
    return this.expertsService.apply(user.id, dto);
  }

  // Update authenticated expert's PayPal payout email
  @Patch('payout-account')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('expert')
  updatePayPalAccount(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdatePayPalDto) {
    return this.expertsService.updatePayPalAccount(user.id, dto.paypalEmail);
  }

  // Direct multipart verification document upload (degree cert, transcript, govt ID, qualification)
  @Post('documents/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: DirectUploadDocDto,
  ) {
    return this.expertsService.uploadExpertDocument(user.id, file, dto?.docType || 'degree_certificate');
  }

  // Resubmit application after uploading corrected documents
  @Post('resubmit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('expert')
  resubmitApplication(@CurrentUser() user: AuthenticatedUser) {
    return this.expertsService.resubmitApplication(user.id);
  }

  // EXP-2: signed S3 upload URL for ID + qualification docs.
  @Post('documents')
  @UseGuards(JwtAuthGuard)
  requestDocumentUpload(@CurrentUser() user: AuthenticatedUser, @Body() dto: UploadDocumentDto) {
    return this.expertsService.requestDocumentUploadUrl(user.id, dto);
  }

  // EXP-3: authenticated expert's own verification status + documents.
  @Get('me/status')
  @UseGuards(JwtAuthGuard)
  getMyStatus(@CurrentUser() user: AuthenticatedUser) {
    return this.expertsService.getStatus(user.id);
  }

  // Public profile view.
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expertsService.findPublicProfile(id);
  }

  // EXP-7: online/offline flag used by the matching engine.
  @Patch('availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('expert')
  updateAvailability(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateAvailabilityDto) {
    return this.expertsService.updateAvailability(user.id, dto);
  }
}

