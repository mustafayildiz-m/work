import { PodcastService } from '../services/podcast.service';
import { CreatePodcastDto } from '../dto/podcast/create-podcast.dto';
import { UpdatePodcastDto } from '../dto/podcast/update-podcast.dto';
import { UploadService } from '../upload/upload.service';
export declare class PodcastController {
    private readonly podcastService;
    private readonly uploadService;
    constructor(podcastService: PodcastService, uploadService: UploadService);
    create(createPodcastDto: CreatePodcastDto, files?: {
        audio?: Express.Multer.File[];
        cover?: Express.Multer.File[];
    }): Promise<import("../entities/podcast.entity").Podcast>;
    getFeaturedPodcasts(limit: number): Promise<import("../entities/podcast.entity").Podcast[]>;
    searchPodcasts(query: string, page: number, limit: number, language?: string, category?: string, isActive?: string): Promise<{
        podcasts: import("../entities/podcast.entity").Podcast[];
        total: number;
        totalPages: number;
    }> | {
        podcasts: never[];
        total: number;
        totalPages: number;
    };
    findAll(page: number, limit: number, isActive?: string, category?: string, isFeatured?: string, language?: string): Promise<{
        podcasts: import("../entities/podcast.entity").Podcast[];
        total: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<import("../entities/podcast.entity").Podcast>;
    incrementListenCount(id: number): Promise<void>;
    incrementLikeCount(id: number): Promise<void>;
    update(id: number, updatePodcastDto: UpdatePodcastDto, files?: {
        audio?: Express.Multer.File[];
        cover?: Express.Multer.File[];
    }): Promise<import("../entities/podcast.entity").Podcast>;
    remove(id: number): Promise<void>;
}
