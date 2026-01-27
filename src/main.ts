import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Security headers with Helmet (recommended by Snyk Learn)
  // https://learn.snyk.io/lesson/xss/?ecosystem=javascript
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline needed for Swagger
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:", "http:"],
          connectSrc: [
            "'self'",
            "http://localhost:5173",
            "https://mini-blog-seven-omega.vercel.app",
            "https://mini-blog.redopay.online"
          ],
          fontSrc: ["'self'", "data:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
          upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false, // Needed for uploaded images
      crossOriginResourcePolicy: { policy: "cross-origin" }, // Needed for CORS
    })
  );
  
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });
  
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://mini-blog-seven-omega.vercel.app',
      "https://mini-blog.redopay.online"
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: false,
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  const config = new DocumentBuilder()
    .setTitle('Mini Blog API')
    .setDescription('Mini Blog API description')
    .setVersion('1.0')
    .addTag('Mini Blog')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document,{
    swaggerOptions: {
      tagsSorter: (a: string, b: string) => {
        const numA = parseInt(a.split('.')[0], 10);
        const numB = parseInt(b.split('.')[0], 10);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return a.localeCompare(b);
      },
      operationsSorter: 'alpha',
    },
  });
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
