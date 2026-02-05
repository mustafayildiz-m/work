import { Scholar } from './scholar.entity';
import { ScholarPostTranslation } from './scholar-post-translation.entity';
export declare class ScholarPost {
    id: string;
    scholarId: number;
    scholar: Scholar;
    translations: ScholarPostTranslation[];
    createdAt: Date;
    updatedAt: Date;
}
