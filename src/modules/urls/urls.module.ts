import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ShortUrl } from './entities/short-url.entity';
import { UrlsRepository } from './urls.repository';
import { UrlsService } from './urls.service';
import { UrlsController } from './urls.controller';
import { RedirectController } from './redirect.controller';
import { ClicksModule } from '../clicks/clicks.module';
import { ShortCodeGeneratorFactory } from '../../common/strategies/short-code/short-code-generator.factory';
import { HashBasedGenerator } from '../../common/strategies/short-code/hash-based.generator';
import { RandomGenerator } from '../../common/strategies/short-code/random.generator';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShortUrl]),
    ConfigModule,
    ClicksModule,
  ],
  controllers: [UrlsController, RedirectController],
  providers: [
    UrlsRepository,
    UrlsService,
    HashBasedGenerator,
    RandomGenerator,
    ShortCodeGeneratorFactory,
  ],
  exports: [UrlsRepository, UrlsService],
})
export class UrlsModule {}

