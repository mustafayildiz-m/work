import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QaSitemapController } from './qa-sitemap.controller';
import { Language } from '../languages/entities/language.entity';

const mockLanguages = [
  { iso639_3: 'tur', englishName: 'Turkish', questionCount: 50 },
  { iso639_3: 'ara', englishName: 'Arabic', questionCount: 100 },
  { iso639_3: 'eng', englishName: 'English', questionCount: 200 },
];

describe('QaSitemapController', () => {
  let controller: QaSitemapController;

  const mockRepo = {
    find: jest.fn().mockResolvedValue(mockLanguages),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QaSitemapController],
      providers: [
        { provide: getRepositoryToken(Language), useValue: mockRepo },
      ],
    }).compile();

    controller = module.get<QaSitemapController>(QaSitemapController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should generate valid XML sitemap', async () => {
    const mockRes = {
      header: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await controller.generateSitemap(mockRes as any);

    expect(mockRes.header).toHaveBeenCalledWith('Content-Type', 'application/xml');
    expect(mockRes.header).toHaveBeenCalledWith('Cache-Control', 'public, max-age=3600');
    expect(mockRes.send).toHaveBeenCalled();

    const xml = mockRes.send.mock.calls[0][0];
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset');
    expect(xml).toContain('/feed/questions</loc>');
    expect(xml).toContain('/feed/questions/tur</loc>');
    expect(xml).toContain('/feed/questions/ara</loc>');
    expect(xml).toContain('/feed/questions/eng</loc>');
  });

  it('should include hreflang alternates', async () => {
    const mockRes = {
      header: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await controller.generateSitemap(mockRes as any);
    const xml = mockRes.send.mock.calls[0][0];

    expect(xml).toContain('xhtml:link rel="alternate" hreflang="tur"');
    expect(xml).toContain('xhtml:link rel="alternate" hreflang="ara"');
    expect(xml).toContain('xhtml:link rel="alternate" hreflang="eng"');
  });

  it('should query active languages from repository', async () => {
    const mockRes = {
      header: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await controller.generateSitemap(mockRes as any);

    expect(mockRepo.find).toHaveBeenCalledWith({
      where: expect.anything(),
      select: ['iso639_3', 'englishName', 'questionCount'],
      order: { questionCount: 'DESC' },
    });
  });
});
