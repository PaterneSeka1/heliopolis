import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { AdhesionStatus, UserRole } from '../../generated/prisma/enums.js';
import type { AuthUser } from '../common/types/auth-user.js';

interface FindUsersQuery {
  role?: UserRole;
  parishId?: string;
  districtId?: string;
  search?: string;
}

interface UpdateAdhesionBody {
  annee: number;
  statut: AdhesionStatus;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll(@Query() query: FindUsersQuery, @CurrentUser() user: AuthUser) {
    return this.usersService.findAll(query, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.usersService.findOne(id, user);
  }

  @Roles(UserRole.ADMIN, UserRole.REGION)
  @Post()
  create(@Body() dto: CreateUserDto, @CurrentUser() user: AuthUser) {
    return this.usersService.create(dto, user);
  }

  @Roles(UserRole.ADMIN, UserRole.REGION)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.usersService.update(id, dto, user);
  }

  @Roles(UserRole.ADMIN, UserRole.REGION)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.usersService.remove(id, user);
  }

  @Roles(UserRole.ADMIN, UserRole.REGION, UserRole.SENTINELLE, UserRole.GUIDE)
  @Patch(':id/adhesion')
  updateAdhesion(
    @Param('id') id: string,
    @Body() body: UpdateAdhesionBody,
    @CurrentUser() user: AuthUser,
  ) {
    return this.usersService.updateAdhesion(
      id,
      body.annee,
      body.statut,
      user.id,
    );
  }
}
