import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
  Request,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ScholarsService } from './scholars.service';
import { CreateScholarDto } from './dto/create-scholar.dto';
import { UpdateScholarDto } from './dto/update-scholar.dto';
import { AuthGuard } from '@nestjs/passport';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../upload/upload.service';
import { UserScholarFollowService } from '../services/user-scholar-follow.service';

@Controller('scholars')
export class ScholarsController {
  constructor(
    private readonly scholarsService: ScholarsService,
    private readonly uploadService: UploadService,
    private readonly userScholarFollowService: UserScholarFollowService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(AnyFilesInterceptor())
  async create(
    @Body() createScholarDto: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: any,
  ) {
    // Portre dosyasını işle (fieldname: 'photo')
    const photoFile = files.find((f) => f.fieldname === 'photo');
    if (photoFile) {
      createScholarDto.photoUrl =
        await this.uploadService.uploadFile(photoFile);
    } else {
      // Eğer scholar için photo yoksa, varsayılan photo'yu kullan
      createScholarDto.photoUrl = 'uploads/coverImage/coverImage.jpg';
    }

    // Kapak resmi dosyasını işle (fieldname: 'coverImage')
    const coverImageFile = files.find((f) => f.fieldname === 'coverImage');
    if (coverImageFile) {
      createScholarDto.coverImage =
        await this.uploadService.uploadFile(coverImageFile);
    } else {
      // Eğer scholar için cover image yoksa, varsayılan cover image'ı kullan
      createScholarDto.coverImage = 'uploads/coverImage/coverImage.jpg';
    }

    // Kendi kitaplarının kapaklarını ve PDF'lerini işle
    if (createScholarDto.ownBooks && Array.isArray(createScholarDto.ownBooks)) {
      createScholarDto.ownBooks = await Promise.all(
        createScholarDto.ownBooks.map(async (book: any, idx: number) => {
          const coverFile = files.find(
            (f) => f.fieldname === `ownBooks[${idx}][cover]`,
          );
          const pdfFile = files.find(
            (f) => f.fieldname === `ownBooks[${idx}][pdf]`,
          );

          const processedBook = { ...book };

          if (coverFile) {
            processedBook.coverUrl =
              await this.uploadService.uploadFile(coverFile);
          } else {
            // Eğer cover dosyası yoksa, varsayılan cover image'ı kullan
            processedBook.coverUrl =
              book.coverUrl || '/uploads/coverImage/coverImage.jpg';
          }

          if (pdfFile) {
            processedBook.pdfUrl = await this.uploadService.uploadFile(pdfFile);
          }

          return processedBook;
        }),
      );
    }

    const userId = req.user?.id;
    return this.scholarsService.create(createScholarDto, userId);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id;
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    const [scholars, totalCount] = await Promise.all([
      this.scholarsService.findAll(userId, pageNumber, limitNumber, search),
      this.scholarsService.getTotalCount(search),
    ]);

    return {
      scholars,
      totalCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
      hasMore: pageNumber * limitNumber < totalCount,
    };
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('userId') queryUserId: string,
    @Request() req: any,
  ) {
    // Use query parameter if provided, otherwise use JWT user ID
    const userId = queryUserId ? +queryUserId : req.user?.id;
    return this.scholarsService.findOne(+id, userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(AnyFilesInterceptor())
  async update(
    @Param('id') id: string,
    @Body() updateScholarDto: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: any,
  ) {
    // Portre güncellemesi
    const photoFile = files.find((f) => f.fieldname === 'photo');
    if (photoFile) {
      updateScholarDto.photoUrl =
        await this.uploadService.uploadFile(photoFile);
    } else if (!updateScholarDto.photoUrl) {
      // Eğer scholar için photo yoksa ve güncelleme de yoksa, varsayılan photo'yu kullan
      updateScholarDto.photoUrl = 'uploads/coverImage/coverImage.jpg';
    }

    // Kapak resmi güncellemesi
    const coverImageFile = files.find((f) => f.fieldname === 'coverImage');
    if (coverImageFile) {
      updateScholarDto.coverImage =
        await this.uploadService.uploadFile(coverImageFile);
    } else if (!updateScholarDto.coverImage) {
      // Eğer scholar için cover image yoksa ve güncelleme de yoksa, varsayılan cover image'ı kullan
      updateScholarDto.coverImage = 'uploads/coverImage/coverImage.jpg';
    }

    // ownBooks cover ve PDF güncellemesi
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (updateScholarDto.ownBooks && Array.isArray(updateScholarDto.ownBooks)) {
      updateScholarDto.ownBooks = await Promise.all(
        updateScholarDto.ownBooks.map(async (book: any, idx: number) => {
          const coverFile = files.find(
            (f) => f.fieldname === `ownBooks[${idx}][cover]`,
          );
          const pdfFile = files.find(
            (f) => f.fieldname === `ownBooks[${idx}][pdf]`,
          );

          const processedBook = { ...book };

          if (coverFile) {
            processedBook.coverUrl =
              await this.uploadService.uploadFile(coverFile);
          } else if (!book.coverUrl) {
            // Eğer cover dosyası yoksa ve mevcut coverUrl da yoksa, varsayılan cover image'ı kullan
            processedBook.coverUrl = 'uploads/coverImage/coverImage.jpg';
          }

          if (pdfFile) {
            processedBook.pdfUrl = await this.uploadService.uploadFile(pdfFile);
          }

          return processedBook;
        }),
      );
    }

    const userId = req.user?.id;
    return this.scholarsService.update(+id, updateScholarDto, userId);
  }

  @Patch(':id/cover-image')
  @UseInterceptors(AnyFilesInterceptor())
  async updateCoverImage(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: any,
  ) {
    const coverImageFile = files.find((f) => f.fieldname === 'coverImage');
    if (!coverImageFile) {
      throw new BadRequestException('Cover image file is required');
    }

    const coverImageUrl = await this.uploadService.uploadFile(coverImageFile);
    const userId = req.user?.id;

    return this.scholarsService.updateCoverImage(+id, coverImageUrl, userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.scholarsService.remove(+id);
  }

  // Bir alim'i takip eden kullanıcıları getir
  @Get(':id/followers')
  async getScholarFollowers(
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const scholarId = +id;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    const offsetNumber = offset ? parseInt(offset, 10) : 0;

    const [users, totalCount] = await Promise.all([
      this.userScholarFollowService.getScholarFollowers(
        scholarId,
        limitNumber,
        offsetNumber,
      ),
      this.userScholarFollowService.getScholarFollowersCount(scholarId),
    ]);

    return {
      users,
      totalCount,
      hasMore: offsetNumber + limitNumber < totalCount,
    };
  }

  // Bir alim için takip istatistikleri
  @Get(':id/follow-stats')
  async getScholarFollowStats(@Param('id') id: string) {
    const scholarId = +id;
    const followersCount =
      await this.userScholarFollowService.getScholarFollowersCount(scholarId);
    return { followersCount };
  }
}
