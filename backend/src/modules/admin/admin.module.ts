import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { BlogModule } from '../blog/blog.module';
// Epic 7 — Admin Console (API side). All routes here require
// role=admin (ADM-1) and are consumed by the future Admin web console.
@Module({
  imports: [BlogModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}