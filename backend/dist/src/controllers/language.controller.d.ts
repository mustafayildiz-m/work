import { LanguageService } from '../services/language.service';
import { CreateLanguageDto } from '../dto/create-language.dto';
import { UpdateLanguageDto } from '../dto/update-language.dto';
export declare class LanguageController {
    private readonly languageService;
    constructor(languageService: LanguageService);
    create(createLanguageDto: CreateLanguageDto): Promise<import("../languages/entities/language.entity").Language>;
    findAll(): Promise<import("../languages/entities/language.entity").Language[]>;
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
    findOne(id: number): Promise<import("../languages/entities/language.entity").Language>;
    update(id: number, updateLanguageDto: UpdateLanguageDto): Promise<import("../languages/entities/language.entity").Language>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
