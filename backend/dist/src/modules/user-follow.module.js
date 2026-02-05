"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserFollowModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_follow_entity_1 = require("../entities/user-follow.entity");
const user_entity_1 = require("../users/entities/user.entity");
const user_post_entity_1 = require("../entities/user-post.entity");
const scholar_post_entity_1 = require("../scholars/entities/scholar-post.entity");
const user_scholar_follow_entity_1 = require("../entities/user-scholar-follow.entity");
const user_follow_service_1 = require("../services/user-follow.service");
const user_follow_controller_1 = require("../controllers/user-follow.controller");
const cache_service_1 = require("../services/cache.service");
let UserFollowModule = class UserFollowModule {
};
exports.UserFollowModule = UserFollowModule;
exports.UserFollowModule = UserFollowModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_follow_entity_1.UserFollow,
                user_entity_1.User,
                user_post_entity_1.UserPost,
                scholar_post_entity_1.ScholarPost,
                user_scholar_follow_entity_1.UserScholarFollow,
            ]),
        ],
        providers: [user_follow_service_1.UserFollowService, cache_service_1.CacheService],
        controllers: [user_follow_controller_1.UserFollowController],
        exports: [user_follow_service_1.UserFollowService],
    })
], UserFollowModule);
//# sourceMappingURL=user-follow.module.js.map