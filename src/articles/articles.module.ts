import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { Article, ArticleSchema } from './entities/article.entity.schema';
import { ImageUploadModule } from 'src/images/image-upload.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TelegramService } from 'src/social/telegram/telegram.service';
import { TelegramModule } from 'src/social/telegram/telegram.module';

@Module({
  controllers: [ArticlesController],
  providers: [ArticlesService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Article.name,
        schema: ArticleSchema
      }
    ]),
    ImageUploadModule,
    TelegramModule
  ]

})
export class ArticlesModule {}
