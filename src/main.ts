import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import { createHash } from 'crypto';

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

function sanitizeRequestUrl(url: string): string {
  return url
    .replace(/\/location\/[^/?#]+/g, '/location/:trackerId')
    .replace(/\/hardware\/battery\/[^/?#]+/g, '/hardware/battery/:trackerId')
    .replace(/\/hardware\/[^/?#]+/g, '/hardware/:trackerId');
}

function sha256Fingerprint(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function getAccountFingerprint(): string | null {
  const email = process.env.TRACTIVE_EMAIL;
  if (!email) {
    return null;
  }
  return `email:${sha256Fingerprint(email)}`;
}

function getTrackerTargetFingerprint(url: string): string | null {
  const match = url.match(/\/(?:location|hardware(?:\/battery)?)\/([^/?#]+)/);
  if (!match) {
    return null;
  }

  return match[1]
    .split(',')
    .filter(Boolean)
    .map((trackerId) => {
      return `tracker:${sha256Fingerprint(decodeURIComponent(trackerId))}`;
    })
    .join(',');
}

function getClientIp(req): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

async function bootstrap() {
  const requestLogger = new Logger('Request');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on('finish', () => {
      const target = getTrackerTargetFingerprint(req.originalUrl || req.url);
      const account = getAccountFingerprint();
      requestLogger.log(
        `${req.method} ${sanitizeRequestUrl(
          req.originalUrl || req.url,
        )} ${res.statusCode} ${Date.now() - startedAt}ms ip=${getClientIp(req)}${
          account ? ` account=${account}` : ''
        }${
          target ? ` target=${target}` : ''
        }`,
      );
    });
    next();
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
