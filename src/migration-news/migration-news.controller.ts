import { Controller, Post } from '@nestjs/common';
import { MigrationService } from './migrate-news-to-articles';

@Controller('migration')
export class MigrationController {
  constructor(private readonly migrationService: MigrationService) {}

  @Post('news-to-articles')
  async migrateNewsToArticles() {
    await this.migrationService.migrateNewsToArticles();
    return { message: '✅ Migración ejecutada. Revisa la colección articles.' };
  }
}
