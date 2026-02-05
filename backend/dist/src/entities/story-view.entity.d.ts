import { ScholarStory } from './scholar-story.entity';
import { User } from '../users/entities/user.entity';
export declare class StoryView {
    id: number;
    story_id: number;
    user_id: number;
    viewed_at: Date;
    story: ScholarStory;
    user: User;
}
