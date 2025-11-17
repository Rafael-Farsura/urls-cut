import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || parseInt(process.env.PORT || '3002', 10);
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
  const serviceName = configService.get<string>('SERVICE_NAME') || 'url-service';

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN') || '*',
    credentials: true,
  });

  // ValidationPipe global
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

  // HttpExceptionFilter global
  app.useGlobalFilters(new HttpExceptionFilter(configService));

  // Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('URL Service - URL Shortener')
    .setDescription('Serviço de encurtamento e gerenciamento de URLs')
    .setVersion('0.1.0')
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

  console.log(`🚀 ${serviceName} is running on: http://localhost:${port}`);
  console.log(`📚 Environment: ${nodeEnv}`);
  console.log(`📖 Swagger documentation: http://localhost:${port}/api-docs`);
}
bootstrap();

