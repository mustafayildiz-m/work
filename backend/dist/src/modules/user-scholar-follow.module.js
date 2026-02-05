"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserScholarFollowModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_scholar_follow_entity_1 = require("../entities/user-scholar-follow.entity");
const scholar_entity_1 = require("../scholars/entities/scholar.entity");
const user_scholar_follow_service_1 = require("../services/user-scholar-follow.service");
const user_scholar_follow_controller_1 = require("../controllers/user-scholar-follow.controller");
const user_entity_1 = require("../users/entities/user.entity");
let UserScholarFollowModule = class UserScholarFollowModule {
};
exports.UserScholarFollowModule = UserScholarFollowModule;
exports.UserScholarFollowModule = UserScholarFollowModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_scholar_follow_entity_1.UserScholarFollow, scholar_entity_1.Scholar, user_entity_1.User])],
        providers: [user_scholar_follow_service_1.UserScholarFollowService],
        controllers: [user_scholar_follow_controller_1.UserScholarFollowController],
        exports: [user_scholar_follow_service_1.UserScholarFollowService],
    })
], UserScholarFollowModule);
//# sourceMappingURL=user-scholar-follow.module.js.map