import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:4200', 'https://elconservadornoticias.com'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',  // Agregar OPTIONS
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });
  
  app.useGlobalPipes(
    new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    })
    );
  await app.listen(3000);
}
bootstrap();
