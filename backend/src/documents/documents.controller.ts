import { Controller, Get, Param, NotFoundException, Res } from '@nestjs/common';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get(':hash')
  serve(@Param('hash') hash: string, @Res() res: Response): void {
    // "69affdf9b8303.pdf" → "69affdf9b8303"
    const key = hash.replace(/\.pdf$/i, '').toLowerCase();

    if (!/^[a-f0-9]{13}$/.test(key)) {
      throw new NotFoundException('Belge bulunamadı');
    }

    const abs = this.documentsService.resolve(key);
    if (!abs) {
      throw new NotFoundException('Belge bulunamadı');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', fs.statSync(abs).size);
    // Tarayıcıda aç, indirme dayatma
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(abs)}"`);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    fs.createReadStream(abs).pipe(res);
  }
}
