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

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );

  const configService = app.get(ConfigService);
  const dataSource = app.get(DataSource);
  const logger = new Logger('Bootstrap');
  const port = Number(configService.get<string>('PORT') ?? 8000);
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

  await app.listen(port);
  const appUrl = await app.getUrl();
  logger.log(`Application running on: ${appUrl}`);
  logger.log(`Application port: ${port}`);
  logger.log(`Swagger docs: ${appUrl}/${swaggerPath}`);
}
bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');

  logger.error(error);
  process.exit(1);
});
