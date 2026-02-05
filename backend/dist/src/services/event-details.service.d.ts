import { Repository } from 'typeorm';
import { EventDetails } from '../entities/event-details.entity';
import { CreateEventDetailsDto } from '../dto/event-details/create-event-details.dto';
import { UpdateEventDetailsDto } from '../dto/event-details/update-event-details.dto';
import { UserFollow } from '../entities/user-follow.entity';
import { UserScholarFollow } from '../entities/user-scholar-follow.entity';
export declare class EventDetailsService {
    private eventDetailsRepository;
    private userFollowRepository;
    private userScholarFollowRepository;
    constructor(eventDetailsRepository: Repository<EventDetails>, userFollowRepository: Repository<UserFollow>, userScholarFollowRepository: Repository<UserScholarFollow>);
    create(createEventDetailsDto: CreateEventDetailsDto): Promise<EventDetails>;
    findAll(): Promise<EventDetails[]>;
    findOne(id: number): Promise<EventDetails | null>;
    update(id: number, updateEventDetailsDto: UpdateEventDetailsDto): Promise<EventDetails>;
    remove(id: number): Promise<{
        deleted: boolean;
    }>;
    getTimeline(userId: number): Promise<{
        type: string;
        id: number;
        user_id: number;
        scholar_id: number;
        title: string;
        description: string;
        date: string;
        time: string;
        duration: number;
        location: string;
        guests: string;
        attachment: string;
        created_at: Date;
        updated_at: Date;
    }[]>;
}
