import { IsEnum, IsString } from 'class-validator';
import { ExpertDocumentType } from '@prisma/client';

export class UploadDocumentDto {
  @IsEnum(ExpertDocumentType)
  docType: ExpertDocumentType;

  @IsString()
  fileName: string;

  @IsString()
  mimeType: string;
}
