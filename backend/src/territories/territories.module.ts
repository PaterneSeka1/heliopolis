import { Module } from '@nestjs/common';
import { TerritoriesService } from './territories.service.js';
import { TerritoriesController } from './territories.controller.js';

@Module({
  providers: [TerritoriesService],
  controllers: [TerritoriesController],
})
export class TerritoriesModule {}
