import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MetricsController } from './metrics.controller';

@Module({
  imports: [ConfigModule],
  controllers: [MetricsController],
})
export class MetricsModule {}
