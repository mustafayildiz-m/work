import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { BookTranslation } from '../books/entities/book-translation.entity';
import { DocumentsService } from './documents.service';

type Kayit = {
  dosya: string;
  dil: string;
  kitapId: number | null;
  guven: 'kesin' | 'yuksek' | 'belirsiz' | 'elle';
  adaylar?: number[];
};

export type AramaSonucu =
  | { durum: 'bulundu'; kitapId: number; pdfUrl: string; guven: string }
  | { durum: 'belirsiz'; adaylar: { kitapId: number; baslik: string }[] }
  | { durum: 'katalogda-yok' }
  | { durum: 'bulunamadi'; oneriler: { kitapId: number; baslik: string }[] };

/** Sıra/cilt numarası sözlüğü. Tek harfli Roma rakamları BİLİNÇLİ olarak yok:
 *  "Seâdet-i", "Diyâ'-i" gibi başlıklarda ek olarak geçip yanlış cilt seçtiriyor. */
const SIRA: Record<string, number> = {
  first: 1, birinci: 1, '1': 1,          second: 2, ikinci: 2, ii: 2, '2': 2,
  third: 3, ucuncu: 3, iii: 3, '3': 3,   fourth: 4, dorduncu: 4, iv: 4, '4': 4,
  fifth: 5, besinci: 5, '5': 5,          sixth: 6, altinci: 6, vi: 6, '6': 6,
  seventh: 7, yedinci: 7, vii: 7, '7': 7, eighth: 8, sekizinci: 8, viii: 8, '8': 8,
};
const DOLGU = new Set(['the','a','an','of','and','fascicle','vol','volume','cilt','fasikul','part']);

@Injectable()
export class KitapAramaService implements OnModuleInit {
  private readonly logger = new Logger(KitapAramaService.name);
  private tablo = new Map<string, Kayit>();
  private katalogdaYok = new Set<string>();
  private basliklar: {
    kitapId: number;
    dil: string;
    dilId: number | null;
    dilAdi: string;
    baslik: string;
    pdfUrl: string;
  }[] = [];

  constructor(
    @InjectRepository(BookTranslation)
    private readonly ceviriRepo: Repository<BookTranslation>,
    private readonly documentsService: DocumentsService,
  ) {}

  /** Arapça-Hint (٠-٩) ve Farsça (۰-۹) rakamlarını Latin rakama çevirir.
   *  Dosya adlarında "الفقه ... ١" yazarken başlıkta "... 1" geçiyor. */
  private static rakamlariCevir(s: string): string {
    return s
      .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
      .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
  }

  /** Aksan, apostrof, noktalama ve büyük/küçük harf farklarını siler. */
  static normalize(s: string): string {
    return KitapAramaService.rakamlariCevir(s)
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')      // aksan
      .toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/['’‘`´]/g, '')              // apostrof kelimeyi BÖLMEMELİ
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }

  /** Dosya adından başlık adaylarını üretir: dil kodu önde/arkada, parantez içi/dışı. */
  static adaylar(dosyaAdi: string): string[] {
    let ad = dosyaAdi.replace(/\.pdf$/i, '').replace(/\s*\(\d+\)\s*$/, '').replace(/\\/g, '').trim();
    ad = ad.replace(/^[A-Za-z]{2,3}\s*[-_]\s*/, '').replace(/\s*[-_]\s*[A-Za-z]{2,3}\s*$/, '');
    ad = ad.replace(/^[-_\s]+|[-_\s]+$/g, '');

    const disi = ad.replace(/[([].*?[)\]]/g, ' ').trim();
    const ici = (ad.match(/[([](.*?)[)\]]/g) || []).map((x) => x.slice(1, -1)).join(' ').trim();
    return [ad, disi, ici].filter((x, i, a) => x.length > 1 && a.indexOf(x) === i);
  }

  private static sira(metin: string): number | null {
    const bulunan = new Set<number>();
    for (const t of KitapAramaService.normalize(metin).split(' ')) {
      if (SIRA[t] !== undefined) bulunan.add(SIRA[t]);
    }
    return bulunan.size === 1 ? [...bulunan][0] : null;
  }

  private static kelimeler(metin: string): Set<string> {
    return new Set(
      KitapAramaService.normalize(metin)
        .split(' ')
        .filter((t) => t.length > 1 && !DOLGU.has(t) && SIRA[t] === undefined),
    );
  }

  /** Dosya adından dil kodunu çıkarır (önek veya sonek). */
  static dilKodu(dosyaAdi: string): string | null {
    const ad = dosyaAdi.replace(/\.pdf$/i, '').trim();
    const son = ad.match(/[-_]\s*([A-Za-z]{2,3})\s*$/);
    if (son) return son[1].toLowerCase();
    const bas = ad.match(/^([A-Za-z]{2,3})\s*[-_]/);
    return bas ? bas[1].toLowerCase() : null;
  }

  async onModuleInit(): Promise<void> {
    this.tabloyuYukle();
    await this.basliklariYukle();
  }

  private tabloyuYukle(): void {
    const adaylar = [
      path.join(__dirname, 'kitap-eslestirme.json'),
      path.join(process.cwd(), 'src', 'documents', 'kitap-eslestirme.json'),
    ];
    const dosya = adaylar.find((p) => fs.existsSync(p));
    if (!dosya) {
      this.logger.warn('kitap-eslestirme.json bulunamadı; yalnızca bulanık arama çalışacak.');
      return;
    }

    const veri = JSON.parse(fs.readFileSync(dosya, 'utf-8'));
    for (const k of veri.kayitlar as Kayit[]) {
      for (const aday of KitapAramaService.adaylar(k.dosya)) {
        const anahtar = `${k.dil}|${KitapAramaService.normalize(aday)}`;
        if (!this.tablo.has(anahtar)) this.tablo.set(anahtar, k);
      }
    }
    for (const y of veri.katalogdaYok as { dosya: string; dil: string }[]) {
      this.katalogdaYok.add(`${y.dil}|${KitapAramaService.normalize(KitapAramaService.adaylar(y.dosya)[0])}`);
    }
    this.logger.log(
      `Eşleştirme tablosu: ${veri.kayitlar.length} kayıt (${this.tablo.size} anahtar), ` +
        `${veri.katalogdaYok.length} katalogda-yok`,
    );
  }

  private async basliklariYukle(): Promise<void> {
    const satirlar = await this.ceviriRepo.find({ relations: ['language'] });
    this.basliklar = satirlar
      .filter((s) => s.pdfUrl)
      .map((s) => ({
        kitapId: s.bookId,
        dil: (s.language?.code || '').toLowerCase(),
        dilId: s.languageId ?? null,
        dilAdi: s.language?.name || '',
        baslik: s.title || '',
        pdfUrl: s.pdfUrl,
      }));
    this.logger.log(`Bulanık arama için ${this.basliklar.length} başlık yüklendi.`);
  }

  private async pdfUrlBul(kitapId: number): Promise<string | null> {
    const yerel = this.basliklar.find((b) => b.kitapId === kitapId);
    if (yerel) return yerel.pdfUrl;
    const c = await this.ceviriRepo.findOne({ where: { bookId: kitapId } });
    return c?.pdfUrl || null;
  }

  private baslikOf(kitapId: number): string {
    return this.basliklar.find((b) => b.kitapId === kitapId)?.baslik || `#${kitapId}`;
  }

  /** Kitabın dil bilgisi — detay sayfasındaki geri dönüş filtresi için. */
  dilBilgisi(kitapId: number): { dilId: number | null; dilAdi: string; dilKodu: string } | null {
    const b = this.basliklar.find((x) => x.kitapId === kitapId);
    return b ? { dilId: b.dilId, dilAdi: b.dilAdi, dilKodu: b.dil } : null;
  }

  /** Dil kodundan languageId — kitap listesini filtrelemek için. */
  dilKodundanId(kod: string): { dilId: number | null; dilAdi: string } | null {
    if (!kod) return null;
    const b = this.basliklar.find((x) => x.dil === kod.toLowerCase());
    return b ? { dilId: b.dilId, dilAdi: b.dilAdi } : null;
  }

  async ara(ad: string, dilParam?: string): Promise<AramaSonucu> {
    const dil = (dilParam || KitapAramaService.dilKodu(ad) || '').toLowerCase();
    const adaylar = KitapAramaService.adaylar(ad);

    // 1) Eşleştirme tablosu — kesin, tahmin yok
    for (const aday of adaylar) {
      const kayit =
        this.tablo.get(`${dil}|${KitapAramaService.normalize(aday)}`) ??
        (dil ? undefined : [...this.tablo.values()].find(
          (k) => KitapAramaService.normalize(k.dosya).includes(KitapAramaService.normalize(aday)),
        ));
      if (!kayit) continue;

      if (kayit.guven === 'belirsiz' && kayit.adaylar?.length) {
        return {
          durum: 'belirsiz',
          adaylar: kayit.adaylar.map((id) => ({ kitapId: id, baslik: this.baslikOf(id) })),
        };
      }
      if (kayit.kitapId) {
        const pdfUrl = await this.pdfUrlBul(kayit.kitapId);
        if (pdfUrl) return { durum: 'bulundu', kitapId: kayit.kitapId, pdfUrl, guven: kayit.guven };
      }
    }

    // 2) Bilinen eksik — net cevap ver, boşuna arama
    for (const aday of adaylar) {
      if (this.katalogdaYok.has(`${dil}|${KitapAramaService.normalize(aday)}`)) {
        return { durum: 'katalogda-yok' };
      }
    }

    // 3) Bulanık arama — tabloda olmayan yeni kitaplar için yedek
    return this.bulanikAra(adaylar, dil);
  }

  private async bulanikAra(adaylar: string[], dil: string): Promise<AramaSonucu> {
    const havuzTum = dil ? this.basliklar.filter((b) => b.dil === dil) : this.basliklar;

    let enIyi: { skor: number; kayit: (typeof this.basliklar)[0] }[] = [];
    for (const aday of adaylar) {
      const kelime = KitapAramaService.kelimeler(aday);
      const sira = KitapAramaService.sira(aday);
      if (!kelime.size) continue;

      // Cilt numarası ZORUNLU kısıt: uyuşmayan adaylar tamamen elenir
      let havuz = havuzTum;
      if (sira !== null) {
        const kisitli = havuz.filter((b) => KitapAramaService.sira(b.baslik) === sira);
        if (kisitli.length) havuz = kisitli;
      }

      for (const b of havuz) {
        const t = KitapAramaService.kelimeler(b.baslik);
        if (!t.size) continue;
        const ortak = [...t].filter((x) => kelime.has(x)).length;
        const kapsam = ortak / t.size;
        const jaccard = ortak / new Set([...t, ...kelime]).size;
        enIyi.push({ skor: 0.7 * kapsam + 0.3 * jaccard, kayit: b });
      }
    }
    if (!enIyi.length) return { durum: 'bulunamadi', oneriler: [] };

    enIyi.sort((a, b) => b.skor - a.skor);
    const tepe = enIyi[0].skor;
    if (tepe < 0.45) {
      return {
        durum: 'bulunamadi',
        oneriler: enIyi.slice(0, 3).map((x) => ({ kitapId: x.kayit.kitapId, baslik: x.kayit.baslik })),
      };
    }

    const kazananlar = [...new Map(
      enIyi.filter((x) => x.skor >= tepe - 0.02).map((x) => [x.kayit.kitapId, x.kayit]),
    ).values()];

    if (kazananlar.length === 1) {
      return { durum: 'bulundu', kitapId: kazananlar[0].kitapId, pdfUrl: kazananlar[0].pdfUrl, guven: 'bulanik' };
    }
    return {
      durum: 'belirsiz',
      adaylar: kazananlar.slice(0, 5).map((k) => ({ kitapId: k.kitapId, baslik: k.baslik })),
    };
  }

  /** Kitap ID -> kısa /documents/ linki */
  async kisaLink(kitapId: number, baseUrl: string): Promise<string | null> {
    const pdfUrl = await this.pdfUrlBul(kitapId);
    return pdfUrl ? this.documentsService.buildUrl(pdfUrl, baseUrl) : null;
  }
}
