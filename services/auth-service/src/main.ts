import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '@urls-cut/shared';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || parseInt(process.env.PORT || '3001', 10);
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
  const serviceName = configService.get<string>('SERVICE_NAME') || 'auth-service';

  // Validação de variáveis de ambiente obrigatórias
  if (nodeEnv === 'production') {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ ERROR: JWT_SECRET is required in production environment');
      console.error('   Please set the JWT_SECRET environment variable.');
      console.error('   Generate a secure secret: openssl rand -base64 32');
      process.exit(1);
    }

    const dbHost = process.env.DB_HOST;
    if (!dbHost) {
      console.error('❌ ERROR: DB_HOST is required in production environment');
      process.exit(1);
    }

    console.log('✅ Environment validation passed');
  }

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
    .setTitle('Auth Service - URL Shortener')
    .setDescription('Serviço de autenticação e gerenciamento de usuários')
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
    .addTag('auth', 'Endpoints de autenticação')
    .addTag('health', 'Endpoints de health check')
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
