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
exports.EventDetailsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_details_entity_1 = require("../entities/event-details.entity");
const user_follow_entity_1 = require("../entities/user-follow.entity");
const user_scholar_follow_entity_1 = require("../entities/user-scholar-follow.entity");
let EventDetailsService = class EventDetailsService {
    constructor(eventDetailsRepository, userFollowRepository, userScholarFollowRepository) {
        this.eventDetailsRepository = eventDetailsRepository;
        this.userFollowRepository = userFollowRepository;
        this.userScholarFollowRepository = userScholarFollowRepository;
    }
    create(createEventDetailsDto) {
        const event = this.eventDetailsRepository.create(createEventDetailsDto);
        return this.eventDetailsRepository.save(event);
    }
    findAll() {
        return this.eventDetailsRepository.find();
    }
    findOne(id) {
        return this.eventDetailsRepository.findOneBy({ id });
    }
    async update(id, updateEventDetailsDto) {
        const event = await this.eventDetailsRepository.findOneBy({ id });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        Object.assign(event, updateEventDetailsDto);
        return this.eventDetailsRepository.save(event);
    }
    async remove(id) {
        const event = await this.eventDetailsRepository.findOneBy({ id });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        await this.eventDetailsRepository.remove(event);
        return { deleted: true };
    }
    async getTimeline(userId) {
        const following = await this.userFollowRepository.find({
            where: { follower_id: userId },
            select: ['following_id'],
        });
        const followingIds = following.map(f => f.following_id);
        const scholarFollowing = await this.userScholarFollowRepository.find({
            where: { user_id: userId },
            select: ['scholar_id'],
        });
        const scholarIds = scholarFollowing.map(f => f.scholar_id);
        const userEvents = followingIds.length > 0 ? await this.eventDetailsRepository.find({
            where: { user_id: (0, typeorm_2.In)(followingIds) },
            order: { created_at: 'DESC' },
        }) : [];
        const scholarEvents = scholarIds.length > 0 ? await this.eventDetailsRepository.find({
            where: { scholar_id: (0, typeorm_2.In)(scholarIds) },
            order: { created_at: 'DESC' },
        }) : [];
        const allEvents = [
            ...userEvents.map(e => ({ ...e, type: 'user' })),
            ...scholarEvents.map(e => ({ ...e, type: 'scholar' })),
        ];
        allEvents.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
        return allEvents;
    }
};
exports.EventDetailsService = EventDetailsService;
exports.EventDetailsService = EventDetailsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_details_entity_1.EventDetails)),
    __param(1, (0, typeorm_1.InjectRepository)(user_follow_entity_1.UserFollow)),
    __param(2, (0, typeorm_1.InjectRepository)(user_scholar_follow_entity_1.UserScholarFollow)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], EventDetailsService);
//# sourceMappingURL=event-details.service.js.map