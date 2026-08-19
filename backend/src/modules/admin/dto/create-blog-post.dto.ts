import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateBlogPostDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  category: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  readTimeMin?: number;

  @IsOptional()
  published?: boolean;
}
