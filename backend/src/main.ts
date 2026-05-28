import 'dotenv/config'; // doit être le 1er import — charge le .env avant tout module
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(process.env.PORT || 4000);
  console.log(`Codex des Gardiens API — port ${process.env.PORT || 4000}`);
}
void bootstrap();
