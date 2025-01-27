import { Body, Controller, Get, Logger, Post, Res } from '@nestjs/common';
import { FacebookService } from './facebook.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Controller('facebook')
export class FacebookController {
  private readonly logger = new Logger(FacebookController.name);
  
  constructor(
    private readonly facebookService: FacebookService,
    private configService: ConfigService
  ) {}

  public frontendUrl = this.configService.get<string>('FRONTEND_URL');
  
  @Get('refresh-token')
  async refreshToken(@Res() res: Response): Promise<void> {
    try {
      const newToken = await this.facebookService.refreshAccessToken();
      res.status(200).json({ success: true, token: newToken });
    } catch (error) {
      this.logger.error('Error refreshing Facebook token', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  @Post('share-news')
async shareNews(@Body() shareData: { newsId: string, imageUrl: string }, @Res() res: Response): Promise<void> {
  try {
    const link = `${this.frontendUrl}/news/${shareData.newsId}`;
    const result = await this.facebookService.shareNewsAsStory(shareData.newsId, shareData.imageUrl, link);
    res.status(200).json({ success: true, result });
  } catch (error) {
    this.logger.error('Error sharing news on Facebook', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
}
