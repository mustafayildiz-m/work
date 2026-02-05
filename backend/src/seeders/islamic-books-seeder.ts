import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../books/entities/book.entity';
import { BookTranslation } from '../books/entities/book-translation.entity';
import { Language } from '../languages/entities/language.entity';

@Injectable()
export class IslamicBooksSeeder {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(BookTranslation)
    private readonly bookTranslationRepository: Repository<BookTranslation>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
  ) {}

  async seed() {
    console.log('🌱 Starting Islamic books seeding...');

    // İslami kitaplar
    const islamicBooks = [
      {
        title: "Kur'an-ı Kerim",
        description: "İslam'ın kutsal kitabı, Allah'ın vahyi",
        coverUrl: 'uploads/books/kuran-kerim.jpg',
        author: 'Allah (C.C.)',
        publishDate: new Date('632-01-01'),
        summary:
          "İslam dininin temel kaynağı olan kutsal kitap. Hz. Muhammed'e 23 yıl boyunca vahyedilen ayetlerden oluşur.",
        languages: [
          { languageCode: 'ar', pdfUrl: 'uploads/books/kuran-arabic.pdf' },
          { languageCode: 'tr', pdfUrl: 'uploads/books/kuran-turkish.pdf' },
          { languageCode: 'en', pdfUrl: 'uploads/books/kuran-english.pdf' },
        ],
      },
      {
        title: 'Sahih-i Buhari',
        description: 'En güvenilir hadis koleksiyonu',
        coverUrl: 'uploads/books/sahih-buhari.jpg',
        author: 'İmam Buhari',
        publishDate: new Date('0870-01-01'),
        summary:
          "İslam'ın en güvenilir hadis kaynağı. 600.000 hadis arasından seçilen 7.275 hadis içerir.",
        languages: [
          {
            languageCode: 'ar',
            pdfUrl: 'uploads/books/sahih-buhari-arabic.pdf',
          },
          {
            languageCode: 'tr',
            pdfUrl: 'uploads/books/sahih-buhari-turkish.pdf',
          },
          {
            languageCode: 'en',
            pdfUrl: 'uploads/books/sahih-buhari-english.pdf',
          },
        ],
      },
      {
        title: 'Sahih-i Müslim',
        description: 'İkinci en güvenilir hadis koleksiyonu',
        coverUrl: 'uploads/books/sahih-muslim.jpg',
        author: 'İmam Müslim',
        publishDate: new Date('0875-01-01'),
        summary:
          "Sahih-i Buhari'den sonra en güvenilir hadis kaynağı. 300.000 hadis arasından seçilen 4.000 hadis içerir.",
        languages: [
          {
            languageCode: 'ar',
            pdfUrl: 'uploads/books/sahih-muslim-arabic.pdf',
          },
          {
            languageCode: 'tr',
            pdfUrl: 'uploads/books/sahih-muslim-turkish.pdf',
          },
          {
            languageCode: 'en',
            pdfUrl: 'uploads/books/sahih-muslim-english.pdf',
          },
        ],
      },
      {
        title: "İhya-u Ulumi'd-Din",
        description: 'Tasavvuf ve ahlak konularında en önemli eser',
        coverUrl: 'uploads/books/ihya-ulumiddin.jpg',
        author: 'İmam Gazali',
        publishDate: new Date('1111-01-01'),
        summary:
          'İslam tasavvufunun en önemli eserlerinden biri. 4 cilt halinde ibadet, adet, helak ve necat konularını ele alır.',
        languages: [
          { languageCode: 'ar', pdfUrl: 'uploads/books/ihya-arabic.pdf' },
          { languageCode: 'tr', pdfUrl: 'uploads/books/ihya-turkish.pdf' },
          { languageCode: 'en', pdfUrl: 'uploads/books/ihya-english.pdf' },
        ],
      },
      {
        title: 'Mesnevi',
        description: 'Tasavvuf ve aşk konularında en önemli eser',
        coverUrl: 'uploads/books/mesnevi.jpg',
        author: 'Mevlana Celaleddin Rumi',
        publishDate: new Date('1273-01-01'),
        summary:
          'Tasavvuf edebiyatının şaheseri. 6 cilt halinde 25.000 beyit içerir. Aşk, ahlak ve maneviyat konularını ele alır.',
        languages: [
          { languageCode: 'fa', pdfUrl: 'uploads/books/mesnevi-persian.pdf' },
          { languageCode: 'tr', pdfUrl: 'uploads/books/mesnevi-turkish.pdf' },
          { languageCode: 'en', pdfUrl: 'uploads/books/mesnevi-english.pdf' },
        ],
      },
      {
        title: 'Fıkh-ı Ekber',
        description: 'İslam inanç esaslarını açıklayan temel eser',
        coverUrl: 'uploads/books/fikh-ekber.jpg',
        author: 'İmam-ı Azam Ebu Hanife',
        publishDate: new Date('0767-01-01'),
        summary:
          'İslam inanç esaslarının sistematik açıklaması. Kelam ilminin temel kaynaklarından biri.',
        languages: [
          { languageCode: 'ar', pdfUrl: 'uploads/books/fikh-ekber-arabic.pdf' },
          {
            languageCode: 'tr',
            pdfUrl: 'uploads/books/fikh-ekber-turkish.pdf',
          },
          {
            languageCode: 'en',
            pdfUrl: 'uploads/books/fikh-ekber-english.pdf',
          },
        ],
      },
      {
        title: 'Muvatta',
        description: 'Hadis ve fıkıh konularında en önemli eser',
        coverUrl: 'uploads/books/muvatta.jpg',
        author: 'İmam Malik bin Enes',
        publishDate: new Date('0795-01-01'),
        summary:
          'Maliki mezhebinin temel kaynağı. Medine halkının ameli ve hadislerin bir araya getirildiği eser.',
        languages: [
          { languageCode: 'ar', pdfUrl: 'uploads/books/muvatta-arabic.pdf' },
          { languageCode: 'tr', pdfUrl: 'uploads/books/muvatta-turkish.pdf' },
          { languageCode: 'en', pdfUrl: 'uploads/books/muvatta-english.pdf' },
        ],
      },
      {
        title: 'er-Risale',
        description: 'Fıkıh usulü konusunda temel eser',
        coverUrl: 'uploads/books/er-risale.jpg',
        author: 'İmam Şafii',
        publishDate: new Date('0820-01-01'),
        summary:
          "Fıkıh usulünün ilk sistematik eseri. Şer'i hükümlerin çıkarılma yöntemlerini açıklar.",
        languages: [
          { languageCode: 'ar', pdfUrl: 'uploads/books/er-risale-arabic.pdf' },
          { languageCode: 'tr', pdfUrl: 'uploads/books/er-risale-turkish.pdf' },
          { languageCode: 'en', pdfUrl: 'uploads/books/er-risale-english.pdf' },
        ],
      },
      {
        title: 'Müsned',
        description: 'En büyük hadis koleksiyonlarından biri',
        coverUrl: 'uploads/books/musned.jpg',
        author: 'İmam Ahmed bin Hanbel',
        publishDate: new Date('0855-01-01'),
        summary:
          'Hanbeli mezhebinin temel kaynağı. 30.000 hadis içeren büyük koleksiyon.',
        languages: [
          { languageCode: 'ar', pdfUrl: 'uploads/books/musned-arabic.pdf' },
          { languageCode: 'tr', pdfUrl: 'uploads/books/musned-turkish.pdf' },
          { languageCode: 'en', pdfUrl: 'uploads/books/musned-english.pdf' },
        ],
      },
      {
        title: "el-Kanun fi't-Tıb",
        description: 'Tıp alanında en önemli eserlerden biri',
        coverUrl: 'uploads/books/el-kanun.jpg',
        author: 'İbn Sina',
        publishDate: new Date('1037-01-01'),
        summary:
          'Ortaçağ tıbbının en kapsamlı eseri. 5 cilt halinde tıp biliminin tüm alanlarını kapsar.',
        languages: [
          { languageCode: 'ar', pdfUrl: 'uploads/books/el-kanun-arabic.pdf' },
          { languageCode: 'tr', pdfUrl: 'uploads/books/el-kanun-turkish.pdf' },
          { languageCode: 'en', pdfUrl: 'uploads/books/el-kanun-english.pdf' },
        ],
      },
      {
        title: 'Tefsir-i Kebir',
        description: "Kur'an tefsirinin en kapsamlı eserlerinden biri",
        coverUrl: 'uploads/books/tefsir-kebir.jpg',
        author: 'Fahruddin er-Razi',
        publishDate: new Date('1209-01-01'),
        summary:
          "Kur'an tefsirinin en detaylı eserlerinden biri. Kelam, felsefe ve tasavvuf açılarından tefsir.",
        languages: [
          {
            languageCode: 'ar',
            pdfUrl: 'uploads/books/tefsir-kebir-arabic.pdf',
          },
          {
            languageCode: 'tr',
            pdfUrl: 'uploads/books/tefsir-kebir-turkish.pdf',
          },
          {
            languageCode: 'en',
            pdfUrl: 'uploads/books/tefsir-kebir-english.pdf',
          },
        ],
      },
      {
        title: 'Divan-ı Kebir',
        description: 'Şiirlerinin toplandığı büyük divan',
        coverUrl: 'uploads/books/divan-kebir.jpg',
        author: 'Mevlana Celaleddin Rumi',
        publishDate: new Date('1273-01-01'),
        summary:
          "Mevlana'nın tüm şiirlerinin toplandığı büyük divan. Gazel, rubai ve kaside türlerinde şiirler içerir.",
        languages: [
          {
            languageCode: 'fa',
            pdfUrl: 'uploads/books/divan-kebir-persian.pdf',
          },
          {
            languageCode: 'tr',
            pdfUrl: 'uploads/books/divan-kebir-turkish.pdf',
          },
          {
            languageCode: 'en',
            pdfUrl: 'uploads/books/divan-kebir-english.pdf',
          },
        ],
      },
      {
        title: "Tahafütü'l-Felasife",
        description: 'Felsefecilerin tutarsızlıklarını ele alan eser',
        coverUrl: 'uploads/books/tahafut.jpg',
        author: 'İmam Gazali',
        publishDate: new Date('1111-01-01'),
        summary:
          'Felsefecilerin görüşlerini eleştiren ve İslam düşüncesini savunan eser.',
        languages: [
          { languageCode: 'ar', pdfUrl: 'uploads/books/tahafut-arabic.pdf' },
          { languageCode: 'tr', pdfUrl: 'uploads/books/tahafut-turkish.pdf' },
          { languageCode: 'en', pdfUrl: 'uploads/books/tahafut-english.pdf' },
        ],
      },
      {
        title: 'eş-Şifa',
        description: 'Felsefe ve mantık konularında kapsamlı eser',
        coverUrl: 'uploads/books/esh-shifa.jpg',
        author: 'İbn Sina',
        publishDate: new Date('1037-01-01'),
        summary:
          'Aristoteles felsefesinin İslam dünyasındaki en kapsamlı yorumu. Mantık, fizik, metafizik konularını ele alır.',
        languages: [
          { languageCode: 'ar', pdfUrl: 'uploads/books/esh-shifa-arabic.pdf' },
          { languageCode: 'tr', pdfUrl: 'uploads/books/esh-shifa-turkish.pdf' },
          { languageCode: 'en', pdfUrl: 'uploads/books/esh-shifa-english.pdf' },
        ],
      },
      {
        title: 'Fihi Ma Fih',
        description: "Mevlana'nın sohbetlerinin derlemesi",
        coverUrl: 'uploads/books/fihi-ma-fih.jpg',
        author: 'Mevlana Celaleddin Rumi',
        publishDate: new Date('1273-01-01'),
        summary:
          "Mevlana'nın sohbetlerinin derlendiği eser. Tasavvuf, ahlak ve maneviyat konularında derin düşünceler.",
        languages: [
          {
            languageCode: 'fa',
            pdfUrl: 'uploads/books/fihi-ma-fih-persian.pdf',
          },
          {
            languageCode: 'tr',
            pdfUrl: 'uploads/books/fihi-ma-fih-turkish.pdf',
          },
          {
            languageCode: 'en',
            pdfUrl: 'uploads/books/fihi-ma-fih-english.pdf',
          },
        ],
      },
    ];

    for (const bookData of islamicBooks) {
      try {
        // Kitabın zaten var olup olmadığını kontrol et (author + publishDate ile)
        const existingBook = await this.bookRepository.findOne({
          where: {
            author: bookData.author,
            publishDate: bookData.publishDate,
          },
        });

        if (existingBook) {
          console.log(`⚠️  Book already exists: ${bookData.title}`);
          continue;
        }

        // Kitabı oluştur (sadece dil-bağımsız alanlar)
        const { languages, title, description, summary, ...bookInfo } =
          bookData;
        const book = this.bookRepository.create(bookInfo);
        const savedBook = await this.bookRepository.save(book);

        // Her dil için translation oluştur
        for (const langData of languages) {
          const language = await this.languageRepository.findOne({
            where: { code: langData.languageCode },
          });

          if (language) {
            const bookTranslation = this.bookTranslationRepository.create({
              bookId: savedBook.id,
              languageId: language.id,
              title: bookData.title, // Şimdilik tüm dillerde aynı başlık
              description: bookData.description,
              summary: bookData.summary,
              pdfUrl: langData.pdfUrl,
            });

            await this.bookTranslationRepository.save(bookTranslation);
          }
        }

        console.log(
          `✅ Added book: ${bookData.title} with ${languages.length} languages`,
        );
      } catch (error) {
        console.error(`❌ Error adding book ${bookData.title}:`, error.message);
      }
    }

    console.log('🎉 Islamic books seeding completed!');
  }
}
