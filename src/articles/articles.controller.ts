import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, Query } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from 'src/common/dto/search.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post('create-article')
  @UseInterceptors(FilesInterceptor('files'))
  async createaArticle(
    @Body() createArticleDto: CreateArticleDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const imageFile = files?.find(file => file.mimetype.startsWith('image'));
    const videoFile = files?.find(file => file.mimetype.startsWith('video'));
    return this.articlesService.createArticle(createArticleDto, imageFile, videoFile);
  }

  @Get()
  findAll( @Query() paginationDto: PaginationDto ) {
    return this.articlesService.findAll(paginationDto);
  }

  @Get('category')
  findAllByCategory(@Query() paginationDto: PaginationDto) {
    return this.articlesService.findAllByCategory(paginationDto);
  }
  
  @Get('search')
  async searchNews(@Query() searchDto: SearchDto) {
    const { query, ...paginationDto } = searchDto;
    return this.articlesService.searchArticles(query, paginationDto);
  }
  
  
  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.articlesService.findOne( term )
  }

  @Get('date/:date')
  getNewsByDate(@Param('date') date: string) {
    return this.articlesService.getArticlesByDate(date);
  }


  @Patch(':term')
  update(@Param('term') term: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articlesService.update( term, updateArticleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articlesService.remove( id );
  }

  @Patch(':id/increment-views')
  async incrementViews(@Param('id') id: string) {
    return this.articlesService.incrementViews(id);
  }

}