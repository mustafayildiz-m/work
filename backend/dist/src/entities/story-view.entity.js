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
exports.StoryView = void 0;
const typeorm_1 = require("typeorm");
const scholar_story_entity_1 = require("./scholar-story.entity");
const user_entity_1 = require("../users/entities/user.entity");
let StoryView = class StoryView {
};
exports.StoryView = StoryView;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], StoryView.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], StoryView.prototype, "story_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], StoryView.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], StoryView.prototype, "viewed_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => scholar_story_entity_1.ScholarStory, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'story_id' }),
    __metadata("design:type", scholar_story_entity_1.ScholarStory)
], StoryView.prototype, "story", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], StoryView.prototype, "user", void 0);
exports.StoryView = StoryView = __decorate([
    (0, typeorm_1.Entity)('story_views'),
    (0, typeorm_1.Unique)(['story_id', 'user_id'])
], StoryView);
//# sourceMappingURL=story-view.entity.js.map