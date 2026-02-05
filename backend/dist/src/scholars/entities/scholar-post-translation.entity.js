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
exports.ScholarPostTranslation = exports.TranslationStatus = void 0;
const typeorm_1 = require("typeorm");
const scholar_post_entity_1 = require("./scholar-post.entity");
var TranslationStatus;
(function (TranslationStatus) {
    TranslationStatus["DRAFT"] = "draft";
    TranslationStatus["PENDING"] = "pending";
    TranslationStatus["APPROVED"] = "approved";
})(TranslationStatus || (exports.TranslationStatus = TranslationStatus = {}));
let ScholarPostTranslation = class ScholarPostTranslation {
};
exports.ScholarPostTranslation = ScholarPostTranslation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ScholarPostTranslation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => scholar_post_entity_1.ScholarPost, (post) => post.translations, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", scholar_post_entity_1.ScholarPost)
], ScholarPostTranslation.prototype, "post", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ScholarPostTranslation.prototype, "postId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 5 }),
    __metadata("design:type", String)
], ScholarPostTranslation.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ScholarPostTranslation.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], ScholarPostTranslation.prototype, "mediaUrls", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], ScholarPostTranslation.prototype, "fileUrls", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TranslationStatus,
        nullable: true,
    }),
    __metadata("design:type", String)
], ScholarPostTranslation.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ScholarPostTranslation.prototype, "translatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ScholarPostTranslation.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ScholarPostTranslation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ScholarPostTranslation.prototype, "updatedAt", void 0);
exports.ScholarPostTranslation = ScholarPostTranslation = __decorate([
    (0, typeorm_1.Entity)('scholar_post_translations')
], ScholarPostTranslation);
//# sourceMappingURL=scholar-post-translation.entity.js.map