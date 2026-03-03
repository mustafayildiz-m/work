import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'uploads');
    const thumbDir = path.join(process.cwd(), 'uploads', 'thumbnails');

    // Uploads dizinleri yoksa oluştur
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    if (!fs.existsSync(thumbDir)) {
      fs.mkdirSync(thumbDir, { recursive: true });
    }

    const uniqName = `${Date.now()}-${uuidv4()}.jpg`; // Her zaman JPEG
    const filePath = path.join(uploadDir, uniqName);
    const thumbPath = path.join(thumbDir, uniqName);

    // 🎨 Resmi optimize et ve kaydet
    await sharp(file.buffer)
      .resize(600, 900, {
        fit: 'inside', // Oranı koruyarak max 600x900
        withoutEnlargement: true, // Küçük resimleri büyütme
      })
      .jpeg({ quality: 85, mozjpeg: true }) // 85% kalite, optimize edilmiş
      .toFile(filePath);

    // 🔍 Thumbnail oluştur (200x300)
    await sharp(file.buffer)
      .resize(200, 300, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(thumbPath);

    // URL'i döndür
    return `/uploads/${uniqName}`;
  }

  async uploadPdf(file: Express.Multer.File): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'uploads', 'pdfs');

    // Uploads/pdfs dizini yoksa oluştur
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const uniqName = `${Date.now()}-${uuidv4()}${ext}`;
    const filePath = path.join(uploadDir, uniqName);

    // Dosyayı kaydet
    fs.writeFileSync(filePath, file.buffer);

    // URL'i döndür
    return `/uploads/pdfs/${uniqName}`;
  }

  async uploadAudio(file: Express.Multer.File): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'uploads', 'audios');

    // Uploads/audios dizini yoksa oluştur
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const uniqName = `${Date.now()}-${uuidv4()}${ext}`;
    const filePath = path.join(uploadDir, uniqName);

    // Dosyayı kaydet
    fs.writeFileSync(filePath, file.buffer);

    // URL'i döndür
    return `/uploads/audios/${uniqName}`;
  }
}
