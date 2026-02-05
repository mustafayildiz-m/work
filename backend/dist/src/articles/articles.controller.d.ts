import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { UploadService } from '../upload/upload.service';
export declare class ArticlesController {
    private readonly articlesService;
    private readonly uploadService;
    constructor(articlesService: ArticlesService, uploadService: UploadService);
    findOnePublic(id: number, lang?: string): Promise<import("./entities/article.entity").Article>;
    create(createArticleDto: CreateArticleDto, files: Express.Multer.File[]): Promise<import("./entities/article.entity").Article>;
    findAllByBook(bookId: number, languageId?: string, search?: string, page?: string, limit?: string): Promise<any>;
    findAll(languageId?: string, search?: string, bookIds?: string, page?: string, limit?: string): Promise<any>;
    findOne(id: number): Promise<import("./entities/article.entity").Article>;
    update(id: number, updateArticleDto: UpdateArticleDto, files: Express.Multer.File[]): Promise<import("./entities/article.entity").Article>;
    remove(id: number): Promise<{
        message: string;
    }>;
    reorder(bookId: number, body: {
        articles: {
            id: number;
            orderIndex: number;
        }[];
    }): Promise<{
        message: string;
    }>;
}
