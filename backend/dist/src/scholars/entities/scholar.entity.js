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
exports.Scholar = void 0;
const typeorm_1 = require("typeorm");
const source_entity_1 = require("../../sources/entities/source.entity");
const book_entity_1 = require("../../books/entities/book.entity");
const scholar_book_entity_1 = require("./scholar-book.entity");
const scholar_post_entity_1 = require("./scholar-post.entity");
let Scholar = class Scholar {
};
exports.Scholar = Scholar;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Scholar.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Scholar.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Scholar.prototype, "lineage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Scholar.prototype, "birthDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Scholar.prototype, "deathDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Scholar.prototype, "biography", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Scholar.prototype, "photoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Scholar.prototype, "coverImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 8, nullable: true }),
    __metadata("design:type", Number)
], Scholar.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 11, scale: 8, nullable: true }),
    __metadata("design:type", Number)
], Scholar.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Scholar.prototype, "locationName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Scholar.prototype, "locationDescription", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => source_entity_1.Source, (source) => source.scholar),
    __metadata("design:type", Array)
], Scholar.prototype, "sources", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => scholar_book_entity_1.ScholarBook, (book) => book.scholar),
    __metadata("design:type", Array)
], Scholar.prototype, "ownBooks", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => book_entity_1.Book),
    (0, typeorm_1.JoinTable)({
        name: 'scholar_related_books',
        joinColumn: { name: 'scholar_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'book_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Scholar.prototype, "relatedBooks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => scholar_post_entity_1.ScholarPost, (post) => post.scholar),
    __metadata("design:type", Array)
], Scholar.prototype, "posts", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Scholar.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Scholar.prototype, "updatedAt", void 0);
exports.Scholar = Scholar = __decorate([
    (0, typeorm_1.Entity)('scholars')
], Scholar);
//# sourceMappingURL=scholar.entity.js.map