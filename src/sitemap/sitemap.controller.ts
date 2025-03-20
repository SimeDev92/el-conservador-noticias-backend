import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { SitemapService } from './sitemap.service';

@Controller('sitemap')
export class SitemapController {
  constructor(private readonly sitemapService: SitemapService) {}

  @Get('sitemap.xml')
  async getSitemap(@Res() res: Response): Promise<void> {
    try {
      const xml = await this.sitemapService.generateMainSitemap();
      res.setHeader('Content-Type', 'application/xml');
      res.status(HttpStatus.OK).send(xml);
    } catch (error) {
      console.error('Error al generar el sitemap:', error.message);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error al generar el sitemap.');
    }
  }

  @Get('news-sitemap.xml')
  async getNewsSitemap(@Res() res: Response): Promise<void> {
    try {
      const xml = await this.sitemapService.generateNewsSitemap();
      res.setHeader('Content-Type', 'application/xml');
      res.status(HttpStatus.OK).send(xml);
    } catch (error) {
      console.error('Error al generar el news sitemap:', error.message);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error al generar el news sitemap.');
    }
  }
}
