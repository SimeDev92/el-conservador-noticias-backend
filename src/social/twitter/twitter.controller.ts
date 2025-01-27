import { Controller, Post, Body, Get, UsePipes, ValidationPipe } from '@nestjs/common';
import { TwitterService } from './twitter.service';
import { CreateTweetDto } from './dto/create-tweet.dto';

@Controller('twitter')
export class TwitterController {
  constructor(private readonly twitterService: TwitterService) {}

  @Post('tweet')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createTweet(@Body() createTweetDto: CreateTweetDto) {
    return this.twitterService.postTweet(createTweetDto);
  }
  
}
