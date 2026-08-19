import { IsIn, IsOptional } from 'class-validator';

export class ListRequestsQueryDto {
  @IsOptional()
  @IsIn(['submitted', 'matching', 'matched', 'in_progress', 'completed', 'cancelled'])
  status?: string;
}
