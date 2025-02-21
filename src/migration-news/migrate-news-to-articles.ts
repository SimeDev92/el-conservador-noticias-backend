import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article } from 'src/articles/entities/article.entity.schema';
import { News } from 'src/articles/entities/news.entity.schema';

@Injectable()
export class MigrationService {
  constructor(
    @InjectModel('News') private readonly newsModel: Model<News>,
    @InjectModel('Article') private readonly articleModel: Model<Article>,
  ) {}

  async migrateNewsToArticles() {
    console.log('🚀 Iniciando migración de news a articles...');

    const newsList = await this.newsModel.find().exec();
    if (!newsList.length) {
      console.log('❌ No hay noticias para migrar.');
      return;
    }

    const articlesToInsert = newsList.map((news) => {
        const validStatus = news.status && ['active', 'inactive'].includes(news.status) ? news.status : 'inactive';
        // Comprobamos si el valor de news.newsType es 'subcover' y lo reemplazamos por 'general'
  const validArticleType = news.newsType === 'subcover' ? 'general' : news.newsType;
        return {
          _id: news._id,
          title: news.title,
          subtitle: 'Sin subtítulo',  // Se asegura de que se incluya, sin depender de 'news.subtitle'
          category: news.category || 'Uncategorized',
          author: 'Redacción',
          content: news.content,
          imgUrl: news.imgUrl || '',
          videoUrl: '',
          date: news.date,
          status: validStatus,
          articleType: validArticleType,
          tags: news.tags || [],
          views: news.views || 0,
          slug: this.generateSlug(news.title),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });
      
      
    await this.articleModel.insertMany(articlesToInsert);
    console.log(`✅ Migración completada: ${articlesToInsert.length} noticias migradas.`);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
