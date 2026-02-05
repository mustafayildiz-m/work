import { Repository } from 'typeorm';
import { Language } from '../languages/entities/language.entity';
import { BookTranslation } from '../books/entities/book-translation.entity';
import { ArticleTranslation } from '../articles/entities/article-translation.entity';
import { CreateLanguageDto } from '../dto/create-language.dto';
import { UpdateLanguageDto } from '../dto/update-language.dto';
export declare class LanguageService {
    private languageRepository;
    private bookTranslationRepository;
    private articleTranslationRepository;
    constructor(languageRepository: Repository<Language>, bookTranslationRepository: Repository<BookTranslation>, articleTranslationRepository: Repository<ArticleTranslation>);
    create(createLanguageDto: CreateLanguageDto): Promise<Language>;
    findAll(): Promise<Language[]>;
    getBookCounts(): Promise<{
        languageId: number;
        languageName: string;
        languageCode: string;
        bookCount: number;
    }[]>;
    getArticleCounts(): Promise<{
        languageId: number;
        languageName: string;
        languageCode: string;
        articleCount: number;
    }[]>;
    findOne(id: number): Promise<Language>;
    update(id: number, updateLanguageDto: UpdateLanguageDto): Promise<Language>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
