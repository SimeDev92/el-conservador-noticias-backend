
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticlesModule } from './articles/articles.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig, { CONFIG_DATABASE } from './config/database.config';
import { ImageUploadModule } from './images/image-upload.module';
import { TelegramModule } from './social/telegram/telegram.module';
import { TwitterModule } from './social/twitter/twitter.module';
import { FacebookModule } from './social/facebook/facebook.module';
import { AuthModule } from './auth/auth.module';
import { SitemapModule } from './sitemap/sitemap.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.get(CONFIG_DATABASE).users.uri,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    ArticlesModule,
    ImageUploadModule,
    TwitterModule,
    TelegramModule,
    FacebookModule,
    SitemapModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}