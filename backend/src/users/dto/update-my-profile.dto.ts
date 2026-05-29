import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UpdateMyProfileDto {
  @IsOptional()
  @IsString()
  declare nom?: string;

  @IsOptional()
  @IsString()
  declare prenoms?: string;

  @IsOptional()
  @IsEmail()
  declare email?: string;

  @IsOptional()
  @IsString()
  declare telephone?: string;
}
