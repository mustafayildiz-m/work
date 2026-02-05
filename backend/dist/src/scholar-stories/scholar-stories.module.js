"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScholarStoriesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const scholar_story_entity_1 = require("../entities/scholar-story.entity");
const story_view_entity_1 = require("../entities/story-view.entity");
const story_like_entity_1 = require("../entities/story-like.entity");
const scholar_entity_1 = require("../scholars/entities/scholar.entity");
const scholar_story_service_1 = require("../services/scholar-story.service");
const scholar_story_controller_1 = require("../controllers/scholar-story.controller");
const upload_module_1 = require("../upload/upload.module");
let ScholarStoriesModule = class ScholarStoriesModule {
};
exports.ScholarStoriesModule = ScholarStoriesModule;
exports.ScholarStoriesModule = ScholarStoriesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([scholar_story_entity_1.ScholarStory, story_view_entity_1.StoryView, story_like_entity_1.StoryLike, scholar_entity_1.Scholar]),
            upload_module_1.UploadModule,
        ],
        controllers: [scholar_story_controller_1.ScholarStoryController],
        providers: [scholar_story_service_1.ScholarStoryService],
        exports: [scholar_story_service_1.ScholarStoryService],
    })
], ScholarStoriesModule);
//# sourceMappingURL=scholar-stories.module.js.map