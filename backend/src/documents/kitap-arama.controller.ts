import { Controller, Get, Query, Res, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { KitapAramaService } from './kitap-arama.service';

/**
 * Dış sistemler için: kitap adı + dil ile PDF'i doğrudan açar.
 *
 *   GET /kitap-ac?ad=My Beloved Prophet-EN         -> 302 redirect, PDF açılır
 *   GET /kitap-ac?ad=My Beloved Prophet&dil=en     -> aynı
 *   GET /kitap-ac?ad=...&json=1                    -> yönlendirme yerine JSON
 */
@Controller('kitap-ac')
export class KitapAramaController {
  constructor(private readonly arama: KitapAramaService) {}

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

    const sonuc = await this.arama.ara(ad.trim(), dil);
    const base = `${res.req.protocol}://${res.req.get('host')}`;

    if (sonuc.durum === 'bulundu') {
      const link = await this.arama.kisaLink(sonuc.kitapId, base);
      if (!link) {
        res.status(404).json({ durum: 'bulunamadi', mesaj: 'Kitabın PDF dosyası yok.' });
        return;
      }
      if (json === '1') {
        res.json({ durum: 'bulundu', kitapId: sonuc.kitapId, guven: sonuc.guven, url: link });
        return;
      }
      res.redirect(302, link); // tarayıcı PDF'i doğrudan açar
      return;
    }

    if (sonuc.durum === 'belirsiz') {
      const adaylar = await Promise.all(
        sonuc.adaylar.map(async (a) => ({
          kitapId: a.kitapId,
          baslik: a.baslik,
          url: await this.arama.kisaLink(a.kitapId, base),
        })),
      );
      res.status(300).json({
        durum: 'belirsiz',
        mesaj: 'Birden fazla kitap eşleşti; doğru olanı seçin.',
        adaylar,
      });
      return;
    }

    if (sonuc.durum === 'katalogda-yok') {
      res.status(404).json({
        durum: 'katalogda-yok',
        mesaj: 'Bu kitap sizin listenizde var ancak bizim katalogumuzda bulunmuyor.',
      });
      return;
    }

    const oneriler = await Promise.all(
      sonuc.oneriler.map(async (o) => ({
        kitapId: o.kitapId,
        baslik: o.baslik,
        url: await this.arama.kisaLink(o.kitapId, base),
      })),
    );
    res.status(404).json({ durum: 'bulunamadi', mesaj: 'Kitap bulunamadı.', oneriler });
  }
}
