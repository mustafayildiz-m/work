import { Repository } from 'typeorm';
import { Scholar } from '../scholars/entities/scholar.entity';
import { Book } from '../books/entities/book.entity';
export declare class ScholarRelatedBooksSeeder {
    private readonly scholarRepository;
    private readonly bookRepository;
    constructor(scholarRepository: Repository<Scholar>, bookRepository: Repository<Book>);
    seed(): Promise<void>;
    private getRandomBooks;
}
