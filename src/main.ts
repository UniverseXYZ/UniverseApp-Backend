import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { AppConfig } from 'src/modules/configuration/configuration.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from './modules/validation.pipe';
import { RedisIoAdapter } from './adapters/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  const config = app.get(AppConfig);
  const port = config.values.app.port;
  app.use(helmet());
  app.enableCors({ methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS' });
  app.useGlobalPipes(new ValidationPipe());
  app.useWebSocketAdapter(new RedisIoAdapter(app));

  const options = new DocumentBuilder()
    .setTitle('Universe XYZ API')
    .setDescription('Universe XYZ API Documentation')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('health')
    .addTag('nfts')
    .addTag('auction')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
}

bootstrap();
