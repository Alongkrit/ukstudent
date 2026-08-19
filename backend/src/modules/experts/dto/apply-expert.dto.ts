import { ArrayNotEmpty, IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

export class ApplyExpertDto {
  @IsArray()
  @ArrayNotEmpty()
  subjects: string[];

  @IsString()
  qualifications: string;

  @IsString()
  bio: string;

  @IsOptional()
  @IsEmail()
  paypalEmail?: string;
}
