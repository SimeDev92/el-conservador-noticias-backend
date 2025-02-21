import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const TelegramBot = require('node-telegram-bot-api');


@Injectable()
export class TelegramService {
  private readonly bot: any;
  private logger = new Logger(TelegramService.name);
  constructor(
    private readonly configService: ConfigService,
  ) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN')
    this.bot = new TelegramBot(token, { polling: true });
    const frontendUrl = this.configService.get<string>('FRONTEND_URL')

  }

  private telegramChannelId = this.configService.get<string>('TELEGRAM_CHANNEL_ID')

  onReceiveMessage = (msg: any) => {
    this.logger.debug(msg)
  }

  sendMessageToChannel = ( telegramChannelId:string, message: string ) => {
    this.bot.sendMessage(telegramChannelId, message )
}

      // Método para publicar un artículo en el canal de Telegram
      sendArticleToChannel(title: string, slug: string) {
        const articleUrl = `https://elconservadornoticias.com/noticias/${slug}`;
        const message = ` ${articleUrl}`;
        this.sendMessageToChannel(this.telegramChannelId, message);
      }


}
