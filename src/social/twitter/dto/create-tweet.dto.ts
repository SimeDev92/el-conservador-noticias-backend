import { IsString, IsOptional } from 'class-validator';

export class CreateTweetDto {
  @IsString()
  text: string;

  @IsString()
  @IsOptional()
  url?: string;
}
