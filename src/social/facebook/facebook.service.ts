import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class FacebookService {
  private readonly logger = new Logger(FacebookService.name);
  private PAGE_ID: string;
  private ACCESS_TOKEN: string;
  private readonly API_VERSION = 'v21.0';

  constructor(private configService: ConfigService) {
    this.initializeService();
  }

  private initializeService() {
    try {
      this.PAGE_ID = this.configService.get<string>('FACEBOOK_PAGE_ID');
      this.ACCESS_TOKEN = this.configService.get<string>('FACEBOOK_PAGE_ACCESS_TOKEN');

      if (!this.ACCESS_TOKEN) {
        this.logger.error('Facebook access token is missing');
      }
      if (!this.PAGE_ID) {
        this.logger.error('Facebook page ID is missing');
      }
    } catch (error) {
      this.logger.error('Error initializing FacebookService', error);
    }
  }

  async postToFacebook( link: string): Promise<any> {
    try {
      const url = `https://graph.facebook.com/${this.API_VERSION}/${this.PAGE_ID}/feed`;
      const data = {  link, access_token: this.ACCESS_TOKEN };
  
      const response = await axios.post(url, data);
      this.logger.log(`Successfully posted to Facebook: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      this.logger.error(`Error posting to Facebook: ${JSON.stringify(error.response?.data || error)}`);
      throw new Error(`Failed to post to Facebook: ${errorMessage}`);
    }
  }
  
  async refreshAccessToken(): Promise<string> {
    try {
      const appId = this.configService.get<string>('FACEBOOK_APP_ID');
      const appSecret = this.configService.get<string>('FACEBOOK_APP_SECRET');
      const shortLivedToken = this.ACCESS_TOKEN;

      const longLivedTokenResponse = await axios.get(
        `https://graph.facebook.com/${this.API_VERSION}/oauth/access_token`,
        {
          params: {
            grant_type: 'fb_exchange_token',
            client_id: appId,
            client_secret: appSecret,
            fb_exchange_token: shortLivedToken,
          },
        }
      );

      const longLivedToken = longLivedTokenResponse.data.access_token;

      const pageTokenResponse = await axios.get(
        `https://graph.facebook.com/${this.API_VERSION}/${this.PAGE_ID}`,
        {
          params: {
            fields: 'access_token',
            access_token: longLivedToken,
          },
        }
      );

      const newPageToken = pageTokenResponse.data.access_token;

      this.ACCESS_TOKEN = newPageToken;
      this.logger.log('Successfully refreshed Facebook access token');
      return newPageToken;
    } catch (error) {
      this.logger.error('Error refreshing Facebook access token:', error);
      throw new Error('Failed to refresh Facebook access token');
    }
  }

  async shareNewsAsStory(newsId: string, imageUrl: string, link: string): Promise<any> {
    try {
      if (!this.ACCESS_TOKEN) {
        throw new Error('Facebook access token is missing');
      }
  
      const url = `https://graph.facebook.com/${this.API_VERSION}/${this.PAGE_ID}/stories`;
  
      const data = {
        image_url: imageUrl,
        link,
        access_token: this.ACCESS_TOKEN
      };
  
      const response = await axios.post(url, data);
  
      this.logger.log(`Successfully shared news as story: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      this.logger.error(`Error sharing news as story: ${JSON.stringify(error.response?.data || error)}`);
      throw new Error(`Failed to share news as story: ${errorMessage}`);
    }
  }
}