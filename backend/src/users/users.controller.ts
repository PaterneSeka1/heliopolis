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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { AdhesionStatus, ProfileStatus, UserRole } from '../../generated/prisma/enums.js';
import type { AuthUser } from '../common/types/auth-user.js';

interface FindUsersQuery {
  role?: UserRole;
  parishId?: string;
  districtId?: string;
  search?: string;
}

interface UpdateAdhesionBody {
  annee: number | string;
  statut: AdhesionStatus;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Patch('me')
  updateMe(@Body() dto: UpdateMyProfileDto, @CurrentUser() user: AuthUser) {
    return this.usersService.updateMe(user.id, dto);
  }

  @Patch('me/avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads', 'avatars'),
      filename: (req, file, cb) => {
        cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase() || '.jpg'}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype));
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async updateAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthUser,
  ) {
    if (!file) throw new BadRequestException('Fichier image manquant ou format non supporté (JPEG, PNG, WebP)');
    return this.usersService.updateAvatar(user.id, file.filename);
  }

  @Get()
  findAll(@Query() query: FindUsersQuery, @CurrentUser() user: AuthUser) {
    return this.usersService.findAll(query, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.usersService.findOne(id, user);
  }

  @Roles(UserRole.ADMIN, UserRole.REGION, UserRole.SENTINELLE, UserRole.GUIDE)
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

  @Roles(UserRole.ADMIN)
  @Patch(':id/statut')
  updateStatut(
    @Param('id') id: string,
    @Body() body: { statut: ProfileStatus },
    @CurrentUser() user: AuthUser,
  ) {
    return this.usersService.updateStatut(id, body.statut, user);
  }

  @Roles(UserRole.ADMIN, UserRole.REGION)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.usersService.remove(id, user);
  }

  @Roles(UserRole.ADMIN, UserRole.REGION, UserRole.SENTINELLE, UserRole.GUIDE)
  @Patch(':id/adhesion')
  @UseInterceptors(FileInterceptor('preuve', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads', 'adhesions'),
      filename: (req, file, cb) => {
        cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase() || '.bin'}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      cb(null, ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.mimetype));
    },
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  updateAdhesion(
    @Param('id') id: string,
    @Body() body: UpdateAdhesionBody,
    @CurrentUser() user: AuthUser,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const annee = Number(body.annee);
    const preuveUrl = file ? `/uploads/adhesions/${file.filename}` : undefined;
    return this.usersService.updateAdhesion(
      id,
      annee,
      body.statut,
      user.id,
      preuveUrl,
    );
  }
}
