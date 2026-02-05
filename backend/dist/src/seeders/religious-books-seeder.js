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
exports.ReligiousBooksSeeder = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const book_entity_1 = require("../books/entities/book.entity");
const book_translation_entity_1 = require("../books/entities/book-translation.entity");
const book_category_entity_1 = require("../books/entities/book-category.entity");
const language_entity_1 = require("../languages/entities/language.entity");
let ReligiousBooksSeeder = class ReligiousBooksSeeder {
    constructor(bookRepository, bookTranslationRepository, bookCategoryRepository, languageRepository) {
        this.bookRepository = bookRepository;
        this.bookTranslationRepository = bookTranslationRepository;
        this.bookCategoryRepository = bookCategoryRepository;
        this.languageRepository = languageRepository;
    }
    async seed() {
        console.log('🌱 Dini kitaplar ekleniyor...');
        const turkish = await this.languageRepository.findOne({
            where: { code: 'tr' },
        });
        const english = await this.languageRepository.findOne({
            where: { code: 'en' },
        });
        const arabic = await this.languageRepository.findOne({
            where: { code: 'ar' },
        });
        if (!turkish || !english || !arabic) {
            console.error('❌ Gerekli diller bulunamadı! Önce dilleri ekleyin.');
            return;
        }
        const religiousBooks = [
            {
                author: 'İmam Gazali',
                publishDate: new Date('1111-01-01'),
                coverImage: 'uploads/books/kimya-saadet.jpg',
                categories: ['Tasavvuf', 'Ahlak', 'Dini Eserler'],
                translations: [
                    {
                        languageId: turkish.id,
                        title: 'Kimya-yı Saadet',
                        description: "İmam Gazali'nin en önemli eserlerinden biri. İnsanı mutluluğa götüren yolları anlatan tasavvufi bir eserdir.",
                        summary: 'Mutluluk kimyası, ibadet, ahlak ve tasavvuf konularında rehber bir eser.',
                    },
                    {
                        languageId: english.id,
                        title: 'The Alchemy of Happiness',
                        description: "One of Imam Ghazali's most important works. A Sufi work that describes the ways that lead man to happiness.",
                        summary: 'The chemistry of happiness, a guide on worship, morals and Sufism.',
                    },
                    {
                        languageId: arabic.id,
                        title: 'كيمياء السعادة',
                        description: 'أحد أهم أعمال الإمام الغزالي. عمل صوفي يصف الطرق التي تؤدي بالإنسان إلى السعادة.',
                        summary: 'كيمياء السعادة، دليل في العبادة والأخلاق والتصوف.',
                    },
                ],
            },
            {
                author: 'İbn Arabi',
                publishDate: new Date('1240-01-01'),
                coverImage: 'uploads/books/fusus-hikem.jpg',
                categories: ['Tasavvuf', 'Felsefe', 'İslam Düşüncesi'],
                translations: [
                    {
                        languageId: turkish.id,
                        title: "Fusus'ul Hikem",
                        description: "İbn Arabi'nin en önemli eserlerinden biri. Vahdet-i vücut düşüncesinin temel metinlerinden.",
                        summary: 'Peygamberlerin hikmetlerini anlatan derin bir tasavvuf eseri.',
                    },
                    {
                        languageId: english.id,
                        title: 'The Bezels of Wisdom',
                        description: "One of Ibn Arabi's most important works. One of the basic texts of the idea of ​​unity of being.",
                        summary: 'A profound Sufi work describing the wisdom of the prophets.',
                    },
                    {
                        languageId: arabic.id,
                        title: 'فصوص الحكم',
                        description: 'أحد أهم أعمال ابن عربي. أحد النصوص الأساسية لفكرة وحدة الوجود.',
                        summary: 'عمل صوفي عميق يصف حكمة الأنبياء.',
                    },
                ],
            },
            {
                author: 'Said Nursi',
                publishDate: new Date('1960-01-01'),
                coverImage: 'uploads/books/risale-nur.jpg',
                categories: ['Tefsir', 'İman', 'Dini Eserler'],
                translations: [
                    {
                        languageId: turkish.id,
                        title: 'Risale-i Nur Külliyatı',
                        description: "Said Nursi'nin Kur'an'ın manevi tefsiri olarak kaleme aldığı eserler topluluğu.",
                        summary: "İman, ibadet ve Kur'an tefsiri konularında kapsamlı bir eser.",
                    },
                    {
                        languageId: english.id,
                        title: 'The Risale-i Nur Collection',
                        description: 'A collection of works written by Said Nursi as a spiritual commentary on the Quran.',
                        summary: 'A comprehensive work on faith, worship and Quranic commentary.',
                    },
                    {
                        languageId: arabic.id,
                        title: 'رسائل النور',
                        description: 'مجموعة من الأعمال التي كتبها سعيد النورسي كتفسير روحي للقرآن.',
                        summary: 'عمل شامل عن الإيمان والعبادة والتفسير القرآني.',
                    },
                ],
            },
            {
                author: 'İbn Kayyim el-Cevziyye',
                publishDate: new Date('1350-01-01'),
                coverImage: 'uploads/books/igasetul-lehfan.jpg',
                categories: ['Fıkıh', 'Hadis', 'İslam Hukuku'],
                translations: [
                    {
                        languageId: turkish.id,
                        title: "İğasetü'l Lehfan",
                        description: 'Şeytanın tuzaklarından korunma yollarını anlatan önemli bir eser.',
                        summary: 'İslam ahlakı ve şeytanın hilelerinden korunma rehberi.',
                    },
                    {
                        languageId: english.id,
                        title: 'Relief from Distress',
                        description: 'An important work describing ways to protect from the traps of Satan.',
                        summary: 'A guide to Islamic morality and protection from the tricks of Satan.',
                    },
                    {
                        languageId: arabic.id,
                        title: 'إغاثة اللهفان من مصايد الشيطان',
                        description: 'عمل مهم يصف طرق الحماية من مصائد الشيطان.',
                        summary: 'دليل للأخلاق الإسلامية والحماية من حيل الشيطان.',
                    },
                ],
            },
            {
                author: 'Fahruddin er-Razi',
                publishDate: new Date('1209-01-01'),
                coverImage: 'uploads/books/mefatih-gayb.jpg',
                categories: ['Tefsir', 'Kelam', 'İslam İlimleri'],
                translations: [
                    {
                        languageId: turkish.id,
                        title: "Mefatihü'l Gayb (Tefsir-i Kebir)",
                        description: "Kur'an-ı Kerim'in en kapsamlı ve detaylı tefsirlerinden biri.",
                        summary: 'Kelam, felsefe ve dil bilgisi açısından zengin bir tefsir eseri.',
                    },
                    {
                        languageId: english.id,
                        title: 'Keys to the Unseen (Great Commentary)',
                        description: 'One of the most comprehensive and detailed commentaries on the Holy Quran.',
                        summary: 'A commentary work rich in terms of theology, philosophy and grammar.',
                    },
                    {
                        languageId: arabic.id,
                        title: 'مفاتيح الغيب (التفسير الكبير)',
                        description: 'أحد أشمل وأدق التفاسير للقرآن الكريم.',
                        summary: 'عمل تفسيري غني من حيث علم الكلام والفلسفة والنحو.',
                    },
                ],
            },
            {
                author: 'İmam Rabbani',
                publishDate: new Date('1624-01-01'),
                coverImage: 'uploads/books/mektubat.jpg',
                categories: ['Tasavvuf', 'Mektuplar', 'Nakşibendi'],
                translations: [
                    {
                        languageId: turkish.id,
                        title: 'Mektubat-ı Rabbani',
                        description: "İmam Rabbani'nin müridlerine ve çeşitli kimselere yazdığı mektuplardan oluşan eser.",
                        summary: 'Tasavvuf, şeriat-tarikat dengesi ve maneviyat üzerine öğütler.',
                    },
                    {
                        languageId: english.id,
                        title: 'Letters of Rabbani',
                        description: 'A work consisting of letters written by Imam Rabbani to his disciples and various people.',
                        summary: 'Advice on Sufism, sharia-tariqa balance and spirituality.',
                    },
                    {
                        languageId: arabic.id,
                        title: 'المكتوبات',
                        description: 'عمل يتكون من رسائل كتبها الإمام الرباني لمريديه ومختلف الناس.',
                        summary: 'نصائح حول التصوف وتوازن الشريعة والطريقة والروحانية.',
                    },
                ],
            },
            {
                author: 'Abdulkadir Geylani',
                publishDate: new Date('1166-01-01'),
                coverImage: 'uploads/books/gunyetut-talibin.jpg',
                categories: ['Tasavvuf', 'Kadiri', 'Ahlak'],
                translations: [
                    {
                        languageId: turkish.id,
                        title: "Gunyetü't Talibin",
                        description: "Abdulkadir Geylani'nin fıkıh ve tasavvuf konularındaki temel eseri.",
                        summary: 'Müridlerin rehberi, fıkıh ve tasavvuf bilgileri içeren kapsamlı eser.',
                    },
                    {
                        languageId: english.id,
                        title: 'Sufficient Provision for Seekers',
                        description: "Abdulkadir Geylani's basic work on jurisprudence and Sufism.",
                        summary: 'A comprehensive work containing the guide of disciples, jurisprudence and Sufism knowledge.',
                    },
                    {
                        languageId: arabic.id,
                        title: 'غنية الطالبين',
                        description: 'العمل الأساسي لعبد القادر الجيلاني في الفقه والتصوف.',
                        summary: 'عمل شامل يحتوي على دليل التلاميذ ومعرفة الفقه والتصوف.',
                    },
                ],
            },
            {
                author: 'İmam Şafii',
                publishDate: new Date('820-01-01'),
                coverImage: 'uploads/books/umm.jpg',
                categories: ['Fıkıh', 'Şafii Mezhebi', 'İslam Hukuku'],
                translations: [
                    {
                        languageId: turkish.id,
                        title: 'el-Ümm',
                        description: "İmam Şafii'nin fıkıh usulü ve fıkhi meseleleri ele aldığı ana eseri.",
                        summary: 'Şafii mezhebinin temel kaynağı, fıkıh ve usul konularında referans eser.',
                    },
                    {
                        languageId: english.id,
                        title: 'The Mother Book',
                        description: "Imam Shafi's main work dealing with the principles of jurisprudence and jurisprudence issues.",
                        summary: 'The main source of the Shafi school, reference work on jurisprudence and methodology.',
                    },
                    {
                        languageId: arabic.id,
                        title: 'الأم',
                        description: 'العمل الرئيسي للإمام الشافعي الذي يتناول أصول الفقه والمسائل الفقهية.',
                        summary: 'المصدر الرئيسي للمذهب الشافعي، عمل مرجعي في الفقه والمنهجية.',
                    },
                ],
            },
            {
                author: 'İbn Haldun',
                publishDate: new Date('1377-01-01'),
                coverImage: 'uploads/books/mukaddime.jpg',
                categories: ['Tarih', 'Sosyoloji', 'İslam Medeniyeti'],
                translations: [
                    {
                        languageId: turkish.id,
                        title: 'Mukaddime',
                        description: "İbn Haldun'un toplum ve medeniyet tarihi üzerine çığır açan eseri.",
                        summary: 'Sosyolojinin temellerini atan, medeniyet ve devlet teorileri içeren klasik eser.',
                    },
                    {
                        languageId: english.id,
                        title: 'The Muqaddimah',
                        description: "Ibn Khaldun's groundbreaking work on the history of society and civilization.",
                        summary: 'A classic work that lays the foundations of sociology and contains theories of civilization and state.',
                    },
                    {
                        languageId: arabic.id,
                        title: 'المقدمة',
                        description: 'عمل ابن خلدون الرائد في تاريخ المجتمع والحضارة.',
                        summary: 'عمل كلاسيكي يضع أسس علم الاجتماع ويحتوي على نظريات الحضارة والدولة.',
                    },
                ],
            },
            {
                author: 'Ebu Hamid el-Gazali',
                publishDate: new Date('1105-01-01'),
                coverImage: 'uploads/books/munkiz.jpg',
                categories: ['Kelam', 'Felsefe', 'Otoبiyografi'],
                translations: [
                    {
                        languageId: turkish.id,
                        title: "el-Munkizu mine'd Dalal",
                        description: "İmam Gazali'nin entelektüel ve ruhani yolculuğunu anlattığı otobiyografik eseri.",
                        summary: 'Dalalet ve şüpheden kurtuluş, hakikate ulaşma serüveni.',
                    },
                    {
                        languageId: english.id,
                        title: 'The Deliverance from Error',
                        description: "Imam Ghazali's autobiographical work describing his intellectual and spiritual journey.",
                        summary: 'Deliverance from error and doubt, the adventure of reaching the truth.',
                    },
                    {
                        languageId: arabic.id,
                        title: 'المنقذ من الضلال',
                        description: 'العمل السيري الذاتي للإمام الغزالي الذي يصف رحلته الفكرية والروحية.',
                        summary: 'الخلاص من الخطأ والشك، مغامرة الوصول إلى الحقيقة.',
                    },
                ],
            },
        ];
        let addedCount = 0;
        for (const bookData of religiousBooks) {
            try {
                const existingBook = await this.bookRepository.findOne({
                    where: {
                        author: bookData.author,
                        publishDate: bookData.publishDate,
                    },
                });
                if (existingBook) {
                    console.log(`⚠️  Kitap zaten mevcut: ${bookData.translations[0].title}`);
                    continue;
                }
                const book = this.bookRepository.create({
                    author: bookData.author,
                    publishDate: bookData.publishDate,
                    coverImage: bookData.coverImage,
                });
                const savedBook = await this.bookRepository.save(book);
                for (const categoryName of bookData.categories) {
                    const bookCategory = this.bookCategoryRepository.create({
                        bookId: savedBook.id,
                        categoryName: categoryName,
                    });
                    await this.bookCategoryRepository.save(bookCategory);
                }
                for (const transData of bookData.translations) {
                    const bookTranslation = this.bookTranslationRepository.create({
                        bookId: savedBook.id,
                        languageId: transData.languageId,
                        title: transData.title,
                        description: transData.description,
                        summary: transData.summary,
                    });
                    await this.bookTranslationRepository.save(bookTranslation);
                }
                addedCount++;
                console.log(`✅ Kitap eklendi: ${bookData.translations[0].title} (${bookData.categories.join(', ')})`);
            }
            catch (error) {
                console.error(`❌ Kitap eklenirken hata: ${bookData.translations[0].title}`, error.message);
            }
        }
        console.log(`🎉 ${addedCount} dini kitap başarıyla eklendi!`);
    }
};
exports.ReligiousBooksSeeder = ReligiousBooksSeeder;
exports.ReligiousBooksSeeder = ReligiousBooksSeeder = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(book_entity_1.Book)),
    __param(1, (0, typeorm_1.InjectRepository)(book_translation_entity_1.BookTranslation)),
    __param(2, (0, typeorm_1.InjectRepository)(book_category_entity_1.BookCategory)),
    __param(3, (0, typeorm_1.InjectRepository)(language_entity_1.Language)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReligiousBooksSeeder);
//# sourceMappingURL=religious-books-seeder.js.map