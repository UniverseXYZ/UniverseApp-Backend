import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { AppConfig } from 'src/modules/configuration/configuration.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(AppConfig);
  const port = config.values.app.port;
  const frontendDomain = config.values.frontend.domain;

  app.enableCors({ origin: frontendDomain, credentials: true });
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe());

  const options = new DocumentBuilder()
    .setTitle('Universe XYZ API')
    .setDescription('Universe XYZ API Documentation')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('health')
    .addTag('nfts')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  app.use(
    session({
      secret: config.values.app.sessionSecret,
      resave: false,
      saveUninitialized: false,
    }),
  );

  await app.listen(port);
}

bootstrap();
