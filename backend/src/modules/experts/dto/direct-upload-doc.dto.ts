import { IsOptional, IsString } from 'class-validator';

export class DirectUploadDocDto {
  @IsOptional()
  @IsString()
  docType?: string;
}
