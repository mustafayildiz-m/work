import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { QaItem } from './entities/qa-item.entity';
import { QaItemTranslation } from './entities/qa-item-translation.entity';
import { QaCategory } from './entities/qa-category.entity';
import { QaCategoryTranslation } from './entities/qa-category-translation.entity';
import { QaTag } from './entities/qa-tag.entity';
import { QaTagTranslation } from './entities/qa-tag-translation.entity';
import { Language } from '../languages/entities/language.entity';

interface ImportRow {
  question: string;
  answer: string;
  category?: string;
  keywords?: string;
  source_reference?: string;
  source_booklet?: string;
  source_section?: string;
  language_code: string;
  tags?: string;
}

@Injectable()
export class QaImportService {
  constructor(
    @InjectRepository(QaItem)
    private itemRepo: Repository<QaItem>,
    @InjectRepository(QaItemTranslation)
    private itemTransRepo: Repository<QaItemTranslation>,
    @InjectRepository(QaCategory)
    private categoryRepo: Repository<QaCategory>,
    @InjectRepository(QaCategoryTranslation)
    private categoryTransRepo: Repository<QaCategoryTranslation>,
    @InjectRepository(QaTag)
    private tagRepo: Repository<QaTag>,
    @InjectRepository(QaTagTranslation)
    private tagTransRepo: Repository<QaTagTranslation>,
  ) {}

  async importFromJson(data: ImportRow[], languageMap: Map<string, number>): Promise<{ imported: number; errors: string[] }> {
    const errors: string[] = [];
    let imported = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        if (!row.question || !row.answer || !row.language_code) {
          errors.push(`Row ${i + 1}: Missing required fields (question, answer, language_code)`);
          continue;
        }

        const languageId = languageMap.get(row.language_code);
        if (!languageId) {
          errors.push(`Row ${i + 1}: Unknown language code "${row.language_code}"`);
          continue;
        }

        let categoryId: number | null = null;
        if (row.category) {
          categoryId = await this.findOrCreateCategory(row.category, languageId);
        }

        let tagIds: number[] = [];
        if (row.tags) {
          const tagNames = row.tags.split(',').map((t) => t.trim()).filter(Boolean);
          tagIds = await this.findOrCreateTags(tagNames, languageId);
        }

        const item = this.itemRepo.create({
          categoryId: categoryId ?? undefined,
          sourceReference: row.source_reference,
          sourceBookletName: row.source_booklet,
          sourceSection: row.source_section,
          isActive: true,
        });
        const savedItem = await this.itemRepo.save(item);

        const translation = this.itemTransRepo.create({
          qaItemId: savedItem.id,
          languageId,
          question: row.question,
          answer: row.answer,
          keywords: row.keywords,
        });
        await this.itemTransRepo.save(translation);

        if (tagIds.length) {
          const tags = await this.tagRepo.findBy({ id: In(tagIds) });
          savedItem.tags = tags;
          await this.itemRepo.save(savedItem);
        }

        imported++;
      } catch (err) {
        errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    return { imported, errors };
  }

  async importFromCsv(csvContent: string, languageMap: Map<string, number>): Promise<{ imported: number; errors: string[] }> {
    const rows = this.parseCsv(csvContent);
    return this.importFromJson(rows, languageMap);
  }

  async importFromFile(
    file: Express.Multer.File,
  ): Promise<{ imported: number; errors: string[] }> {
    const languageMap = await this.getLanguageMap();

    const filename = file.originalname.toLowerCase();
    const content = file.buffer.toString('utf-8');

    if (filename.endsWith('.json')) {
      const data = JSON.parse(content);
      if (!Array.isArray(data)) {
        throw new BadRequestException('JSON file must contain an array of objects');
      }
      return this.importFromJson(data, languageMap);
    }

    if (filename.endsWith('.csv')) {
      return this.importFromCsv(content, languageMap);
    }

    if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      return this.importFromExcel(file.buffer, languageMap);
    }

    throw new BadRequestException('Unsupported file format. Use .json, .csv, or .xlsx');
  }

  private async importFromExcel(
    buffer: Buffer,
    languageMap: Map<string, number>,
  ): Promise<{ imported: number; errors: string[] }> {
    let ExcelJS: any;
    try {
      ExcelJS = await import('exceljs' as any);
    } catch {
      throw new BadRequestException('Excel support requires exceljs package. Install it with: npm install exceljs');
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new BadRequestException('Excel file has no worksheets');
    }

    const headers: string[] = [];
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      headers[colNumber - 1] = String(cell.value || '').toLowerCase().trim();
    });

    const rows: ImportRow[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const obj: any = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (header) obj[header] = String(cell.value || '');
      });
      rows.push(obj);
    });

    return this.importFromJson(rows, languageMap);
  }

  private parseCsv(content: string): ImportRow[] {
    const lines = content.split('\n').filter((l) => l.trim());
    if (lines.length < 2) return [];

    const headers = this.parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim());
    const rows: ImportRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i]);
      const obj: any = {};
      headers.forEach((header, idx) => {
        obj[header] = values[idx] || '';
      });
      rows.push(obj);
    }

    return rows;
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  private async getLanguageMap(): Promise<Map<string, number>> {
    const languages = await this.categoryRepo.manager
      .getRepository(Language)
      .find({ select: ['id', 'code'] });
    const map = new Map<string, number>();
    languages.forEach((l) => map.set(l.code, l.id));
    return map;
  }

  private async findOrCreateCategory(name: string, languageId: number): Promise<number> {
    const existing = await this.categoryTransRepo.findOne({
      where: { name, languageId },
    });
    if (existing) return existing.categoryId;

    const category = this.categoryRepo.create({ isActive: true, order: 0 });
    const saved = await this.categoryRepo.save(category);

    const trans = this.categoryTransRepo.create({
      categoryId: saved.id,
      languageId,
      name,
    });
    await this.categoryTransRepo.save(trans);

    return saved.id;
  }

  private async findOrCreateTags(names: string[], languageId: number): Promise<number[]> {
    const ids: number[] = [];
    for (const name of names) {
      const existing = await this.tagTransRepo.findOne({
        where: { name, languageId },
      });
      if (existing) {
        ids.push(existing.tagId);
      } else {
        const tag = this.tagRepo.create();
        const saved = await this.tagRepo.save(tag);
        const trans = this.tagTransRepo.create({
          tagId: saved.id,
          languageId,
          name,
        });
        await this.tagTransRepo.save(trans);
        ids.push(saved.id);
      }
    }
    return ids;
  }
}
