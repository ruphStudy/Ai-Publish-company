import 'tsconfig-paths/register';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger as PinoLogger } from 'nestjs-pino';
import { json, urlencoded } from 'express';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { securityHeadersMiddleware } from './core/security/security-headers.middleware';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);

  app.useLogger(app.get(PinoLogger));
  app.setGlobalPrefix('api/v1');
  app.use(securityHeadersMiddleware);
  app.use(json({ limit: config.get<string>('security.bodyLimit', '1mb') }));
  app.use(urlencoded({ extended: false, limit: config.get<string>('security.bodyLimit', '1mb') }));
  const corsOrigins = config.get<string[]>('cors.origins', ['*']);
  app.enableCors({
    origin: corsOrigins.includes('*') ? true : corsOrigins,
    credentials: !corsOrigins.includes('*'),
  });
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  if (config.get<boolean>('swagger.enabled', true)) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('AI Publishing Company API')
      .setDescription('Enterprise API contract for the AI publishing platform.')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  const port = config.get<number>('api.port', 3000);
  await app.listen(port);
  Logger.log(`API listening on port ${port}`, 'Bootstrap');
}

void bootstrap();
