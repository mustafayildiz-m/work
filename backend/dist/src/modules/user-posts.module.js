"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPostsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_post_entity_1 = require("../entities/user-post.entity");
const user_posts_controller_1 = require("../controllers/user-posts.controller");
const user_posts_service_1 = require("../services/user-posts.service");
const user_follow_entity_1 = require("../entities/user-follow.entity");
const user_scholar_follow_entity_1 = require("../entities/user-scholar-follow.entity");
const scholar_post_entity_1 = require("../scholars/entities/scholar-post.entity");
const user_entity_1 = require("../users/entities/user.entity");
const scholar_entity_1 = require("../scholars/entities/scholar.entity");
const user_post_comment_entity_1 = require("../entities/user-post-comment.entity");
const user_post_share_entity_1 = require("../entities/user-post-share.entity");
const user_post_share_controller_1 = require("../controllers/user-post-share.controller");
const user_post_share_service_1 = require("../services/user-post-share.service");
const cache_service_1 = require("../services/cache.service");
let UserPostsModule = class UserPostsModule {
};
exports.UserPostsModule = UserPostsModule;
exports.UserPostsModule = UserPostsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_post_entity_1.UserPost,
                user_follow_entity_1.UserFollow,
                user_scholar_follow_entity_1.UserScholarFollow,
                scholar_post_entity_1.ScholarPost,
                user_entity_1.User,
                scholar_entity_1.Scholar,
                user_post_comment_entity_1.UserPostComment,
                user_post_share_entity_1.UserPostShare,
            ]),
        ],
        controllers: [user_posts_controller_1.UserPostsController, user_post_share_controller_1.UserPostShareController],
        providers: [user_posts_service_1.UserPostsService, user_post_share_service_1.UserPostShareService, cache_service_1.CacheService],
        exports: [user_posts_service_1.UserPostsService, user_post_share_service_1.UserPostShareService],
    })
], UserPostsModule);
//# sourceMappingURL=user-posts.module.js.map