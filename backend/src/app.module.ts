import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { PrismaModule } from './common/prisma/prisma.module';
import { HealthController } from './health.controller';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ExpertsModule } from './modules/experts/experts.module';
import { ServicesModule } from './modules/services/services.module';
import { RequestsModule } from './modules/requests/requests.module';
import { MatchingModule } from './modules/matching/matching.module';
import { ChatModule } from './modules/chat/chat.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BlogModule } from './modules/blog/blog.module';
import { AdminModule } from './modules/admin/admin.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Redis-backed rate limiting on auth & payment endpoints (SEC-2)
    ThrottlerModule.forRoot([
      {
        ttl: 600000, // 10 minutes
        limit: 5, // 5 attempts per IP per 10 minutes
      },
    ]),

    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ExpertsModule,
    ServicesModule,
    RequestsModule,
    MatchingModule,
    ChatModule,
    PaymentsModule,
    ReviewsModule,
    NotificationsModule,
    BlogModule,
    AdminModule,
    UploadModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
