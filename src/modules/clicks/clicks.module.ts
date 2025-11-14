import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Click } from './entities/click.entity';
import { ClicksRepository } from './clicks.repository';
import { ClicksService } from './clicks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Click])],
  providers: [ClicksRepository, ClicksService],
  exports: [ClicksRepository, ClicksService],
})
export class ClicksModule {}

