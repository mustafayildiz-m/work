import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scholar } from '../scholars/entities/scholar.entity';
import { ScholarBook } from '../scholars/entities/scholar-book.entity';
import { Source } from '../sources/entities/source.entity';

@Injectable()
export class ScholarSeeder {
  constructor(
    @InjectRepository(Scholar)
    private readonly scholarRepository: Repository<Scholar>,
    @InjectRepository(ScholarBook)
    private readonly scholarBookRepository: Repository<ScholarBook>,
    @InjectRepository(Source)
    private readonly sourceRepository: Repository<Source>,
  ) {}

  async seed() {
    console.log('🌱 Starting scholar seeding...');

    const scholars = [
      {
        fullName: 'İmam-ı Azam Ebu Hanife',
        lineage: "Ebu Hanife en-Nu'man bin Sabit bin Zuta",
        birthDate: '699',
        deathDate: '767',
        biography:
          "İslam fıkhının en büyük alimlerinden biri ve Hanefi mezhebinin kurucusu. Kufe'de doğdu ve Bağdat'ta vefat etti. Fıkıh, hadis ve kelam alanlarında büyük eserler verdi. En önemli özelliği kıyas metodunu sistematik hale getirmesi ve rey fıkhının temellerini atmasıdır.",
        photoUrl: 'uploads/coverImage/coverImage.jpg',
        coverImage: 'uploads/coverImage/coverImage.jpg',
        latitude: 33.3152,
        longitude: 44.3661,
        locationName: 'Kufe, Irak',
        locationDescription:
          "Ebu Hanife'nin doğduğu ve ilk eğitimini aldığı şehir",
        ownBooks: [
          {
            title: 'Fıkh-ı Ekber',
            description: 'İslam inanç esaslarını açıklayan temel eser',
            coverUrl: 'uploads/coverImage/coverImage.jpg',
          },
          {
            title: "Kitabü'l-Asar",
            description: 'Hadis ve fıkıh konularında önemli bir eser',
            coverUrl: 'uploads/coverImage/coverImage.jpg',
          },
        ],
        sources: [
          {
            content: "Ebu Hanife'nin fıkıh metodolojisi hakkında detaylı bilgi",
            url: 'https://islamansiklopedisi.org.tr/ebu-hanife',
          },
        ],
      },
      {
        fullName: 'İmam Malik bin Enes',
        lineage: 'Malik bin Enes bin Malik bin Ebi Amir el-Asbahi',
        birthDate: '711',
        deathDate: '795',
        biography:
          "Maliki mezhebinin kurucusu ve Medine'nin en büyük alimi. Medine'de doğdu ve vefat etti. Muvatta adlı eseri ile tanınır. Medine halkının ameli (uygulaması) konusunda önemli çalışmalar yaptı.",
        photoUrl: 'uploads/coverImage/coverImage.jpg',
        coverImage: 'uploads/coverImage/coverImage.jpg',
        latitude: 24.5247,
        longitude: 39.5692,
        locationName: 'Medine, Suudi Arabistan',
        locationDescription: "İmam Malik'in doğduğu ve yaşadığı kutsal şehir",
        ownBooks: [
          {
            title: 'Muvatta',
            description: 'Hadis ve fıkıh konularında en önemli eser',
            coverUrl: 'uploads/coverImage/coverImage.jpg',
          },
        ],
        sources: [
          {
            content: "İmam Malik'in hayatı ve eserleri hakkında bilgi",
            url: 'https://islamansiklopedisi.org.tr/malik-b-enes',
          },
        ],
      },
      {
        fullName: 'İmam Şafii',
        lineage: 'Muhammed bin İdris bin Abbas bin Osman bin Şafii',
        birthDate: '767',
        deathDate: '820',
        biography:
          "Şafii mezhebinin kurucusu ve İslam fıkhının büyük alimi. Gazze'de doğdu, Mısır'da vefat etti. Fıkıh usulü konusunda önemli çalışmalar yaptı ve er-Risale adlı eseri ile fıkıh metodolojisini sistematik hale getirdi.",
        photoUrl: 'uploads/coverImage/coverImage.jpg',
        coverImage: 'uploads/coverImage/coverImage.jpg',
        latitude: 30.0444,
        longitude: 31.2357,
        locationName: 'Kahire, Mısır',
        locationDescription:
          "İmam Şafii'nin vefat ettiği ve türbesinin bulunduğu şehir",
        ownBooks: [
          {
            title: 'er-Risale',
            description: 'Fıkıh usulü konusunda temel eser',
            coverUrl: 'uploads/coverImage/coverImage.jpg',
          },
          {
            title: 'el-Ümm',
            description: 'Fıkıh konularında kapsamlı eser',
            coverUrl: 'uploads/coverImage/coverImage.jpg',
          },
        ],
        sources: [
          {
            content: "İmam Şafii'nin fıkıh metodolojisi",
            url: 'https://islamansiklopedisi.org.tr/safii',
          },
        ],
      },
      {
        fullName: 'İmam Ahmed bin Hanbel',
        lineage: 'Ahmed bin Muhammed bin Hanbel eş-Şeybani',
        birthDate: '780',
        deathDate: '855',
        biography:
          "Hanbeli mezhebinin kurucusu ve büyük hadis alimi. Bağdat'ta doğdu ve vefat etti. Müsned adlı eseri ile tanınır. Mihne döneminde büyük sıkıntılar çekti ve inancından taviz vermedi.",
        photoUrl: 'uploads/coverImage/coverImage.jpg',
        coverImage: 'uploads/coverImage/coverImage.jpg',
        latitude: 33.3152,
        longitude: 44.3661,
        locationName: 'Bağdat, Irak',
        locationDescription:
          "İmam Ahmed bin Hanbel'in doğduğu ve vefat ettiği şehir",
        ownBooks: [
          {
            title: 'Müsned',
            description: 'En büyük hadis koleksiyonlarından biri',
            coverUrl: 'uploads/coverImage/coverImage.jpg',
          },
        ],
        sources: [
          {
            content: "İmam Ahmed bin Hanbel'in hayatı ve mücadeleleri",
            url: 'https://islamansiklopedisi.org.tr/ahmed-b-hanbel',
          },
        ],
      },
      {
        fullName: 'İmam Gazali',
        lineage: 'Ebu Hamid Muhammed bin Muhammed bin Muhammed el-Gazali',
        birthDate: '1058',
        deathDate: '1111',
        biography:
          "İslam düşüncesinin en büyük alimlerinden biri. Tus'ta doğdu ve aynı yerde vefat etti. Felsefe, kelam, tasavvuf ve fıkıh alanlarında büyük eserler verdi. İhya-u Ulumi'd-Din adlı eseri ile tanınır.",
        photoUrl: 'uploads/coverImage/coverImage.jpg',
        coverImage: 'uploads/coverImage/coverImage.jpg',
        latitude: 36.2605,
        longitude: 59.6168,
        locationName: 'Tus, İran',
        locationDescription: "İmam Gazali'nin doğduğu ve vefat ettiği şehir",
        ownBooks: [
          {
            title: "İhya-u Ulumi'd-Din",
            description: 'Tasavvuf ve ahlak konularında en önemli eser',
            coverUrl: 'uploads/coverImage/coverImage.jpg',
          },
          {
            title: "Tahafütü'l-Felasife",
            description: 'Felsefecilerin tutarsızlıklarını ele alan eser',
            coverUrl: 'uploads/coverImage/coverImage.jpg',
          },
        ],
        sources: [
          {
            content: "İmam Gazali'nin düşünce sistemi",
            url: 'https://islamansiklopedisi.org.tr/gazali',
          },
        ],
      },
      {
        fullName: 'İbn Sina',
        lineage: 'Ebu Ali el-Hüseyin bin Abdullah bin Sina',
        birthDate: '980',
        deathDate: '1037',
        biography:
          "İslam dünyasının en büyük filozof ve hekimi. Buhara yakınlarında doğdu, Hemedan'da vefat etti. Tıp, felsefe, matematik ve astronomi alanlarında büyük eserler verdi. el-Kanun fi't-Tıb adlı eseri ile tanınır.",
        photoUrl: 'uploads/coverImage/coverImage.jpg',
        coverImage: 'uploads/coverImage/coverImage.jpg',
        latitude: 34.7989,
        longitude: 48.515,
        locationName: 'Hemedan, İran',
        locationDescription:
          "İbn Sina'nın vefat ettiği ve türbesinin bulunduğu şehir",
        ownBooks: [
          {
            title: "el-Kanun fi't-Tıb",
            description: 'Tıp alanında en önemli eserlerden biri',
            coverUrl: 'uploads/coverImage/coverImage.jpg',
          },
          {
            title: 'eş-Şifa',
            description: 'Felsefe ve mantık konularında kapsamlı eser',
            coverUrl: 'uploads/coverImage/coverImage.jpg',
          },
        ],
        sources: [
          {
            content: "İbn Sina'nın tıp ve felsefe alanındaki katkıları",
            url: 'https://islamansiklopedisi.org.tr/ibn-sina',
          },
        ],
      },
      {
        fullName: 'İbn Rüşd',
        lineage: "Ebu'l-Velid Muhammed bin Ahmed bin Rüşd",
        birthDate: '1126',
        deathDate: '1198',
        biography:
          "Endülüs'ün en büyük filozofu ve hekimi. Kurtuba'da doğdu ve aynı yerde vefat etti. Aristoteles felsefesini İslam dünyasına tanıttı. Felsefe, tıp ve hukuk alanlarında önemli eserler verdi.",
        photoUrl: 'uploads/coverImage/coverImage.jpg',
        coverImage: 'uploads/coverImage/coverImage.jpg',
        latitude: 37.8882,
        longitude: -4.7794,
        locationName: 'Kurtuba, İspanya',
        locationDescription:
          "İbn Rüşd'ün doğduğu ve vefat ettiği Endülüs şehri",
        ownBooks: [
          {
            title: "Tahafütü't-Tahafüt",
            description: "Gazali'nin felsefe eleştirilerine cevap",
            coverUrl: 'uploads/coverImage/coverImage.jpg',
          },
          {
            title: "el-Külliyat fi't-Tıb",
            description: 'Tıp alanında önemli eser',
            coverUrl: 'uploads/coverImage/coverImage.jpg',
          },
        ],
        sources: [
          {
            content: "İbn Rüşd'ün felsefe ve bilim alanındaki katkıları",
            url: 'https://islamansiklopedisi.org.tr/ibn-rusd',
          },
        ],
      },
      {
        fullName: 'İmam Buhari',
        lineage:
          'Ebu Abdullah Muhammed bin İsmail bin İbrahim bin Mugire el-Buhari',
        birthDate: '810',
        deathDate: '870',
        biography:
          "En büyük hadis alimlerinden biri ve Sahih-i Buhari'nin müellifi. Buhara'da doğdu, Semerkant'ta vefat etti. Hadis ilminin en güvenilir kaynaklarından biri olan Sahih-i Buhari'yi derledi.",
        photoUrl: 'uploads/coverImage/coverImage.jpg',
        coverImage: 'uploads/coverImage/coverImage.jpg',
        latitude: 39.6547,
        longitude: 66.9597,
        locationName: 'Buhara, Özbekistan',
        locationDescription: "İmam Buhari'nin doğduğu şehir",
        ownBooks: [
          {
            title: 'Sahih-i Buhari',
            description: 'En güvenilir hadis koleksiyonu',
            coverUrl: 'uploads/coverImage/coverImage.jpg',
          },
          {
            title: "et-Tarihu'l-Kebir",
            description: 'Hadis ricali hakkında önemli eser',
            coverUrl: 'uploads/coverImage/coverImage.jpg',
          },
        ],
        sources: [
          {
            content: "İmam Buhari'nin hadis metodolojisi",
            url: 'https://islamansiklopedisi.org.tr/buhari',
          },
        ],
      },
      {
        fullName: 'İmam Müslim',
        lineage: "Ebu'l-Hüseyin Müslim bin Haccac bin Müslim el-Kuşeyri",
        birthDate: '821',
        deathDate: '875',
        biography:
          "Büyük hadis alimi ve Sahih-i Müslim'in müellifi. Nişabur'da doğdu ve vefat etti. Sahih-i Müslim, Sahih-i Buhari'den sonra en güvenilir hadis koleksiyonudur.",
        photoUrl: 'uploads/coverImage/coverImage.jpg',
        coverImage: 'uploads/coverImage/coverImage.jpg',
        latitude: 36.214,
        longitude: 58.7961,
        locationName: 'Nişabur, İran',
        locationDescription: "İmam Müslim'in doğduğu ve vefat ettiği şehir",
        ownBooks: [
          {
            title: 'Sahih-i Müslim',
            description: 'En güvenilir hadis koleksiyonlarından biri',
            coverUrl: 'uploads/coverImage/coverImage.jpg',
          },
        ],
        sources: [
          {
            content: "İmam Müslim'in hadis çalışmaları",
            url: 'https://islamansiklopedisi.org.tr/muslim',
          },
        ],
      },
      {
        fullName: 'Mevlana Celaleddin Rumi',
        lineage: 'Celaleddin Muhammed bin Bahauddin Veled',
        birthDate: '1207',
        deathDate: '1273',
        biography:
          "Büyük mutasavvıf, şair ve düşünür. Belh'te doğdu, Konya'da vefat etti. Mesnevi adlı eseri ile tanınır. Tasavvuf ve aşk konularında derin düşünceler ortaya koydu.",
        photoUrl: 'uploads/coverImage/coverImage.jpg',
        coverImage: 'uploads/coverImage/coverImage.jpg',
        latitude: 37.8746,
        longitude: 32.4932,
        locationName: 'Konya, Türkiye',
        locationDescription:
          "Mevlana'nın vefat ettiği ve türbesinin bulunduğu şehir",
        ownBooks: [
          {
            title: 'Mesnevi',
            description: 'Tasavvuf ve aşk konularında en önemli eser',
            coverUrl: 'uploads/coverImage/coverImage.jpg',
          },
          {
            title: 'Divan-ı Kebir',
            description: 'Şiirlerinin toplandığı büyük divan',
            coverUrl: 'uploads/coverImage/coverImage.jpg',
          },
        ],
        sources: [
          {
            content: "Mevlana'nın tasavvuf düşüncesi",
            url: 'https://islamansiklopedisi.org.tr/mevlana',
          },
        ],
      },
    ];

    for (const scholarData of scholars) {
      try {
        // Scholar'ın zaten var olup olmadığını kontrol et
        const existingScholar = await this.scholarRepository.findOne({
          where: { fullName: scholarData.fullName },
        });

        if (existingScholar) {
          console.log(`⚠️  Scholar already exists: ${scholarData.fullName}`);
          continue;
        }

        // Scholar'ı oluştur
        const { ownBooks, sources, ...scholarInfo } = scholarData;
        const scholar = this.scholarRepository.create(scholarInfo);
        const savedScholar = await this.scholarRepository.save(scholar);

        // Kendi kitaplarını ekle
        if (ownBooks && ownBooks.length > 0) {
          const books = ownBooks.map((book) =>
            this.scholarBookRepository.create({
              ...book,
              scholar: savedScholar,
            }),
          );
          await this.scholarBookRepository.save(books);
        }

        // Kaynakları ekle
        if (sources && sources.length > 0) {
          const sourceEntities = sources.map((source) =>
            this.sourceRepository.create({ ...source, scholar: savedScholar }),
          );
          await this.sourceRepository.save(sourceEntities);
        }

        console.log(
          `✅ Successfully added: ${scholarData.fullName} (ID: ${savedScholar.id})`,
        );
      } catch (error) {
        console.error(
          `❌ Error adding ${scholarData.fullName}:`,
          error.message,
        );
      }
    }

    console.log('🎉 Scholar seeding completed!');
  }
}
