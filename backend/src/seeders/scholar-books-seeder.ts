import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scholar } from '../scholars/entities/scholar.entity';
import { ScholarBook } from '../scholars/entities/scholar-book.entity';

@Injectable()
export class ScholarBooksSeeder {
  constructor(
    @InjectRepository(Scholar)
    private readonly scholarRepository: Repository<Scholar>,
    @InjectRepository(ScholarBook)
    private readonly scholarBookRepository: Repository<ScholarBook>,
  ) {}

  async seed() {
    console.log('🌱 Starting scholar books seeding...');

    // Her alim için ek kitaplar
    const additionalBooks = {
      1: [
        // İmam-ı Azam Ebu Hanife
        {
          title: "el-Fıkhü'l-Ekber",
          description: 'İslam inanç esaslarının detaylı açıklaması',
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/el-fikhul-ekber.pdf',
        },
        {
          title: 'Risale-i Ebu Hanife',
          description: 'Fıkıh usulü ve metodolojisi hakkında risale',
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/risale-ebu-hanife.pdf',
        },
      ],
      2: [
        // İmam Malik bin Enes
        {
          title: 'el-Mudewwene',
          description: 'Maliki fıkhının temel kaynağı',
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/el-mudewwene.pdf',
        },
        {
          title: "Risale fi'l-Kader",
          description: 'Kader konusunda yazılmış risale',
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/risale-fil-kader.pdf',
        },
      ],
      3: [
        // İmam Şafii
        {
          title: 'el-Ümm',
          description: 'Şafii fıkhının en kapsamlı eseri',
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/el-umm.pdf',
        },
        {
          title: "Ahkamü'l-Kur'an",
          description: "Kur'an'daki hükümlerin tefsiri",
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/ahkamul-kuran.pdf',
        },
        {
          title: "İhtilafü'l-Hadis",
          description: 'Hadis ihtilaflarının çözümü',
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/ihtilaf-ul-hadis.pdf',
        },
      ],
      4: [
        // İmam Ahmed bin Hanbel
        {
          title: "Kitabü'z-Zühd",
          description: 'Zühd ve takva konularında eser',
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/kitabuz-zuhd.pdf',
        },
        {
          title: "er-Red ale'l-Cehmiyye",
          description: 'Cehmiyye mezhebine reddiye',
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/red-alel-cehmiyye.pdf',
        },
      ],
      5: [
        // İmam Gazali
        {
          title: "Mizanü'l-Amel",
          description: 'Ahlak ve davranış ölçüleri',
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/mizanul-amel.pdf',
        },
        {
          title: "el-Munkız mine'd-Dalal",
          description: "Gazali'nin otobiyografik eseri",
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/el-munkiz.pdf',
        },
        {
          title: 'Kimya-yı Saadet',
          description: 'Mutluluk ve kemal yolları',
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/kimya-yi-saadet.pdf',
        },
      ],
      6: [
        // İbn Sina
        {
          title: "el-İşarat ve't-Tenbihat",
          description: 'Felsefe ve mantık konularında eser',
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/el-isarat.pdf',
        },
        {
          title: 'en-Necat',
          description: 'Felsefe ve mantık konularında özet eser',
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/en-necat.pdf',
        },
        {
          title: "Uyunü'l-Hikme",
          description: 'Hikmet ve felsefe konularında eser',
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/uyunul-hikme.pdf',
        },
      ],
      7: [
        // İbn Rüşd
        {
          title: "Faslü'l-Makal",
          description: 'Felsefe ve din ilişkisi hakkında eser',
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/faslul-makal.pdf',
        },
        {
          title: "Tefsirü Ma Ba'de't-Tabia",
          description: "Aristoteles'in Metafizik eserinin tefsiri",
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/tefsir-ma-bade.pdf',
        },
      ],
      8: [
        // İmam Buhari
        {
          title: "et-Tarihu'l-Kebir",
          description: 'Hadis ricali hakkında büyük eser',
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/et-tarihul-kebir.pdf',
        },
        {
          title: "et-Tarihu's-Sağir",
          description: 'Hadis ricali hakkında küçük eser',
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/et-tarihus-sagir.pdf',
        },
        {
          title: "el-Edebü'l-Müfred",
          description: 'Ahlak ve edep konularında hadisler',
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/el-edebul-mufred.pdf',
        },
      ],
      9: [
        // İmam Müslim
        {
          title: 'et-Temyiz',
          description: 'Hadis ricali hakkında eser',
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/et-temyiz.pdf',
        },
        {
          title: 'el-Müfrid',
          description: 'Hadis konularında özel eser',
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/el-mufrid.pdf',
        },
      ],
      10: [
        // Mevlana Celaleddin Rumi
        {
          title: 'Fihi Ma Fih',
          description: "Mevlana'nın sohbetlerinin derlemesi",
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/fihi-ma-fih.pdf',
        },
        {
          title: "Mecalis-i Seb'a",
          description: 'Yedi vaaz derlemesi',
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/mecalis-i-seba.pdf',
        },
        {
          title: 'Rubailer',
          description: "Mevlana'nın rubai tarzındaki şiirleri",
          coverUrl: 'uploads/coverImage/coverImage.jpg',
          pdfUrl: 'uploads/books/rubailer.pdf',
        },
      ],
    };

    for (const [scholarId, books] of Object.entries(additionalBooks)) {
      try {
        // Scholar'ı bul
        const scholar = await this.scholarRepository.findOne({
          where: { id: parseInt(scholarId) },
        });

        if (!scholar) {
          console.log(`⚠️  Scholar not found: ID ${scholarId}`);
          continue;
        }

        // Her kitap için kontrol et ve ekle
        for (const bookData of books) {
          const existingBook = await this.scholarBookRepository.findOne({
            where: {
              title: bookData.title,
              scholar: { id: parseInt(scholarId) },
            },
          });

          if (existingBook) {
            console.log(
              `⚠️  Book already exists: ${bookData.title} for ${scholar.fullName}`,
            );
            continue;
          }

          const book = this.scholarBookRepository.create({
            ...bookData,
            scholar: scholar,
          });

          await this.scholarBookRepository.save(book);
          console.log(
            `✅ Added book: ${bookData.title} for ${scholar.fullName}`,
          );
        }
      } catch (error) {
        console.error(
          `❌ Error adding books for scholar ID ${scholarId}:`,
          error.message,
        );
      }
    }

    console.log('🎉 Scholar books seeding completed!');
  }
}
