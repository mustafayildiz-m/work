"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PodcastModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const podcast_controller_1 = require("../controllers/podcast.controller");
const podcast_service_1 = require("../services/podcast.service");
const podcast_entity_1 = require("../entities/podcast.entity");
const upload_module_1 = require("../upload/upload.module");
let PodcastModule = class PodcastModule {
};
exports.PodcastModule = PodcastModule;
exports.PodcastModule = PodcastModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([podcast_entity_1.Podcast]), upload_module_1.UploadModule],
        controllers: [podcast_controller_1.PodcastController],
        providers: [podcast_service_1.PodcastService],
        exports: [podcast_service_1.PodcastService],
    })
], PodcastModule);
//# sourceMappingURL=podcast.module.js.map