import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateBlogPostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  readTimeMin?: number;

  @IsOptional()
  published?: boolean;
}