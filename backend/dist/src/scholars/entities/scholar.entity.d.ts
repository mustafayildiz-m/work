import { Source } from '../../sources/entities/source.entity';
import { Book } from '../../books/entities/book.entity';
import { ScholarBook } from './scholar-book.entity';
import { ScholarPost } from './scholar-post.entity';
export declare class Scholar {
    id: number;
    fullName: string;
    lineage: string;
    birthDate: string;
    deathDate: string;
    biography: string;
    photoUrl: string;
    coverImage: string;
    latitude: number;
    longitude: number;
    locationName: string;
    locationDescription: string;
    sources: Source[];
    ownBooks: ScholarBook[];
    relatedBooks: Book[];
    posts: ScholarPost[];
    createdAt: Date;
    updatedAt: Date;
}
