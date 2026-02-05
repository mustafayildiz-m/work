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
exports.ArticleTranslation = void 0;
const typeorm_1 = require("typeorm");
const article_entity_1 = require("./article.entity");
const language_entity_1 = require("../../languages/entities/language.entity");
let ArticleTranslation = class ArticleTranslation {
};
exports.ArticleTranslation = ArticleTranslation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ArticleTranslation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ArticleTranslation.prototype, "articleId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ArticleTranslation.prototype, "languageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], ArticleTranslation.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], ArticleTranslation.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ArticleTranslation.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ArticleTranslation.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ArticleTranslation.prototype, "pdfUrl", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => article_entity_1.Article, (article) => article.translations, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'articleId' }),
    __metadata("design:type", article_entity_1.Article)
], ArticleTranslation.prototype, "article", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => language_entity_1.Language, (language) => language.id),
    (0, typeorm_1.JoinColumn)({ name: 'languageId' }),
    __metadata("design:type", language_entity_1.Language)
], ArticleTranslation.prototype, "language", void 0);
exports.ArticleTranslation = ArticleTranslation = __decorate([
    (0, typeorm_1.Entity)('article_translations')
], ArticleTranslation);
//# sourceMappingURL=article-translation.entity.js.map