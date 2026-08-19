import { IsString, IsUUID } from 'class-validator';

export class CapturePaypalOrderDto {
  @IsString()
  orderId: string;

  @IsUUID()
  requestId: string;
}
