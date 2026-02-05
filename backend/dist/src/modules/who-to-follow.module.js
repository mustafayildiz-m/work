"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhoToFollowModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const who_to_follow_controller_1 = require("../controllers/who-to-follow.controller");
const who_to_follow_service_1 = require("../services/who-to-follow.service");
const user_entity_1 = require("../users/entities/user.entity");
const scholar_entity_1 = require("../scholars/entities/scholar.entity");
const user_follow_module_1 = require("./user-follow.module");
const user_scholar_follow_module_1 = require("./user-scholar-follow.module");
const cache_service_1 = require("../services/cache.service");
let WhoToFollowModule = class WhoToFollowModule {
};
exports.WhoToFollowModule = WhoToFollowModule;
exports.WhoToFollowModule = WhoToFollowModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, scholar_entity_1.Scholar]),
            user_follow_module_1.UserFollowModule,
            user_scholar_follow_module_1.UserScholarFollowModule,
        ],
        controllers: [who_to_follow_controller_1.WhoToFollowController],
        providers: [who_to_follow_service_1.WhoToFollowService, cache_service_1.CacheService],
        exports: [who_to_follow_service_1.WhoToFollowService],
    })
], WhoToFollowModule);
//# sourceMappingURL=who-to-follow.module.js.map