import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from '../languages/entities/language.entity';
import { BookTranslation } from '../books/entities/book-translation.entity';
import { ArticleTranslation } from '../articles/entities/article-translation.entity';
import { CreateLanguageDto } from '../dto/create-language.dto';
import { UpdateLanguageDto } from '../dto/update-language.dto';
import { Not } from 'typeorm';

@Injectable()
export class LanguageService {
  constructor(
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
    @InjectRepository(BookTranslation)
    private bookTranslationRepository: Repository<BookTranslation>,
    @InjectRepository(ArticleTranslation)
    private articleTranslationRepository: Repository<ArticleTranslation>,
  ) {}

  async create(createLanguageDto: CreateLanguageDto): Promise<Language> {
    try {
      const language = this.languageRepository.create(createLanguageDto);
      return await this.languageRepository.save(language);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Bu dil adı veya kodu zaten mevcut.');
      }
      throw error;
    }
  }

  async findAll(): Promise<Language[]> {
    return await this.languageRepository.find();
  }

  async getBookCounts(): Promise<
    {
      languageId: number;
      languageName: string;
      languageCode: string;
      bookCount: number;
    }[]
  > {
    const result = await this.languageRepository
      .createQueryBuilder('language')
      .leftJoin('language.bookTranslations', 'bookTranslation')
      .select([
        'language.id as languageId',
        'language.name as languageName',
        'language.code as languageCode',
        'COUNT(DISTINCT bookTranslation.bookId) as bookCount',
      ])
      .groupBy('language.id')
      .orderBy('language.name', 'ASC')
      .getRawMany();

    return result.map((item) => ({
      languageId: parseInt(item.languageId),
      languageName: item.languageName,
      languageCode: item.languageCode,
      bookCount: parseInt(item.bookCount),
    }));
  }

  async getArticleCounts(): Promise<
    {
      languageId: number;
      languageName: string;
      languageCode: string;
      articleCount: number;
    }[]
  > {
    const result = await this.languageRepository
      .createQueryBuilder('language')
      .leftJoin('language.articleTranslations', 'articleTranslation')
      .select([
        'language.id as languageId',
        'language.name as languageName',
        'language.code as languageCode',
        'COUNT(DISTINCT articleTranslation.articleId) as articleCount',
      ])
      .groupBy('language.id')
      .orderBy('language.name', 'ASC')
      .getRawMany();

    return result.map((item) => ({
      languageId: parseInt(item.languageId),
      languageName: item.languageName,
      languageCode: item.languageCode,
      articleCount: parseInt(item.articleCount),
    }));
  }

  async findOne(id: number): Promise<Language> {
    const language = await this.languageRepository.findOne({ where: { id } });
    if (!language) {
      throw new NotFoundException(`Language with ID ${id} not found`);
    }
    return language;
  }

  async update(
    id: number,
    updateLanguageDto: UpdateLanguageDto,
  ): Promise<Language> {
    try {
      // Önce mevcut dili kontrol et
      const existingLanguage = await this.findOne(id);

      // Eğer name güncelleniyorsa, aynı isimde başka dil var mı kontrol et
      if (updateLanguageDto.name) {
        const duplicateName = await this.languageRepository.findOne({
          where: { name: updateLanguageDto.name, id: Not(id) },
        });
        if (duplicateName) {
          throw new ConflictException(
            'Bu dil adı başka bir dilde kullanılıyor.',
          );
        }
      }

      // Eğer code güncelleniyorsa, aynı kodda başka dil var mı kontrol et
      if (updateLanguageDto.code) {
        const duplicateCode = await this.languageRepository.findOne({
          where: { code: updateLanguageDto.code, id: Not(id) },
        });
        if (duplicateCode) {
          throw new ConflictException(
            'Bu dil kodu başka bir dilde kullanılıyor.',
          );
        }
      }

      await this.languageRepository.update(id, updateLanguageDto);
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Bu dil adı veya kodu zaten mevcut.');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const language = await this.findOne(id);
    const result = await this.languageRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Language with ID ${id} not found`);
    }
    return { message: `${language.name} dili başarıyla silindi.` };
  }
}
