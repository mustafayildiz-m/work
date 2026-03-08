import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Newsletter } from '../entities/newsletter.entity';

@Injectable()
export class NewslettersSeeder {
  constructor(
    @InjectRepository(Newsletter)
    private readonly newsletterRepository: Repository<Newsletter>,
  ) {}

  async seed(): Promise<void> {
    console.log('🌱 Newsletters seeding started...');

    const seedData: Array<{
      title: string;
      publishDate: string;
      intro: string;
      content: string;
      imageUrl: string;
    }> = [
      {
        title: 'Gazze icin acil insani yardim koridoru cagrisi',
        publishDate: '2026-03-09',
        intro:
          'Bolgedeki yardim kuruluslari, Ramazan oncesi gida ve tibbi destek akisinin hizlandirilmasi icin ortak cagrida bulundu.',
        content:
          '<h2>Insani yardim cagrisi</h2><p>Gazze cevresinde faaliyet gosteren yardim aglari, temel tibbi malzeme, bebek mamasi ve temiz su erisimi icin yeni bir lojistik plan paylasti.</p><p>Bolgedeki yerel gonullu ekipler, dagitim noktalarinin guvenligi ve surekliligi icin uluslararasi koordinasyonun artirilmasini bekliyor.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1578922746465-3a80a228f223?auto=format&fit=crop&w=1400&q=80',
      },
      {
        title: 'Kudus te Ramadan hazirliklari basladi',
        publishDate: '2026-03-08',
        intro:
          'Mescid-i Aksa cevresinde ibadet duzeni, ulasim ve guvenlik planlamalari icin yerel kurumlar ortak toplantilar gerceklestirdi.',
        content:
          '<h2>Ramazan duzeni</h2><p>Kudus belediyesi ve vakif temsilcileri, teravih saatlerinde yogunlugu azaltmak icin ulasim rotalarini guncelledi.</p><p>Esnaf birlikleri de iftar sonrasi artan hareketlilik icin temel hizmet saatlerini yeniden planladi.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?auto=format&fit=crop&w=1400&q=80',
      },
      {
        title: 'Turkiye de zekat dagitim agi dijital takip sistemine geciyor',
        publishDate: '2026-03-07',
        intro:
          'Birden fazla vakif, yardimlarin dogru haneye ulasmasi icin ortak bir dijital dogrulama ve raporlama platformu baslatti.',
        content:
          '<h2>Dijital donusum</h2><p>Yeni sistem ile yardim basvurulari kimlik, gelir durumu ve aciliyet kriterlerine gore siniflandirilacak.</p><p>Kuruluslar, bagiscilar icin anonim ama olculebilir etki raporlari yayinlayacak.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1400&q=80',
      },
      {
        title: 'Endonezya da cami merkezli afet hazirlik egitimleri yayginlasiyor',
        publishDate: '2026-03-06',
        intro:
          'Yerel otoriteler, deprem ve sel riskine karsi cami cemaatleri icin pratik tahliye ve ilk yardim modulleri baslatti.',
        content:
          '<h2>Toplum dayanikliligi</h2><p>Egitim programinda temel ilk yardim, cocuk-guvenli tahliye ve gecici barinma koordinasyonu ele aliniyor.</p><p>Uygulamalarin ramazan sonrasi kirsal bolgelere de tasinmasi planlaniyor.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1400&q=80',
      },
      {
        title: 'Afrika Boynuzu nda su kuyusu projelerine yeni finansman',
        publishDate: '2026-03-05',
        intro:
          'Bolgede calisan hayir kuruluslari, kurakliktan etkilenen yerlesimlere yonelik kuyu ve su depolama yatirimlarini artirdi.',
        content:
          '<h2>Su erisimi</h2><p>Projeler, okul ve saglik merkezi cevrelerinde suya erisimi onceliklendirecek sekilde planlandi.</p><p>Yerel teknik ekiplerin egitimi ile bakim sureclerinin surdurulebilir hale getirilmesi hedefleniyor.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1400&q=80',
      },
      {
        title: 'Bosna da tarihi cami restorasyonunda son asamaya gelindi',
        publishDate: '2026-03-04',
        intro:
          'Osmanli doneminden kalan bir caminin restorasyonu tamamlanma asamasina gelirken acilis icin kultur programi hazirlaniyor.',
        content:
          '<h2>Restorasyon sureci</h2><p>Calismalarda ozgun tas detaylari korunarak guvenlik ve erisilebilirlik standartlari guncellendi.</p><p>Yerel universiteler, proje kapsaminda genclere yonelik miras koruma atolyeleri duzenliyor.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1400&q=80',
      },
      {
        title: 'Malezya da helal gida tedarikinde yeni denetim donemi',
        publishDate: '2026-03-03',
        intro:
          'Yetkili kurumlar, ithal urunlerde izlenebilirligi artirmak icin QR tabanli dogrulama adimini devreye aldi.',
        content:
          '<h2>Tedarik zinciri denetimi</h2><p>Yeni uygulama ile urunun kaynagi, isleme asamalari ve sertifika gecmisi tek ekranda gorulebiliyor.</p><p>Perakende noktalarinda denetim sikliginin yil boyunca artirilmasi planlaniyor.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1400&q=80',
      },
      {
        title: 'Avrupa da genclere yonelik mescid calismalari ivme kazandi',
        publishDate: '2026-03-02',
        intro:
          'Bir cok sehirde mescidler, ogrenciler icin kariyer danismanligi ve psikososyal destek bulusmalari duzenliyor.',
        content:
          '<h2>Genclik programlari</h2><p>Programlarda dijital guvenlik, akademik planlama ve gonulluluk temali moduller one cikiyor.</p><p>Yerel belediyelerle is birligi yapilarak ortak etkinlik takvimi olusturuldu.</p>',
        imageUrl:
          'https://images.pexels.com/photos/2451538/pexels-photo-2451538.jpeg?auto=compress&cs=tinysrgb&w=1400',
      },
      {
        title: 'Pakistan da medrese mezunlarina teknoloji bursu destegi',
        publishDate: '2026-03-01',
        intro:
          'Yeni burs modeli, dini egitim alan genclerin yazilim, veri analizi ve dil teknolojileri alaninda uzmanlasmasini hedefliyor.',
        content:
          '<h2>Egitimde melez model</h2><p>Bursiyerler, cevrim ici teknik kamplar ve yuz yuze mentorluk ile 6 aylik programa dahil edilecek.</p><p>Mezunlarin sosyal girisim projelerine mikro hibe saglanmasi planlaniyor.</p>',
        imageUrl:
          'https://images.pexels.com/photos/8197543/pexels-photo-8197543.jpeg?auto=compress&cs=tinysrgb&w=1400',
      },
      {
        title: 'Umre sezonu oncesi saglik ve guvenlik rehberi guncellendi',
        publishDate: '2026-02-28',
        intro:
          'Yetkili kurumlar, yogun sezonda ziyaretci guvenligi icin sicaklik, kalabalik yonetimi ve acil durum protokollerini yeniledi.',
        content:
          '<h2>Sezon hazirliklari</h2><p>Rehberde kronik hastalar icin ilac planlamasi, grup hareket saatleri ve acil iletisim adimlari detaylandirildi.</p><p>Hac ve umre operatorlerine, saha ekip egitimlerini erken tamamlama tavsiyesi verildi.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1400&q=80',
      },
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const item of seedData) {
      const existing = await this.newsletterRepository.findOne({
        where: { title: item.title },
      });

      if (existing) {
        skippedCount++;
        continue;
      }

      const entity = this.newsletterRepository.create({
        title: item.title,
        publishDate: new Date(item.publishDate),
        intro: item.intro,
        content: item.content,
        imageUrl: item.imageUrl,
      });

      await this.newsletterRepository.save(entity);
      createdCount++;
    }

    console.log(
      `✅ Newsletters seeding finished. Created: ${createdCount}, Skipped: ${skippedCount}`,
    );
  }
}
