import { Module } from '@nestjs/common';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { MatchingModule } from '../matching/matching.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [MatchingModule, UploadModule],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
