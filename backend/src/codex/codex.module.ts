import { Module } from '@nestjs/common';
import { CodexService } from './codex.service.js';
import { CodexController } from './codex.controller.js';

@Module({
  providers: [CodexService],
  controllers: [CodexController],
})
export class CodexModule {}
