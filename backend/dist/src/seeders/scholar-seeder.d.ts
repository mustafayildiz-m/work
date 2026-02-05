import { Repository } from 'typeorm';
import { Scholar } from '../scholars/entities/scholar.entity';
import { ScholarBook } from '../scholars/entities/scholar-book.entity';
import { Source } from '../sources/entities/source.entity';
export declare class ScholarSeeder {
    private readonly scholarRepository;
    private readonly scholarBookRepository;
    private readonly sourceRepository;
    constructor(scholarRepository: Repository<Scholar>, scholarBookRepository: Repository<ScholarBook>, sourceRepository: Repository<Source>);
    seed(): Promise<void>;
}
