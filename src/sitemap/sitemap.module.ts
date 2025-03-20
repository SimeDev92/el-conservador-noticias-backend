import { Module } from '@nestjs/common';
import { SitemapService } from './sitemap.service';
import { SitemapController } from './sitemap.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticleSchema } from '../articles/entities/article.entity.schema';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([{ 
      name: Article.name, 
      schema: ArticleSchema 
    }]),
      CacheModule.register({
      ttl: 3600, // 1 hora en segundos
      max: 100 // Máximo 100 items en caché
    }),
    ScheduleModule.forRoot(),

    HttpModule
  ],
  controllers: [SitemapController],
  providers: [SitemapService],
  exports: [SitemapService]
})
export class SitemapModule {}
