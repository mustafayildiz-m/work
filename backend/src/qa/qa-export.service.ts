import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QaItem } from './entities/qa-item.entity';
import { QaItemTranslation } from './entities/qa-item-translation.entity';

export type ExportFormat = 'json' | 'jsonl' | 'csv';

interface ExportRow {
  id: number;
  question: string;
  answer: string;
  language_code: string;
  language_name: string;
  category: string;
  keywords: string;
  tags: string;
  source_reference: string;
  source_booklet: string;
  source_section: string;
  created_at: string;
}

@Injectable()
export class QaExportService {
  constructor(
    @InjectRepository(QaItem)
    private itemRepo: Repository<QaItem>,
    @InjectRepository(QaItemTranslation)
    private itemTransRepo: Repository<QaItemTranslation>,
  ) {}

  async exportData(
    format: ExportFormat,
    languageId?: number,
    categoryId?: number,
  ): Promise<{ content: string; mimeType: string; filename: string }> {
    const rows = await this.getExportRows(languageId, categoryId);

    switch (format) {
      case 'jsonl':
        return {
          content: rows.map((r) => JSON.stringify(r)).join('\n'),
          mimeType: 'application/x-ndjson',
          filename: `qa_export_${Date.now()}.jsonl`,
        };
      case 'csv':
        return {
          content: this.toCsv(rows),
          mimeType: 'text/csv; charset=utf-8',
          filename: `qa_export_${Date.now()}.csv`,
        };
      case 'json':
      default:
        return {
          content: JSON.stringify(rows, null, 2),
          mimeType: 'application/json',
          filename: `qa_export_${Date.now()}.json`,
        };
    }
  }

  private async getExportRows(languageId?: number, categoryId?: number): Promise<ExportRow[]> {
    const qb = this.itemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.translations', 'trans')
      .leftJoinAndSelect('trans.language', 'lang')
      .leftJoinAndSelect('item.category', 'cat')
      .leftJoinAndSelect('cat.translations', 'catTrans')
      .leftJoinAndSelect('item.tags', 'tag')
      .leftJoinAndSelect('tag.translations', 'tagTrans');

    if (languageId) {
      qb.andWhere('trans.languageId = :languageId', { languageId });
    }

    if (categoryId) {
      qb.andWhere('item.categoryId = :categoryId', { categoryId });
    }

    qb.orderBy('item.id', 'ASC');

    const items = await qb.getMany();
    const rows: ExportRow[] = [];

    for (const item of items) {
      for (const trans of item.translations) {
        const catName = item.category?.translations?.[0]?.name || '';
        const tagNames = (item.tags || [])
          .map((t) => t.translations?.[0]?.name || '')
          .filter(Boolean)
          .join(', ');

        rows.push({
          id: item.id,
          question: trans.question,
          answer: trans.answer,
          language_code: trans.language?.code || '',
          language_name: trans.language?.name || '',
          category: catName,
          keywords: trans.keywords || '',
          tags: tagNames,
          source_reference: item.sourceReference || '',
          source_booklet: item.sourceBookletName || '',
          source_section: item.sourceSection || '',
          created_at: item.createdAt?.toISOString() || '',
        });
      }
    }

    return rows;
  }

  private toCsv(rows: ExportRow[]): string {
    if (!rows.length) return '';

    const BOM = '\uFEFF';
    const headers = Object.keys(rows[0]);
    const lines = [headers.join(',')];

    for (const row of rows) {
      const values = headers.map((h) => {
        const val = String(row[h] || '');
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });
      lines.push(values.join(','));
    }

    return BOM + lines.join('\n');
  }
}
