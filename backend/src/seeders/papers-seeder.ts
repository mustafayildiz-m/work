import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paper } from '../entities/paper.entity';
import { PaperService } from '../services/paper.service';

type SeedPaper = {
  title: string;
  author: string;
  publishDate: string;
  intro: string;
  content: string;
  imageUrl: string;
  tags: string[];
  sourceLanguage: string;
};

@Injectable()
export class PapersSeeder {
  constructor(
    @InjectRepository(Paper)
    private readonly paperRepository: Repository<Paper>,
    private readonly paperService: PaperService,
  ) {}

  async seed(): Promise<void> {
    console.log('🌱 Papers seeding started...');

    const seedData: SeedPaper[] = [
      // Türkçe
      {
        title: 'Ramazan Nasıl İşler? Yeni Başlayanlar İçin Rehber',
        author: 'Anonim Misafir Yazar',
        publishDate: '2026-03-09',
        intro:
          'Orucun faziletleri, uygulamanın ruhu, neden oruç tuttuğumuz ve hangi ahlaki, psikolojik ve manevi sonuçların hedeflendiği hakkında bilgi edinin.',
        content:
          '<h2>İnsani yardım çağrısı</h2><p>Ramazan, İslam takviminin dokuzuncu ayıdır. Oruç tutmak, güneşin doğuşundan batışına kadar yemek, içmek ve bazı bedensel ihtiyaçlardan uzak durmaktır.</p><p>Orucun amacı sadece fiziksel bir uygulama değil; aynı zamanda nefsi terbiye etmek, sabrı öğrenmek ve Allah ile bağlantı kurmaktır.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1761939998860-6ccd2ed9198d?auto=format&fit=crop&w=1400&h=700&q=80',
        tags: ['FAITH', 'ALLAH'],
        sourceLanguage: 'tr',
      },
      {
        title: 'Zekat ve Modern Ekonomi: İslami Perspektif',
        author: 'Dr. Ahmed Hassan',
        publishDate: '2026-03-07',
        intro:
          'Zekatın çağdaş finansal sistemlerdeki yeri ve dijital ödeme araçlarıyla uygulanabilirliği üzerine akademik bir inceleme.',
        content:
          '<h2>Zekat ve Dijital Dönüşüm</h2><p>Zekat, İslam\'ın beş şartından biridir ve malın belirli bir oranının ihtiyaç sahiplerine verilmesini içerir.</p><p>Modern çağda dijital ödeme sistemleri, zekatın daha etkin ve şeffaf bir şekilde toplanması ve dağıtılması için yeni imkanlar sunmaktadır.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1759162323169-f7e380922a2f?auto=format&fit=crop&w=1400&h=700&q=80',
        tags: ['FIQH', 'ECONOMICS'],
        sourceLanguage: 'tr',
      },
      // İngilizce
      {
        title: "How Does Ramadan Work? A Beginner's Guide",
        author: 'Anonymous Guest Author',
        publishDate: '2026-03-08',
        intro:
          'Learn about the virtues of fasting in general, the spirit of the practice, why we fast, and what moral, psychological, and spiritual outcomes are desired.',
        content:
          '<h2>Humanitarian Call</h2><p>Ramadan is the ninth month of the Islamic calendar. Fasting means abstaining from food, drink and certain physical needs from the break of dawn until sunset.</p><p>The purpose of fasting is not merely a physical practice; it is also to discipline the soul, learn patience, and connect with Allah.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1761056835725-47bd7658df37?auto=format&fit=crop&w=1400&h=700&q=80',
        tags: ['FAITH', 'ALLAH'],
        sourceLanguage: 'en',
      },
      {
        title: "Understanding the Qur'an Through the Names and Attributes of Allah",
        author: 'Jinan Yousef',
        publishDate: '2026-03-06',
        intro:
          "Approaching the Qur'an through Allah's names impacts the way we receive its message. This paper contextualizes the messages of the Qur'an through the names that Allah mentions to help you connect to Allah.",
        content:
          '<h2>The Names of Allah</h2><p>The Qur\'an mentions many beautiful names and attributes of Allah. These names help us understand His infinite attributes and His mercy towards His servants.</p><p>Names such as Ar-Rahman, Ar-Rahim, Al-Hakim enable us to grasp the messages of the Qur\'an more deeply.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1761056835725-47bd7658df37?auto=format&fit=crop&w=1400&h=700&q=80',
        tags: ['FAITH', 'QURAN'],
        sourceLanguage: 'en',
      },
      // Arapça
      {
        title: 'الصلاة والخشوع: روح العبادة',
        author: 'محمد العلي',
        publishDate: '2026-03-05',
        intro:
          'بحث في أهمية الخشوع في الصلاة وكيفية تحقيقه في الحياة العصرية.',
        content:
          '<h2>معنى الخشوع</h2><p>الخشوع هو حضور القلب والجوارح في العبادة. عندما نصلي بخشوع، ننشغل بالله وحده وننسى الدنيا.</p><p>الصلاة بخشوع تربي النفس وتقرب العبد من ربه.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1597258071486-bc1754c01349?auto=format&fit=crop&w=1400&h=700&q=80',
        tags: ['FAITH', 'PRAYER'],
        sourceLanguage: 'ar',
      },
      // Almanca
      {
        title: 'Zakat und moderne Wirtschaft: Islamische Perspektive',
        author: 'Dr. Ahmed Hassan',
        publishDate: '2026-03-04',
        intro:
          'Eine akademische Untersuchung über die Rolle der Zakat in zeitgenössischen Finanzsystemen und ihre Anwendbarkeit mit digitalen Zahlungsmitteln.',
        content:
          '<h2>Zakat und digitale Transformation</h2><p>Zakat ist eine der fünf Säulen des Islam und beinhaltet die Abgabe eines bestimmten Teils des Vermögens an Bedürftige.</p><p>In der modernen Zeit bieten digitale Zahlungssysteme neue Möglichkeiten für eine effizientere und transparentere Sammlung und Verteilung der Zakat.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1710362781451-96f51265b43e?auto=format&fit=crop&w=1400&h=700&q=80',
        tags: ['FIQH', 'ECONOMICS'],
        sourceLanguage: 'de',
      },
      // Fransızca
      {
        title: "La famille et le mariage en Islam",
        author: 'Prof. Fatma Yilmaz',
        publishDate: '2026-03-03',
        intro:
          "Une recherche sur l'importance de la structure familiale dans les enseignements islamiques et le rôle social de l'institution du mariage.",
        content:
          '<h2>L\'institution familiale</h2><p>L\'Islam considère la famille comme la pierre angulaire de la société. Le mariage est l\'union de deux personnes avec la satisfaction d\'Allah.</p><p>L\'amour mutuel, le respect et la compréhension sont les éléments fondamentaux d\'une structure familiale saine.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1710362781451-96f51265b43e?auto=format&fit=crop&w=1400&h=700&q=80',
        tags: ['FAMILY', 'FIQH'],
        sourceLanguage: 'fr',
      },
      // İspanyolca
      {
        title: 'Enfoques contemporáneos en la historia del exégesis',
        author: 'Dr. Mehmet Kaya',
        publishDate: '2026-03-02',
        intro:
          'Una evaluación académica sobre las metodologías modernas en la exégesis del Corán y la importancia del contexto histórico.',
        content:
          '<h2>Metodología de la exégesis</h2><p>La ciencia del tafsir tiene como objetivo explicar el significado de los versículos del Corán. A lo largo de la historia se han desarrollado diferentes escuelas y enfoques.</p><p>Los estudios contemporáneos de tafsir intentan alcanzar una comprensión más completa utilizando disciplinas como la lingüística, la historia y la sociología.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1597258071486-bc1754c01349?auto=format&fit=crop&w=1400&h=700&q=80',
        tags: ['QURAN', 'SCHOLARSHIP'],
        sourceLanguage: 'es',
      },
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const item of seedData) {
      const existing = await this.paperRepository.findOne({
        where: { title: item.title },
      });

      if (existing) {
        skippedCount++;
        continue;
      }

      const entity = this.paperRepository.create({
        title: item.title,
        author: item.author,
        publishDate: new Date(item.publishDate),
        intro: item.intro,
        content: item.content,
        imageUrl: item.imageUrl,
        tags: item.tags,
        sourceLanguage: item.sourceLanguage,
      });

      await this.paperRepository.save(entity);
      createdCount++;
    }

    await this.paperService.invalidateCache();

    console.log(
      `✅ Papers seeding finished. Created: ${createdCount}, Skipped: ${skippedCount}`,
    );
  }
}
