import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as dayjs from 'dayjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Article } from '../articles/entities/article.entity.schema';
import { HttpService } from '@nestjs/axios';

enum NewsGenres {
  PRESS_RELEASE = 'PressRelease',
  USER_GENERATED = 'UserGenerated',
  BLOG = 'Blog',
  OPINION = 'Opinion',
}

@Injectable()
export class SitemapService {
  private readonly logger = new Logger(SitemapService.name);
  private readonly MAX_URLS_PER_SITEMAP = 50000;

  constructor(
    @InjectModel(Article.name)
    private readonly articleModel: Model<Article>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly httpService: HttpService,
  ) {}

  private escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }

  private validateSlug(slug: string): string {
    return encodeURIComponent(slug)
      .replace(/%(23|2C|2F|3F|5C)/g, '')
      .replace(/['"]/g, '');
  }

  private generateFallbackSitemap(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://elconservadornoticias.com/</loc>
    <priority>1.0</priority>
  </url>
</urlset>`;
  }

  async generateMainSitemap(page = 1): Promise<string> {
    try {
      const cacheKey = `main-sitemap-${page}`;
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) return cached as string;

      const skip = (page - 1) * this.MAX_URLS_PER_SITEMAP;
      const articles = await this.articleModel
        .find({ status: 'active' })
        .select('slug title date updatedAt')
        .sort({ date: -1 })
        .skip(skip)
        .limit(this.MAX_URLS_PER_SITEMAP)
        .lean()
        .exec();

      if (articles.length === 0) return '';

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      articles.forEach((article) => {
        const priority = Math.max(0.1, parseFloat((0.8 - (page * 0.1)).toFixed(1)));

        xml += `
  <url>
    <loc>https://elconservadornoticias.com/noticias/${this.validateSlug(article.slug)}</loc>
    <lastmod>${dayjs(article.date).format('YYYY-MM-DD')}</lastmod>
    <changefreq>${page === 1 ? 'daily' : 'weekly'}</changefreq>
    <priority>${priority}</priority>
  </url>`;
      });

      xml += '\n</urlset>';

      await this.cacheManager.set(cacheKey, xml, 3600); // Caché por 1 hora
      return xml;
    } catch (error) {
      this.logger.error(`Error main sitemap: ${error.message}`, error.stack);
      return this.generateFallbackSitemap();
    }
  }

  async generateNewsSitemap(): Promise<string> {
    try {
      const cacheKey = 'news-sitemap';
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) return cached as string;

      const twoDaysAgo = dayjs().subtract(2, 'days').toDate();
      const articles = await this.articleModel
        .find({ status: 'active', date: { $gte: twoDaysAgo } })
        .select('slug title date tags')
        .sort({ date: -1 })
        .lean()
        .exec();

      if (articles.length === 0) return '';

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;

      articles.forEach((article) => {
        xml += `
  <url>
    <loc>https://elconservadornoticias.com/noticias/${this.validateSlug(article.slug)}</loc>
    <news:news>
      <news:publication>
        <news:name>El Conservador Noticias</news:name>
        <news:language>es</news:language>
      </news:publication>
      <news:publication_date>${dayjs(article.date).format('YYYY-MM-DD')}</news:publication_date>
      <news:title>${this.escapeXml(article.title)}</news:title>
      ${article.tags?.length ? `<news:keywords>${this.escapeXml(article.tags.join(','))}</news:keywords>` : ''}
      <news:genres>${NewsGenres.PRESS_RELEASE},${NewsGenres.USER_GENERATED}</news:genres>
    </news:news>
  </url>`;
      });

      xml += '\n</urlset>';

      await this.cacheManager.set(cacheKey, xml, 3600); // Caché por 1 hora
      return xml;
    } catch (error) {
      this.logger.error(`Error news sitemap: ${error.message}`, error.stack);
      return '';
    }
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async handleSitemapRegeneration() {
    this.logger.log('Regenerando sitemaps programado');
    await this.cacheManager.del('main-sitemap-*');
    await this.cacheManager.del('news-sitemap');
    await this.generateMainSitemap(1);
    await this.generateNewsSitemap();
  }

  async getTotalSitemaps(): Promise<number> {
    const totalArticles = await this.articleModel.countDocuments({ status: 'active' });
    return Math.ceil(totalArticles / this.MAX_URLS_PER_SITEMAP);
  }


  async updateNewsSitemap() {
    await this.cacheManager.del('news-sitemap');
    await this.generateNewsSitemap();
  }
}
