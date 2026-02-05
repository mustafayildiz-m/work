import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EventDetails } from '../entities/event-details.entity';
import { CreateEventDetailsDto } from '../dto/event-details/create-event-details.dto';
import { UpdateEventDetailsDto } from '../dto/event-details/update-event-details.dto';
import { UserFollow } from '../entities/user-follow.entity';
import { UserScholarFollow } from '../entities/user-scholar-follow.entity';

@Injectable()
export class EventDetailsService {
  constructor(
    @InjectRepository(EventDetails)
    private eventDetailsRepository: Repository<EventDetails>,
    @InjectRepository(UserFollow)
    private userFollowRepository: Repository<UserFollow>,
    @InjectRepository(UserScholarFollow)
    private userScholarFollowRepository: Repository<UserScholarFollow>,
  ) {}

  create(createEventDetailsDto: CreateEventDetailsDto) {
    const event = this.eventDetailsRepository.create(createEventDetailsDto);
    return this.eventDetailsRepository.save(event);
  }

  findAll() {
    return this.eventDetailsRepository.find();
  }

  findOne(id: number) {
    return this.eventDetailsRepository.findOneBy({ id });
  }

  async update(id: number, updateEventDetailsDto: UpdateEventDetailsDto) {
    const event = await this.eventDetailsRepository.findOneBy({ id });
    if (!event) throw new NotFoundException('Event not found');
    Object.assign(event, updateEventDetailsDto);
    return this.eventDetailsRepository.save(event);
  }

  async remove(id: number) {
    const event = await this.eventDetailsRepository.findOneBy({ id });
    if (!event) throw new NotFoundException('Event not found');
    await this.eventDetailsRepository.remove(event);
    return { deleted: true };
  }

  async getTimeline(userId: number) {
    // Takip edilen kullanıcılar
    const following = await this.userFollowRepository.find({
      where: { follower_id: userId },
      select: ['following_id'],
    });
    const followingIds = following.map((f) => f.following_id);
    // Takip edilen scholarlar
    const scholarFollowing = await this.userScholarFollowRepository.find({
      where: { user_id: userId },
      select: ['scholar_id'],
    });
    const scholarIds = scholarFollowing.map((f) => f.scholar_id);
    // Etkinlikleri çek
    const userEvents =
      followingIds.length > 0
        ? await this.eventDetailsRepository.find({
            where: { user_id: In(followingIds) },
            order: { created_at: 'DESC' },
          })
        : [];
    const scholarEvents =
      scholarIds.length > 0
        ? await this.eventDetailsRepository.find({
            where: { scholar_id: In(scholarIds) },
            order: { created_at: 'DESC' },
          })
        : [];
    // Hepsini birleştir, tarihe göre sırala
    const allEvents = [
      ...userEvents.map((e) => ({ ...e, type: 'user' })),
      ...scholarEvents.map((e) => ({ ...e, type: 'scholar' })),
    ];
    allEvents.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    return allEvents;
  }
}
