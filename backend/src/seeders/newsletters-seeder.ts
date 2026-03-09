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
      sourceLanguage: string;
    }> = [
      {
        title: 'Gazze için acil insani yardım koridoru çağrısı',
        publishDate: '2026-03-09',
        intro:
          'Bölgedeki yardım kuruluşları, Ramazan öncesi gıda ve tıbbi destek akışının hızlandırılması için ortak çağrıda bulundu.',
        content:
          '<h2>İnsani yardım çağrısı</h2><p>Gazze çevresinde faaliyet gösteren yardım ağları, temel tıbbi malzeme, bebek maması ve temiz su erişimi için yeni bir lojistik plan paylaştı.</p><p>Bölgedeki yerel gönüllü ekipler, dağıtım noktalarının güvenliği ve sürekliliği için uluslararası koordinasyonun artırılmasını bekliyor.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1578922746465-3a80a228f223?auto=format&fit=crop&w=1400&q=80',
        sourceLanguage: 'tr',
      },
      {
        title: 'Indonesia launches mosque-based disaster preparedness training',
        publishDate: '2026-03-08',
        intro:
          'Local authorities have launched practical evacuation and first aid modules for mosque congregations against earthquake and flood risks.',
        content:
          '<h2>Community resilience</h2><p>The training program covers basic first aid, child-safe evacuation, and temporary shelter coordination.</p><p>Applications are planned to extend to rural areas after Ramadan.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1400&q=80',
        sourceLanguage: 'en',
      },
      {
        title: 'البوسنة: مرحلة نهائية في ترميم مسجد تاريخي',
        publishDate: '2026-03-07',
        intro:
          'اقترب ترميم مسجد يعود إلى العهد العثماني من الانتهاء، فيما تُعد برامج ثقافية لافتتاحه.',
        content:
          '<h2>عملية الترميم</h2><p>تم تحديث معايير السلامة وإمكانية الوصول مع الحفاظ على التفاصيل المعمارية الأصلية.</p><p>تنظم الجامعات المحلية ورش عمل لحماية التراث للشباب ضمن المشروع.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1400&q=80',
        sourceLanguage: 'ar',
      },
      {
        title: 'Moscheen in Europa starten Jugendprogramme',
        publishDate: '2026-03-06',
        intro:
          'In vielen Städten bieten Moscheen Karriereberatung und psychosoziale Unterstützung für Studierende an.',
        content:
          '<h2>Jugendprogramme</h2><p>Die Programme umfassen Module zu digitaler Sicherheit, akademischer Planung und Freiwilligenarbeit.</p><p>In Zusammenarbeit mit lokalen Gemeinden wurde ein gemeinsamer Veranstaltungskalender erstellt.</p>',
        imageUrl:
          'https://images.pexels.com/photos/2451538/pexels-photo-2451538.jpeg?auto=compress&cs=tinysrgb&w=1400',
        sourceLanguage: 'de',
      },
      {
        title: 'Nouveau financement pour les puits en Afrique de l\'Est',
        publishDate: '2026-03-05',
        intro:
          'Les associations caritatives de la région ont augmenté leurs investissements dans les puits et le stockage d\'eau.',
        content:
          '<h2>Accès à l\'eau</h2><p>Les projets privilégient l\'accès à l\'eau autour des écoles et des centres de santé.</p><p>La formation des équipes techniques locales vise à rendre les processus de maintenance durables.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1400&q=80',
        sourceLanguage: 'fr',
      },
      {
        title: 'Nuevo sistema de verificación halal en Malasia',
        publishDate: '2026-03-04',
        intro:
          'Las autoridades han implementado verificación basada en QR para mejorar la trazabilidad de productos importados.',
        content:
          '<h2>Control de la cadena de suministro</h2><p>Con la nueva aplicación, el origen, las etapas de procesamiento y el historial de certificación se pueden ver en una sola pantalla.</p><p>Se planea aumentar la frecuencia de inspección en puntos de venta durante todo el año.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1400&q=80',
        sourceLanguage: 'es',
      },
      {
        title: 'دعوة عاجلة لممر إنساني لغزة',
        publishDate: '2026-03-03',
        intro:
          'دعت المنظمات الإنسانية في المنطقة إلى تسريع تدفق الغذاء والدعم الطبي قبل رمضان.',
        content:
          '<h2>نداء إنساني</h2><p>شاركت شبكات الإغاثة العاملة حول غزة خطة لوجستية جديدة للوصول إلى المستلزمات الطبية الأساسية وحليب الأطفال والمياه النظيفة.</p><p>تنتظر فرق المتطوعين المحلية زيادة التنسيق الدولي لضمان سلامة واستمرارية نقاط التوزيع.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1578922746465-3a80a228f223?auto=format&fit=crop&w=1400&q=80',
        sourceLanguage: 'ar',
      },
      {
        title: 'Türkiye\'de zekat dağıtım ağı dijital takip sistemine geçiyor',
        publishDate: '2026-03-02',
        intro:
          'Birden fazla vakıf, yardımların doğru haneye ulaşması için ortak bir dijital doğrulama ve raporlama platformu başlattı.',
        content:
          '<h2>Dijital dönüşüm</h2><p>Yeni sistem ile yardım başvuruları kimlik, gelir durumu ve aciliyet kriterlerine göre sınıflandırılacak.</p><p>Kuruluşlar, bağışçılar için anonim ama ölçülebilir etki raporları yayınlayacak.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1400&q=80',
        sourceLanguage: 'tr',
      },
      {
        title: 'Pakistan launches technology scholarship for madrasa graduates',
        publishDate: '2026-03-01',
        intro:
          'The new scholarship model aims to help youth with religious education specialize in software, data analysis and language technologies.',
        content:
          '<h2>Hybrid education model</h2><p>Scholars will join a six-month program through online tech camps and in-person mentoring.</p><p>Micro-grants for graduates\' social enterprise projects are planned.</p>',
        imageUrl:
          'https://images.pexels.com/photos/8197543/pexels-photo-8197543.jpeg?auto=compress&cs=tinysrgb&w=1400',
        sourceLanguage: 'en',
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
        sourceLanguage: item.sourceLanguage,
      });

      await this.newsletterRepository.save(entity);
      createdCount++;
    }

    console.log(
      `✅ Newsletters seeding finished. Created: ${createdCount}, Skipped: ${skippedCount}`,
    );
  }
}
