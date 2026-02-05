import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../books/entities/book.entity';
import { BookTranslation } from '../books/entities/book-translation.entity';
import { BookCategory } from '../books/entities/book-category.entity';
import { Language } from '../languages/entities/language.entity';

@Injectable()
export class MultiLanguageBooksSeeder {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(BookTranslation)
    private readonly bookTranslationRepository: Repository<BookTranslation>,
    @InjectRepository(BookCategory)
    private readonly bookCategoryRepository: Repository<BookCategory>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
  ) {}

  async seed() {
    console.log('🌱 Çok dilli kitaplar ekleniyor...');

    // Dilleri al
    const languages = {
      tr: await this.languageRepository.findOne({ where: { code: 'tr' } }),
      en: await this.languageRepository.findOne({ where: { code: 'en' } }),
      ar: await this.languageRepository.findOne({ where: { code: 'ar' } }),
      fa: await this.languageRepository.findOne({ where: { code: 'fa' } }),
      ur: await this.languageRepository.findOne({ where: { code: 'ur' } }),
      de: await this.languageRepository.findOne({ where: { code: 'de' } }),
      fr: await this.languageRepository.findOne({ where: { code: 'fr' } }),
      es: await this.languageRepository.findOne({ where: { code: 'es' } }),
      ru: await this.languageRepository.findOne({ where: { code: 'ru' } }),
      az: await this.languageRepository.findOne({ where: { code: 'az' } }),
      id: await this.languageRepository.findOne({ where: { code: 'id' } }),
      ms: await this.languageRepository.findOne({ where: { code: 'ms' } }),
      bn: await this.languageRepository.findOne({ where: { code: 'bn' } }),
      hi: await this.languageRepository.findOne({ where: { code: 'hi' } }),
      kk: await this.languageRepository.findOne({ where: { code: 'kk' } }),
      uz: await this.languageRepository.findOne({ where: { code: 'uz' } }),
    };

    // Eksik diller için uyarı
    Object.entries(languages).forEach(([code, lang]) => {
      if (!lang) {
        console.warn(
          `⚠️  Dil bulunamadı: ${code} - Bu dil için kitap eklenmeyecek`,
        );
      }
    });

    const books = [
      // İslam Tarihi Kitapları
      {
        author: 'İbn Hişam',
        publishDate: new Date('833-01-01'),
        coverImage: '/uploads/books/siret-1.jpg',
        categories: ['İslam Tarihi', 'Siyer', 'Biyografi'],
        translations: [
          {
            lang: 'tr',
            title: "Hz. Muhammed'in Hayatı (es-Sire)",
            description:
              "Hz. Muhammed'in hayatını en detaylı şekilde anlatan klasik siyer kitabı.",
            summary: 'Peygamberimizin doğumundan vefatına kadar olan hayatı.',
          },
          {
            lang: 'en',
            title: 'The Life of Prophet Muhammad (As-Sira)',
            description:
              'The most detailed classical biography of Prophet Muhammad.',
            summary: 'The life of the Prophet from birth to death.',
          },
          {
            lang: 'ar',
            title: 'السيرة النبوية',
            description:
              'أشمل كتاب كلاسيكي عن حياة النبي محمد صلى الله عليه وسلم.',
            summary: 'حياة النبي من الولادة حتى الوفاة.',
          },
        ],
      },
      {
        author: 'İbn İshak',
        publishDate: new Date('767-01-01'),
        coverImage: '/uploads/books/siret-2.jpg',
        categories: ['Siyer', 'İslam Tarihi'],
        translations: [
          {
            lang: 'tr',
            title: "Siretü'n Nebi",
            description:
              'Peygamber efendimizin hayatına dair ilk kapsamlı eser.',
            summary: 'İslam tarihinin temel kaynaklarından.',
          },
          {
            lang: 'en',
            title: 'The Biography of the Prophet',
            description:
              'The first comprehensive work on the life of the Prophet.',
            summary: 'One of the basic sources of Islamic history.',
          },
          {
            lang: 'ar',
            title: 'سيرة النبي',
            description: 'أول عمل شامل عن حياة النبي.',
            summary: 'من المصادر الأساسية للتاريخ الإسلامي.',
          },
          {
            lang: 'ur',
            title: 'سیرت النبی',
            description: 'نبی کریم کی زندگی کے بارے میں پہلا جامع کام۔',
            summary: 'اسلامی تاریخ کے بنیادی ذرائع میں سے ایک۔',
          },
        ],
      },
      {
        author: 'Taberî',
        publishDate: new Date('923-01-01'),
        coverImage: '/uploads/books/tarih-taberi.jpg',
        categories: ['İslam Tarihi', 'Tarih', 'Tefsir'],
        translations: [
          {
            lang: 'tr',
            title: 'Tarih-i Taberî',
            description: 'İslam tarihinin en önemli kaynaklarından biri.',
            summary: 'Yaratılıştan yazarın dönemine kadar olan tarih.',
          },
          {
            lang: 'en',
            title: 'The History of al-Tabari',
            description:
              'One of the most important sources of Islamic history.',
            summary: "History from creation to the author's time.",
          },
          {
            lang: 'ar',
            title: 'تاريخ الطبري',
            description: 'من أهم مصادر التاريخ الإسلامي.',
            summary: 'التاريخ من الخلق إلى زمن المؤلف.',
          },
          {
            lang: 'fa',
            title: 'تاریخ طبری',
            description: 'یکی از مهمترین منابع تاریخ اسلام.',
            summary: 'تاریخ از آفرینش تا زمان مؤلف.',
          },
        ],
      },

      // Hadis Kitapları
      {
        author: 'İmam Buhari',
        publishDate: new Date('870-01-01'),
        coverImage: '/uploads/books/sahih-buhari.jpg',
        categories: ['Hadis', 'Sahih', 'İslam İlimleri'],
        translations: [
          {
            lang: 'tr',
            title: 'Sahih-i Buhari',
            description:
              "En sahih hadis kitabı, Kur'an'dan sonra en güvenilir kaynak.",
            summary:
              "Peygamberimizin sözleri ve hayatı hakkında 7000'den fazla hadis.",
          },
          {
            lang: 'en',
            title: 'Sahih al-Bukhari',
            description:
              'The most authentic hadith book, the most reliable source after the Quran.',
            summary:
              'More than 7000 hadiths about the words and life of the Prophet.',
          },
          {
            lang: 'ar',
            title: 'صحيح البخاري',
            description: 'أصح كتب الحديث، المصدر الأوثق بعد القرآن.',
            summary: 'أكثر من 7000 حديث عن أقوال النبي وحياته.',
          },
          {
            lang: 'ur',
            title: 'صحیح بخاری',
            description:
              'سب سے مستند حدیث کی کتاب، قرآن کے بعد سب سے قابل اعتماد ذریعہ۔',
            summary:
              'نبی کریم کے اقوال اور زندگی کے بارے میں 7000 سے زیادہ احادیث۔',
          },
        ],
      },
      {
        author: 'İmam Muslim',
        publishDate: new Date('875-01-01'),
        coverImage: '/uploads/books/sahih-muslim.jpg',
        categories: ['Hadis', 'Sahih', 'İslam İlimleri'],
        translations: [
          {
            lang: 'tr',
            title: 'Sahih-i Muslim',
            description: 'Buhari ile birlikte en sahih hadis kaynaklarından.',
            summary: 'Sistematik olarak düzenlenmiş sahih hadisler.',
          },
          {
            lang: 'en',
            title: 'Sahih Muslim',
            description:
              'One of the most authentic hadith sources along with Bukhari.',
            summary: 'Systematically arranged authentic hadiths.',
          },
          {
            lang: 'ar',
            title: 'صحيح مسلم',
            description: 'من أصح مصادر الحديث مع البخاري.',
            summary: 'أحاديث صحيحة منظمة بشكل منهجي.',
          },
        ],
      },
      {
        author: 'İmam Tirmizi',
        publishDate: new Date('892-01-01'),
        coverImage: '/uploads/books/tirmizi.jpg',
        categories: ['Hadis', 'Sünen', 'Fıkıh'],
        translations: [
          {
            lang: 'tr',
            title: 'Sünen-i Tirmizi',
            description:
              "Kütüb-i Sitte'den biri, hadislerin sıhhat derecelerini belirten eser.",
            summary: 'Fıkıh bablarına göre düzenlenmiş hadisler.',
          },
          {
            lang: 'en',
            title: "Jami' at-Tirmidhi",
            description:
              'One of the Kutub al-Sittah, a work indicating the authenticity levels of hadiths.',
            summary: 'Hadiths arranged according to jurisprudence chapters.',
          },
          {
            lang: 'ar',
            title: 'جامع الترمذي',
            description: 'من الكتب الستة، عمل يشير إلى درجات صحة الأحاديث.',
            summary: 'أحاديث مرتبة حسب أبواب الفقه.',
          },
        ],
      },

      // Tefsir Kitapları
      {
        author: 'İbn Kesir',
        publishDate: new Date('1373-01-01'),
        coverImage: '/uploads/books/tefsir-ibn-kesir.jpg',
        categories: ['Tefsir', "Kur'an", 'İslam İlimleri'],
        translations: [
          {
            lang: 'tr',
            title: 'Tefsir-i İbn Kesir',
            description:
              "Kur'an-ı Kerim'in en yaygın ve güvenilir tefsirlerinden.",
            summary: "Kur'an ayetlerinin hadis ve rivayet ışığında açıklaması.",
          },
          {
            lang: 'en',
            title: 'Tafsir Ibn Kathir',
            description:
              'One of the most widespread and reliable commentaries of the Holy Quran.',
            summary:
              'Explanation of Quranic verses in the light of hadiths and narrations.',
          },
          {
            lang: 'ar',
            title: 'تفسير ابن كثير',
            description: 'من أشهر وأوثق تفاسير القرآن الكريم.',
            summary: 'شرح آيات القرآن في ضوء الأحاديث والروايات.',
          },
          {
            lang: 'ur',
            title: 'تفسیر ابن کثیر',
            description:
              'قرآن کریم کی سب سے مشہور اور قابل اعتماد تفسیروں میں سے ایک۔',
            summary: 'احادیث اور روایات کی روشنی میں قرآنی آیات کی تشریح۔',
          },
          {
            lang: 'fa',
            title: 'تفسیر ابن کثیر',
            description: 'یکی از معتبرترین و پرکاربردترین تفاسیر قرآن کریم.',
            summary: 'تبیین آیات قرآن در پرتو احادیث و روایات.',
          },
        ],
      },
      {
        author: 'Elmalılı Hamdi Yazır',
        publishDate: new Date('1935-01-01'),
        coverImage: '/uploads/books/hak-dini.jpg',
        categories: ['Tefsir', "Kur'an", 'Türk Eserleri'],
        translations: [
          {
            lang: 'tr',
            title: "Hak Dini Kur'an Dili",
            description:
              "Türkçe'de yazılmış en kapsamlı ve derin tefsir eseri.",
            summary:
              "Kur'an ayetlerinin dil, edebiyat ve felsefe açısından incelemesi.",
          },
          {
            lang: 'en',
            title: 'The Religion of Truth: The Language of the Quran',
            description:
              'The most comprehensive and profound commentary written in Turkish.',
            summary:
              'Analysis of Quranic verses in terms of language, literature and philosophy.',
          },
          {
            lang: 'az',
            title: 'Haqq Dini Quran Dili',
            description:
              'Türk dilində yazılmış ən əhatəli və dərin təfsir əsəri.',
            summary:
              'Quran ayələrinin dil, ədəbiyyat və fəlsəfə baxımından təhlili.',
          },
        ],
      },
      {
        author: 'Kurtubî',
        publishDate: new Date('1273-01-01'),
        coverImage: '/uploads/books/tefsir-kurtubi.jpg',
        categories: ['Tefsir', 'Fıkıh', 'Ahkam'],
        translations: [
          {
            lang: 'tr',
            title: "el-Cami' li-Ahkami'l Kur'an",
            description:
              "Kur'an ayetlerinin fıkhi hükümlerini detaylı işleyen tefsir.",
            summary: 'Ahkam ayetlerinin kapsamlı açıklaması.',
          },
          {
            lang: 'en',
            title: 'The Compendium of Legal Rulings of the Quran',
            description:
              'A commentary that deals with the jurisprudence rulings of Quranic verses in detail.',
            summary: 'Comprehensive explanation of legal verses.',
          },
          {
            lang: 'ar',
            title: 'الجامع لأحكام القرآن',
            description: 'تفسير يتناول الأحكام الفقهية لآيات القرآن بالتفصيل.',
            summary: 'شرح شامل لآيات الأحكام.',
          },
        ],
      },

      // Fıkıh Kitapları
      {
        author: 'İmam Ebu Hanife',
        publishDate: new Date('767-01-01'),
        coverImage: '/uploads/books/fikh-ekber.jpg',
        categories: ['Fıkıh', 'Hanefi', 'Akaid'],
        translations: [
          {
            lang: 'tr',
            title: "el-Fıkhu'l Ekber",
            description: "İmam-ı Azam'ın itikat konularındaki temel eseri.",
            summary: 'İslam inancının temel prensipleri.',
          },
          {
            lang: 'en',
            title: 'Al-Fiqh Al-Akbar',
            description: "Imam Abu Hanifa's basic work on matters of belief.",
            summary: 'Basic principles of Islamic faith.',
          },
          {
            lang: 'ar',
            title: 'الفقه الأكبر',
            description: 'العمل الأساسي للإمام أبي حنيفة في مسائل العقيدة.',
            summary: 'المبادئ الأساسية للعقيدة الإسلامية.',
          },
          {
            lang: 'ur',
            title: 'الفقہ الاکبر',
            description: 'امام ابوحنیفہ کا عقیدے کے معاملات پر بنیادی کام۔',
            summary: 'اسلامی ایمان کے بنیادی اصول۔',
          },
        ],
      },
      {
        author: 'İmam Şafii',
        publishDate: new Date('820-01-01'),
        coverImage: '/uploads/books/risale-shafii.jpg',
        categories: ['Fıkıh', 'Şafii', 'Usul'],
        translations: [
          {
            lang: 'tr',
            title: 'er-Risale',
            description: 'Fıkıh usulünün ilk sistematik eseri.',
            summary:
              'İslam hukukunun kaynaklarını ve metodolojisini belirleyen klasik.',
          },
          {
            lang: 'en',
            title: 'Ar-Risala',
            description:
              'The first systematic work on the principles of jurisprudence.',
            summary:
              'A classic that determines the sources and methodology of Islamic law.',
          },
          {
            lang: 'ar',
            title: 'الرسالة',
            description: 'أول عمل منهجي في أصول الفقه.',
            summary: 'كلاسيكي يحدد مصادر ومنهجية الشريعة الإسلامية.',
          },
        ],
      },
      {
        author: 'İmam Malik',
        publishDate: new Date('795-01-01'),
        coverImage: '/uploads/books/muvatta.jpg',
        categories: ['Hadis', 'Fıkıh', 'Maliki'],
        translations: [
          {
            lang: 'tr',
            title: 'el-Muvatta',
            description: 'En eski hadis ve fıkıh kitaplarından biri.',
            summary: "Medine'nin amelini yansıtan hadis ve fıkıh eseri.",
          },
          {
            lang: 'en',
            title: 'Al-Muwatta',
            description: 'One of the oldest books of hadith and jurisprudence.',
            summary:
              'A work of hadith and jurisprudence reflecting the practice of Medina.',
          },
          {
            lang: 'ar',
            title: 'الموطأ',
            description: 'من أقدم كتب الحديث والفقه.',
            summary: 'عمل حديثي وفقهي يعكس عمل المدينة.',
          },
        ],
      },

      // Tasavvuf Kitapları
      {
        author: 'Mevlana Celaleddin Rumi',
        publishDate: new Date('1273-01-01'),
        coverImage: '/uploads/books/mesnevi.jpg',
        categories: ['Tasavvuf', 'Şiir', 'Edebiyat'],
        translations: [
          {
            lang: 'tr',
            title: 'Mesnevi',
            description: 'Tasavvuf edebiyatının en büyük şaheserlerinden.',
            summary: 'Altı ciltte 25.000 beyitlik maneviyat ansiklopedisi.',
          },
          {
            lang: 'en',
            title: 'Masnavi',
            description: 'One of the greatest masterpieces of Sufi literature.',
            summary:
              'A 25,000-couplet encyclopedia of spirituality in six volumes.',
          },
          {
            lang: 'ar',
            title: 'المثنوي',
            description: 'من أعظم روائع الأدب الصوفي.',
            summary: 'موسوعة الروحانية في 25000 بيت في ستة مجلدات.',
          },
          {
            lang: 'fa',
            title: 'مثنوی معنوی',
            description: 'از بزرگترین شاهکارهای ادبیات عرفانی.',
            summary: 'دایره‌المعارف معنویت در 25000 بیت در شش جلد.',
          },
        ],
      },
      {
        author: 'Yunus Emre',
        publishDate: new Date('1320-01-01'),
        coverImage: '/uploads/books/yunus-divan.jpg',
        categories: ['Tasavvuf', 'Türk Edebiyatı', 'Şiir'],
        translations: [
          {
            lang: 'tr',
            title: 'Yunus Emre Divanı',
            description: 'Anadolu tasavvuf şiirinin en önemli eserlerinden.',
            summary: 'İlahi aşk, hoşgörü ve insanlık sevgisi şiirleri.',
          },
          {
            lang: 'en',
            title: 'The Divan of Yunus Emre',
            description:
              'One of the most important works of Anatolian Sufi poetry.',
            summary: 'Poems of divine love, tolerance and love of humanity.',
          },
          {
            lang: 'az',
            title: 'Yunus Əmrə Divanı',
            description: 'Anadolu təsəvvüf şeirinin ən mühüm əsərlərindən.',
            summary: 'İlahi məhəbbət, dözümlülük və insanlıq sevgisi şeirləri.',
          },
        ],
      },
      {
        author: 'Muhyiddin İbn Arabi',
        publishDate: new Date('1240-01-01'),
        coverImage: '/uploads/books/futuhat.jpg',
        categories: ['Tasavvuf', 'Felsefe', 'Kelam'],
        translations: [
          {
            lang: 'tr',
            title: 'Futuhat-ı Mekkiye',
            description:
              'İslam tasavvuf literatürünün en hacimli ve derin eseri.',
            summary: '37 ciltte tasavvufi marifet ve felsefe.',
          },
          {
            lang: 'en',
            title: 'The Meccan Revelations',
            description:
              'The most voluminous and profound work of Islamic Sufi literature.',
            summary: 'Mystical knowledge and philosophy in 37 volumes.',
          },
          {
            lang: 'ar',
            title: 'الفتوحات المكية',
            description: 'أضخم وأعمق عمل في الأدب الصوفي الإسلامي.',
            summary: 'المعرفة الصوفية والفلسفة في 37 مجلداً.',
          },
        ],
      },
      {
        author: 'Fariduddin Attar',
        publishDate: new Date('1220-01-01'),
        coverImage: '/uploads/books/mantik-uttayr.jpg',
        categories: ['Tasavvuf', 'Farsça Edebiyat', 'Şiir'],
        translations: [
          {
            lang: 'tr',
            title: "Mantık'ut-Tayr",
            description: "Kuşların Allah'ı arayışını anlatan alegorik mesnevi.",
            summary: 'Manevi yolculuk ve nefis terbiyesi üzerine şiirsel eser.',
          },
          {
            lang: 'en',
            title: 'The Conference of the Birds',
            description: "An allegorical poem about birds' search for God.",
            summary: 'A poetic work on spiritual journey and self-discipline.',
          },
          {
            lang: 'fa',
            title: 'منطق الطیر',
            description: 'منظومه تمثیلی درباره جستجوی پرندگان برای خدا.',
            summary: 'اثری شاعرانه درباره سفر معنوی و تربیت نفس.',
          },
          {
            lang: 'ar',
            title: 'منطق الطير',
            description: 'قصيدة مجازية عن بحث الطيور عن الله.',
            summary: 'عمل شعري عن الرحلة الروحية وتربية النفس.',
          },
        ],
      },

      // Ahlak Kitapları
      {
        author: 'İmam Gazali',
        publishDate: new Date('1105-01-01'),
        coverImage: '/uploads/books/ihya.jpg',
        categories: ['Tasavvuf', 'Ahlak', 'Fıkıh'],
        translations: [
          {
            lang: 'tr',
            title: "İhya-u Ulumi'd-Din",
            description: 'İslam ahlakı ve tasavvufunun en kapsamlı eseri.',
            summary:
              'Dinin ilimlerin ihyası, ibadet ve ahlak üzerine 40 kitap.',
          },
          {
            lang: 'en',
            title: 'The Revival of Religious Sciences',
            description:
              'The most comprehensive work on Islamic morality and Sufism.',
            summary:
              'Revival of religious sciences, 40 books on worship and morality.',
          },
          {
            lang: 'ar',
            title: 'إحياء علوم الدين',
            description: 'أشمل عمل في الأخلاق الإسلامية والتصوف.',
            summary: 'إحياء علوم الدين، 40 كتاباً في العبادة والأخلاق.',
          },
          {
            lang: 'ur',
            title: 'احیاء علوم الدین',
            description: 'اسلامی اخلاقیات اور تصوف پر سب سے جامع کام۔',
            summary: 'علوم دین کی بحالی، عبادت اور اخلاقیات پر 40 کتابیں۔',
          },
        ],
      },
      {
        author: 'İbn Miskeveyh',
        publishDate: new Date('1030-01-01'),
        coverImage: '/uploads/books/tezhib-ahlak.jpg',
        categories: ['Ahlak', 'Felsefe'],
        translations: [
          {
            lang: 'tr',
            title: "Tezhîbü'l-Ahlâk",
            description: 'İslam ahlak felsefesinin temel eserlerinden.',
            summary: 'Ahlakın ıslahı ve karakter eğitimi.',
          },
          {
            lang: 'en',
            title: 'The Refinement of Character',
            description: 'One of the basic works of Islamic moral philosophy.',
            summary: 'Moral improvement and character education.',
          },
          {
            lang: 'ar',
            title: 'تهذيب الأخلاق',
            description: 'من الأعمال الأساسية في فلسفة الأخلاق الإسلامية.',
            summary: 'إصلاح الأخلاق وتربية الشخصية.',
          },
          {
            lang: 'fa',
            title: 'تهذیب الاخلاق',
            description: 'از آثار پایه‌ای فلسفه اخلاق اسلامی.',
            summary: 'اصلاح اخلاق و تربیت شخصیت.',
          },
        ],
      },

      // Kelam ve Akaid
      {
        author: 'İmam Maturidi',
        publishDate: new Date('944-01-01'),
        coverImage: '/uploads/books/tevhid.jpg',
        categories: ['Kelam', 'Akaid', 'Felsefe'],
        translations: [
          {
            lang: 'tr',
            title: "Kitabu't-Tevhid",
            description: 'Maturidi kelam ekolünün temel metni.',
            summary: "Allah'ın birliği ve inanç esasları.",
          },
          {
            lang: 'en',
            title: 'The Book of Divine Unity',
            description: 'The basic text of the Maturidi school of theology.',
            summary: 'The unity of God and the principles of faith.',
          },
          {
            lang: 'ar',
            title: 'كتاب التوحيد',
            description: 'النص الأساسي لمدرسة الماتريدية في علم الكلام.',
            summary: 'وحدة الله ومبادئ الإيمان.',
          },
          {
            lang: 'uz',
            title: 'Tavhid Kitobı',
            description: 'Moturidiy kalom maktabining asosiy matni.',
            summary: 'Ollohning birligi va iymon asoslari.',
          },
        ],
      },
      {
        author: "İmam Eş'arî",
        publishDate: new Date('935-01-01'),
        coverImage: '/uploads/books/ibaneh.jpg',
        categories: ['Kelam', 'Akaid'],
        translations: [
          {
            lang: 'tr',
            title: "el-İbane an Usuli'd-Diyane",
            description: "Eş'ari kelam ekolünün temel eseri.",
            summary: 'Dinin usullerini açıklayan kelam kitabı.',
          },
          {
            lang: 'en',
            title: 'Clarification Concerning the Foundations of Religion',
            description: 'The basic work of the Ashari school of theology.',
            summary:
              'A theological book explaining the principles of religion.',
          },
          {
            lang: 'ar',
            title: 'الإبانة عن أصول الديانة',
            description: 'العمل الأساسي لمدرسة الأشعرية في علم الكلام.',
            summary: 'كتاب كلامي يشرح أصول الدين.',
          },
        ],
      },
      {
        author: 'Ebu Mansur el-Maturidi',
        publishDate: new Date('944-01-01'),
        coverImage: '/uploads/books/tevhid-2.jpg',
        categories: ['Kelam', 'Akaid'],
        translations: [
          {
            lang: 'tr',
            title: "Kitabu't-Tevhid",
            description: "Allah'ın birliği konusunda klasik kelam eseri.",
            summary: 'İslam inancının temel prensiplerini ele alan eser.',
          },
          {
            lang: 'en',
            title: 'The Book of Monotheism',
            description: 'A classical theological work on the unity of God.',
            summary:
              'A work dealing with the basic principles of Islamic faith.',
          },
          {
            lang: 'ar',
            title: 'كتاب التوحيد',
            description: 'عمل كلامي كلاسيكي عن وحدة الله.',
            summary: 'عمل يتناول المبادئ الأساسية للعقيدة الإسلامية.',
          },
          {
            lang: 'kk',
            title: 'Таухид кітабы',
            description:
              'Алланың біртұтастығы туралы классикалық теологиялық еңбек.',
            summary: 'Ислам сенімінің негізгі қағидаларын қарастыратын еңбек.',
          },
        ],
      },

      // Felsefe Kitapları
      {
        author: 'İbn Sina (Avicenna)',
        publishDate: new Date('1037-01-01'),
        coverImage: '/uploads/books/kanun-fit-tib.jpg',
        categories: ['Felsefe', 'Tıp', 'Bilim'],
        translations: [
          {
            lang: 'tr',
            title: "El-Kanun fi't-Tıb",
            description:
              'Tıp tarihinin en önemli eserlerinden, 800 yıl boyunca kullanıldı.',
            summary: 'Tıbbi bilgilerin kapsamlı ansiklopedisi.',
          },
          {
            lang: 'en',
            title: 'The Canon of Medicine',
            description:
              'One of the most important works in medical history, used for 800 years.',
            summary: 'A comprehensive encyclopedia of medical knowledge.',
          },
          {
            lang: 'ar',
            title: 'القانون في الطب',
            description: 'من أهم الأعمال في تاريخ الطب، استخدم لمدة 800 عام.',
            summary: 'موسوعة شاملة للمعرفة الطبية.',
          },
          {
            lang: 'fa',
            title: 'قانون در طب',
            description:
              'یکی از مهمترین آثار تاریخ پزشکی، 800 سال مورد استفاده قرار گرفت.',
            summary: 'دایره‌المعارف جامع دانش پزشکی.',
          },
        ],
      },
      {
        author: 'Farabi',
        publishDate: new Date('950-01-01'),
        coverImage: '/uploads/books/ihsa-ulum.jpg',
        categories: ['Felsefe', 'Bilim', 'Mantık'],
        translations: [
          {
            lang: 'tr',
            title: "İhsa'u'l-Ulum",
            description: 'İlimlerin tasnifi ve felsefi düşüncenin esasları.',
            summary: 'İslam felsefesinin kurucu metinlerinden.',
          },
          {
            lang: 'en',
            title: 'The Enumeration of the Sciences',
            description:
              'Classification of sciences and foundations of philosophical thought.',
            summary: 'One of the founding texts of Islamic philosophy.',
          },
          {
            lang: 'ar',
            title: 'إحصاء العلوم',
            description: 'تصنيف العلوم وأسس الفكر الفلسفي.',
            summary: 'من النصوص التأسيسية للفلسفة الإسلامية.',
          },
        ],
      },
      {
        author: 'İbn Rüşd (Averroes)',
        publishDate: new Date('1198-01-01'),
        coverImage: '/uploads/books/fasl-makale.jpg',
        categories: ['Felsefe', 'Kelam', 'Mantık'],
        translations: [
          {
            lang: 'tr',
            title: "Faslu'l-Makal",
            description: 'Felsefe ve din ilişkisini ele alan önemli eser.',
            summary: 'Hakikat birdir, ancak ona ulaşma yolları farklıdır.',
          },
          {
            lang: 'en',
            title: 'The Decisive Treatise',
            description:
              'An important work dealing with the relationship between philosophy and religion.',
            summary: 'Truth is one, but the ways to reach it are different.',
          },
          {
            lang: 'ar',
            title: 'فصل المقال',
            description: 'عمل مهم يتناول العلاقة بين الفلسفة والدين.',
            summary: 'الحقيقة واحدة، لكن طرق الوصول إليها مختلفة.',
          },
          {
            lang: 'es',
            title: 'El Discurso Decisivo',
            description:
              'Una obra importante que trata la relación entre filosofía y religión.',
            summary:
              'La verdad es una, pero los caminos para alcanzarla son diferentes.',
          },
        ],
      },

      // Edebiyat Kitapları
      {
        author: 'Fuzuli',
        publishDate: new Date('1562-01-01'),
        coverImage: '/uploads/books/leyla-mecnun.jpg',
        categories: ['Edebiyat', 'Şiir', 'Klasik Türk Edebiyatı'],
        translations: [
          {
            lang: 'tr',
            title: 'Leyla vü Mecnun',
            description: 'Klasik Türk edebiyatının en önemli aşk mesnevisi.',
            summary: 'İlahi ve beşeri aşkın sembolik anlatımı.',
          },
          {
            lang: 'en',
            title: 'Layla and Majnun',
            description:
              'The most important love masnavi of classical Turkish literature.',
            summary: 'Symbolic expression of divine and human love.',
          },
          {
            lang: 'az',
            title: 'Leyli və Məcnun',
            description:
              'Klassik türk ədəbiyyatının ən mühüm məhəbbət məsnavisi.',
            summary: 'İlahi və bəşəri eşqin simvolik ifadəsi.',
          },
          {
            lang: 'ar',
            title: 'ليلى والمجنون',
            description: 'أهم مثنوي حب في الأدب التركي الكلاسيكي.',
            summary: 'التعبير الرمزي للحب الإلهي والإنساني.',
          },
        ],
      },
      {
        author: 'Şeyh Galip',
        publishDate: new Date('1799-01-01'),
        coverImage: '/uploads/books/husn-ask.jpg',
        categories: ['Edebiyat', 'Şiir', 'Tasavvuf'],
        translations: [
          {
            lang: 'tr',
            title: 'Hüsn ü Aşk',
            description: 'Divan edebiyatının en son büyük mesnevisi.',
            summary: 'Güzellik ve aşkın tasavvufi sembolizmle anlatımı.',
          },
          {
            lang: 'en',
            title: 'Beauty and Love',
            description: 'The last great masnavi of Divan literature.',
            summary: 'Expression of beauty and love with Sufi symbolism.',
          },
          {
            lang: 'az',
            title: 'Hüsn və Eşq',
            description: 'Divan ədəbiyyatının sonuncu böyük məsnavisi.',
            summary: 'Gözəllik və eşqin təsəvvüf simvolizmi ilə ifadəsi.',
          },
        ],
      },
      {
        author: 'Nizami Gencevi',
        publishDate: new Date('1209-01-01'),
        coverImage: '/uploads/books/hamse.jpg',
        categories: ['Edebiyat', 'Farsça Edebiyat', 'Şiir'],
        translations: [
          {
            lang: 'tr',
            title: 'Hamse (Beş Hazine)',
            description: 'Fars edebiyatının en büyük şaheserlerinden biri.',
            summary: 'Beş mesneviden oluşan şiir külliyatı.',
          },
          {
            lang: 'en',
            title: 'Khamsa (Five Treasures)',
            description:
              'One of the greatest masterpieces of Persian literature.',
            summary: 'A collection of poems consisting of five masnavis.',
          },
          {
            lang: 'fa',
            title: 'خمسه (پنج گنج)',
            description: 'یکی از بزرگترین شاهکارهای ادبیات فارسی.',
            summary: 'مجموعه شعری متشکل از پنج مثنوی.',
          },
          {
            lang: 'az',
            title: 'Xəmsə (Beş Xəzinə)',
            description: 'Fars ədəbiyyatının ən böyük şah əsərlərindən biri.',
            summary: 'Beş məsnavidən ibarət şeir külliyyatı.',
          },
        ],
      },

      // Modern İslami Eserler
      {
        author: 'Mehmet Akif Ersoy',
        publishDate: new Date('1943-01-01'),
        coverImage: '/uploads/books/safahat.jpg',
        categories: ['Şiir', 'Türk Edebiyatı', 'İslami Edebiyat'],
        translations: [
          {
            lang: 'tr',
            title: 'Safahat',
            description:
              "Türk edebiyatının en önemli şiir kitaplarından, İstiklal Marşı'nın da yazarı.",
            summary: 'Toplumsal, dini ve milli konuların şiirle anlatımı.',
          },
          {
            lang: 'en',
            title: 'Pages',
            description:
              'One of the most important poetry books of Turkish literature, also the author of the National Anthem.',
            summary:
              'Poetic expression of social, religious and national issues.',
          },
          {
            lang: 'az',
            title: 'Səhifələr',
            description:
              'Türk ədəbiyyatının ən mühüm şeir kitablarından, İstiklal Marşının da müəllifi.',
            summary: 'İctimai, dini və milli mövzuların şeirlə ifadəsi.',
          },
        ],
      },
      {
        author: 'Muhammed İkbal',
        publishDate: new Date('1938-01-01'),
        coverImage: '/uploads/books/esrar-remuz.jpg',
        categories: ['Felsefe', 'Şiir', 'İslami Düşünce'],
        translations: [
          {
            lang: 'tr',
            title: 'Esrar ve Remuz',
            description: "İslam'ın yeniden inşası üzerine felsefi şiirler.",
            summary: 'Benliğin keşfi ve İslami yenilenme.',
          },
          {
            lang: 'en',
            title: 'Secrets and Symbols',
            description: 'Philosophical poems on the reconstruction of Islam.',
            summary: 'Discovery of the self and Islamic renewal.',
          },
          {
            lang: 'ur',
            title: 'اسرار و رموز',
            description: 'اسلام کی تعمیر نو پر فلسفیانہ نظمیں۔',
            summary: 'خود کی دریافت اور اسلامی تجدید۔',
          },
          {
            lang: 'fa',
            title: 'اسرار و رموز',
            description: 'اشعار فلسفی در بازسازی اسلام.',
            summary: 'کشف خود و تجدید اسلامی.',
          },
        ],
      },
      {
        author: 'Seyyid Kutub',
        publishDate: new Date('1964-01-01'),
        coverImage: '/uploads/books/fizilal.jpg',
        categories: ['Tefsir', 'İslami Hareket', 'Düşünce'],
        translations: [
          {
            lang: 'tr',
            title: "Fi Zilali'l-Kur'an",
            description: "Kur'an'ın gölgesinde, modern tefsir eseri.",
            summary: "Kur'an ayetlerinin çağdaş hayata tatbiki.",
          },
          {
            lang: 'en',
            title: 'In the Shade of the Quran',
            description: 'In the shadow of the Quran, a modern commentary.',
            summary: 'Application of Quranic verses to contemporary life.',
          },
          {
            lang: 'ar',
            title: 'في ظلال القرآن',
            description: 'في ظلال القرآن، تفسير حديث.',
            summary: 'تطبيق آيات القرآن على الحياة المعاصرة.',
          },
          {
            lang: 'id',
            title: 'Di Bawah Naungan Al-Quran',
            description: 'Di bawah naungan Al-Quran, tafsir modern.',
            summary:
              'Penerapan ayat-ayat Al-Quran dalam kehidupan kontemporer.',
          },
        ],
      },

      // Tarihi ve Kültürel Eserler
      {
        author: 'İbn Battuta',
        publishDate: new Date('1377-01-01'),
        coverImage: '/uploads/books/rihle.jpg',
        categories: ['Seyahatname', 'Tarih', 'Coğrafya'],
        translations: [
          {
            lang: 'tr',
            title: 'İbn Battuta Seyahatnamesi',
            description:
              '14. yüzyılın en önemli seyahat eseri, 30 yıllık dünya turu.',
            summary: "120.000 km'lik yolculukta İslam coğrafyası.",
          },
          {
            lang: 'en',
            title: 'The Travels of Ibn Battuta',
            description:
              'The most important travel work of the 14th century, a 30-year world tour.',
            summary: 'Islamic geography on a 120,000 km journey.',
          },
          {
            lang: 'ar',
            title: 'رحلة ابن بطوطة',
            description:
              'أهم عمل سفر في القرن الرابع عشر، جولة عالمية لمدة 30 عامًا.',
            summary: 'الجغرافيا الإسلامية في رحلة 120 ألف كم.',
          },
          {
            lang: 'fr',
            title: "Les Voyages d'Ibn Battûta",
            description:
              "L'ouvrage de voyage le plus important du 14e siècle, un tour du monde de 30 ans.",
            summary: 'Géographie islamique sur un voyage de 120 000 km.',
          },
        ],
      },
      {
        author: 'Evliya Çelebi',
        publishDate: new Date('1682-01-01'),
        coverImage: '/uploads/books/seyahatname.jpg',
        categories: ['Seyahatname', 'Osmanlı', 'Tarih'],
        translations: [
          {
            lang: 'tr',
            title: 'Seyahatname',
            description:
              'Osmanlı coğrafyasını ve kültürünü anlatan en kapsamlı eser.',
            summary: '10 cilt, 40 yıllık gezi notları.',
          },
          {
            lang: 'en',
            title: 'The Book of Travels',
            description:
              'The most comprehensive work describing Ottoman geography and culture.',
            summary: '10 volumes, 40 years of travel notes.',
          },
          {
            lang: 'ar',
            title: 'كتاب السياحة',
            description:
              'العمل الأكثر شمولاً الذي يصف الجغرافيا والثقافة العثمانية.',
            summary: '10 مجلدات، 40 عامًا من ملاحظات السفر.',
          },
        ],
      },
      {
        author: 'Katip Çelebi',
        publishDate: new Date('1657-01-01'),
        coverImage: '/uploads/books/cihannuma.jpg',
        categories: ['Coğrafya', 'Tarih', 'Osmanlı'],
        translations: [
          {
            lang: 'tr',
            title: 'Cihannüma',
            description: "Osmanlı'nın en önemli coğrafya eseri.",
            summary: 'Dünya coğrafyası ve tarihi bilgileri.',
          },
          {
            lang: 'en',
            title: 'The Mirror of the World',
            description:
              'The most important geography work of the Ottoman Empire.',
            summary: 'World geography and historical information.',
          },
          {
            lang: 'ar',
            title: 'جهان نما',
            description: 'أهم عمل جغرافي في الإمبراطورية العثمانية.',
            summary: 'معلومات الجغرافيا العالمية والتاريخ.',
          },
        ],
      },

      // Hadis Şerhleri
      {
        author: 'İmam Nevevî',
        publishDate: new Date('1277-01-01'),
        coverImage: '/uploads/books/erbain.jpg',
        categories: ['Hadis', 'Şerh', 'Ahlak'],
        translations: [
          {
            lang: 'tr',
            title: 'Kırk Hadis (el-Erbain)',
            description:
              "İslam'ın temel prensiplerini içeren 42 hadis külliyatı.",
            summary: 'Her Müslümanın bilmesi gereken temel hadisler.',
          },
          {
            lang: 'en',
            title: 'Forty Hadith',
            description:
              'A collection of 42 hadiths containing the basic principles of Islam.',
            summary: 'Basic hadiths that every Muslim should know.',
          },
          {
            lang: 'ar',
            title: 'الأربعين النووية',
            description:
              'مجموعة من 42 حديثًا تحتوي على المبادئ الأساسية للإسلام.',
            summary: 'الأحاديث الأساسية التي يجب أن يعرفها كل مسلم.',
          },
          {
            lang: 'ur',
            title: 'چالیس حدیثیں',
            description: 'اسلام کے بنیادی اصولوں پر مشتمل 42 احادیث کا مجموعہ۔',
            summary: 'بنیادی احادیث جو ہر مسلمان کو معلوم ہونی چاہئیں۔',
          },
        ],
      },
      {
        author: 'İbn Hacer el-Askalani',
        publishDate: new Date('1449-01-01'),
        coverImage: '/uploads/books/fethu-bari.jpg',
        categories: ['Hadis', 'Şerh', 'Fıkıh'],
        translations: [
          {
            lang: 'tr',
            title: "Fethu'l-Bari",
            description: "Sahih-i Buhari'nin en kapsamlı şerhi.",
            summary: '13 ciltte hadislerin detaylı izahı.',
          },
          {
            lang: 'en',
            title: 'The Victory of the Creator',
            description:
              'The most comprehensive commentary on Sahih al-Bukhari.',
            summary: 'Detailed explanation of hadiths in 13 volumes.',
          },
          {
            lang: 'ar',
            title: 'فتح الباري',
            description: 'أشمل شرح لصحيح البخاري.',
            summary: 'شرح تفصيلي للأحاديث في 13 مجلدًا.',
          },
        ],
      },

      // Çağdaş İslami Düşünce
      {
        author: 'Ali Şeriati',
        publishDate: new Date('1977-01-01'),
        coverImage: '/uploads/books/dine-karsi-din.jpg',
        categories: ['İslami Düşünce', 'Sosyoloji', 'Çağdaş'],
        translations: [
          {
            lang: 'tr',
            title: 'Dine Karşı Din',
            description:
              'Özgün İslam ile taklitçi din anlayışı arasındaki farklar.',
            summary: "İslam'ın sosyal ve siyasal boyutu üzerine.",
          },
          {
            lang: 'en',
            title: 'Religion Against Religion',
            description:
              'Differences between original Islam and imitative religious understanding.',
            summary: 'On the social and political dimension of Islam.',
          },
          {
            lang: 'fa',
            title: 'دین علیه دین',
            description: 'تفاوت‌های بین اسلام اصیل و درک دینی تقلیدی.',
            summary: 'درباره بعد اجتماعی و سیاسی اسلام.',
          },
          {
            lang: 'ar',
            title: 'الدين ضد الدين',
            description:
              'الاختلافات بين الإسلام الأصيل والفهم الديني التقليدي.',
            summary: 'حول البعد الاجتماعي والسياسي للإسلام.',
          },
        ],
      },
      {
        author: 'Malik bin Nebi',
        publishDate: new Date('1973-01-01'),
        coverImage: '/uploads/books/kuranda-fenomen.jpg',
        categories: ['Düşünce', 'Medeniyet', 'Sosyoloji'],
        translations: [
          {
            lang: 'tr',
            title: "Kur'an'da Fenomen",
            description:
              'İslam medeniyetinin yeniden inşası üzerine düşünceler.',
            summary: 'Toplumsal değişim ve medeniyet teorisi.',
          },
          {
            lang: 'en',
            title: 'The Quranic Phenomenon',
            description:
              'Thoughts on the reconstruction of Islamic civilization.',
            summary: 'Social change and civilization theory.',
          },
          {
            lang: 'ar',
            title: 'الظاهرة القرآنية',
            description: 'أفكار حول إعادة بناء الحضارة الإسلامية.',
            summary: 'التغيير الاجتماعي ونظرية الحضارة.',
          },
          {
            lang: 'fr',
            title: 'Le Phénomène Coranique',
            description:
              'Réflexions sur la reconstruction de la civilisation islamique.',
            summary: 'Changement social et théorie de la civilisation.',
          },
        ],
      },
      {
        author: 'Muhammed Esed',
        publishDate: new Date('1980-01-01'),
        coverImage: '/uploads/books/meal-tefsir.jpg',
        categories: ['Tefsir', 'Meal', 'Çağdaş'],
        translations: [
          {
            lang: 'tr',
            title: "Kur'an Mesajı",
            description: "Modern dönemin en etkili Kur'an tefsir ve meali.",
            summary: "Kur'an'ın evrensel mesajını çağdaş dille sunma.",
          },
          {
            lang: 'en',
            title: 'The Message of The Quran',
            description:
              'The most influential Quran commentary and translation of modern times.',
            summary:
              'Presenting the universal message of the Quran in contemporary language.',
          },
          {
            lang: 'ar',
            title: 'رسالة القرآن',
            description: 'أكثر تفسير وترجمة مؤثرة للقرآن في العصر الحديث.',
            summary: 'تقديم الرسالة العالمية للقرآن بلغة معاصرة.',
          },
          {
            lang: 'de',
            title: 'Die Botschaft des Koran',
            description:
              'Der einflussreichste Korankommentar und Übersetzung der Neuzeit.',
            summary:
              'Die universelle Botschaft des Korans in zeitgenössischer Sprache präsentieren.',
          },
        ],
      },

      // Fıkhi ve Hukuki Eserler
      {
        author: 'İbn Kudemä',
        publishDate: new Date('1223-01-01'),
        coverImage: '/uploads/books/mugni.jpg',
        categories: ['Fıkıh', 'Hanbeli', 'İslam Hukuku'],
        translations: [
          {
            lang: 'tr',
            title: 'el-Muğni',
            description: 'Hanbeli mezhebinin en kapsamlı fıkıh eseri.',
            summary:
              'İbadet, muamelat ve ceza hukuku konularında detaylı açıklamalar.',
          },
          {
            lang: 'en',
            title: 'Al-Mughni',
            description:
              'The most comprehensive jurisprudence work of the Hanbali school.',
            summary:
              'Detailed explanations on worship, transactions and criminal law.',
          },
          {
            lang: 'ar',
            title: 'المغني',
            description: 'أشمل عمل فقهي للمذهب الحنبلي.',
            summary: 'شروحات تفصيلية في العبادات والمعاملات والقانون الجنائي.',
          },
        ],
      },
      {
        author: 'İmam Serahsi',
        publishDate: new Date('1090-01-01'),
        coverImage: '/uploads/books/mebsut.jpg',
        categories: ['Fıkıh', 'Hanefi', 'İslam Hukuku'],
        translations: [
          {
            lang: 'tr',
            title: 'el-Mebsut',
            description: 'Hanefi fıkhının en kapsamlı şerhlerinden, 30 cilt.',
            summary: 'Fıkhi meselelerin delilleriyle detaylı incelemesi.',
          },
          {
            lang: 'en',
            title: 'Al-Mabsut',
            description:
              'One of the most comprehensive commentaries of Hanafi fiqh, 30 volumes.',
            summary:
              'Detailed examination of jurisprudence issues with evidence.',
          },
          {
            lang: 'ar',
            title: 'المبسوط',
            description: 'من أشمل شروحات الفقه الحنفي، 30 مجلدًا.',
            summary: 'دراسة تفصيلية لمسائل الفقه مع الأدلة.',
          },
        ],
      },

      // Tasavvufi Mektuplar ve Risaleler
      {
        author: 'İmam Gazali',
        publishDate: new Date('1096-01-01'),
        coverImage: '/uploads/books/eyyuha-veled.jpg',
        categories: ['Tasavvuf', 'Ahlak', 'Nasihat'],
        translations: [
          {
            lang: 'tr',
            title: "Eyyühe'l-Veled",
            description: "İmam Gazali'nin talebelerine öğütler içeren mektubu.",
            summary: 'İlim, amel ve ihlasın önemi üzerine.',
          },
          {
            lang: 'en',
            title: 'Letter to a Disciple',
            description:
              "Imam Ghazali's letter containing advice to his students.",
            summary: 'On the importance of knowledge, practice and sincerity.',
          },
          {
            lang: 'ar',
            title: 'أيها الولد',
            description: 'رسالة الإمام الغزالي المتضمنة نصائح لطلابه.',
            summary: 'حول أهمية العلم والعمل والإخلاص.',
          },
          {
            lang: 'fa',
            title: 'ای فرزند',
            description: 'نامه امام غزالی حاوی اندرزهایی به شاگردانش.',
            summary: 'درباره اهمیت علم، عمل و اخلاص.',
          },
        ],
      },
      {
        author: 'İmam-ı Rabbani',
        publishDate: new Date('1619-01-01'),
        coverImage: '/uploads/books/iktibas.jpg',
        categories: ['Tasavvuf', 'Nakşibendi', 'Mektup'],
        translations: [
          {
            lang: 'tr',
            title: 'İktibas Nurları',
            description: "İmam Rabbani'nin mektuplarından seçme.",
            summary: 'Tasavvuf ve şeriat dengesi üzerine öğütler.',
          },
          {
            lang: 'en',
            title: 'Selected Letters',
            description: "Selected from Imam Rabbani's letters.",
            summary: 'Advice on the balance between Sufism and Sharia.',
          },
          {
            lang: 'ar',
            title: 'رسائل مختارة',
            description: 'مختارات من رسائل الإمام الرباني.',
            summary: 'نصائح حول التوازن بين التصوف والشريعة.',
          },
        ],
      },

      // Osmanlı Dönemi Eserleri
      {
        author: 'Süleyman Çelebi',
        publishDate: new Date('1409-01-01'),
        coverImage: '/uploads/books/vesile-necat.jpg',
        categories: ['Siyer', 'Türk Edebiyatı', 'Mevlid'],
        translations: [
          {
            lang: 'tr',
            title: "Vesîletü'n-Necât (Mevlid)",
            description: "Hz. Muhammed'in doğumunu ve hayatını anlatan şiir.",
            summary: 'Türk edebiyatının en çok okunan dini eseri.',
          },
          {
            lang: 'en',
            title: 'Birth of the Prophet (Mawlid)',
            description:
              'A poem describing the birth and life of Prophet Muhammad.',
            summary: 'The most read religious work of Turkish literature.',
          },
          {
            lang: 'az',
            title: 'Məvlud',
            description: 'Peyğəmbərin doğulması və həyatını təsvir edən şeir.',
            summary: 'Türk ədəbiyyatının ən çox oxunan dini əsəri.',
          },
        ],
      },
      {
        author: 'Ahmed Yesevi',
        publishDate: new Date('1166-01-01'),
        coverImage: '/uploads/books/divan-hikmet.jpg',
        categories: ['Tasavvuf', 'Türk Edebiyatı', 'Hikmet'],
        translations: [
          {
            lang: 'tr',
            title: 'Divan-ı Hikmet',
            description: 'Türk tasavvuf edebiyatının ilk büyük eseri.',
            summary: 'Hikmetli sözler ve tasavvufi öğütler.',
          },
          {
            lang: 'en',
            title: 'The Divan of Wisdom',
            description: 'The first major work of Turkish Sufi literature.',
            summary: 'Wise words and Sufi advice.',
          },
          {
            lang: 'kk',
            title: 'Диуани Хикмет',
            description: 'Түрік сопылық әдебиетінің алғашқы ірі туындысы.',
            summary: 'Даналық сөздер мен сопылық кеңестер.',
          },
          {
            lang: 'uz',
            title: 'Devoni Hikmat',
            description: 'Turk tasavvuf adabiyotining birinchi yirik asari.',
            summary: "Hikmatli so'zlar va tasavvuf nasiхatlari.",
          },
        ],
      },

      // Güncel İslami Eserler
      {
        author: 'Ömer Nasuhi Bilmen',
        publishDate: new Date('1951-01-01'),
        coverImage: '/uploads/books/buyuk-islam-ilmihali.jpg',
        categories: ['Fıkıh', 'İlmihal', 'Türk Eserleri'],
        translations: [
          {
            lang: 'tr',
            title: 'Büyük İslam İlmihali',
            description: 'Türkçe yazılmış en kapsamlı ilmihal eseri.',
            summary: 'İbadet, muamelat ve İslam hukukunun tüm konuları.',
          },
          {
            lang: 'en',
            title: 'Great Islamic Catechism',
            description:
              'The most comprehensive catechism work written in Turkish.',
            summary: 'All topics of worship, transactions and Islamic law.',
          },
          {
            lang: 'az',
            title: 'Böyük İslam İlmihali',
            description: 'Türk dilində yazılmış ən əhatəli ilmihal əsəri.',
            summary: 'İbadət, müamilələr və İslam hüququnun bütün mövzuları.',
          },
        ],
      },
      {
        author: 'Hamza Aktan',
        publishDate: new Date('2005-01-01'),
        coverImage: '/uploads/books/mukayeseli-islam-hukuku.jpg',
        categories: ['İslam Hukuku', 'Fıkıh', 'Karşılaştırmalı Hukuk'],
        translations: [
          {
            lang: 'tr',
            title: 'Mukayeseli İslam Hukuku',
            description:
              'İslam hukuk mezheplerinin karşılaştırmalı incelenmesi.',
            summary: 'Dört mezhep ve çağdaş hukuk sistemleriyle mukayese.',
          },
          {
            lang: 'en',
            title: 'Comparative Islamic Law',
            description: 'Comparative study of Islamic legal schools.',
            summary:
              'Comparison with four schools and contemporary legal systems.',
          },
        ],
      },

      // Klasik Türk-İslam Kültürü
      {
        author: 'Kutadgu Bilig',
        publishDate: new Date('1069-01-01'),
        coverImage: '/uploads/books/kutadgu-bilig.jpg',
        categories: ['Türk Edebiyatı', 'Siyasetname', 'Klasik'],
        translations: [
          {
            lang: 'tr',
            title: 'Kutadgu Bilig (Mutluluk Veren Bilgi)',
            description:
              'Türk dilinin ilk İslami eseri, siyaset ve ahlak kitabı.',
            summary: 'İyi yönetim, adalet ve erdem üzerine.',
          },
          {
            lang: 'en',
            title: 'The Wisdom of Royal Glory',
            description:
              'The first Islamic work in Turkish, a book on politics and morals.',
            summary: 'On good governance, justice and virtue.',
          },
          {
            lang: 'uz',
            title: "Qutadg'u Bilig",
            description:
              'Turk tilining birinchi islomiy asari, siyosat va aхloq kitobi.',
            summary: 'Yахshi boshqaruv, adolat va fazilat haqida.',
          },
        ],
      },
      {
        author: "Divanu Lugati't-Türk",
        publishDate: new Date('1072-01-01'),
        coverImage: '/uploads/books/divanul-lugat.jpg',
        categories: ['Dil Bilimi', 'Sözlük', 'Türk Dili'],
        translations: [
          {
            lang: 'tr',
            title: "Divanu Lugati't-Türk",
            description: 'Türk dilinin ilk kapsamlı sözlüğü.',
            summary: "Kaşgarlı Mahmud'un 11. yüzyıl Türkçe sözlüğü.",
          },
          {
            lang: 'en',
            title: 'Compendium of the Languages of the Turks',
            description:
              'The first comprehensive dictionary of the Turkish language.',
            summary: "Kashgari Mahmud's 11th century Turkish dictionary.",
          },
          {
            lang: 'ar',
            title: 'ديوان لغات الترك',
            description: 'أول قاموس شامل للغة التركية.',
            summary: 'قاموس الكاشغري محمود التركي من القرن الحادي عشر.',
          },
        ],
      },

      // Son eklenen çeşitli konular
      {
        author: 'İbn Teymiyye',
        publishDate: new Date('1328-01-01'),
        coverImage: '/uploads/books/siyaset-seriyye.jpg',
        categories: ['Fıkıh', 'Siyaset', 'İslam Hukuku'],
        translations: [
          {
            lang: 'tr',
            title: "es-Siyasetü'ş-Şer'iyye",
            description: "İslam'da siyaset ve yönetim ilkeleri.",
            summary: "Şer'i siyasetin esasları ve uygulaması.",
          },
          {
            lang: 'en',
            title: 'Governance According to Sharia',
            description: 'Principles of politics and governance in Islam.',
            summary: 'The foundations and practice of Islamic governance.',
          },
          {
            lang: 'ar',
            title: 'السياسة الشرعية',
            description: 'مبادئ السياسة والحكم في الإسلام.',
            summary: 'أسس وممارسة الحكم الإسلامي.',
          },
        ],
      },
      {
        author: 'İmam Şatibi',
        publishDate: new Date('1388-01-01'),
        coverImage: '/uploads/books/muvafakat.jpg',
        categories: ['Fıkıh', 'Usul', 'Makasıd'],
        translations: [
          {
            lang: 'tr',
            title: 'el-Muvafakat',
            description:
              'İslam hukukunun makasıdını (amaçlarını) inceleyen temel eser.',
            summary: 'Şeriatın amaçları ve maslahat prensipleri.',
          },
          {
            lang: 'en',
            title: 'Reconciliation',
            description:
              'A basic work examining the maqasid (objectives) of Islamic law.',
            summary: 'The objectives of Sharia and principles of maslaha.',
          },
          {
            lang: 'ar',
            title: 'الموافقات',
            description: 'عمل أساسي يدرس مقاصد الشريعة الإسلامية.',
            summary: 'مقاصد الشريعة ومبادئ المصلحة.',
          },
        ],
      },
      {
        author: 'İbn Kayyim el-Cevziyye',
        publishDate: new Date('1350-01-01'),
        coverImage: '/uploads/books/zad-mead.jpg',
        categories: ['Fıkıh', 'Siyer', 'Hadis'],
        translations: [
          {
            lang: 'tr',
            title: "Zadu'l-Mead",
            description: 'Peygamberin hayatından alınan dersler ve hükümler.',
            summary: 'Siyer, fıkıh ve hadis bir arada.',
          },
          {
            lang: 'en',
            title: 'Provisions of the Hereafter',
            description:
              'Lessons and judgments taken from the life of the Prophet.',
            summary: 'Sira, fiqh and hadith together.',
          },
          {
            lang: 'ar',
            title: 'زاد المعاد',
            description: 'دروس وأحكام مستفادة من حياة النبي.',
            summary: 'السيرة والفقه والحديث معًا.',
          },
        ],
      },
      {
        author: 'İbn Ataillah el-İskenderi',
        publishDate: new Date('1309-01-01'),
        coverImage: '/uploads/books/hikem.jpg',
        categories: ['Tasavvuf', 'Hikmet', 'Ahlak'],
        translations: [
          {
            lang: 'tr',
            title: 'Hikem',
            description: 'Tasavvufi hikmet dolu kısa sözler ve öğütler.',
            summary: 'Kalp arıtma ve manevi yükselme üzerine.',
          },
          {
            lang: 'en',
            title: 'The Book of Wisdom',
            description: 'Short words and advice full of Sufi wisdom.',
            summary: 'On purifying the heart and spiritual ascension.',
          },
          {
            lang: 'ar',
            title: 'الحكم العطائية',
            description: 'أقوال قصيرة ونصائح مليئة بالحكمة الصوفية.',
            summary: 'حول تطهير القلب والارتقاء الروحي.',
          },
        ],
      },
      {
        author: 'Bediüzzaman Said Nursi',
        publishDate: new Date('1960-01-01'),
        coverImage: '/uploads/books/sozler.jpg',
        categories: ['Tefsir', 'İman', 'Türk Eserleri'],
        translations: [
          {
            lang: 'tr',
            title: 'Sözler',
            description:
              "Risale-i Nur'un temel kitabı, iman hakikatlerini anlatan.",
            summary: "Allah'ın varlığı ve birliği üzerine deliller.",
          },
          {
            lang: 'en',
            title: 'The Words',
            description:
              'The basic book of Risale-i Nur, describing the truths of faith.',
            summary: 'Evidence on the existence and unity of God.',
          },
          {
            lang: 'ar',
            title: 'الكلمات',
            description: 'الكتاب الأساسي لرسائل النور، يصف حقائق الإيمان.',
            summary: 'أدلة حول وجود الله ووحدانيته.',
          },
        ],
      },
      {
        author: 'Abdülhamid Kişmir',
        publishDate: new Date('1975-01-01'),
        coverImage: '/uploads/books/islam-tarihi.jpg',
        categories: ['Tarih', 'İslam Tarihi', 'Türk Eserleri'],
        translations: [
          {
            lang: 'tr',
            title: 'İslam Tarihi',
            description: 'Hz. Muhammed döneminden günümüze İslam tarihi.',
            summary: 'İslam devletleri ve medeniyetinin tarihi.',
          },
          {
            lang: 'en',
            title: 'History of Islam',
            description:
              'History of Islam from the time of Prophet Muhammad to the present.',
            summary: 'History of Islamic states and civilization.',
          },
          {
            lang: 'az',
            title: 'İslam Tarixi',
            description: 'Peyğəmbər dövründən bu günə qədər İslam tarixi.',
            summary: 'İslam dövlətlərinin və sivilizasiyasının tarixi.',
          },
        ],
      },
      {
        author: 'Elmalılı Tefsiri',
        publishDate: new Date('1935-01-01'),
        coverImage: '/uploads/books/elmalili-tefsir-full.jpg',
        categories: ['Tefsir', "Kur'an", 'Türk Eserleri'],
        translations: [
          {
            lang: 'tr',
            title: "Hak Dini Kur'an Dili (Tam Metin)",
            description: "Elmalılı'nın 9 ciltlik tefsirinin tam metni.",
            summary: "Türkçe'nin en derin ve kapsamlı tefsiri.",
          },
          {
            lang: 'en',
            title: 'The Complete Commentary of Elmalili',
            description: "The complete text of Elmalili's 9-volume commentary.",
            summary:
              'The most profound and comprehensive commentary in Turkish.',
          },
        ],
      },
      {
        author: 'İbn Cüzey',
        publishDate: new Date('1340-01-01'),
        coverImage: '/uploads/books/teshil.jpg',
        categories: ['Tefsir', "Kur'an", 'Özet Tefsir'],
        translations: [
          {
            lang: 'tr',
            title: "et-Teshil li Ulumi't-Tenzil",
            description: 'Kısa ve öz, anlaşılır tefsir eseri.',
            summary: "Kur'an ayetlerinin özet izahı.",
          },
          {
            lang: 'en',
            title: 'Facilitation of the Sciences of Revelation',
            description: 'A concise and clear commentary work.',
            summary: 'Brief explanation of Quranic verses.',
          },
          {
            lang: 'ar',
            title: 'التسهيل لعلوم التنزيل',
            description: 'عمل تفسيري موجز وواضح.',
            summary: 'شرح موجز لآيات القرآن.',
          },
        ],
      },
      {
        author: 'Muhyiddin İbn Arabi',
        publishDate: new Date('1230-01-01'),
        coverImage: '/uploads/books/insan-kamil.jpg',
        categories: ['Tasavvuf', 'İnsan-ı Kamil', 'Felsefe'],
        translations: [
          {
            lang: 'tr',
            title: 'İnsan-ı Kamil',
            description: 'Tasavvufta ideal insanın özellikleri.',
            summary: 'Manevi olgunlaşma ve kemale erme yolları.',
          },
          {
            lang: 'en',
            title: 'The Perfect Human',
            description: 'Characteristics of the ideal human in Sufism.',
            summary: 'Ways of spiritual maturation and perfection.',
          },
          {
            lang: 'ar',
            title: 'الإنسان الكامل',
            description: 'خصائص الإنسان المثالي في التصوف.',
            summary: 'طرق النضج الروحي والكمال.',
          },
        ],
      },
      {
        author: 'Mevlana Celaleddin Rumi',
        publishDate: new Date('1250-01-01'),
        coverImage: '/uploads/books/fihi-mafih.jpg',
        categories: ['Tasavvuf', 'Söylevler', 'Felsefe'],
        translations: [
          {
            lang: 'tr',
            title: 'Fihi Ma Fih',
            description: "Mevlana'nın sohbet ve söylevleri.",
            summary: 'Günlük hayatta tasavvufi hikmetler.',
          },
          {
            lang: 'en',
            title: 'In It What Is In It',
            description: "Rumi's conversations and speeches.",
            summary: 'Sufi wisdom in daily life.',
          },
          {
            lang: 'fa',
            title: 'فیه ما فیه',
            description: 'گفتگوها و سخنرانی‌های مولانا.',
            summary: 'حکمت عرفانی در زندگی روزمره.',
          },
        ],
      },
      {
        author: 'Şah Veliyullah Dehlevi',
        publishDate: new Date('1762-01-01'),
        coverImage: '/uploads/books/huccetullah.jpg',
        categories: ['Hadis', 'Fıkıh', 'Hint Alt Kıtası'],
        translations: [
          {
            lang: 'tr',
            title: "Hüccetullahi'l-Baliğa",
            description:
              'İslam hukuku ve hadis ilimleri üzerine kapsamlı eser.',
            summary: 'Şeriatın hikmetleri ve amaçları.',
          },
          {
            lang: 'en',
            title: 'The Conclusive Argument from God',
            description:
              'Comprehensive work on Islamic law and hadith sciences.',
            summary: 'Wisdom and purposes of Sharia.',
          },
          {
            lang: 'ar',
            title: 'حجة الله البالغة',
            description: 'عمل شامل عن الشريعة الإسلامية وعلوم الحديث.',
            summary: 'حكمة ومقاصد الشريعة.',
          },
          {
            lang: 'ur',
            title: 'حجۃ اللہ البالغہ',
            description: 'اسلامی قانون اور علم حدیث پر جامع کام۔',
            summary: 'شریعت کی حکمتیں اور مقاصد۔',
          },
        ],
      },
    ];

    let addedCount = 0;

    for (const bookData of books) {
      try {
        // Kitabın zaten var olup olmadığını kontrol et
        const existingBook = await this.bookRepository.findOne({
          where: {
            author: bookData.author,
            publishDate: bookData.publishDate,
          },
        });

        if (existingBook) {
          console.log(
            `⚠️  Kitap zaten mevcut: ${bookData.translations[0].title}`,
          );
          continue;
        }

        // Kitabı oluştur (sadece dil-bağımsız alanlar)
        const book = this.bookRepository.create({
          author: bookData.author,
          publishDate: bookData.publishDate,
          coverImage: bookData.coverImage,
        });
        const savedBook = await this.bookRepository.save(book);

        // Kategorileri ekle
        for (const categoryName of bookData.categories) {
          const bookCategory = this.bookCategoryRepository.create({
            bookId: savedBook.id,
            categoryName: categoryName,
          });
          await this.bookCategoryRepository.save(bookCategory);
        }

        // Her dil için translation oluştur
        let translationCount = 0;
        for (const transData of bookData.translations) {
          const langObj = languages[transData.lang];
          if (!langObj) {
            console.log(
              `⚠️  Dil bulunamadı: ${transData.lang} - ${transData.title}`,
            );
            continue;
          }

          const bookTranslation = this.bookTranslationRepository.create({
            bookId: savedBook.id,
            languageId: langObj.id,
            title: transData.title,
            description: transData.description,
            summary: transData.summary,
          });
          await this.bookTranslationRepository.save(bookTranslation);
          translationCount++;
        }

        addedCount++;
        console.log(
          `✅ Kitap eklendi: ${bookData.translations[0].title} (${translationCount} dil, ${bookData.categories.join(', ')})`,
        );
      } catch (error) {
        console.error(
          `❌ Kitap eklenirken hata: ${bookData.translations[0].title}`,
          error.message,
        );
      }
    }

    console.log(`🎉 ${addedCount} kitap başarıyla eklendi!`);
    console.log(`📚 Toplam ${books.length} kitap işlendi.`);
  }
}
