"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDetailsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const event_details_entity_1 = require("../entities/event-details.entity");
const event_details_controller_1 = require("../controllers/event-details.controller");
const event_details_service_1 = require("../services/event-details.service");
const user_follow_entity_1 = require("../entities/user-follow.entity");
const user_scholar_follow_entity_1 = require("../entities/user-scholar-follow.entity");
let EventDetailsModule = class EventDetailsModule {
};
exports.EventDetailsModule = EventDetailsModule;
exports.EventDetailsModule = EventDetailsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([event_details_entity_1.EventDetails, user_follow_entity_1.UserFollow, user_scholar_follow_entity_1.UserScholarFollow])],
        controllers: [event_details_controller_1.EventDetailsController],
        providers: [event_details_service_1.EventDetailsService],
        exports: [event_details_service_1.EventDetailsService],
    })
], EventDetailsModule);
//# sourceMappingURL=event-details.module.js.map