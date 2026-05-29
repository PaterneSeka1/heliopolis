import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  declare ancienMotDePasse: string;

  @IsString()
  @MinLength(6)
  declare nouveauMotDePasse: string;
}
