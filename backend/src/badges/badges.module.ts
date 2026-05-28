import { Module } from '@nestjs/common';
import { BadgesService } from './badges.service.js';
import { BadgesController } from './badges.controller.js';

@Module({
  providers: [BadgesService],
  controllers: [BadgesController],
  exports: [BadgesService],
})
export class BadgesModule {}
