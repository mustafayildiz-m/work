"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const scholar_entity_1 = require("../scholars/entities/scholar.entity");
const user_follow_entity_1 = require("../entities/user-follow.entity");
const user_scholar_follow_entity_1 = require("../entities/user-scholar-follow.entity");
const search_service_1 = require("../services/search.service");
const search_controller_1 = require("../controllers/search.controller");
let SearchModule = class SearchModule {
};
exports.SearchModule = SearchModule;
exports.SearchModule = SearchModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, scholar_entity_1.Scholar, user_follow_entity_1.UserFollow, user_scholar_follow_entity_1.UserScholarFollow]),
        ],
        providers: [search_service_1.SearchService],
        controllers: [search_controller_1.SearchController],
        exports: [search_service_1.SearchService],
    })
], SearchModule);
//# sourceMappingURL=search.module.js.map