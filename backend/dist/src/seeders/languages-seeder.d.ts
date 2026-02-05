import { Repository } from 'typeorm';
import { Language } from '../languages/entities/language.entity';
export declare class LanguagesSeeder {
    private readonly languageRepository;
    constructor(languageRepository: Repository<Language>);
    seed(): Promise<void>;
}
