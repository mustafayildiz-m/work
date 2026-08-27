import { Controller, Get, Query, Res, BadRequestException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { KitapAramaService } from './kitap-arama.service';

/**
 * Dışarıya verilecek adres. req.get('host') KULLANILAMAZ: nginx arkasında
 * Docker'ın iç adı ("backend:3000") gelir ve link dışarıda çalışmaz.
 * Sıra: PUBLIC_BASE_URL env -> X-Forwarded-* başlıkları -> istek host'u.
 */
function publicBaseUrl(req: Request): string {
  const env = process.env.PUBLIC_BASE_URL;
  if (env) return env.replace(/\/$/, '');

  const xfHost = (req.headers['x-forwarded-host'] as string | undefined)?.split(',')[0]?.trim();
  const xfProto = (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0]?.trim();
  const host = xfHost || req.get('host') || '';

  // İç Docker adına asla link verme
  if (!host || /^(backend|localhost|127\.0\.0\.1)(:|$)/i.test(host)) {
    return 'https://islamicwindows.com';
  }
  return `${xfProto || req.protocol || 'https'}://${host}`;
}

/**
 * Dış sistemler için: kitap adı + dil ile kitabı sitede açar.
 *
 *   GET /kitap-ac?ad=My Beloved Prophet-EN   -> 302 /feed/books/385  (detay sayfası)
 *   GET /kitap-ac?ad=bulunmayan bir kitap    -> 302 /feed/books?...  (dil filtreli liste)
 *   GET /kitap-ac?ad=...&json=1              -> yönlendirme yerine JSON
 *
 * Kullanıcı PDF'e değil siteye düşer; böylece diğer kitapları ve modülleri
 * keşfedebilir. PDF'in kendisi detay sayfasındaki okuyucudan açılıyor,
 * doğrudan /documents/{hash}.pdf linkleri de çalışmaya devam ediyor.
 */
@Controller('kitap-ac')
export class KitapAramaController {
  constructor(private readonly arama: KitapAramaService) {}

  /** Kitap detay sayfası. Dil paramları detay sayfasının "geri" linkini besliyor. */
  private detayUrl(base: string, kitapId: number): string {
    const dil = this.arama.dilBilgisi(kitapId);
    const qs = new URLSearchParams();
    if (dil?.dilId) {
      qs.set('languageId', String(dil.dilId));
      qs.set('languageName', dil.dilAdi);
      qs.set('languageCode', dil.dilKodu);
    }
    const ek = qs.toString();
    return `${base}/feed/books/${kitapId}${ek ? `?${ek}` : ''}`;
  }

  /**
   * Kitap bulunamadığında gidilecek liste sayfası.
   *
   * `ad` yalnızca eşleşme ihtimali varken geçilir. Katalogda olmayan bir kitabın
   * adını arama olarak göndermek kullanıcıyı garanti "Sonuç bulunamadı" ekranına
   * düşürür; o durumda sadece dil filtresi verilir ki o dildeki kitaplar listelenip
   * kullanıcı gezinebilsin.
   */
  private listeUrl(base: string, ad: string, dilKodu: string): string {
    const qs = new URLSearchParams();
    if (ad) qs.set('search', ad);
    const dil = dilKodu ? this.arama.dilKodundanId(dilKodu) : null;
    if (dil?.dilId) {
      qs.set('languageId', String(dil.dilId));
      qs.set('languageName', dil.dilAdi);
      qs.set('languageCode', dilKodu.toLowerCase());
    }
    const ek = qs.toString();
    return `${base}/feed/books${ek ? `?${ek}` : ''}`;
  }

  @Get()
  async ac(
    @Query('ad') ad: string,
    @Query('dil') dil: string | undefined,
    @Query('json') json: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    if (!ad || !ad.trim()) {
      throw new BadRequestException("'ad' parametresi zorunlu");
    }

    const arananAd = ad.trim();
    const sonuc = await this.arama.ara(arananAd, dil);
    const base = publicBaseUrl(res.req);
    const dilKodu = (dil || KitapAramaService.dilKodu(arananAd) || '').toLowerCase();

    // Liste sayfasına giderken arama kutusuna dosya adı değil, temiz başlık yazılsın
    const aramaMetni = KitapAramaService.adaylar(arananAd)[0] || arananAd;

    if (sonuc.durum === 'bulundu') {
      const url = this.detayUrl(base, sonuc.kitapId);
      const pdfUrl = await this.arama.kisaLink(sonuc.kitapId, base);
      if (json === '1') {
        res.json({
          durum: 'bulundu',
          kitapId: sonuc.kitapId,
          guven: sonuc.guven,
          url,
          pdfUrl,
        });
        return;
      }
      res.redirect(302, url);
      return;
    }

    if (sonuc.durum === 'belirsiz') {
      const adaylar = await Promise.all(
        sonuc.adaylar.map(async (a) => ({
          kitapId: a.kitapId,
          baslik: a.baslik,
          url: this.detayUrl(base, a.kitapId),
          pdfUrl: await this.arama.kisaLink(a.kitapId, base),
        })),
      );
      if (json === '1') {
        res.status(300).json({
          durum: 'belirsiz',
          mesaj: 'Birden fazla kitap eşleşti.',
          adaylar,
        });
        return;
      }
      // Adaylar gerçekten var, arama metni sonuç getirir
      res.redirect(302, this.listeUrl(base, aramaMetni, dilKodu));
      return;
    }

    // Bulunamadı / katalogda yok: arama metni GEÇİLMEZ (bkz. listeUrl),
    // o dildeki kitaplar listelenir ve kullanıcı gezinir
    const listeUrl = this.listeUrl(base, '', dilKodu);

    if (json === '1') {
      const oneriler =
        sonuc.durum === 'bulunamadi'
          ? await Promise.all(
              sonuc.oneriler.map(async (o) => ({
                kitapId: o.kitapId,
                baslik: o.baslik,
                url: this.detayUrl(base, o.kitapId),
              })),
            )
          : [];
      res.status(404).json({
        durum: sonuc.durum,
        mesaj:
          sonuc.durum === 'katalogda-yok'
            ? 'Bu kitap sizin listenizde var ancak bizim katalogumuzda bulunmuyor.'
            : 'Kitap bulunamadı.',
        url: listeUrl,
        oneriler,
      });
      return;
    }

    res.redirect(302, listeUrl);
  }
}
