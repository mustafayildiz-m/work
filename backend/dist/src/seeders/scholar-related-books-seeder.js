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
exports.ScholarRelatedBooksSeeder = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const scholar_entity_1 = require("../scholars/entities/scholar.entity");
const book_entity_1 = require("../books/entities/book.entity");
let ScholarRelatedBooksSeeder = class ScholarRelatedBooksSeeder {
    constructor(scholarRepository, bookRepository) {
        this.scholarRepository = scholarRepository;
        this.bookRepository = bookRepository;
    }
    async seed() {
        console.log('🌱 Starting scholar related books seeding...');
        const scholars = await this.scholarRepository.find();
        const books = await this.bookRepository.find({
            relations: ['translations'],
        });
        const realScholars = scholars.filter((scholar) => scholar.id !== 12);
        const realBooks = books.filter((book) => book.id !== 16);
        console.log(`Found ${realScholars.length} scholars and ${realBooks.length} books`);
        for (const scholar of realScholars) {
            try {
                const scholarWithBooks = await this.scholarRepository.findOne({
                    where: { id: scholar.id },
                    relations: ['relatedBooks'],
                });
                if (!scholarWithBooks) {
                    console.log(`⚠️  Scholar not found: ${scholar.fullName}`);
                    continue;
                }
                const currentBookIds = scholarWithBooks.relatedBooks?.map((book) => book.id) || [];
                const availableBooks = realBooks.filter((book) => !currentBookIds.includes(book.id));
                const numberOfBooks = Math.floor(Math.random() * 5) + 3;
                const selectedBooks = this.getRandomBooks(availableBooks, numberOfBooks);
                if (selectedBooks.length === 0) {
                    console.log(`⚠️  No available books for ${scholar.fullName}`);
                    continue;
                }
                scholarWithBooks.relatedBooks = selectedBooks;
                await this.scholarRepository.save(scholarWithBooks);
                const bookTitles = selectedBooks
                    .map((b) => b.translations?.[0]?.title ||
                    b.author ||
                    `Book #${b.id}`)
                    .join(', ');
                console.log(`✅ Added ${selectedBooks.length} books to ${scholar.fullName}: ${bookTitles}`);
            }
            catch (error) {
                console.error(`❌ Error adding books to ${scholar.fullName}:`, error.message);
            }
        }
        console.log('🎉 Scholar related books seeding completed!');
    }
    getRandomBooks(books, count) {
        const shuffled = [...books].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, books.length));
    }
};
exports.ScholarRelatedBooksSeeder = ScholarRelatedBooksSeeder;
exports.ScholarRelatedBooksSeeder = ScholarRelatedBooksSeeder = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(scholar_entity_1.Scholar)),
    __param(1, (0, typeorm_1.InjectRepository)(book_entity_1.Book)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ScholarRelatedBooksSeeder);
//# sourceMappingURL=scholar-related-books-seeder.js.map