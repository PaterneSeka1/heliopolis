import { Module } from '@nestjs/common';
import { ChallengesService } from './challenges.service.js';
import { ChallengesController } from './challenges.controller.js';

@Module({
  providers: [ChallengesService],
  controllers: [ChallengesController],
})
export class ChallengesModule {}
