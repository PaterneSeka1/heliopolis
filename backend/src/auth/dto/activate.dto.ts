import { IsString, Matches } from 'class-validator';

export class ActivateDto {
  @IsString()
  @Matches(/^\d{7}[A-Z]$/, { message: 'Matricule invalide (ex: 0525247O)' })
  declare matricule: string;
}
