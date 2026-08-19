import { IsArray, IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddAttachmentDto } from './add-attachment.dto';

export class CreateRequestDto {
  @IsUUID()
  serviceId: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  deadlineAt: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddAttachmentDto)
  attachments?: AddAttachmentDto[];
}
