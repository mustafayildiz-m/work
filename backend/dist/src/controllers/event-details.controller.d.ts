import { EventDetailsService } from '../services/event-details.service';
import { CreateEventDetailsDto } from '../dto/event-details/create-event-details.dto';
import { UpdateEventDetailsDto } from '../dto/event-details/update-event-details.dto';
export declare class EventDetailsController {
    private readonly eventDetailsService;
    constructor(eventDetailsService: EventDetailsService);
    create(createEventDetailsDto: CreateEventDetailsDto): Promise<import("../entities/event-details.entity").EventDetails>;
    findAll(): Promise<import("../entities/event-details.entity").EventDetails[]>;
    findOne(id: number): Promise<import("../entities/event-details.entity").EventDetails | null>;
    update(id: number, updateEventDetailsDto: UpdateEventDetailsDto): Promise<import("../entities/event-details.entity").EventDetails>;
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
