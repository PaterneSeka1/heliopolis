import { Controller, Get, UseGuards } from '@nestjs/common';
import { BadgesService } from './badges.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../common/types/auth-user.js';

@Controller('badges')
export class BadgesController {
  constructor(private badgesService: BadgesService) {}

  @Get()
  findAll() {
    return this.badgesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  getMyBadges(@CurrentUser() user: AuthUser) {
    return this.badgesService.getMyBadges(user.id);
  }
}
