import { Module } from '@nestjs/common';
import { ExpertsController } from './experts.controller';
import { ExpertsService } from './experts.service';
import { S3Module } from '../../common/s3/s3.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [S3Module, UploadModule],
  controllers: [ExpertsController],
  providers: [ExpertsService],
  exports: [ExpertsService],
})
export class ExpertsModule {}