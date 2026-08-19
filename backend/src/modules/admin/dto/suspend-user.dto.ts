import { IsEnum } from 'class-validator';
import { UserStatus } from '@prisma/client';

export class SuspendUserDto {
  @IsEnum(UserStatus)
  status: UserStatus;
}
