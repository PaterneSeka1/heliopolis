import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { UserRole } from '../../../generated/prisma/enums.js';

export class CreateUserDto {
  @IsString()
  declare nom: string;

  @IsString()
  declare prenoms: string;

  @IsOptional()
  @IsString()
  matricule?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsDateString()
  dateNaissance?: string;

  @IsOptional()
  @IsString()
  regionId?: string;

  @IsOptional()
  @IsString()
  districtId?: string;

  @IsOptional()
  @IsString()
  parishId?: string;
}
