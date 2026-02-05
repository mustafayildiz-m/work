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
exports.ScholarPost = void 0;
const typeorm_1 = require("typeorm");
const scholar_entity_1 = require("./scholar.entity");
const scholar_post_translation_entity_1 = require("./scholar-post-translation.entity");
let ScholarPost = class ScholarPost {
};
exports.ScholarPost = ScholarPost;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ScholarPost.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ScholarPost.prototype, "scholarId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => scholar_entity_1.Scholar, scholar => scholar.posts),
    (0, typeorm_1.JoinColumn)({ name: 'scholarId' }),
    __metadata("design:type", scholar_entity_1.Scholar)
], ScholarPost.prototype, "scholar", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => scholar_post_translation_entity_1.ScholarPostTranslation, translation => translation.post, { cascade: true }),
    __metadata("design:type", Array)
], ScholarPost.prototype, "translations", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ScholarPost.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ScholarPost.prototype, "updatedAt", void 0);
exports.ScholarPost = ScholarPost = __decorate([
    (0, typeorm_1.Entity)('scholar_posts')
], ScholarPost);
//# sourceMappingURL=scholar-post.entity.js.map