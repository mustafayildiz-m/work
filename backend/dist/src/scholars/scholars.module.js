"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScholarsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const scholars_service_1 = require("./scholars.service");
const scholars_controller_1 = require("./scholars.controller");
const scholar_entity_1 = require("./entities/scholar.entity");
const scholar_book_entity_1 = require("./entities/scholar-book.entity");
const scholar_post_entity_1 = require("./entities/scholar-post.entity");
const scholar_post_translation_entity_1 = require("./entities/scholar-post-translation.entity");
const scholar_posts_service_1 = require("./scholar-posts.service");
const scholar_posts_controller_1 = require("./scholar-posts.controller");
const source_entity_1 = require("../sources/entities/source.entity");
const book_entity_1 = require("../books/entities/book.entity");
const book_translation_entity_1 = require("../books/entities/book-translation.entity");
const language_entity_1 = require("../languages/entities/language.entity");
const upload_module_1 = require("../upload/upload.module");
const user_scholar_follow_module_1 = require("../modules/user-scholar-follow.module");
let ScholarsModule = class ScholarsModule {
};
exports.ScholarsModule = ScholarsModule;
exports.ScholarsModule = ScholarsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([scholar_entity_1.Scholar, scholar_book_entity_1.ScholarBook, scholar_post_entity_1.ScholarPost, scholar_post_translation_entity_1.ScholarPostTranslation, source_entity_1.Source, book_entity_1.Book, book_translation_entity_1.BookTranslation, language_entity_1.Language]),
            upload_module_1.UploadModule,
            user_scholar_follow_module_1.UserScholarFollowModule,
        ],
        controllers: [scholars_controller_1.ScholarsController, scholar_posts_controller_1.ScholarPostsController],
        providers: [scholars_service_1.ScholarsService, scholar_posts_service_1.ScholarPostsService],
        exports: [scholars_service_1.ScholarsService, scholar_posts_service_1.ScholarPostsService],
    })
], ScholarsModule);
//# sourceMappingURL=scholars.module.js.map