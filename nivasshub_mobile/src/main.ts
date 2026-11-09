import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import multipart from '@fastify/multipart';
import { AppModule } from './app.module';

/**
 * Initializes and starts the NestJS application.
 */
async function bootstrap() {
  // Create the NestJS application using the Fastify adapter.
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Enable multipart/form-data support for file uploads.
  await app.register(multipart);

  // Enable global request validation.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Start the application on the configured port.
  // Defaults to port 3000 when PORT is not provided.
  await app.listen(
    process.env.PORT ?? 3000,
    '0.0.0.0',
  );
}

bootstrap();