import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReportStatus } from '@prisma/client';

export class ResolveReportDto {
  @IsString()
  actionTaken: string;

  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;
}
