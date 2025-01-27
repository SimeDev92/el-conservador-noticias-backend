import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { TwitterApi, TwitterApiReadWrite } from 'twitter-api-v2';

@Injectable()
export class TwitterService {
  private client: TwitterApiReadWrite;
  private readonly logger = new Logger(TwitterService.name);

  constructor(private readonly configService: ConfigService) {
    try {
      // Obtener claves desde ConfigService
      const appKey = this.configService.get<string>('TWITTER_API_KEY');
      const appSecret = this.configService.get<string>('TWITTER_API_SECRET_KEY');
      const accessToken = this.configService.get<string>('TWITTER_ACCESS_TOKEN');
      const accessSecret = this.configService.get<string>('TWITTER_ACCESS_TOKEN_SECRET');

      // Verificar que todas las claves estén configuradas
      if (!appKey || !appSecret || !accessToken || !accessSecret) {
        throw new Error('Twitter API credentials are missing');
      }

      // Inicializar cliente de Twitter
      const twitterClient = new TwitterApi({
        appKey,
        appSecret,
        accessToken,
        accessSecret,
      });

      // Asignar cliente con permisos de lectura y escritura
      this.client = twitterClient.readWrite;

      if (!this.client) {
        this.logger.error('Twitter client initialization failed');
      }
    } catch (error) {
      this.logger.error('Error initializing TwitterService', error);
      throw error;
    }
  }

  async postTweet(createTweetDto: CreateTweetDto): Promise<any> {
    const { text, url } = createTweetDto;
    const tweetText = url ? `${text}\n${url}` : text;

    try {
      const tweetResponse = await this.client.v2.tweet(tweetText);
      return tweetResponse;
    } catch (error) {
      this.logger.error('Error posting tweet:', error);
      throw new Error(`Failed to post tweet: ${error.message}`);
    }
  }

}
