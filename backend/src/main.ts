import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.use(cookieParser());
  const config = app.get(ConfigService);

  const apiPrefix = config.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Scholza API')
    .setDescription('REST & WebSocket API for Students, Experts, and Admins')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  // DTO validation on every endpoint (Security & Access Document, Section 5)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS: only the known web app + admin origins (mobile calls the API
  // directly, outside the browser's CORS model — Security doc, 3.2.1)
  app.enableCors({
    origin: [
      config.get<string>('WEB_APP_ORIGIN', 'http://localhost:3000'),
      config.get<string>('ADMIN_APP_ORIGIN', 'http://localhost:3002'),
    ],
    credentials: true,
  });

  const port = Number(config.get<string>('PORT')) || 3001;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 Scholza API running on http://localhost:${port}/${apiPrefix}`);
}

bootstrap();
