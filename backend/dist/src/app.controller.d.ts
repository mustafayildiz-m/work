import { Repository } from 'typeorm';
import { Scholar } from './scholars/entities/scholar.entity';
import { Book } from './books/entities/book.entity';
import { ScholarPost } from './scholars/entities/scholar-post.entity';
import { Language } from './languages/entities/language.entity';
import { User } from './users/entities/user.entity';
export declare class AppController {
    private readonly scholarRepository;
    private readonly bookRepository;
    private readonly scholarPostRepository;
    private readonly languageRepository;
    private readonly userRepository;
    constructor(scholarRepository: Repository<Scholar>, bookRepository: Repository<Book>, scholarPostRepository: Repository<ScholarPost>, languageRepository: Repository<Language>, userRepository: Repository<User>);
    getCounts(): Promise<{
        scholars: number;
        books: number;
        posts: number;
        languages: number;
    }>;
    getMonthlyStats(): Promise<{
        name: string;
        kitaplar: number;
        alimler: number;
        kullanicilar: number;
    }[]>;
    getRecentActivities(): Promise<{
        type: string;
        title: string;
        description: string;
        createdAt: Date;
        icon: string;
        color: string;
    }[]>;
    getHello(): string;
    getHealth(): {
        status: string;
        timestamp: string;
    };
}
