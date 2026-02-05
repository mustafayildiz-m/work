import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ScholarsService } from '../scholars/scholars.service';
import { BooksService } from '../books/books.service';

@Controller('public')
export class PublicProfileController {
  constructor(
    private readonly usersService: UsersService,
    private readonly scholarsService: ScholarsService,
    private readonly booksService: BooksService,
  ) {}

  @Get('users/:id')
  async getPublicUser(@Param('id') id: string) {
    try {
      const user = await this.usersService.findOnePublic(parseInt(id));

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Return only public information
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        photoUrl: user.photoUrl,
        biography: user.biography,
        createdAt: user.createdAt,
        joinDate: user.createdAt,
        type: 'user',
      };
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  @Get('scholars/:id')
  async getPublicScholar(@Param('id') id: string) {
    try {
      const scholar = await this.scholarsService.findOnePublic(parseInt(id));

      if (!scholar) {
        throw new NotFoundException('Scholar not found');
      }

      // Return only public information
      return {
        id: scholar.id,
        fullName: scholar.fullName,
        photoUrl: scholar.photoUrl,
        biography: scholar.biography,
        birthDate: scholar.birthDate,
        deathDate: scholar.deathDate,
        locationName: scholar.locationName,
        createdAt: scholar.createdAt,
        type: 'scholar',
      };
    } catch (error) {
      throw new NotFoundException('Scholar not found');
    }
  }

  @Get('books/:id')
  async getPublicBook(@Param('id') id: string, @Query('lang') lang?: string) {
    try {
      const book = await this.booksService.findOnePublic(parseInt(id), lang);

      if (!book) {
        throw new NotFoundException('Book not found');
      }

      // Return only public information
      return {
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        coverUrl: book.coverUrl,
        pdfUrl: book.pdfUrl,
        category: book.category?.name || null,
        categoryName: book.category?.name || null,
        publishDate: book.createdAt,
        createdAt: book.createdAt,
        type: 'book',
      };
    } catch (error) {
      throw new NotFoundException('Book not found');
    }
  }
}
