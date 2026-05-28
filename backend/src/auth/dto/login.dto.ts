import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  declare identifier: string; // matricule or email

  @IsString()
  declare password: string;
}
