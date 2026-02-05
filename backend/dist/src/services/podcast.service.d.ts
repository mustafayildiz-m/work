import { Repository } from 'typeorm';
import { Podcast } from '../entities/podcast.entity';
import { CreatePodcastDto } from '../dto/podcast/create-podcast.dto';
import { UpdatePodcastDto } from '../dto/podcast/update-podcast.dto';
export declare class PodcastService {
    private readonly podcastRepository;
    private readonly logger;
    constructor(podcastRepository: Repository<Podcast>);
    create(createPodcastDto: CreatePodcastDto, audioFile?: string, coverFile?: string): Promise<Podcast>;
    findAll(page?: number, limit?: number, isActive?: boolean, category?: string, isFeatured?: boolean, language?: string): Promise<{
        podcasts: Podcast[];
        total: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<Podcast>;
    update(id: number, updatePodcastDto: UpdatePodcastDto, audioFile?: string, coverFile?: string): Promise<Podcast>;
    remove(id: number): Promise<void>;
    incrementListenCount(id: number): Promise<void>;
    incrementLikeCount(id: number): Promise<void>;
    search(query: string, page?: number, limit?: number, language?: string, category?: string, isActive?: boolean): Promise<{
        podcasts: Podcast[];
        total: number;
        totalPages: number;
    }>;
    getFeaturedPodcasts(limit?: number): Promise<Podcast[]>;
}
