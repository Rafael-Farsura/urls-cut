import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 3000;
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN') || '*',
    credentials: true,
  });

  // ValidationPipe global (Fase 9.1)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // HttpExceptionFilter global (Fase 9.2)
  app.useGlobalFilters(new HttpExceptionFilter(configService));

  // Swagger/OpenAPI (Fase 12.1)
  const config = new DocumentBuilder()
    .setTitle('URL Shortener API')
    .setDescription('API REST para encurtamento de URLs construída com NestJS')
    .setVersion('0.5.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Endpoints de autenticação')
    .addTag('urls', 'Endpoints de gerenciamento de URLs')
    .addTag('health', 'Endpoints de health check')
    .addTag('metrics', 'Endpoints de métricas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Environment: ${nodeEnv}`);
  console.log(`📖 Swagger documentation: http://localhost:${port}/api-docs`);
}
bootstrap();
