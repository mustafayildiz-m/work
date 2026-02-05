"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDetailsController = void 0;
const common_1 = require("@nestjs/common");
const event_details_service_1 = require("../services/event-details.service");
const create_event_details_dto_1 = require("../dto/event-details/create-event-details.dto");
const update_event_details_dto_1 = require("../dto/event-details/update-event-details.dto");
let EventDetailsController = class EventDetailsController {
    constructor(eventDetailsService) {
        this.eventDetailsService = eventDetailsService;
    }
    create(createEventDetailsDto) {
        return this.eventDetailsService.create(createEventDetailsDto);
    }
    findAll() {
        return this.eventDetailsService.findAll();
    }
    findOne(id) {
        return this.eventDetailsService.findOne(id);
    }
    update(id, updateEventDetailsDto) {
        return this.eventDetailsService.update(id, updateEventDetailsDto);
    }
    remove(id) {
        return this.eventDetailsService.remove(id);
    }
    getTimeline(userId) {
        return this.eventDetailsService.getTimeline(userId);
    }
};
exports.EventDetailsController = EventDetailsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_details_dto_1.CreateEventDetailsDto]),
    __metadata("design:returntype", void 0)
], EventDetailsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EventDetailsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EventDetailsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_event_details_dto_1.UpdateEventDetailsDto]),
    __metadata("design:returntype", void 0)
], EventDetailsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EventDetailsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('timeline/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EventDetailsController.prototype, "getTimeline", null);
exports.EventDetailsController = EventDetailsController = __decorate([
    (0, common_1.Controller)('event-details'),
    __metadata("design:paramtypes", [event_details_service_1.EventDetailsService])
], EventDetailsController);
//# sourceMappingURL=event-details.controller.js.map