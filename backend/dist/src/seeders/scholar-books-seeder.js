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
exports.ScholarBooksSeeder = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const scholar_entity_1 = require("../scholars/entities/scholar.entity");
const scholar_book_entity_1 = require("../scholars/entities/scholar-book.entity");
let ScholarBooksSeeder = class ScholarBooksSeeder {
    constructor(scholarRepository, scholarBookRepository) {
        this.scholarRepository = scholarRepository;
        this.scholarBookRepository = scholarBookRepository;
    }
    async seed() {
        console.log('🌱 Starting scholar books seeding...');
        const additionalBooks = {
            1: [
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
                const scholar = await this.scholarRepository.findOne({
                    where: { id: parseInt(scholarId) },
                });
                if (!scholar) {
                    console.log(`⚠️  Scholar not found: ID ${scholarId}`);
                    continue;
                }
                for (const bookData of books) {
                    const existingBook = await this.scholarBookRepository.findOne({
                        where: {
                            title: bookData.title,
                            scholar: { id: parseInt(scholarId) },
                        },
                    });
                    if (existingBook) {
                        console.log(`⚠️  Book already exists: ${bookData.title} for ${scholar.fullName}`);
                        continue;
                    }
                    const book = this.scholarBookRepository.create({
                        ...bookData,
                        scholar: scholar,
                    });
                    await this.scholarBookRepository.save(book);
                    console.log(`✅ Added book: ${bookData.title} for ${scholar.fullName}`);
                }
            }
            catch (error) {
                console.error(`❌ Error adding books for scholar ID ${scholarId}:`, error.message);
            }
        }
        console.log('🎉 Scholar books seeding completed!');
    }
};
exports.ScholarBooksSeeder = ScholarBooksSeeder;
exports.ScholarBooksSeeder = ScholarBooksSeeder = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(scholar_entity_1.Scholar)),
    __param(1, (0, typeorm_1.InjectRepository)(scholar_book_entity_1.ScholarBook)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ScholarBooksSeeder);
//# sourceMappingURL=scholar-books-seeder.js.map