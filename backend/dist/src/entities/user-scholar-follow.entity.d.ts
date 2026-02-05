import { User } from '../users/entities/user.entity';
import { Scholar } from '../scholars/entities/scholar.entity';
export declare class UserScholarFollow {
    id: number;
    user_id: number;
    scholar_id: number;
    user: User;
    scholar: Scholar;
}
