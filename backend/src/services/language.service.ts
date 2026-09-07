import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Optional,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In, Raw } from 'typeorm';
import { Language } from '../languages/entities/language.entity';
import { BookTranslation } from '../books/entities/book-translation.entity';
import { QaItemTranslation } from '../qa/entities/qa-item-translation.entity';
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
const CACHE_TTL_COUNTS = 120; // 2 minutes

@Injectable()
export class LanguageService {
  constructor(
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
    @InjectRepository(BookTranslation)
    private bookTranslationRepository: Repository<BookTranslation>,
    @InjectRepository(QaItemTranslation)
    private qaItemTranslationRepository: Repository<QaItemTranslation>,
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
        const counts = await this.getLiveQuestionCounts();
        return [this.normalizeQaLanguage(isoMatch, counts)];
      }
    }

    const qb = this.languageRepository
      .createQueryBuilder('l')
      .where('l.status != :np', { np: 'not_published' })
      .andWhere(
        '(LOWER(l.nativeName) LIKE :pattern OR LOWER(l.englishName) LIKE :pattern OR LOWER(l.name) LIKE :pattern OR l.iso639_3 = :exact OR l.code = :exact OR LOWER(l.aliases) LIKE :pattern)',
        { pattern: `%${q}%`, exact: q },
      )
      .take(limit);

    // Ordered on the live count, so `take` cannot be skewed by the stale column.
    const results = await qb.getMany();
    const counts = await this.getLiveQuestionCounts();
    return results
      .map((l) => this.normalizeQaLanguage(l, counts))
      .sort((a, b) => b.questionCount - a.questionCount);
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
          browserSuggested = match;
          break;
        }
      }
    }

    const counts = await this.getLiveQuestionCounts();
    if (browserSuggested) {
      browserSuggested = this.normalizeQaLanguage(browserSuggested, counts);
    }

    // Cache popular languages
    const cacheKey = 'qa:popular:12';
    let popular: Language[] | null = null;
    if (this.cacheService) {
      popular = await this.cacheService.get<Language[]>(cacheKey);
      if (popular) {
        // Counts are refreshed on read, so re-sort: the cached order was built
        // from whatever the counts were when the entry was written.
        popular = popular
          .map((l) => this.normalizeQaLanguage(l, counts))
          .sort((a, b) => b.questionCount - a.questionCount);
      }
    }
    if (!popular) {
      // Sorted in JS on the live count rather than by the stale column, so the
      // top 12 is actually the top 12.
      const candidates = await this.languageRepository.find({
        where: { status: Not('not_published') },
      });
      popular = candidates
        .map((l) => this.normalizeQaLanguage(l, counts))
        .sort((a, b) => b.questionCount - a.questionCount)
        .slice(0, 12);
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
    });

    const counts = await this.getLiveQuestionCounts();
    const result = languages
      .map((lang) => {
        if (lang.children) {
          lang.children = lang.children
            .filter((c) => c.status !== 'not_published')
            .map((c) => this.normalizeQaLanguage(c, counts))
            .sort((a, b) => b.questionCount - a.questionCount);
        }
        return this.normalizeQaLanguage(lang, counts);
      })
      .sort((a, b) => b.questionCount - a.questionCount);

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

    // QA catalog: 3-letter code entries (tur, eng…) — exclude legacy 2-letter book rows (tr, en…)
    const [totalLanguages, activeLanguages, inProgressLanguages] =
      await Promise.all([
        this.languageRepository.count({
          where: { code: Raw((alias) => `CHAR_LENGTH(${alias}) = 3`) },
        }),
        this.languageRepository.count({ where: { status: 'active' } }),
        this.languageRepository.count({ where: { status: 'in_progress' } }),
      ]);

    // Counted live; SUM(l.questionCount) undercounts as soon as the column drifts.
    const counts = await this.getLiveQuestionCounts();
    const totalQuestions = [...counts.values()].reduce((a, b) => a + b, 0);

    const topCandidates = await this.languageRepository.find({
      where: { status: Not('not_published') },
      select: ['id', 'iso639_3', 'englishName'],
    });

    const result = {
      totalLanguages,
      activeLanguages,
      inProgressLanguages,
      totalQuestions,
      topLanguages: topCandidates
        .filter((l) => l.iso639_3 && l.englishName)
        .map((l) => ({
          iso639_3: l.iso639_3 as string,
          englishName: l.englishName as string,
          questionCount: counts.get(l.id) ?? 0,
        }))
        .sort((a, b) => b.questionCount - a.questionCount)
        .slice(0, 10),
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
  /**
   * Live Q&A translation count per language id.
   *
   * `languages.questionCount` is a denormalized column that only the seeder
   * refreshes, so it drifts the moment content is added — Turkish read 8 while
   * the table actually held 184. Counting here keeps every QA endpoint
   * consistent with what /qa/items/search returns, so the same `isActive`
   * filter is applied.
   */
  private async getLiveQuestionCounts(): Promise<Map<number, number>> {
    const cacheKey = 'qa:counts:byLanguage';
    if (this.cacheService) {
      const cached =
        await this.cacheService.get<Array<[number, number]>>(cacheKey);
      if (cached) return new Map(cached);
    }

    const rows = await this.qaItemTranslationRepository
      .createQueryBuilder('t')
      .innerJoin('t.qaItem', 'item', 'item.isActive = :active', {
        active: true,
      })
      .select('t.languageId', 'languageId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('t.languageId')
      .getRawMany<{ languageId: number; count: string }>();

    const counts = new Map<number, number>(
      rows.map((r) => [Number(r.languageId), Number(r.count)]),
    );

    if (this.cacheService) {
      await this.cacheService.set(cacheKey, [...counts], CACHE_TTL_COUNTS);
    }
    return counts;
  }

  private normalizeQaLanguage(
    lang: Language,
    counts?: Map<number, number>,
  ): Language {
    // `name` = Turkish UI label key; do not copy into nativeName/englishName
    lang.nativeName = lang.nativeName || lang.englishName || lang.code || null;
    lang.englishName = lang.englishName || lang.nativeName || lang.code || null;
    if (!lang.iso639_3 && lang.code) {
      lang.iso639_3 = lang.code;
    }
    if (counts) {
      lang.questionCount = counts.get(lang.id) ?? 0;
    }
    return lang;
  }
}
