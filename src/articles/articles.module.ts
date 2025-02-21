import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { Article, ArticleSchema } from './entities/article.entity.schema';
import { ImageUploadModule } from '../images/image-upload.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TelegramModule } from '../social/telegram/telegram.module';
import { FacebookModule } from '../social/facebook/facebook.module';
import { TwitterModule } from '../social/twitter/twitter.module';

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
    TelegramModule,
    FacebookModule,
    TwitterModule
  ]

})
export class ArticlesModule {}
