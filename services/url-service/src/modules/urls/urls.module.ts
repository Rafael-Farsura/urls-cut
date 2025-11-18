import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ShortUrl } from './entities/short-url.entity';
import { UrlsRepository } from './urls.repository';
import { UrlsService } from './urls.service';
import { UrlsController } from './urls.controller';
import { RedirectController } from './redirect.controller';
import { ClicksModule } from '../clicks/clicks.module';
import { ShortCodeGeneratorFactory, HashBasedGenerator, RandomGenerator } from '@urls-cut/shared';

@Module({
  imports: [TypeOrmModule.forFeature([ShortUrl]), ConfigModule, ClicksModule],
  controllers: [UrlsController, RedirectController],
  providers: [
    UrlsRepository,
    UrlsService,
    {
      provide: HashBasedGenerator,
      useFactory: (configService: ConfigService) => {
        return new HashBasedGenerator(configService);
      },
      inject: [ConfigService],
    },
    {
      provide: RandomGenerator,
      useFactory: (configService: ConfigService) => {
        return new RandomGenerator(configService);
      },
      inject: [ConfigService],
    },
    {
      provide: ShortCodeGeneratorFactory,
      useFactory: (
        configService: ConfigService,
        hashBasedGenerator: HashBasedGenerator,
        randomGenerator: RandomGenerator,
      ) => {
        return new ShortCodeGeneratorFactory(configService, hashBasedGenerator, randomGenerator);
      },
      inject: [ConfigService, HashBasedGenerator, RandomGenerator],
    },
  ],
  exports: [UrlsRepository, UrlsService],
})
export class UrlsModule {}
