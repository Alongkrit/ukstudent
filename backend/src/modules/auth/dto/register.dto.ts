import { IsArray, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';
export class RegisterDto {
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(8)
  password: string;
  @IsIn(['student', 'expert'])
  role: 'student' | 'expert';
  @IsOptional()
  @IsString()
  fullName?: string;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjects?: string[];
  @IsOptional()
  @IsString()
  university?: string;
  @IsOptional()
  @IsString()
  course?: string;
  @IsOptional()
  @IsString()
  yearOfStudy?: string;
  @IsOptional()
  @IsString()
  acceptedTermsAt?: string;
  @IsOptional()
  @IsString()
  qualifications?: string;
  @IsOptional()
  @IsString()
  bio?: string;
  @IsOptional()
  @IsString()
  paypalEmail?: string;
}