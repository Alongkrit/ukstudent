import { IsOptional, IsString, IsUrl } from 'class-validator';

export class SendMessageDto {
  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}