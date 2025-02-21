// migrate.ts
import { CommandFactory } from 'nest-commander';
import { AppModule } from './src/app.module';

async function bootstrap() {
  await CommandFactory.run(AppModule);
}

bootstrap();
