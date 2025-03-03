import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateSuperAdminDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsString()
  surname: string;
}