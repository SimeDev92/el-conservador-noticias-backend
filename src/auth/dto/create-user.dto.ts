import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {

    @IsEmail()
    email: string; 

    @IsString()
    name: string; 

    @IsString()
    surname: string; 

    @MinLength(6)
    password: string; 

    @IsString()
    @IsOptional()
    telegramUserId?: string;

}
