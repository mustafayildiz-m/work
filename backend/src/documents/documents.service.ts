import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Kısa PDF linkleri (/documents/{hash}.pdf) için hash → dosya eşleştirmesi.
 *
 * Hash, dosya adının md5'inin ilk 13 hex karakteri. Deterministik olduğu için
 * veritabanına kolon eklemeye ya da dosyaları yeniden adlandırmaya gerek yok;
 * mevcut kayıtların hiçbiri değişmez.
 */
@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  private readonly pdfDir = path.join(process.cwd(), 'uploads', 'pdfs');

  private map = new Map<string, string>();
  private lastBuild = 0;

  /** Dosya adından kısa hash üretir. */
  static hashOf(fileName: string): string {
    return crypto.createHash('md5').update(fileName).digest('hex').slice(0, 13);
  }

  /** Bir pdfUrl için tam kısa link döndürür. */
  buildUrl(pdfUrl: string, baseUrl: string): string | null {
    if (!pdfUrl) return null;
    const fileName = pdfUrl.split('/').pop();
    if (!fileName) return null;
    return `${baseUrl.replace(/\/$/, '')}/documents/${DocumentsService.hashOf(fileName)}.pdf`;
  }

  /** Hash → gerçek dosya yolu. Bulunamazsa haritayı bir kez tazeleyip tekrar dener. */
  resolve(hash: string): string | null {
    let fileName = this.map.get(hash);

    if (!fileName) {
      this.rebuild();
      fileName = this.map.get(hash);
    }
    if (!fileName) return null;

    // Yol kaçışına karşı: çözülen yol pdf dizininin altında kalmalı
    const abs = path.resolve(this.pdfDir, fileName);
    if (!abs.startsWith(path.resolve(this.pdfDir) + path.sep)) return null;
    if (!fs.existsSync(abs)) return null;

    return abs;
  }

  /** Diskteki pdf'leri tarayıp haritayı kurar. En fazla 30 saniyede bir çalışır. */
  private rebuild(): void {
    const now = Date.now();
    if (now - this.lastBuild < 30_000 && this.map.size > 0) return;
    this.lastBuild = now;

    if (!fs.existsSync(this.pdfDir)) {
      this.logger.warn(`PDF dizini yok: ${this.pdfDir}`);
      return;
    }

    const next = new Map<string, string>();
    for (const f of fs.readdirSync(this.pdfDir)) {
      if (!f.toLowerCase().endsWith('.pdf')) continue;
      const h = DocumentsService.hashOf(f);
      if (next.has(h)) {
        this.logger.warn(`Hash çakışması: ${h} → ${next.get(h)} / ${f}`);
        continue;
      }
      next.set(h, f);
    }

    this.map = next;
    this.logger.log(`Doküman haritası kuruldu: ${next.size} PDF`);
  }

  onModuleInit(): void {
    this.rebuild();
  }
}
