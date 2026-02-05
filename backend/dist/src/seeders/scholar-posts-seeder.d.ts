import { Repository } from 'typeorm';
import { Scholar } from '../scholars/entities/scholar.entity';
import { ScholarPost } from '../scholars/entities/scholar-post.entity';
export declare class ScholarPostsSeeder {
    private readonly scholarRepository;
    private readonly scholarPostRepository;
    constructor(scholarRepository: Repository<Scholar>, scholarPostRepository: Repository<ScholarPost>);
    seed(): Promise<void>;
}
