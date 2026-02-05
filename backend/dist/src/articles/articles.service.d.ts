import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { ArticleTranslation } from './entities/article-translation.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { UploadService } from '../upload/upload.service';
export declare class ArticlesService {
    private articleRepository;
    private articleTranslationRepository;
    private uploadService;
    constructor(articleRepository: Repository<Article>, articleTranslationRepository: Repository<ArticleTranslation>, uploadService: UploadService);
    private getExistingSlugs;
    create(createArticleDto: CreateArticleDto): Promise<Article>;
    findAllByBook(bookId: number, languageId?: string, search?: string, page?: number, limit?: number): Promise<any>;
    findAll(languageId?: string, search?: string, bookIds?: string, page?: number, limit?: number): Promise<any>;
    findOne(id: number): Promise<Article>;
    update(id: number, updateArticleDto: UpdateArticleDto): Promise<Article>;
    remove(id: number): Promise<void>;
    reorderArticles(bookId: number, articleOrders: {
        id: number;
        orderIndex: number;
    }[]): Promise<void>;
}
