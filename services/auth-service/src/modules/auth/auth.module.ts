import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwksController } from './jwks.controller';
import { UsersModule } from '../users/users.module';
import * as jwt from 'jsonwebtoken';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const expiresIn = configService.get<string>('jwt.expiresIn') || '24h';
        const secret = configService.get<string>('jwt.secret');
        
        if (!secret) {
          throw new Error(
            'JWT_SECRET is required. Please set the JWT_SECRET environment variable.',
          );
        }

        return {
          secret,
          signOptions: {
            expiresIn,
            issuer: 'urls-cut',
            audience: 'urls-cut-api',
          } as jwt.SignOptions,
        };
      },
    }),
  ],
  controllers: [AuthController, JwksController],
  providers: [JwtStrategy, AuthService],
  exports: [JwtModule, PassportModule, AuthService],
})
export class AuthModule {}
