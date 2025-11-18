import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER, Reflector } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import observabilityConfig from './config/observability.config';
import jwtConfig from './config/jwt.config';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './modules/health/health.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { UrlsModule } from './modules/urls/urls.module';
import { ClicksModule } from './modules/clicks/clicks.module';
import { GatewayAuthGuard } from './common/guards/gateway-auth.guard';
import { LoggingInterceptor, MetricsInterceptor, TimeoutInterceptor, HttpExceptionFilter } from '@urls-cut/shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, observabilityConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('jwt.secret');
        if (!secret) {
          throw new Error('JWT_SECRET is required');
        }
        return {
          secret,
          signOptions: {
            issuer: 'urls-cut',
            audience: 'urls-cut-api',
          },
        };
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const ttl = configService.get<number>('app.throttleTtl') || 60;
        const limit = configService.get<number>('app.throttleLimit') || 100;
        return {
          throttlers: [
            {
              ttl: ttl * 1000,
              limit,
            },
          ],
        };
      },
    }),
    DatabaseModule,
    HealthModule,
    MetricsModule,
    UrlsModule,
    ClicksModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector, jwtService: JwtService, configService: ConfigService) => {
        return new GatewayAuthGuard(reflector, jwtService, configService);
      },
      inject: [Reflector, JwtService, ConfigService],
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: (configService: ConfigService) => {
        return new LoggingInterceptor(configService);
      },
      inject: [ConfigService],
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: (configService: ConfigService) => {
        return new MetricsInterceptor(configService);
      },
      inject: [ConfigService],
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: (configService: ConfigService) => {
        return new TimeoutInterceptor(configService);
      },
      inject: [ConfigService],
    },
    {
      provide: APP_FILTER,
      useFactory: (configService: ConfigService) => {
        return new HttpExceptionFilter(configService);
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}

