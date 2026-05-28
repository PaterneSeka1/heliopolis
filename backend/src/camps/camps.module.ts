import { Module } from '@nestjs/common';
import { CampsService } from './camps.service.js';
import { CampsController } from './camps.controller.js';

@Module({
  providers: [CampsService],
  controllers: [CampsController],
  exports: [CampsService],
})
export class CampsModule {}
