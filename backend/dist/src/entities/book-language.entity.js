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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookLanguage = void 0;
const typeorm_1 = require("typeorm");
const language_entity_1 = require("./language.entity");
const book_entity_1 = require("./book.entity");
let BookLanguage = class BookLanguage {
};
exports.BookLanguage = BookLanguage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BookLanguage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => language_entity_1.Language, language => language.bookLanguages),
    (0, typeorm_1.JoinColumn)({ name: 'languageId' }),
    __metadata("design:type", language_entity_1.Language)
], BookLanguage.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => book_entity_1.Book),
    (0, typeorm_1.JoinColumn)({ name: 'bookId' }),
    __metadata("design:type", book_entity_1.Book)
], BookLanguage.prototype, "book", void 0);
exports.BookLanguage = BookLanguage = __decorate([
    (0, typeorm_1.Entity)('book_languages')
], BookLanguage);
//# sourceMappingURL=book-language.entity.js.map