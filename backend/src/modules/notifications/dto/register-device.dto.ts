import { IsIn, IsString } from 'class-validator';

export class RegisterDeviceDto {
  @IsString()
  deviceToken: string;

  @IsIn(['ios', 'android', 'web'])
  platform: 'ios' | 'android' | 'web';
}
