import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { CampType } from '../../../generated/prisma/enums.js';

export class CreateCampDto {
  @IsString()
  declare nom: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  declare dateDebut: string;

  @IsDateString()
  declare dateFin: string;

  @IsString()
  declare lieu: string;

  @IsEnum(CampType)
  declare type: CampType;

  @IsOptional()
  @IsArray()
  districtIds?: string[];

  @IsOptional()
  @IsBoolean()
  selectionOuverte?: boolean;
}
