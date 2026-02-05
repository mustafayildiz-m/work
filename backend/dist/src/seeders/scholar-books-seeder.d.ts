import { Repository } from 'typeorm';
import { Scholar } from '../scholars/entities/scholar.entity';
import { ScholarBook } from '../scholars/entities/scholar-book.entity';
export declare class ScholarBooksSeeder {
    private readonly scholarRepository;
    private readonly scholarBookRepository;
    constructor(scholarRepository: Repository<Scholar>, scholarBookRepository: Repository<ScholarBook>);
    seed(): Promise<void>;
}
