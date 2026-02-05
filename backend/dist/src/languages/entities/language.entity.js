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
exports.Language = void 0;
const typeorm_1 = require("typeorm");
const book_translation_entity_1 = require("../../books/entities/book-translation.entity");
const article_translation_entity_1 = require("../../articles/entities/article-translation.entity");
let Language = class Language {
};
exports.Language = Language;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Language.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, unique: true }),
    __metadata("design:type", String)
], Language.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, unique: true }),
    __metadata("design:type", String)
], Language.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Language.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => book_translation_entity_1.BookTranslation, bookTranslation => bookTranslation.language),
    __metadata("design:type", Array)
], Language.prototype, "bookTranslations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => article_translation_entity_1.ArticleTranslation, articleTranslation => articleTranslation.language),
    __metadata("design:type", Array)
], Language.prototype, "articleTranslations", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Language.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Language.prototype, "updatedAt", void 0);
exports.Language = Language = __decorate([
    (0, typeorm_1.Entity)('languages')
], Language);
//# sourceMappingURL=language.entity.js.map