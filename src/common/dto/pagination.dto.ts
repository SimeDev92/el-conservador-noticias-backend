import { IsNumber, IsOptional, Min } from "class-validator";

export class PaginationDto {

    @IsOptional()
    @IsNumber()
    @Min(0)
    limit?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    offset?: number; 
}