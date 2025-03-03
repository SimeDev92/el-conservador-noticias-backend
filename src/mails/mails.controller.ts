import { Controller, Get } from '@nestjs/common';
import { MailsService } from './mails.service';

@Controller('mails')
export class MailsController {
  constructor(private readonly mailsService: MailsService) {}

  @Get('test')
  async sendTestEmail() {
    await this.mailsService.sendTestEmail();
    return 'Correo de prueba enviado';
  }

}
