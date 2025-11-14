import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from '../config/database.config';
import { User } from '../modules/users/entities/user.entity';
import { ShortUrl } from '../modules/urls/entities/short-url.entity';
import { Click } from '../modules/clicks/entities/click.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        return {
          ...dbConfig,
          entities: [User, ShortUrl, Click],
        };
      },
    }),
  ],
})
export class DatabaseModule {}
