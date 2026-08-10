import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Qa300LanguagesSeeder } from './qa-300-languages-seeder';
import { Language } from '../languages/entities/language.entity';
import { QA_300_LANGUAGES, QA_PARENT_LANGUAGES } from './qa-300-languages.data';

describe('Qa300LanguagesSeeder', () => {
  let seeder: Qa300LanguagesSeeder;
  let mockRepo: any;

  beforeEach(async () => {
    mockRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockResolvedValue({ id: 1 }),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Qa300LanguagesSeeder,
        { provide: getRepositoryToken(Language), useValue: mockRepo },
      ],
    }).compile();

    seeder = module.get<Qa300LanguagesSeeder>(Qa300LanguagesSeeder);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(seeder).toBeDefined();
  });

  it('should call save for each new language entry', async () => {
    await seeder.seed();

    const totalEntries = QA_PARENT_LANGUAGES.length + QA_300_LANGUAGES.length;
    expect(mockRepo.save).toHaveBeenCalledTimes(totalEntries);
  });

  it('should call update (not save) for existing languages', async () => {
    mockRepo.findOne.mockResolvedValue({ id: 99, iso639_3: 'eng' });
    mockRepo.save.mockClear();

    await seeder.seed();

    expect(mockRepo.update).toHaveBeenCalled();
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should link parent relationships in Pass 2', async () => {
    let callCount = 0;
    mockRepo.findOne.mockImplementation(({ where }) => {
      callCount++;
      if (callCount <= QA_PARENT_LANGUAGES.length + QA_300_LANGUAGES.length) {
        return null; // Pass 1: all new
      }
      return { id: callCount, iso639_3: 'xxx' }; // Pass 2: found parent/child
    });

    await seeder.seed();

    const childEntries = [...QA_PARENT_LANGUAGES, ...QA_300_LANGUAGES].filter(
      (e) => e.parentIso,
    );
    if (childEntries.length > 0) {
      expect(mockRepo.update).toHaveBeenCalled();
    }
  });

  it('should handle duplicate entry errors gracefully', async () => {
    const dupError: any = new Error('Duplicate entry');
    dupError.code = 'ER_DUP_ENTRY';
    mockRepo.save.mockRejectedValueOnce(dupError);

    await expect(seeder.seed()).resolves.not.toThrow();
  });

  it('should re-throw non-duplicate errors', async () => {
    const unexpectedError = new Error('Connection lost');
    mockRepo.save.mockRejectedValueOnce(unexpectedError);

    await expect(seeder.seed()).rejects.toThrow('Connection lost');
  });
});
