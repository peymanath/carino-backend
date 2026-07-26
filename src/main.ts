import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { TransformResponseInterceptor } from './shared/interceptors/TransformResponseInterceptor';
import { ProblemDetailsDto } from './shared/dto/ProblemDetails.dto';
import { NestExpressApplication } from '@nestjs/platform-express';
import { TransformDateInterceptor } from './shared/interceptors/TransformDateInterceptor';
import { registerEnv } from './config/env.config';
// import { apiReference } from '@scalar/nestjs-api-reference';

(async (): Promise<void> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  // Prefix all routes with /api (e.g., /api/users)
  app.setGlobalPrefix('api');

  // Show Ip
  app.set('trust proxy', true);

  // Global error shape → Problem Details style via custom filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global input validation & transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // Global success response transformation
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // Global date time transformation
  app.useGlobalInterceptors(new TransformDateInterceptor());

  // Class serialization (e.g., @Expose/@Exclude) for controller return values
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Cross-Origin Resource Sharing
  // app.enableCors({
  //   origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3005', 'http://192.168.1.197:3003', 'http://192.168.1.197:3005'],
  //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  //   credentials: true,
  // });

  if (registerEnv.IS_DEVELOPMENT) {
    // Add Bearer auth so consumers can authorize with JWT in Swagger UI
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Carino API')
      .setDescription('API documentation for the Carino application')
      .setVersion('1.0')
      .setContact('Peyman Naderi', 'https://peymanath.ir', 'naderidefault@gmail.com')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: "Paste your JWT here (without 'Bearer ' prefix).",
      })

      .build();

    // Include extra models so they appear in the schema
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig, {
      extraModels: [ProblemDetailsDto],
    });

    // Serve Swagger UI at /docs
    SwaggerModule.setup('/docs', app, swaggerDocument, {
      customSiteTitle: 'Carino API Docs',
      jsonDocumentUrl: 'docs/export/data/swagger/swagger.json',
      swaggerOptions: {
        persistAuthorization: true,
      },
      customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css',
      customJs: ['https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-standalone-preset.min.js'],
    });

    // Scalar API Reference
    // app.use(
    //   '/reference',
    //   apiReference({
    //     content: swaggerDocument,
    //   })
    // );
  }

  // Prefer explicit numeric port with fallback
  const port = Number(process.env.PORT ?? 3000);

  // Start HTTP server
  await app.listen(port).then(() => {
    Logger.log(`🚀 App running on port ${port}`);
  });
})();
