import { ScholarStory } from './scholar-story.entity';
import { User } from '../users/entities/user.entity';
export declare class StoryLike {
    id: number;
    story_id: number;
    user_id: number;
    liked_at: Date;
    story: ScholarStory;
    user: User;
}
