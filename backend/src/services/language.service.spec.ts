import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LanguageService } from './language.service';
import { Language } from '../languages/entities/language.entity';
import { BookTranslation } from '../books/entities/book-translation.entity';
import {
  LanguageSearchDto,
  UpdateLanguageStatusDto,
  BulkUpdateStatusDto,
  LanguageDashboardQueryDto,
} from '../dto/language-search.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockLanguage = (overrides = {}): Partial<Language> => ({
  id: 1,
  name: 'Turkish',
  code: 'tur',
  nativeName: 'Türkçe',
  englishName: 'Turkish',
  iso639_3: 'tur',
  direction: 'ltr',
  aliases: '["Turkce"]',
  parentLanguageId: null,
  parentLanguage: null,
  children: [],
  questionCount: 50,
  status: 'active',
  isActive: true,
  ...overrides,
});

const mockLanguageArray = [
  mockLanguage(),
  mockLanguage({ id: 2, name: 'Arabic', code: 'ara', nativeName: 'العربية', englishName: 'Arabic', iso639_3: 'ara', direction: 'rtl', questionCount: 100 }),
  mockLanguage({ id: 3, name: 'English', code: 'eng', nativeName: 'English', englishName: 'English', iso639_3: 'eng', questionCount: 200 }),
];

describe('LanguageService – QA 300 Methods', () => {
  let service: LanguageService;
  let languageRepo: Repository<Language>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    loadRelationCountAndMap: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(mockLanguageArray),
    getCount: jest.fn().mockResolvedValue(3),
    getRawOne: jest.fn().mockResolvedValue({ total: '350' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LanguageService,
        {
          provide: getRepositoryToken(Language),
          useValue: {
            find: jest.fn().mockResolvedValue(mockLanguageArray),
            findOne: jest.fn().mockResolvedValue(mockLanguage()),
            count: jest.fn().mockResolvedValue(10),
            save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 1, ...entity })),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
            create: jest.fn().mockImplementation((dto) => dto),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(BookTranslation),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LanguageService>(LanguageService);
    languageRepo = module.get<Repository<Language>>(getRepositoryToken(Language));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('qaSearch', () => {
    it('should return matching languages for a query', async () => {
      const dto: LanguageSearchDto = { q: 'turk', limit: 10 };
      const result = await service.qaSearch(dto);

      expect(result).toEqual(mockLanguageArray);
      expect(languageRepo.createQueryBuilder).toHaveBeenCalledWith('l');
    });

    it('should try exact ISO match for short queries (<=3 chars)', async () => {
      const dto: LanguageSearchDto = { q: 'tur' };
      jest.spyOn(languageRepo, 'findOne').mockResolvedValueOnce(mockLanguage() as Language);

      const result = await service.qaSearch(dto);

      expect(languageRepo.findOne).toHaveBeenCalledWith({
        where: { iso639_3: 'tur' },
      });
      expect(result).toEqual([expect.objectContaining({ iso639_3: 'tur' })]);
    });

    it('should fall through to fulltext when ISO match is not_published', async () => {
      const dto: LanguageSearchDto = { q: 'xyz' };
      jest.spyOn(languageRepo, 'findOne').mockResolvedValueOnce(
        mockLanguage({ iso639_3: 'xyz', status: 'not_published' }) as Language,
      );

      const result = await service.qaSearch(dto);

      expect(languageRepo.createQueryBuilder).toHaveBeenCalled();
    });

    it('should use default limit of 20 when not specified', async () => {
      const dto: LanguageSearchDto = { q: 'arabic' };
      await service.qaSearch(dto);

      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
    });
  });

  describe('qaSuggested', () => {
    it('should return popular languages and detect browser language', async () => {
      jest.spyOn(languageRepo, 'findOne').mockResolvedValueOnce(mockLanguage() as Language);

      const result = await service.qaSuggested('tr-TR,tr;q=0.9,en;q=0.8');

      expect(result.browserSuggested).toBeTruthy();
      expect(result.popular).toEqual(mockLanguageArray);
    });

    it('should return null browserSuggested when no header', async () => {
      const result = await service.qaSuggested(undefined);

      expect(result.browserSuggested).toBeNull();
      expect(result.popular).toBeDefined();
    });

    it('should return null browserSuggested when no language matched', async () => {
      jest.spyOn(languageRepo, 'findOne').mockResolvedValue(null);

      const result = await service.qaSuggested('xx-XX,xx;q=0.9');

      expect(result.browserSuggested).toBeNull();
    });
  });

  describe('qaGrouped', () => {
    it('should return languages with children filtered', async () => {
      const parentWithChildren = mockLanguage({
        children: [
          mockLanguage({ id: 10, status: 'active' }),
          mockLanguage({ id: 11, status: 'not_published' }),
        ],
      });
      jest.spyOn(languageRepo, 'find').mockResolvedValueOnce([parentWithChildren as Language]);

      const result = await service.qaGrouped();

      expect(result[0].children).toHaveLength(1);
      expect(result[0].children[0].status).not.toBe('not_published');
    });
  });

  describe('qaStats', () => {
    it('should aggregate statistics', async () => {
      jest.spyOn(languageRepo, 'count')
        .mockResolvedValueOnce(300) // total
        .mockResolvedValueOnce(50)  // active
        .mockResolvedValueOnce(30); // in_progress

      const result = await service.qaStats();

      expect(result.totalLanguages).toBe(300);
      expect(result.activeLanguages).toBe(50);
      expect(result.inProgressLanguages).toBe(30);
      expect(result.totalQuestions).toBe(350);
      expect(result.topLanguages).toBeDefined();
    });
  });

  describe('updateStatus', () => {
    it('should update status for a valid language', async () => {
      const dto: UpdateLanguageStatusDto = { status: 'active' };
      jest.spyOn(languageRepo, 'findOne').mockResolvedValueOnce(mockLanguage() as Language);
      jest.spyOn(languageRepo, 'save').mockResolvedValueOnce(
        mockLanguage({ status: 'active' }) as Language,
      );

      const result = await service.updateStatus(1, dto);

      expect(result.status).toBe('active');
    });

    it('should throw NotFoundException for non-existent language', async () => {
      jest.spyOn(languageRepo, 'findOne').mockResolvedValueOnce(null);

      await expect(
        service.updateStatus(999, { status: 'active' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should update multiple languages at once', async () => {
      const dto: BulkUpdateStatusDto = { ids: [1, 2, 3], status: 'active' };

      const result = await service.bulkUpdateStatus(dto);

      expect(languageRepo.update).toHaveBeenCalled();
      expect(result.updated).toBe(mockLanguageArray.length);
    });

    it('should throw BadRequestException for empty ids', async () => {
      const dto: BulkUpdateStatusDto = { ids: [], status: 'active' };

      await expect(service.bulkUpdateStatus(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for more than 50 ids', async () => {
      const dto: BulkUpdateStatusDto = {
        ids: Array.from({ length: 51 }, (_, i) => i + 1),
        status: 'active',
      };

      await expect(service.bulkUpdateStatus(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAdminDashboard', () => {
    it('should return paginated list with stats', async () => {
      jest.spyOn(languageRepo, 'count')
        .mockResolvedValueOnce(50)   // active
        .mockResolvedValueOnce(30)   // in_progress
        .mockResolvedValueOnce(220); // not_published

      const query: LanguageDashboardQueryDto = { page: 1, limit: 10 };
      const result = await service.getAdminDashboard(query);

      expect(result.items).toBeDefined();
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.stats).toBeDefined();
    });

    it('should filter by status', async () => {
      jest.spyOn(languageRepo, 'count')
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(30)
        .mockResolvedValueOnce(220);

      const query: LanguageDashboardQueryDto = { status: 'active', page: 1, limit: 20 };
      await service.getAdminDashboard(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'l.status = :status',
        { status: 'active' },
      );
    });

    it('should filter by search query', async () => {
      jest.spyOn(languageRepo, 'count')
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(30)
        .mockResolvedValueOnce(220);

      const query: LanguageDashboardQueryDto = { q: 'turk', page: 1, limit: 20 };
      await service.getAdminDashboard(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });
  });
});
