import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';

type DatabaseOptions = {
  database?: string;
  host?: string;
  port?: number | string;
  type?: string;
};

function isPrivateLanHostname(hostname: string) {
  const parts = hostname.split('.').map(Number);

  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return false;
  }

  const [first, second] = parts;

  return (
    first === 10 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function isAllowedCorsOrigin(origin: string | undefined, allowedPorts: Set<string>) {
  if (!origin) {
    return true;
  }

  try {
    const url = new URL(origin);

    return (
      url.protocol === 'http:' &&
      allowedPorts.has(url.port) &&
      (url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1' ||
        isPrivateLanHostname(url.hostname))
    );
  } catch {
    return false;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = Number(configService.get<string>('PORT') ?? 8000);
  const allowedCorsPorts = new Set(['3000', String(port)]);

  app.enableCors({
    origin: (origin, callback) => {
      if (isAllowedCorsOrigin(origin, allowedCorsPorts)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );

  const dataSource = app.get(DataSource);
  const logger = new Logger('Bootstrap');
  const databaseOptions = dataSource.options as DatabaseOptions;
  const swaggerPath = 'api';

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Parking API')
    .setDescription('Parking management API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(swaggerPath, app, swaggerDocument);

  if (dataSource.isInitialized) {
    logger.log(
      `Database connected: ${databaseOptions.type}://${databaseOptions.host}:${databaseOptions.port}/${databaseOptions.database}`,
    );
  }

  await app.listen(port, '0.0.0.0');
  const appUrl = await app.getUrl();
  logger.log(`Application running on: ${appUrl}`);
  logger.log(`Network access: http://YOUR-PC-IP:${port}`);
  logger.log(`Application port: ${port}`);
  logger.log(`Swagger docs: ${appUrl}/${swaggerPath}`);
}
bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');

  logger.error(error);
  process.exit(1);
});
