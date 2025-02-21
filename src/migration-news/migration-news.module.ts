import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MigrationService } from './migrate-news-to-articles';
import { NewsSchema } from 'src/articles/entities/news.entity.schema';
import { ArticleSchema } from 'src/articles/entities/article.entity.schema';
import { MigrationController } from './migration-news.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'News', schema: NewsSchema },
      { name: 'Article', schema: ArticleSchema },
    ]),
  ],
  controllers: [MigrationController], 
  providers: [MigrationService],
  exports: [MigrationService],
})
export class MigrationModule {}
