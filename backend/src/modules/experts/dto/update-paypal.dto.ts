import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdatePayPalDto {
  @IsNotEmpty()
  @IsEmail()
  paypalEmail: string;
}
