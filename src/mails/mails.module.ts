import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailsService } from './mails.service';
import { MailsController } from './mails.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: process.env.MAIL_HOST,
          secure: false, // Ajustar según tu configuración de SMTP (puede ser true si usas SSL)
          auth: {
            user: process.env.MAIL_USER, // Usar ConfigService
            pass: process.env.MAIL_PASSWORD, // Usar ConfigService
          },
        },
        defaults: {
          from: `"No Reply" <${process.env.MAIL_FROM}>`, // Usar ConfigService aquí
        },
        template: {
          dir: join(__dirname, 'templates'), // Ruta a las plantillas
          adapter: new HandlebarsAdapter(), // Adaptador de Handlebars para las plantillas
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  controllers: [MailsController],
  providers: [MailsService],
  exports: [MailsService],
})
export class MailsModule {}
