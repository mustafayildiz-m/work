import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paper } from '../entities/paper.entity';
import { PaperService } from '../services/paper.service';

@Injectable()
export class PapersSeeder {
  constructor(
    @InjectRepository(Paper)
    private readonly paperRepository: Repository<Paper>,
    private readonly paperService: PaperService,
  ) {}

  async seed(): Promise<void> {
    console.log('🌱 Papers seeding started...');

    const seedData: Array<{
      title: string;
      author: string;
      publishDate: string;
      intro: string;
      content: string;
      imageUrl: string;
      tags: string[];
    }> = [
      {
        title: "How Does Ramadan Work? A Beginner's Guide",
        author: 'Anonymous Guest Author',
        publishDate: '2026-03-09',
        intro:
          'Learn about the virtues of fasting in general, the spirit of the practice, why we fast, and what moral, psychological, and spiritual outcomes are desired.',
        content:
          '<h2>Insani yardim cagrisi</h2><p>Ramazan, Islam takviminin dokuzuncu ayidir. Oruc tutmak, gunesin dogusundan batisina kadar yemek, icmek ve bazi bedensel ihtiyaclardan uzak durmaktir.</p><p>Orucun amaci sadece fiziksel bir uygulama degil; ayni zamanda nefsi terbiye etmek, sabri ogrenmek ve Allah ile baglanti kurmaktir.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1761939998860-6ccd2ed9198d?auto=format&fit=crop&w=1400&h=700&q=80',
        tags: ['FAITH', 'ALLAH'],
      },
      {
        title: "Understanding the Qur'an Through the Names and Attributes of Allah",
        author: 'Jinan Yousef',
        publishDate: '2026-03-08',
        intro:
          "Approaching the Qur'an through Allah's names impacts the way we receive its message. This paper contextualizes the messages of the Qur'an through the names that Allah mentions to help you connect to Allah.",
        content:
          '<h2>Allah in Isimleri</h2><p>Kur\'an-i Kerim, Allah\'in bircok guzel ismini ve sifatini zikreder. Bu isimler, O\'nun sonsuz sifatlarini ve kullarina olan rahmetini anlamamiza yardimci olur.</p><p>Al-Rahman, Al-Rahim, Al-Hakim gibi isimler, Kur\'an mesajlarini daha derinlemesine kavramamiza olanak saglar.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1761056835725-47bd7658df37?auto=format&fit=crop&w=1400&h=700&q=80',
        tags: ['FAITH', 'ALLAH'],
      },
      {
        title: 'Zekat ve Modern Ekonomi: Islami Perspektif',
        author: 'Dr. Ahmed Hassan',
        publishDate: '2026-03-07',
        intro:
          'Zekatin cagdas finansal sistemlerdeki yeri ve dijital odeme araclariyla uygulanabilirligi uzerine akademik bir inceleme.',
        content:
          '<h2>Zekat ve Dijital Donusum</h2><p>Zekat, Islam\'in bes sartindan biridir ve malin belirli bir oraninin ihtiyac sahiplerine verilmesini icerir.</p><p>Modern cagda dijital odeme sistemleri, zekatin daha etkin ve seffaf bir sekilde toplanmasi ve dagitilmasi icin yeni imkanlar sunmaktadir.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1759162323169-f7e380922a2f?auto=format&fit=crop&w=1400&h=700&q=80',
        tags: ['FIQH', 'ECONOMICS'],
      },
      {
        title: 'Islamda Aile ve Evlilik',
        author: 'Prof. Fatma Yilmaz',
        publishDate: '2026-03-06',
        intro:
          'Islami ogretilerde aile yapisinin onemi ve evlilik kurumunun toplumsal rolune dair bir arastirma.',
        content:
          '<h2>Aile Kurumu</h2><p>Islam, aileyi toplumun temel tasi olarak gorur. Nikah, iki kisinin Allah\'in rizasiyla bir araya gelmesidir.</p><p>Karsilikli sevgi, saygi ve anlayis, saglikli bir aile yapisinin temel unsurlaridir.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1710362781451-96f51265b43e?auto=format&fit=crop&w=1400&h=700&q=80',
        tags: ['FAMILY', 'FIQH'],
      },
      {
        title: 'Tefsir Tarihinde Cagdas Yaklasimlar',
        author: 'Dr. Mehmet Kaya',
        publishDate: '2026-03-05',
        intro:
          'Kur\'an tefsirinde modern metodolojiler ve tarihsel baglamin onemi uzerine akademik bir degerlendirme.',
        content:
          '<h2>Tefsir Metodolojisi</h2><p>Tefsir ilmi, Kur\'an ayetlerinin anlamini aciklamayi hedefler. Tarih boyunca farkli ekoller ve yaklasimlar gelismistir.</p><p>Cagdas tefsir calismalari, dil bilimi, tarih ve sosyoloji gibi disiplinlerden yararlanarak daha kapsamli bir anlama ulasmayi amaclar.</p>',
        imageUrl:
          'https://images.unsplash.com/photo-1597258071486-bc1754c01349?auto=format&fit=crop&w=1400&h=700&q=80',
        tags: ['QURAN', 'SCHOLARSHIP'],
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
