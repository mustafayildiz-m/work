import { Repository } from 'typeorm';
import { Scholar } from './entities/scholar.entity';
import { CreateScholarDto } from './dto/create-scholar.dto';
import { UpdateScholarDto } from './dto/update-scholar.dto';
import { ScholarBook } from './entities/scholar-book.entity';
import { Source } from '../sources/entities/source.entity';
import { Book } from '../books/entities/book.entity';
import { BookTranslation } from '../books/entities/book-translation.entity';
import { Language } from '../languages/entities/language.entity';
import { UserScholarFollowService } from '../services/user-scholar-follow.service';
export declare class ScholarsService {
    private readonly scholarRepository;
    private readonly scholarBookRepository;
    private readonly sourceRepository;
    private readonly bookRepository;
    private readonly bookTranslationRepository;
    private readonly languageRepository;
    private readonly userScholarFollowService;
    constructor(scholarRepository: Repository<Scholar>, scholarBookRepository: Repository<ScholarBook>, sourceRepository: Repository<Source>, bookRepository: Repository<Book>, bookTranslationRepository: Repository<BookTranslation>, languageRepository: Repository<Language>, userScholarFollowService: UserScholarFollowService);
    create(createScholarDto: CreateScholarDto, userId?: number): Promise<Scholar>;
    findAll(userId?: number, page?: number, limit?: number, search?: string): Promise<Scholar[]>;
    getTotalCount(search?: string): Promise<number>;
    findOne(id: number, userId?: number): Promise<Scholar>;
    update(id: number, updateScholarDto: UpdateScholarDto, userId?: number): Promise<Scholar>;
    updateCoverImage(id: number, coverImageUrl: string, userId?: number): Promise<Scholar>;
    remove(id: number): Promise<Scholar>;
    findOnePublic(id: number): Promise<Scholar | null>;
}
