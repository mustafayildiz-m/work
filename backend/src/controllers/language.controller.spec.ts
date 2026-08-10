import { Test, TestingModule } from '@nestjs/testing';
import { LanguageController } from './language.controller';
import { LanguageService } from '../services/language.service';
import {
  LanguageSearchDto,
  UpdateLanguageStatusDto,
  BulkUpdateStatusDto,
  LanguageDashboardQueryDto,
} from '../dto/language-search.dto';

const mockLanguage = {
  id: 1,
  name: 'Turkish',
  code: 'tur',
  nativeName: 'Türkçe',
  englishName: 'Turkish',
  iso639_3: 'tur',
  direction: 'ltr',
  questionCount: 50,
  status: 'active',
};

const mockService = {
  create: jest.fn().mockResolvedValue(mockLanguage),
  findAll: jest.fn().mockResolvedValue([mockLanguage]),
  findOne: jest.fn().mockResolvedValue(mockLanguage),
  update: jest.fn().mockResolvedValue(mockLanguage),
  remove: jest.fn().mockResolvedValue({ message: 'deleted' }),
  getBookCounts: jest.fn().mockResolvedValue([]),
  qaSearch: jest.fn().mockResolvedValue([mockLanguage]),
  qaSuggested: jest.fn().mockResolvedValue({
    browserSuggested: mockLanguage,
    popular: [mockLanguage],
  }),
  qaGrouped: jest.fn().mockResolvedValue([mockLanguage]),
  qaStats: jest.fn().mockResolvedValue({
    totalLanguages: 300,
    activeLanguages: 50,
    inProgressLanguages: 30,
    totalQuestions: 1000,
    topLanguages: [],
  }),
  updateStatus: jest.fn().mockResolvedValue({ ...mockLanguage, status: 'in_progress' }),
  bulkUpdateStatus: jest.fn().mockResolvedValue({ updated: 3, languages: [mockLanguage] }),
  getAdminDashboard: jest.fn().mockResolvedValue({
    items: [mockLanguage],
    total: 1,
    page: 1,
    limit: 20,
    stats: { active: 50, inProgress: 30, notPublished: 220, totalQuestions: 1000 },
  }),
};

describe('LanguageController – QA 300 Endpoints', () => {
  let controller: LanguageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LanguageController],
      providers: [
        { provide: LanguageService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<LanguageController>(LanguageController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /languages/qa/search', () => {
    it('should delegate to qaSearch service method', async () => {
      const dto: LanguageSearchDto = { q: 'turk', limit: 10 };
      const result = await controller.qaSearch(dto);

      expect(mockService.qaSearch).toHaveBeenCalledWith(dto);
      expect(result).toEqual([mockLanguage]);
    });
  });

  describe('GET /languages/qa/suggested', () => {
    it('should delegate to qaSuggested with accept-language header', async () => {
      const result = await controller.qaSuggested('tr-TR,tr;q=0.9');

      expect(mockService.qaSuggested).toHaveBeenCalledWith('tr-TR,tr;q=0.9');
      expect(result.browserSuggested).toBeDefined();
      expect(result.popular).toBeDefined();
    });

    it('should work without accept-language header', async () => {
      await controller.qaSuggested(undefined);

      expect(mockService.qaSuggested).toHaveBeenCalledWith(undefined);
    });
  });

  describe('GET /languages/qa/grouped', () => {
    it('should return grouped languages', async () => {
      const result = await controller.qaGrouped();

      expect(mockService.qaGrouped).toHaveBeenCalled();
      expect(result).toEqual([mockLanguage]);
    });
  });

  describe('GET /languages/qa/stats', () => {
    it('should return language statistics', async () => {
      const result = await controller.qaStats();

      expect(mockService.qaStats).toHaveBeenCalled();
      expect(result.totalLanguages).toBe(300);
      expect(result.activeLanguages).toBe(50);
    });
  });

  describe('PATCH /languages/qa/:id/status', () => {
    it('should update language status', async () => {
      const dto: UpdateLanguageStatusDto = { status: 'in_progress' };
      const result = await controller.updateStatus(1, dto);

      expect(mockService.updateStatus).toHaveBeenCalledWith(1, dto);
      expect(result.status).toBe('in_progress');
    });
  });

  describe('PATCH /languages/qa/bulk-status', () => {
    it('should bulk update statuses', async () => {
      const dto: BulkUpdateStatusDto = { ids: [1, 2, 3], status: 'active' };
      const result = await controller.bulkUpdateStatus(dto);

      expect(mockService.bulkUpdateStatus).toHaveBeenCalledWith(dto);
      expect(result.updated).toBe(3);
    });
  });

  describe('GET /languages/qa/admin', () => {
    it('should return admin dashboard data', async () => {
      const query: LanguageDashboardQueryDto = { page: 1, limit: 20 };
      const result = await controller.qaAdminDashboard(query);

      expect(mockService.getAdminDashboard).toHaveBeenCalledWith(query);
      expect(result.items).toBeDefined();
      expect(result.stats).toBeDefined();
    });
  });
});
