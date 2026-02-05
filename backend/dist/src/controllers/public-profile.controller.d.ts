import { UsersService } from '../users/users.service';
import { ScholarsService } from '../scholars/scholars.service';
import { BooksService } from '../books/books.service';
export declare class PublicProfileController {
    private readonly usersService;
    private readonly scholarsService;
    private readonly booksService;
    constructor(usersService: UsersService, scholarsService: ScholarsService, booksService: BooksService);
    getPublicUser(id: string): Promise<{
        id: number;
        firstName: string;
        lastName: string;
        username: string;
        photoUrl: string;
        biography: string;
        createdAt: Date;
        joinDate: Date;
        type: string;
    }>;
    getPublicScholar(id: string): Promise<{
        id: number;
        fullName: string;
        photoUrl: string;
        biography: string;
        birthDate: string;
        deathDate: string;
        locationName: string;
        createdAt: Date;
        type: string;
    }>;
    getPublicBook(id: string, lang?: string): Promise<{
        id: any;
        title: any;
        author: any;
        description: any;
        coverUrl: any;
        pdfUrl: any;
        category: any;
        categoryName: any;
        publishDate: any;
        createdAt: any;
        type: string;
    }>;
}
