import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Optional,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Language } from '../languages/entities/language.entity';
import { BookTranslation } from '../books/entities/book-translation.entity';
import { CreateLanguageDto } from '../dto/create-language.dto';
import { UpdateLanguageDto } from '../dto/update-language.dto';
import {
  LanguageSearchDto,
  UpdateLanguageStatusDto,
  BulkUpdateStatusDto,
  LanguageDashboardQueryDto,
} from '../dto/language-search.dto';
import { CacheService } from './cache.service';

const CACHE_TTL_SUGGESTED = 300; // 5 minutes
const CACHE_TTL_GROUPED = 600; // 10 minutes
const CACHE_TTL_STATS = 120; // 2 minutes

@Injectable()
export class LanguageService {
  constructor(
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
    @InjectRepository(BookTranslation)
    private bookTranslationRepository: Repository<BookTranslation>,
    @Optional() @Inject(CacheService) private cacheService?: CacheService,
  ) {}

  async create(createLanguageDto: CreateLanguageDto): Promise<Language> {
    try {
      if (createLanguageDto.code) {
        createLanguageDto.code = String(createLanguageDto.code).toLowerCase();
      }
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
      if (updateLanguageDto.code) {
        updateLanguageDto.code = String(updateLanguageDto.code).toLowerCase();
      }
      await this.findOne(id);

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

  // ─── QA 300 Methods ─────────────────────────────────────────

  async qaSearch(dto: LanguageSearchDto): Promise<Language[]> {
    const q = dto.q.trim().toLowerCase();
    const limit = dto.limit || 20;

    // Exact ISO 639-3 match
    if (q.length <= 3) {
      const isoMatch = await this.languageRepository.findOne({
        where: [
          { iso639_3: q, status: Not('not_published') },
          { code: q, status: Not('not_published') },
        ],
      });
      if (isoMatch) {
        return [this.normalizeQaLanguage(isoMatch)];
      }
    }

    const qb = this.languageRepository
      .createQueryBuilder('l')
      .where('l.status != :np', { np: 'not_published' })
      .andWhere(
        '(LOWER(l.nativeName) LIKE :pattern OR LOWER(l.englishName) LIKE :pattern OR LOWER(l.name) LIKE :pattern OR l.iso639_3 = :exact OR l.code = :exact OR LOWER(l.aliases) LIKE :pattern)',
        { pattern: `%${q}%`, exact: q },
      )
      .orderBy('l.questionCount', 'DESC')
      .take(limit);

    const results = await qb.getMany();
    return results.map((l) => this.normalizeQaLanguage(l));
  }

  async qaSuggested(acceptLanguage?: string): Promise<{
    browserSuggested: Language | null;
    popular: Language[];
  }> {
    let browserSuggested: Language | null = null;

    if (acceptLanguage) {
      const codes = this.parseAcceptLanguage(acceptLanguage);
      for (const code of codes) {
        const match = await this.languageRepository.findOne({
          where: [
            { iso639_3: code, status: Not('not_published') },
            { code: code, status: Not('not_published') },
          ],
        });
        if (match) {
          browserSuggested = this.normalizeQaLanguage(match);
          break;
        }
      }
    }

    // Cache popular languages
    const cacheKey = 'qa:popular:12';
    let popular: Language[] | null = null;
    if (this.cacheService) {
      popular = await this.cacheService.get<Language[]>(cacheKey);
      if (popular) {
        popular = popular.map((l) => this.normalizeQaLanguage(l));
      }
    }
    if (!popular) {
      popular = await this.languageRepository.find({
        where: { status: Not('not_published') },
        order: { questionCount: 'DESC' },
        take: 12,
      });
      popular = popular.map((l) => this.normalizeQaLanguage(l));
      if (this.cacheService) {
        await this.cacheService.set(cacheKey, popular, CACHE_TTL_SUGGESTED);
      }
    }

    return { browserSuggested, popular };
  }

  async qaGrouped(): Promise<Language[]> {
    const cacheKey = 'qa:grouped';
    if (this.cacheService) {
      const cached = await this.cacheService.get<Language[]>(cacheKey);
      if (cached) return cached;
    }

    const languages = await this.languageRepository.find({
      where: { status: Not('not_published'), parentLanguageId: null as any },
      relations: ['children'],
      order: { questionCount: 'DESC' },
    });

    const result = languages.map((lang) => {
      if (lang.children) {
        lang.children = lang.children
          .filter((c) => c.status !== 'not_published')
          .map((c) => this.normalizeQaLanguage(c));
      }
      return this.normalizeQaLanguage(lang);
    });

    if (this.cacheService) {
      await this.cacheService.set(cacheKey, result, CACHE_TTL_GROUPED);
    }

    return result;
  }

  async qaStats(): Promise<{
    totalLanguages: number;
    activeLanguages: number;
    inProgressLanguages: number;
    totalQuestions: number;
    topLanguages: Array<{
      iso639_3: string;
      englishName: string;
      questionCount: number;
    }>;
  }> {
    const cacheKey = 'qa:stats';
    if (this.cacheService) {
      const cached = await this.cacheService.get<any>(cacheKey);
      if (cached) return cached;
    }

    const [totalLanguages, activeLanguages, inProgressLanguages] =
      await Promise.all([
        this.languageRepository.count(),
        this.languageRepository.count({ where: { status: 'active' } }),
        this.languageRepository.count({ where: { status: 'in_progress' } }),
      ]);

    const totalQuestionsResult = await this.languageRepository
      .createQueryBuilder('l')
      .select('SUM(l.questionCount)', 'total')
      .getRawOne();

    const topLanguages = await this.languageRepository.find({
      where: { status: Not('not_published') },
      order: { questionCount: 'DESC' },
      take: 10,
      select: ['iso639_3', 'englishName', 'questionCount'],
    });

    const result = {
      totalLanguages,
      activeLanguages,
      inProgressLanguages,
      totalQuestions: parseInt(totalQuestionsResult?.total || '0', 10),
      topLanguages: topLanguages
        .filter((l) => l.iso639_3 && l.englishName)
        .map((l) => ({
          iso639_3: l.iso639_3 as string,
          englishName: l.englishName as string,
          questionCount: l.questionCount,
        })),
    };

    if (this.cacheService) {
      await this.cacheService.set(cacheKey, result, CACHE_TTL_STATS);
    }

    return result;
  }

  async updateStatus(
    id: number,
    dto: UpdateLanguageStatusDto,
  ): Promise<Language> {
    const language = await this.findOne(id);
    language.status = dto.status;
    return this.languageRepository.save(language);
  }

  async bulkUpdateStatus(
    dto: BulkUpdateStatusDto,
  ): Promise<{ updated: number; languages: Language[] }> {
    if (!dto.ids?.length) {
      throw new BadRequestException('ids array cannot be empty');
    }
    if (dto.ids.length > 50) {
      throw new BadRequestException('Maximum 50 ids per request');
    }

    await this.languageRepository.update(
      { id: In(dto.ids) },
      { status: dto.status },
    );

    const languages = await this.languageRepository.find({
      where: { id: In(dto.ids) },
    });

    return { updated: languages.length, languages };
  }

  async getAdminDashboard(query: LanguageDashboardQueryDto) {
    const { page = 1, limit = 20, status, q, sort = 'questionCount', order = 'DESC' } = query;

    const qb = this.languageRepository.createQueryBuilder('l');

    if (status) {
      qb.andWhere('l.status = :status', { status });
    }

    if (q) {
      qb.andWhere(
        '(LOWER(l.nativeName) LIKE :q OR LOWER(l.englishName) LIKE :q OR l.iso639_3 = :exact)',
        { q: `%${q.toLowerCase()}%`, exact: q.toLowerCase() },
      );
    }

    const allowedSorts = ['nativeName', 'englishName', 'questionCount', 'status', 'iso639_3'];
    const sortField = allowedSorts.includes(sort) ? sort : 'questionCount';
    qb.orderBy(`l.${sortField}`, order === 'ASC' ? 'ASC' : 'DESC');

    const total = await qb.getCount();
    const items = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .loadRelationCountAndMap('l.childrenCount', 'l.children')
      .getMany();

    const [active, inProgress, notPublished] = await Promise.all([
      this.languageRepository.count({ where: { status: 'active' } }),
      this.languageRepository.count({ where: { status: 'in_progress' } }),
      this.languageRepository.count({ where: { status: 'not_published' } }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      stats: {
        active,
        inProgress,
        notPublished,
        totalQuestions: items.reduce((sum, l) => sum + l.questionCount, 0),
      },
    };
  }

  private parseAcceptLanguage(header: string): string[] {
    return header
      .split(',')
      .map((part) => {
        const [lang] = part.trim().split(';');
        return lang.trim().toLowerCase().split('-')[0];
      })
      .filter((code) => code.length >= 2 && code.length <= 3);
  }

  /** Eski dil kayıtlarında nativeName/iso639_3 boş olabilir — QA API için normalize et */
  private normalizeQaLanguage(lang: Language): Language {
    // `name` = Turkish UI label key; do not copy into nativeName/englishName
    lang.nativeName = lang.nativeName || lang.englishName || lang.code || undefined;
    lang.englishName = lang.englishName || lang.nativeName || lang.code || undefined;
    if (!lang.iso639_3 && lang.code) {
      lang.iso639_3 = lang.code;
    }
    return lang;
  }
}
