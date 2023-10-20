import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';

const swaggerDescription = `
Tractive is a company that specializes in GPS tracking devices for pets, primarily dogs and cats. These devices allow
owners to keep tabs on the location of their pets in real-time via a mobile app. The Tractive GPS tracker can be easily
attached to the pet's collar and uses a combination of GPS, Wi-Fi, and cellular technology to provide accurate location
data. The service usually requires a subscription fee for access to the GPS tracking features.

In addition to tracking, some Tractive devices offer additional features such as activity monitoring, which gives you
insights into your pet's daily activities and behaviors. This can be useful for pet owners looking to monitor their
pet's health and well-being closely.

Since tractive has no official, documented public API, this will be a wrapper around their REST API.
`;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // class-validation @see https://www.npmjs.com/package/class-validator
  app.useGlobalPipes(new ValidationPipe());

  // swagger-api @see https://docs.nestjs.com/openapi/introduction
  const config = new DocumentBuilder()
    .setTitle('Tractive REST API')
    .setDescription(swaggerDescription)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync('./swagger-spec.json', JSON.stringify(document));
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: '*',
  });
  await app.listen(3002);
}

bootstrap();
