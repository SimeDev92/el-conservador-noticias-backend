import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailsService {
  constructor(
    private configService: ConfigService,
    private readonly mailerService: MailerService
  ) {}

  private async sendEmail(options: {
    to: string;
    subject: string;
    template: string;
    context: any;
  }) {
    try {
      await this.mailerService.sendMail({
        to: options.to,
        from: this.configService.get<string>('MAIL_FROM'),
        subject: options.subject,
        template: options.template,
        context: {
          ...options.context,
          frontendUrl: this.configService.get<string>('FRONTEND_URL'),
          logoUrl: this.configService.get<string>('LOGO_URL'),
        },
      });
    } catch (error) {
      console.error(`Error al enviar el correo a ${options.to}:`, error);
    }
  }

  async sendUserConfirmation(user: string, email: string) {
    await this.sendEmail({
      to: email,
      subject: 'Bienvenid@ a El Conservador',
      template: './welcome',
      context: {
        nombre: user,
        unsubscribeLink: `${this.configService.get<string>('FRONTEND_URL')}/unsubscribe`,
      },
    });
  }

  async sendDonationThankyou(user: string, email: string) {
    await this.sendEmail({
      to: email,
      subject: 'Gracias por tu donación',
      template: './donation-thankyou',
      context: { nombre: user },
    });
  }

  async sendRecurringDonationThankyou(user: string, email: string) {
    await this.sendEmail({
      to: email,
      subject: 'Gracias por tu apoyo mensual',
      template: './recurring-donation-thankyou',
      context: { nombre: user },
    });
  }

  async sendSubscriptionThankyou(user: string, email: string, collaboratorCode: string) {
    await this.sendEmail({
      to: email,
      subject: 'Gracias por suscribirte',
      template: './subscription-thankyou',
      context: {
        nombre: user,
        collaboratorCode
      },
    });
  }
  
  async sendCancellationConfirmation(user: string, email: string) {
    await this.sendEmail({
      to: email,
      subject: 'Cancelación confirmada',
      template: './cancellation-confirmation',
      context: { nombre: user },
    });
  }

  async sendPasswordReset(user: string, email: string, resetLink: string) {
    await this.sendEmail({
      to: email,
      subject: 'Recuperación de contraseña',
      template: './password-reset',
      context: { nombre: user, resetLink },
    });
  }

  async sendPasswordChangeConfirmation(user: string, email: string) {
    await this.sendEmail({
      to: email,
      subject: 'Cambio de contraseña exitoso',
      template: './password-change-confirmation',
      context: { nombre: user },
    });
  }

  async sendNewsPublicationNotification(user: string, email: string, newsLink: string) {
    await this.sendEmail({
      to: email,
      subject: '¡Tu Noticia Ha Sido Publicada!',
      template: './news-publication',
      context: {
        nombre: user,
        newsLink,
      },
    });
  }

  async sendTestEmail() {
    await this.sendEmail({
      to: 'simeonparis@gmail.com',
      subject: 'Correo de Prueba - El Conservador',
      template: './welcome',
      context: {
        nombre: 'Usuario de Prueba',
        unsubscribeLink: `${this.configService.get<string>('FRONTEND_URL')}/unsubscribe`,
      },
    });
  }
}