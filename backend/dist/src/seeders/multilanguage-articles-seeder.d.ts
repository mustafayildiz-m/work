import { Repository } from 'typeorm';
import { Article } from '../articles/entities/article.entity';
import { ArticleTranslation } from '../articles/entities/article-translation.entity';
import { Book } from '../books/entities/book.entity';
import { Language } from '../languages/entities/language.entity';
export declare class MultiLanguageArticlesSeeder {
    private readonly articleRepository;
    private readonly articleTranslationRepository;
    private readonly bookRepository;
    private readonly languageRepository;
    constructor(articleRepository: Repository<Article>, articleTranslationRepository: Repository<ArticleTranslation>, bookRepository: Repository<Book>, languageRepository: Repository<Language>);
    seed(): Promise<void>;
    private getExistingSlugs;
    private getArticleData;
    private generateAdditionalArticles;
    private generateTurkishContent;
    private generateEnglishContent;
    private generateArabicContent;
    private generateTurkishSummary;
    private generateEnglishSummary;
    private generateArabicSummary;
}
