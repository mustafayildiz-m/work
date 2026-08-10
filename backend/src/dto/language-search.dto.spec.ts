import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  LanguageSearchDto,
  UpdateLanguageStatusDto,
  BulkUpdateStatusDto,
  LanguageDashboardQueryDto,
} from './language-search.dto';

describe('LanguageSearchDto', () => {
  it('should pass validation with valid q', async () => {
    const dto = plainToInstance(LanguageSearchDto, { q: 'turkish' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if q is empty', async () => {
    const dto = plainToInstance(LanguageSearchDto, { q: '' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail if q is missing', async () => {
    const dto = plainToInstance(LanguageSearchDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should use default limit of 20', () => {
    const dto = plainToInstance(LanguageSearchDto, { q: 'test' });
    expect(dto.limit).toBe(20);
  });

  it('should accept custom limit between 1-50', async () => {
    const dto = plainToInstance(LanguageSearchDto, { q: 'test', limit: 30 });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.limit).toBe(30);
  });

  it('should reject limit > 50', async () => {
    const dto = plainToInstance(LanguageSearchDto, { q: 'test', limit: 100 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject limit < 1', async () => {
    const dto = plainToInstance(LanguageSearchDto, { q: 'test', limit: 0 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('UpdateLanguageStatusDto', () => {
  it('should pass with valid status values', async () => {
    for (const status of ['active', 'in_progress', 'not_published']) {
      const dto = plainToInstance(UpdateLanguageStatusDto, { status });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    }
  });

  it('should fail with invalid status', async () => {
    const dto = plainToInstance(UpdateLanguageStatusDto, { status: 'invalid' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('BulkUpdateStatusDto', () => {
  it('should pass with valid ids and status', async () => {
    const dto = plainToInstance(BulkUpdateStatusDto, {
      ids: [1, 2, 3],
      status: 'active',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid status', async () => {
    const dto = plainToInstance(BulkUpdateStatusDto, {
      ids: [1, 2],
      status: 'invalid',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with non-integer ids', async () => {
    const dto = plainToInstance(BulkUpdateStatusDto, {
      ids: ['abc', 'def'],
      status: 'active',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('LanguageDashboardQueryDto', () => {
  it('should use defaults when no values provided', () => {
    const dto = plainToInstance(LanguageDashboardQueryDto, {});
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(20);
    expect(dto.sort).toBe('questionCount');
    expect(dto.order).toBe('DESC');
  });

  it('should validate order enum', async () => {
    const dto = plainToInstance(LanguageDashboardQueryDto, { order: 'INVALID' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should validate status enum', async () => {
    const dto = plainToInstance(LanguageDashboardQueryDto, { status: 'invalid' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should accept valid parameters', async () => {
    const dto = plainToInstance(LanguageDashboardQueryDto, {
      page: 2,
      limit: 50,
      status: 'active',
      q: 'turk',
      sort: 'englishName',
      order: 'ASC',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
