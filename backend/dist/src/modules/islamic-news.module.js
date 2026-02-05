"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IslamicNewsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const islamic_news_entity_1 = require("../entities/islamic-news.entity");
const islamic_news_service_1 = require("../services/islamic-news.service");
const islamic_news_controller_1 = require("../controllers/islamic-news.controller");
const cache_service_1 = require("../services/cache.service");
let IslamicNewsModule = class IslamicNewsModule {
};
exports.IslamicNewsModule = IslamicNewsModule;
exports.IslamicNewsModule = IslamicNewsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([islamic_news_entity_1.IslamicNews])],
        providers: [islamic_news_service_1.IslamicNewsService, cache_service_1.CacheService],
        controllers: [islamic_news_controller_1.IslamicNewsController],
        exports: [islamic_news_service_1.IslamicNewsService],
    })
], IslamicNewsModule);
//# sourceMappingURL=islamic-news.module.js.map