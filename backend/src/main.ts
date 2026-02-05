import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  console.log('DB_HOST:', process.env.DB_HOST);
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    rawBody: true,
  });

  // Body parser için limit artırma
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://46.62.255.65:3000',
    'http://46.62.255.65:3001',
    'http://46.62.255.65:5173',
    'https://islamicwindows.com',
    'https://www.islamicwindows.com',
    'https://admin.islamicwindows.com',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // __dirname compile sonrası dist/src olur, uploads ise backend/uploads'ta
  const uploadsPath = join(__dirname, '../..', 'uploads');

  // Static file serving için CORS header'ları ekle
  app.use('/uploads', (req, res, next) => {
    const origin = req.headers.origin;
    if (!origin || allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(
    '/uploads',
    express.static(uploadsPath, {
      setHeaders: (res, path) => {
        // Cache control headers - 1 yıl cache, ancak revalidation ile
        res.set('Cache-Control', 'public, max-age=31536000');
        // ETag desteği için Last-Modified header'ı ayarla
        res.set('Last-Modified', new Date().toUTCString());
      },
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log('📁 Serving uploads from:', uploadsPath);
  console.log('📁 __dirname:', __dirname);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
