import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateReportDto {
  @IsOptional()
  @IsUUID()
  requestId?: string;

  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  details?: string;
}
