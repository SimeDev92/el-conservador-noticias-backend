import { Allow, IsArray, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, IsUrl, Matches, MaxLength, Min, MinLength } from "class-validator";
import { ArticleCategory } from "../enums/article-category.enum";
import { ArticleStatus } from "../enums/article-status.enum";
import { ArticleType } from "../enums/article-type.enum";

export class CreateArticleDto {

    @IsString()
    @MinLength(10, {
        message: 'Title is too short',
    })
    @MaxLength(100, {
        message: 'Title is too long',
    })
    title: string;

    @IsString()
    @MinLength(10, {
        message: 'Subtitle is too short',
    })
    subtitle: string;

    @IsEnum(ArticleCategory)
    category: ArticleCategory;

    @IsString()
    author: string;

    @IsString()
    @Allow() // Permite cualquier string, incluyendo HTML
    content: string;
    
    @IsOptional()
    @IsUrl({}, { message: 'Image URL must be a valid URL' })
    imgUrl: string;


    @IsOptional()
    @IsUrl({}, { message: 'Video URL must be a valid URL' })
    videoUrl: string;

    @IsDateString()
    date: string;

    @IsEnum(ArticleStatus)
    status: ArticleStatus;

    @IsEnum(ArticleType)
    articleType: ArticleType;

    @IsArray()
    @IsOptional()
    tags: string[];

    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Min(0)
    @IsInt()
    views: number;

    @IsOptional()
    @IsString()
    @MinLength(6, {
        message: 'Slug is too short!',
    })
    @Matches(/^[a-z0-9_-]+$/, {
        message: 'Slug must only contain lowercase letters, numbers, hyphens, and underscores',
    })
    slug: string;

}
