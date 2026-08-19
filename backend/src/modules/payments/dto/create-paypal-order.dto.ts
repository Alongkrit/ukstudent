import { IsUUID, IsOptional, IsNumber, IsString } from 'class-validator';

export class CreatePaypalOrderDto {
  @IsUUID()
  requestId: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;
}
