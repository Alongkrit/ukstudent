import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AddAttachmentDto {
  @IsString()
  fileUrl: string;

  @IsString()
  fileName: string;

  @IsOptional()
  @IsString()
  storageKey?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsNumber()
  sizeBytes?: number;
}
