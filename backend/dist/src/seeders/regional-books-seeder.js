"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegionalBooksSeeder = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const book_entity_1 = require("../books/entities/book.entity");
const book_translation_entity_1 = require("../books/entities/book-translation.entity");
const book_category_entity_1 = require("../books/entities/book-category.entity");
const language_entity_1 = require("../languages/entities/language.entity");
let RegionalBooksSeeder = class RegionalBooksSeeder {
    constructor(bookRepository, bookTranslationRepository, bookCategoryRepository, languageRepository) {
        this.bookRepository = bookRepository;
        this.bookTranslationRepository = bookTranslationRepository;
        this.bookCategoryRepository = bookCategoryRepository;
        this.languageRepository = languageRepository;
    }
    async seed() {
        console.log('🌱 Starting regional books seeding...');
        const regionalBooks = [
            {
                title: 'Mesnevi',
                description: "Mevlana Celaleddin Rumi'nin en ünlü eseri",
                coverImage: '/uploads/books/mesnevi.jpg',
                author: 'Mevlana Celaleddin Rumi',
                publishDate: new Date('1260-01-01'),
                summary: 'Tasavvuf edebiyatının en önemli eserlerinden biri. 25.000 beyitlik manzum eser.',
                languages: [
                    { languageCode: 'tr', pdfUrl: '/uploads/books/mesnevi-turkish.pdf' },
                    { languageCode: 'fa', pdfUrl: '/uploads/books/mesnevi-persian.pdf' },
                    { languageCode: 'en', pdfUrl: '/uploads/books/mesnevi-english.pdf' },
                ],
                categories: ['Tasavvuf', 'Şiir', 'Edebiyat'],
            },
            {
                title: 'Dede Korkut Hikayeleri',
                description: 'Türk halk edebiyatının en önemli eserlerinden',
                coverImage: '/uploads/books/dede-korkut.jpg',
                author: 'Anonim',
                publishDate: new Date('1400-01-01'),
                summary: 'Oğuz Türklerinin destansı hikayelerinin derlendiği eser.',
                languages: [
                    {
                        languageCode: 'tr',
                        pdfUrl: '/uploads/books/dede-korkut-turkish.pdf',
                    },
                    {
                        languageCode: 'en',
                        pdfUrl: '/uploads/books/dede-korkut-english.pdf',
                    },
                ],
                categories: ['Halk Edebiyatı', 'Destan', 'Türk Kültürü'],
            },
            {
                title: 'Divan-ı Hikmet',
                description: "Ahmet Yesevi'nin manzum eserleri",
                coverImage: '/uploads/books/divan-hikmet.jpg',
                author: 'Ahmet Yesevi',
                publishDate: new Date('1166-01-01'),
                summary: 'Türk tasavvuf edebiyatının ilk örneklerinden. Hikmet tarzında yazılmış şiirler.',
                languages: [
                    {
                        languageCode: 'tr',
                        pdfUrl: '/uploads/books/divan-hikmet-turkish.pdf',
                    },
                    {
                        languageCode: 'kk',
                        pdfUrl: '/uploads/books/divan-hikmet-kazakh.pdf',
                    },
                ],
                categories: ['Tasavvuf', 'Şiir', 'Türk Tarihi'],
            },
            {
                title: 'الفتوحات المكية',
                description: "İbn Arabi'nin en büyük eseri",
                coverImage: '/uploads/books/futuhat-makkiyya.jpg',
                author: 'İbn Arabi',
                publishDate: new Date('1238-01-01'),
                summary: 'Tasavvuf felsefesinin en kapsamlı eseri. 560 bölümden oluşur.',
                languages: [
                    { languageCode: 'ar', pdfUrl: '/uploads/books/futuhat-arabic.pdf' },
                    { languageCode: 'tr', pdfUrl: '/uploads/books/futuhat-turkish.pdf' },
                    { languageCode: 'en', pdfUrl: '/uploads/books/futuhat-english.pdf' },
                ],
                categories: ['Tasavvuf', 'Felsefe', 'İslam Düşüncesi'],
            },
            {
                title: 'تفسير الطبري',
                description: 'En kapsamlı Kuran tefsiri',
                coverImage: '/uploads/books/tafsir-tabari.jpg',
                author: 'İbn Cerir et-Taberi',
                publishDate: new Date('923-01-01'),
                summary: "Kuran'ın en detaylı ve güvenilir tefsirlerinden biri.",
                languages: [
                    {
                        languageCode: 'ar',
                        pdfUrl: '/uploads/books/tafsir-tabari-arabic.pdf',
                    },
                    {
                        languageCode: 'tr',
                        pdfUrl: '/uploads/books/tafsir-tabari-turkish.pdf',
                    },
                ],
                categories: ['Tefsir', 'Kuran İlimleri', 'Hadis'],
            },
            {
                title: 'الرسالة',
                description: "İmam Şafii'nin fıkıh usulü eseri",
                coverImage: '/uploads/books/risala.jpg',
                author: 'İmam Şafii',
                publishDate: new Date('820-01-01'),
                summary: 'Fıkıh usulünün temel eserlerinden biri.',
                languages: [
                    { languageCode: 'ar', pdfUrl: '/uploads/books/risala-arabic.pdf' },
                    { languageCode: 'tr', pdfUrl: '/uploads/books/risala-turkish.pdf' },
                ],
                categories: ['Fıkıh', 'Usul', 'İslam Hukuku'],
            },
            {
                title: 'گلستان',
                description: "Sadi'nin en ünlü eseri",
                coverImage: '/uploads/books/gulistan.jpg',
                author: 'Sadi Şirazi',
                publishDate: new Date('1258-01-01'),
                summary: 'Ahlak ve edep konularında yazılmış manzum ve mensur karışık eser.',
                languages: [
                    { languageCode: 'fa', pdfUrl: '/uploads/books/gulistan-persian.pdf' },
                    { languageCode: 'tr', pdfUrl: '/uploads/books/gulistan-turkish.pdf' },
                    { languageCode: 'en', pdfUrl: '/uploads/books/gulistan-english.pdf' },
                ],
                categories: ['Edebiyat', 'Ahlak', 'Şiir'],
            },
            {
                title: 'بوستان',
                description: "Sadi'nin ahlaki eseri",
                coverImage: '/uploads/books/bustan.jpg',
                author: 'Sadi Şirazi',
                publishDate: new Date('1257-01-01'),
                summary: 'Tamamen manzum olarak yazılmış ahlaki öğütler içeren eser.',
                languages: [
                    { languageCode: 'fa', pdfUrl: '/uploads/books/bustan-persian.pdf' },
                    { languageCode: 'tr', pdfUrl: '/uploads/books/bustan-turkish.pdf' },
                ],
                categories: ['Şiir', 'Ahlak', 'Edebiyat'],
            },
            {
                title: 'شاهنامه',
                description: "Firdevsi'nin destansı eseri",
                coverImage: '/uploads/books/shahnameh.jpg',
                author: 'Firdevsi',
                publishDate: new Date('1010-01-01'),
                summary: "İran'ın milli destanı. 60.000 beyitlik manzum eser.",
                languages: [
                    {
                        languageCode: 'fa',
                        pdfUrl: '/uploads/books/shahnameh-persian.pdf',
                    },
                    {
                        languageCode: 'tr',
                        pdfUrl: '/uploads/books/shahnameh-turkish.pdf',
                    },
                    {
                        languageCode: 'en',
                        pdfUrl: '/uploads/books/shahnameh-english.pdf',
                    },
                ],
                categories: ['Destan', 'Edebiyat', 'Tarih'],
            },
            {
                title: 'دیوان غالب',
                description: "Mirza Ghalib'in şiir koleksiyonu",
                coverImage: '/uploads/books/dewan-ghalib.jpg',
                author: 'Mirza Ghalib',
                publishDate: new Date('1869-01-01'),
                summary: 'Urdu edebiyatının en büyük şairinin eserleri.',
                languages: [
                    {
                        languageCode: 'ur',
                        pdfUrl: '/uploads/books/dewan-ghalib-urdu.pdf',
                    },
                    {
                        languageCode: 'tr',
                        pdfUrl: '/uploads/books/dewan-ghalib-turkish.pdf',
                    },
                    {
                        languageCode: 'en',
                        pdfUrl: '/uploads/books/dewan-ghalib-english.pdf',
                    },
                ],
                categories: ['Şiir', 'Edebiyat', 'Urdu Kültürü'],
            },
            {
                title: 'قرآن مجید کا اردو ترجمہ',
                description: "Kuran'ın Urduca tercümesi",
                coverImage: '/uploads/books/quran-urdu.jpg',
                author: 'Muhammad Ali Jauhar',
                publishDate: new Date('1930-01-01'),
                summary: "Kuran'ın güvenilir Urduca tercümesi.",
                languages: [
                    {
                        languageCode: 'ur',
                        pdfUrl: '/uploads/books/quran-urdu-translation.pdf',
                    },
                    { languageCode: 'ar', pdfUrl: '/uploads/books/quran-arabic.pdf' },
                ],
                categories: ['Tefsir', 'Kuran', 'Çeviri'],
            },
            {
                title: 'Абай жолы',
                description: "Abay Kunanbayev'in şiir koleksiyonu",
                coverImage: '/uploads/books/abay-joly.jpg',
                author: 'Abay Kunanbayev',
                publishDate: new Date('1890-01-01'),
                summary: 'Kazak edebiyatının kurucusunun eserleri.',
                languages: [
                    { languageCode: 'kk', pdfUrl: '/uploads/books/abay-joly-kazakh.pdf' },
                    {
                        languageCode: 'tr',
                        pdfUrl: '/uploads/books/abay-joly-turkish.pdf',
                    },
                    {
                        languageCode: 'ru',
                        pdfUrl: '/uploads/books/abay-joly-russian.pdf',
                    },
                ],
                categories: ['Şiir', 'Kazak Edebiyatı', 'Kültür'],
            },
            {
                title: 'Қозы Көрпеш - Баян сұлу',
                description: 'Kazak halk destanı',
                coverImage: '/uploads/books/kozy-korpesh.jpg',
                author: 'Anonim',
                publishDate: new Date('1700-01-01'),
                summary: 'Kazak halk edebiyatının en ünlü aşk destanı.',
                languages: [
                    {
                        languageCode: 'kk',
                        pdfUrl: '/uploads/books/kozy-korpesh-kazakh.pdf',
                    },
                    {
                        languageCode: 'tr',
                        pdfUrl: '/uploads/books/kozy-korpesh-turkish.pdf',
                    },
                ],
                categories: ['Destan', 'Halk Edebiyatı', 'Aşk'],
            },
            {
                title: 'Алпомиш',
                description: 'Özbek halk destanı',
                coverImage: '/uploads/books/alpamysh.jpg',
                author: 'Anonim',
                publishDate: new Date('1500-01-01'),
                summary: 'Özbek halk edebiyatının en önemli destanı.',
                languages: [
                    { languageCode: 'uz', pdfUrl: '/uploads/books/alpamysh-uzbek.pdf' },
                    { languageCode: 'tr', pdfUrl: '/uploads/books/alpamysh-turkish.pdf' },
                    { languageCode: 'kk', pdfUrl: '/uploads/books/alpamysh-kazakh.pdf' },
                ],
                categories: ['Destan', 'Halk Edebiyatı', 'Özbek Kültürü'],
            },
            {
                title: 'Гур-оғли',
                description: 'Özbek halk destanı',
                coverImage: '/uploads/books/gur-ogli.jpg',
                author: 'Anonim',
                publishDate: new Date('1600-01-01'),
                summary: 'Özbek halk edebiyatının kahramanlık destanı.',
                languages: [
                    { languageCode: 'uz', pdfUrl: '/uploads/books/gur-ogli-uzbek.pdf' },
                    { languageCode: 'tr', pdfUrl: '/uploads/books/gur-ogli-turkish.pdf' },
                ],
                categories: ['Destan', 'Kahramanlık', 'Halk Edebiyatı'],
            },
            {
                title: 'Идегәй',
                description: 'Tatar halk destanı',
                coverImage: '/uploads/books/idegei.jpg',
                author: 'Anonim',
                publishDate: new Date('1400-01-01'),
                summary: 'Tatar halk edebiyatının en önemli destanı.',
                languages: [
                    { languageCode: 'tt', pdfUrl: '/uploads/books/idegei-tatar.pdf' },
                    { languageCode: 'tr', pdfUrl: '/uploads/books/idegei-turkish.pdf' },
                    { languageCode: 'ru', pdfUrl: '/uploads/books/idegei-russian.pdf' },
                ],
                categories: ['Destan', 'Tatar Kültürü', 'Halk Edebiyatı'],
            },
            {
                title: 'Чыңгызхан дастаны',
                description: 'Cengiz Han destanı',
                coverImage: '/uploads/books/chingiz-khan.jpg',
                author: 'Anonim',
                publishDate: new Date('1300-01-01'),
                summary: "Cengiz Han'ın hayatını anlatan destan.",
                languages: [
                    {
                        languageCode: 'tt',
                        pdfUrl: '/uploads/books/chingiz-khan-tatar.pdf',
                    },
                    {
                        languageCode: 'tr',
                        pdfUrl: '/uploads/books/chingiz-khan-turkish.pdf',
                    },
                ],
                categories: ['Destan', 'Tarih', 'Kahramanlık'],
            },
            {
                title: 'ئۇيغۇر خەلق داستانلىرى',
                description: 'Uygur halk destanları',
                coverImage: '/uploads/books/uyghur-legends.jpg',
                author: 'Anonim',
                publishDate: new Date('1200-01-01'),
                summary: 'Uygur halk edebiyatının en önemli destanları.',
                languages: [
                    {
                        languageCode: 'ug',
                        pdfUrl: '/uploads/books/uyghur-legends-uyghur.pdf',
                    },
                    {
                        languageCode: 'tr',
                        pdfUrl: '/uploads/books/uyghur-legends-turkish.pdf',
                    },
                    {
                        languageCode: 'zh',
                        pdfUrl: '/uploads/books/uyghur-legends-chinese.pdf',
                    },
                ],
                categories: ['Destan', 'Uygur Kültürü', 'Halk Edebiyatı'],
            },
            {
                title: 'ئۇيغۇر تىلى گرامماتىكىسى',
                description: 'Uygur dilbilgisi',
                coverImage: '/uploads/books/uyghur-grammar.jpg',
                author: 'Muhemmed Salih',
                publishDate: new Date('1980-01-01'),
                summary: 'Uygur Türkçesi dilbilgisi kitabı.',
                languages: [
                    {
                        languageCode: 'ug',
                        pdfUrl: '/uploads/books/uyghur-grammar-uyghur.pdf',
                    },
                    {
                        languageCode: 'tr',
                        pdfUrl: '/uploads/books/uyghur-grammar-turkish.pdf',
                    },
                ],
                categories: ['Dilbilgisi', 'Eğitim', 'Uygur Dili'],
            },
            {
                title: 'Dədə Qorqud',
                description: 'Azerbaycan versiyonu',
                coverImage: '/uploads/books/dede-qorqud-az.jpg',
                author: 'Anonim',
                publishDate: new Date('1400-01-01'),
                summary: 'Dede Korkut hikayelerinin Azerbaycan versiyonu.',
                languages: [
                    {
                        languageCode: 'az',
                        pdfUrl: '/uploads/books/dede-qorqud-azerbaijani.pdf',
                    },
                    {
                        languageCode: 'tr',
                        pdfUrl: '/uploads/books/dede-qorqud-turkish.pdf',
                    },
                ],
                categories: ['Halk Edebiyatı', 'Azerbaycan Kültürü', 'Destan'],
            },
            {
                title: 'Leyla və Məcnun',
                description: "Fuzuli'nin ünlü eseri",
                coverImage: '/uploads/books/leyla-mecnun.jpg',
                author: 'Fuzuli',
                publishDate: new Date('1535-01-01'),
                summary: 'Azerbaycan edebiyatının en ünlü aşk hikayesi.',
                languages: [
                    {
                        languageCode: 'az',
                        pdfUrl: '/uploads/books/leyla-mecnun-azerbaijani.pdf',
                    },
                    {
                        languageCode: 'tr',
                        pdfUrl: '/uploads/books/leyla-mecnun-turkish.pdf',
                    },
                    {
                        languageCode: 'fa',
                        pdfUrl: '/uploads/books/leyla-mecnun-persian.pdf',
                    },
                ],
                categories: ['Aşk', 'Edebiyat', 'Şiir'],
            },
            {
                title: 'The Sealed Nectar',
                description: 'Biography of Prophet Muhammad',
                coverImage: '/uploads/books/sealed-nectar.jpg',
                author: 'Safiyur Rahman Mubarakpuri',
                publishDate: new Date('1979-01-01'),
                summary: 'Comprehensive biography of Prophet Muhammad (PBUH).',
                languages: [
                    {
                        languageCode: 'en',
                        pdfUrl: '/uploads/books/sealed-nectar-english.pdf',
                    },
                    {
                        languageCode: 'ar',
                        pdfUrl: '/uploads/books/sealed-nectar-arabic.pdf',
                    },
                    {
                        languageCode: 'tr',
                        pdfUrl: '/uploads/books/sealed-nectar-turkish.pdf',
                    },
                ],
                categories: ['Siyer', 'Biography', 'İslam Tarihi'],
            },
            {
                title: 'The Meaning of the Holy Quran',
                description: 'English translation and commentary',
                coverImage: '/uploads/books/quran-meaning.jpg',
                author: 'Abdullah Yusuf Ali',
                publishDate: new Date('1934-01-01'),
                summary: 'Comprehensive English translation of the Quran with commentary.',
                languages: [
                    {
                        languageCode: 'en',
                        pdfUrl: '/uploads/books/quran-meaning-english.pdf',
                    },
                    { languageCode: 'ar', pdfUrl: '/uploads/books/quran-arabic.pdf' },
                ],
                categories: ['Tefsir', 'Kuran', 'Çeviri'],
            },
            {
                title: 'Der Islam',
                description: 'Einführung in den Islam',
                coverImage: '/uploads/books/der-islam.jpg',
                author: 'Annemarie Schimmel',
                publishDate: new Date('1990-01-01'),
                summary: 'Umfassende Einführung in den Islam und seine Kultur.',
                languages: [
                    { languageCode: 'de', pdfUrl: '/uploads/books/der-islam-german.pdf' },
                    {
                        languageCode: 'tr',
                        pdfUrl: '/uploads/books/der-islam-turkish.pdf',
                    },
                    {
                        languageCode: 'en',
                        pdfUrl: '/uploads/books/der-islam-english.pdf',
                    },
                ],
                categories: ['İslam Bilgisi', 'Kültür', 'Einführung'],
            },
            {
                title: "L'Islam et l'Occident",
                description: 'Relations entre Islam et Occident',
                coverImage: '/uploads/books/islam-occident.jpg',
                author: 'Bernard Lewis',
                publishDate: new Date('1993-01-01'),
                summary: "Analyse des relations historiques entre l'Islam et l'Occident.",
                languages: [
                    {
                        languageCode: 'fr',
                        pdfUrl: '/uploads/books/islam-occident-french.pdf',
                    },
                    {
                        languageCode: 'tr',
                        pdfUrl: '/uploads/books/islam-occident-turkish.pdf',
                    },
                    {
                        languageCode: 'en',
                        pdfUrl: '/uploads/books/islam-occident-english.pdf',
                    },
                ],
                categories: ['Tarih', 'İslam Tarihi', 'Kültür'],
            },
            {
                title: 'イスラム教の歴史',
                description: 'İslam tarihi',
                coverImage: '/uploads/books/islam-history-jp.jpg',
                author: 'Hiroshi Kato',
                publishDate: new Date('2005-01-01'),
                summary: 'İslam tarihinin Japonca anlatımı.',
                languages: [
                    {
                        languageCode: 'ja',
                        pdfUrl: '/uploads/books/islam-history-japanese.pdf',
                    },
                    {
                        languageCode: 'tr',
                        pdfUrl: '/uploads/books/islam-history-turkish.pdf',
                    },
                    {
                        languageCode: 'en',
                        pdfUrl: '/uploads/books/islam-history-english.pdf',
                    },
                ],
                categories: ['İslam Tarihi', 'Tarih', 'Japonca'],
            },
        ];
        for (const bookData of regionalBooks) {
            try {
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
                const { languages, categories, title, description, summary, ...bookInfo } = bookData;
                const book = this.bookRepository.create(bookInfo);
                const savedBook = await this.bookRepository.save(book);
                for (const langData of languages) {
                    const language = await this.languageRepository.findOne({
                        where: { code: langData.languageCode },
                    });
                    if (language) {
                        const bookTranslation = this.bookTranslationRepository.create({
                            bookId: savedBook.id,
                            languageId: language.id,
                            title: bookData.title,
                            description: bookData.description,
                            summary: bookData.summary,
                            pdfUrl: langData.pdfUrl,
                        });
                        await this.bookTranslationRepository.save(bookTranslation);
                    }
                    else {
                        console.log(`⚠️  Language not found: ${langData.languageCode}`);
                    }
                }
                for (const categoryName of categories) {
                    const bookCategory = this.bookCategoryRepository.create({
                        bookId: savedBook.id,
                        categoryName: categoryName,
                    });
                    await this.bookCategoryRepository.save(bookCategory);
                }
                console.log(`✅ Added book: ${bookData.title} with ${languages.length} languages and ${categories.length} categories`);
            }
            catch (error) {
                console.error(`❌ Error adding book ${bookData.title}:`, error.message);
            }
        }
        console.log('🎉 Regional books seeding completed!');
    }
};
exports.RegionalBooksSeeder = RegionalBooksSeeder;
exports.RegionalBooksSeeder = RegionalBooksSeeder = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(book_entity_1.Book)),
    __param(1, (0, typeorm_1.InjectRepository)(book_translation_entity_1.BookTranslation)),
    __param(2, (0, typeorm_1.InjectRepository)(book_category_entity_1.BookCategory)),
    __param(3, (0, typeorm_1.InjectRepository)(language_entity_1.Language)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RegionalBooksSeeder);
//# sourceMappingURL=regional-books-seeder.js.map