import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { In } from 'typeorm';
import { Scholar } from './entities/scholar.entity';
import { CreateScholarDto } from './dto/create-scholar.dto';
import { UpdateScholarDto } from './dto/update-scholar.dto';
import { ScholarBook } from './entities/scholar-book.entity';
import { Source } from '../sources/entities/source.entity';
import { Book } from '../books/entities/book.entity';
import { BookTranslation } from '../books/entities/book-translation.entity';
import { Language } from '../languages/entities/language.entity';
import { UserScholarFollowService } from '../services/user-scholar-follow.service';

@Injectable()
export class ScholarsService {
  constructor(
    @InjectRepository(Scholar)
    private readonly scholarRepository: Repository<Scholar>,
    @InjectRepository(ScholarBook)
    private readonly scholarBookRepository: Repository<ScholarBook>,
    @InjectRepository(Source)
    private readonly sourceRepository: Repository<Source>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(BookTranslation)
    private readonly bookTranslationRepository: Repository<BookTranslation>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
    private readonly userScholarFollowService: UserScholarFollowService,
  ) {}

  async create(createScholarDto: CreateScholarDto, userId?: number) {
    if (
      typeof createScholarDto.birthDate === 'string' &&
      (createScholarDto.birthDate === '' ||
        createScholarDto.birthDate === 'null')
    )
      createScholarDto.birthDate = undefined;
    if (
      typeof createScholarDto.deathDate === 'string' &&
      (createScholarDto.deathDate === '' ||
        createScholarDto.deathDate === 'null')
    )
      createScholarDto.deathDate = undefined;
    const { ownBooks, sources, relatedBooks, ...scholarData } =
      createScholarDto;
    const scholar = this.scholarRepository.create(scholarData);
    const savedScholar = await this.scholarRepository.save(scholar);

    // Kendi kitapları
    if (ownBooks && ownBooks.length > 0) {
      const books = ownBooks.map((book) =>
        this.scholarBookRepository.create({ ...book, scholar: savedScholar }),
      );
      await this.scholarBookRepository.save(books);
    }

    // Kaynaklar
    if (sources && sources.length > 0) {
      const sourceEntities = sources.map((source) =>
        this.sourceRepository.create({ ...source, scholar: savedScholar }),
      );
      await this.sourceRepository.save(sourceEntities);
    }

    // Bağlantılı kitaplar
    if (relatedBooks && relatedBooks.length > 0) {
      const books = await this.bookRepository.findByIds(relatedBooks);
      savedScholar.relatedBooks = books;
      await this.scholarRepository.save(savedScholar);
    }

    return this.findOne(savedScholar.id, userId);
  }

  async findAll(
    userId?: number,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    // Query builder kullanarak arama ekleyelim
    const queryBuilder = this.scholarRepository
      .createQueryBuilder('scholar')
      .leftJoinAndSelect('scholar.ownBooks', 'ownBooks')
      .leftJoinAndSelect('scholar.relatedBooks', 'relatedBooks')
      .leftJoinAndSelect(
        'relatedBooks.translations',
        'relatedBooksTranslations',
      )
      .leftJoinAndSelect('scholar.sources', 'sources')
      .orderBy('scholar.id', 'DESC')
      .skip(skip)
      .take(limit);

    // Arama varsa filtrele (sadece fullName'de ara, ismin başından eşleştir)
    if (search && search.trim()) {
      const searchTerm = `${search.trim().toUpperCase()}%`;
      queryBuilder.where('UPPER(scholar.fullName) LIKE :search', {
        search: searchTerm,
      });
    }

    const scholars = await queryBuilder.getMany();

    // Her scholar için relatedBooks translations bilgilerini ekle
    for (const scholar of scholars) {
      if (scholar.relatedBooks && scholar.relatedBooks.length > 0) {
        for (const book of scholar.relatedBooks) {
          const bookTranslations = await this.bookTranslationRepository.find({
            where: { book: { id: book.id } },
            relations: ['language'],
          });

          // Translations array'ini oluştur
          (book as any).translations = bookTranslations.map((bt) => ({
            id: bt.id,
            bookId: book.id,
            languageId: bt.language.id,
            languageName: bt.language.name,
            languageCode: bt.language.code,
            title: bt.title,
            description: bt.description,
            summary: bt.summary,
            pdfUrl: bt.pdfUrl || null,
          }));
        }
      }
    }

    // Her scholar için follow status bilgisini ekle
    if (userId) {
      for (const scholar of scholars) {
        try {
          const followRecord = await this.userScholarFollowService.findFollow(
            userId,
            scholar.id,
          );
          (scholar as any).isFollowing = !!followRecord;
        } catch (error) {
          (scholar as any).isFollowing = false;
        }
      }
    } else {
      for (const scholar of scholars) {
        (scholar as any).isFollowing = false;
      }
    }

    return scholars;
  }

  async getTotalCount(search?: string): Promise<number> {
    // Arama varsa filtrelenerek sayalım (sadece fullName'de, ismin başından eşleştir)
    if (search && search.trim()) {
      const searchTerm = `${search.trim().toUpperCase()}%`;
      return this.scholarRepository
        .createQueryBuilder('scholar')
        .where('UPPER(scholar.fullName) LIKE :search', { search: searchTerm })
        .getCount();
    }

    return this.scholarRepository.count();
  }

  async findOne(id: number, userId?: number) {
    const scholar = await this.scholarRepository.findOne({
      where: { id },
      relations: ['ownBooks', 'relatedBooks', 'sources'],
    });

    if (!scholar) {
      throw new NotFoundException(`Scholar with id ${id} not found`);
    }

    // RelatedBooks için translations bilgilerini getir
    if (scholar.relatedBooks && scholar.relatedBooks.length > 0) {
      for (const book of scholar.relatedBooks) {
        const bookTranslations = await this.bookTranslationRepository.find({
          where: { book: { id: book.id } },
          relations: ['language'],
        });

        // Translations array'ini oluştur
        (book as any).translations = bookTranslations.map((bt) => ({
          id: bt.id,
          bookId: book.id,
          languageId: bt.language.id,
          languageName: bt.language.name,
          languageCode: bt.language.code,
          title: bt.title,
          description: bt.description,
          summary: bt.summary,
          pdfUrl: bt.pdfUrl || null,
        }));
      }
    }

    // Follow status bilgisini ekle
    if (userId) {
      try {
        const followRecord = await this.userScholarFollowService.findFollow(
          userId,
          id,
        );
        (scholar as any).isFollowing = !!followRecord;
      } catch (error) {
        (scholar as any).isFollowing = false;
      }
    } else {
      (scholar as any).isFollowing = false;
    }

    return scholar;
  }

  async update(
    id: number,
    updateScholarDto: UpdateScholarDto,
    userId?: number,
  ) {
    const nullify = (val: any) =>
      val === '' || val === 'null' ? undefined : val;
    updateScholarDto.birthDate = nullify(updateScholarDto.birthDate);
    updateScholarDto.deathDate = nullify(updateScholarDto.deathDate);

    const { relatedBooks, ownBooks, sources, ...scholarData } =
      updateScholarDto;

    // Scholar'ı bul
    const scholar = await this.scholarRepository.findOne({
      where: { id },
      relations: ['relatedBooks'],
    });
    if (!scholar) {
      throw new NotFoundException(`Scholar with id ${id} not found`);
    }

    // Eski cover image dosyasını sil (eğer yeni bir tane yüklendiyse)
    if (
      scholarData.coverImage &&
      scholar.coverImage &&
      scholar.coverImage !== scholarData.coverImage
    ) {
      try {
        const fs = require('fs');
        const path = require('path');
        const oldPath = path.join(process.cwd(), scholar.coverImage);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (error) {
        // Dosya silme hatası durumunda işleme devam et
        console.warn('Eski cover image dosyası silinemedi:', error);
      }
    }

    // Ana verileri güncelle
    Object.assign(scholar, scholarData);
    await this.scholarRepository.save(scholar);

    // relatedBooks güncelle
    if (relatedBooks) {
      const books = await this.bookRepository.findBy({ id: In(relatedBooks) });
      scholar.relatedBooks = books;
      await this.scholarRepository.save(scholar);
    }

    // ownBooks güncelle
    if (ownBooks) {
      // Önce eski kitapları sil (kendi yazdığı kitaplar)
      await this.scholarBookRepository.delete({ scholar: { id } });
      // Yeni kitapları ekle
      const newBooks = ownBooks.map((book) =>
        this.scholarBookRepository.create({ ...book, scholar }),
      );
      await this.scholarBookRepository.save(newBooks);
    }

    // sources güncelle
    if (sources) {
      // Önce eski kaynakları sil
      await this.sourceRepository.delete({ scholar: { id } });
      // Yeni kaynakları ekle
      const newSources = sources.map((source) =>
        this.sourceRepository.create({ ...source, scholar }),
      );
      await this.sourceRepository.save(newSources);
    }

    return this.findOne(id, userId);
  }

  async updateCoverImage(id: number, coverImageUrl: string, userId?: number) {
    // Scholar'ı bul
    const scholar = await this.scholarRepository.findOne({ where: { id } });
    if (!scholar) {
      throw new NotFoundException(`Scholar with id ${id} not found`);
    }

    // Eski cover image dosyasını sil
    if (scholar.coverImage) {
      try {
        const fs = require('fs');
        const path = require('path');
        const oldPath = path.join(process.cwd(), scholar.coverImage);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (error) {
        console.warn('Eski cover image dosyası silinemedi:', error);
      }
    }

    // Yeni cover image'ı güncelle
    scholar.coverImage = coverImageUrl;
    await this.scholarRepository.save(scholar);

    return this.findOne(id, userId);
  }

  async remove(id: number) {
    const scholar = await this.findOne(id); // Silmeden önce kaydı getir

    // Cover image dosyasını sil
    if (scholar.coverImage) {
      try {
        const fs = require('fs');
        const path = require('path');
        const coverPath = path.join(process.cwd(), scholar.coverImage);
        if (fs.existsSync(coverPath)) {
          fs.unlinkSync(coverPath);
        }
      } catch (error) {
        // Dosya silme hatası durumunda işleme devam et
        console.warn('Cover image dosyası silinemedi:', error);
      }
    }

    await this.scholarRepository.delete(id);
    return scholar; // Silinen scholar'ı döndür
  }

  async findOnePublic(id: number) {
    return this.scholarRepository.findOne({
      where: { id },
      select: [
        'id',
        'fullName',
        'photoUrl',
        'biography',
        'birthDate',
        'deathDate',
        'locationName',
        'createdAt',
      ],
    });
  }
}
