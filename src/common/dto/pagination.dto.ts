import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ArticleCategory } from '../../articles/enums/article-category.enum';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number) // 👈 Convierte a número antes de la validación
  @IsNumber()
  @Min(0)
  limit?: number;

  @IsOptional()
  @Type(() => Number) // 👈 Convierte a número antes de la validación
  @IsNumber()
  @Min(0)
  offset?: number;

  @IsOptional()
  @IsEnum(ArticleCategory)
  category?: ArticleCategory;
}