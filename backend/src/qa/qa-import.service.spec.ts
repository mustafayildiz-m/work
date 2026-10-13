import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as ExcelJS from 'exceljs';
import * as JSZip from 'jszip';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QaImportService } from './qa-import.service';
import { QaItem } from './entities/qa-item.entity';
import { QaItemTranslation } from './entities/qa-item-translation.entity';
import { QaCategory } from './entities/qa-category.entity';
import { QaCategoryTranslation } from './entities/qa-category-translation.entity';
import { QaTag } from './entities/qa-tag.entity';
import { QaTagTranslation } from './entities/qa-tag-translation.entity';

// Iceri aktarilan her satir yeni bir QaItem + bir ceviri yaratir; testte
// kaydedilen cevirileri toplayip kac tanesinin gercekten yazildigina bakiyoruz.
const makeRepos = (existingQuestions: Array<{ languageId: number; question: string }> = []) => {
  const savedTranslations: any[] = [];
  let nextId = 1;

  const itemRepo = {
    create: (data: any) => ({ ...data }),
    save: jest.fn(async (item: any) => ({ id: item.id ?? nextId++, ...item })),
    findBy: jest.fn(async () => []),
  };
  const itemTransRepo = {
    create: (data: any) => ({ ...data }),
    save: jest.fn(async (t: any) => {
      savedTranslations.push(t);
      return t;
    }),
    find: jest.fn(async () => existingQuestions),
  };
  const categoryRepo = {
    create: (d: any) => ({ ...d }),
    save: jest.fn(async (c: any) => ({ id: nextId++, ...c })),
    manager: { getRepository: () => ({ find: async () => [] }) },
  };
  const categoryTransRepo = {
    create: (d: any) => ({ ...d }),
    save: jest.fn(async (c: any) => c),
    findOne: jest.fn(async () => null),
  };
  const tagRepo = { create: () => ({}), save: jest.fn(async () => ({ id: nextId++ })) };
  const tagTransRepo = {
    create: (d: any) => ({ ...d }),
    save: jest.fn(async (t: any) => t),
    findOne: jest.fn(async () => null),
  };

  return { itemRepo, itemTransRepo, categoryRepo, categoryTransRepo, tagRepo, tagTransRepo, savedTranslations };
};

describe('QaImportService - mukerrer kontrolu', () => {
  let service: QaImportService;
  let repos: ReturnType<typeof makeRepos>;

  const build = async (existing: Array<{ languageId: number; question: string }> = []) => {
    repos = makeRepos(existing);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QaImportService,
        { provide: getRepositoryToken(QaItem), useValue: repos.itemRepo },
        { provide: getRepositoryToken(QaItemTranslation), useValue: repos.itemTransRepo },
        { provide: getRepositoryToken(QaCategory), useValue: repos.categoryRepo },
        { provide: getRepositoryToken(QaCategoryTranslation), useValue: repos.categoryTransRepo },
        { provide: getRepositoryToken(QaTag), useValue: repos.tagRepo },
        { provide: getRepositoryToken(QaTagTranslation), useValue: repos.tagTransRepo },
      ],
    }).compile();
    service = module.get<QaImportService>(QaImportService);
  };

  const langMap = new Map([['es', 1], ['en', 2]]);
  const row = (question: string, language_code = 'es') => ({
    question,
    answer: 'cevap',
    language_code,
  });

  it('veritabaninda ayni dilde ayni soru varsa satiri atlar', async () => {
    await build([{ languageId: 1, question: '¿Quién fue Mawlana Jalid?' }]);

    const result = await service.importFromJson(
      [row('¿Quién fue Mawlana Jalid?'), row('Yeni bir soru')],
      langMap,
    );

    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(1);
    expect(repos.savedTranslations).toHaveLength(1);
    expect(repos.savedTranslations[0].question).toBe('Yeni bir soru');
  });

  it('ayni dosya icinde tekrarlanan sorulari bir kez alir', async () => {
    await build();

    const result = await service.importFromJson(
      [row('Tekrar eden soru'), row('Tekrar eden soru'), row('Baska soru')],
      langMap,
    );

    expect(result.imported).toBe(2);
    expect(result.skipped).toBe(1);
  });

  it('buyuk/kucuk harf ve fazla bosluk farkini ayni soru sayar', async () => {
    await build([{ languageId: 1, question: '¿Qué es la fe?' }]);

    const result = await service.importFromJson([row('  ¿QUÉ   ES LA FE?  ')], langMap);

    expect(result.imported).toBe(0);
    expect(result.skipped).toBe(1);
  });

  it('ayni soru farkli dilde ise mukerrer sayilmaz', async () => {
    await build([{ languageId: 1, question: 'What is faith?' }]);

    const result = await service.importFromJson([row('What is faith?', 'en')], langMap);

    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(0);
  });

  it('atlanan satirlari hata olarak degil, ayri listede bildirir', async () => {
    await build([{ languageId: 1, question: 'Var olan' }]);

    const result = await service.importFromJson([row('Var olan')], langMap);

    expect(result.errors).toHaveLength(0);
    expect(result.skippedRows[0]).toContain('1');
  });
});

describe('QaImportService - Excel dosyasi okuma', () => {
  let service: QaImportService;

  beforeEach(async () => {
    const repos = makeRepos();
    repos.categoryRepo.manager.getRepository = () => ({ find: async () => [{ id: 1, code: 'es' }] });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QaImportService,
        { provide: getRepositoryToken(QaItem), useValue: repos.itemRepo },
        { provide: getRepositoryToken(QaItemTranslation), useValue: repos.itemTransRepo },
        { provide: getRepositoryToken(QaCategory), useValue: repos.categoryRepo },
        { provide: getRepositoryToken(QaCategoryTranslation), useValue: repos.categoryTransRepo },
        { provide: getRepositoryToken(QaTag), useValue: repos.tagRepo },
        { provide: getRepositoryToken(QaTagTranslation), useValue: repos.tagTransRepo },
      ],
    }).compile();
    service = module.get<QaImportService>(QaImportService);
  });

  const file = (originalname: string, buffer: Buffer) => ({ originalname, buffer }) as Express.Multer.File;

  const xlsxBuffer = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Hoja1');
    ws.addRow(['question', 'answer', 'language_code']);
    ws.addRow(['¿Quién es el Profeta?', 'Muhammad', 'es']);
    ws.addRow(['¿Qué es el Corán?', 'El libro', 'es']);
    return Buffer.from(await wb.xlsx.writeBuffer());
  };

  // Excel disindaki bazi araclar (OpenXML SDK ile yazan ERP/rapor ciktilari) etiketleri
  // <x:workbook>, <x:sheet> gibi onekli yazar; Excel acar ama exceljs okuyamaz.
  const prefixXml = (xml: string, prefix: string) => {
    const ns = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
    return xml
      .replace(`xmlns="${ns}"`, `xmlns:${prefix}="${ns}"`)
      .replace(/<(\/?)([A-Za-z][\w]*)(?=[\s>\/])/g, `<$1${prefix}:$2`);
  };

  const prefixedXlsxBuffer = async () => {
    const zip = await JSZip.loadAsync(await xlsxBuffer());
    for (const name of Object.keys(zip.files)) {
      if (!/^xl\/(workbook|worksheets\/sheet\d+|sharedStrings|styles)\.xml$/.test(name)) continue;
      zip.file(name, prefixXml(await zip.file(name)!.async('string'), 'x'));
    }
    return zip.generateAsync({ type: 'nodebuffer' });
  };

  it('normal .xlsx dosyasini iceri aktarir', async () => {
    const result = await service.importFromFile(file('normal.xlsx', await xlsxBuffer()));

    expect(result.imported).toBe(2);
    expect(result.errors).toHaveLength(0);
  });

  it('etiketleri onekli (<x:workbook>) yazilmis .xlsx dosyasini da iceri aktarir', async () => {
    const result = await service.importFromFile(file('Mi_Amado_Profeta_Import_Ready.xlsx', await prefixedXlsxBuffer()));

    expect(result.imported).toBe(2);
    expect(result.errors).toHaveLength(0);
  });

  it('okunamayan .xlsx dosyasinda 500 yerine anlasilir 400 doner', async () => {
    await expect(service.importFromFile(file('bozuk.xlsx', Buffer.from('bu bir excel degil')))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('eski ikili .xls bicimini acik bir mesajla reddeder', async () => {
    // Excel 97-2003 .xls dosyalari zip degil, OLE (D0 CF 11 E0) imzasiyla baslar.
    const ole = Buffer.concat([Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]), Buffer.alloc(512)]);

    await expect(service.importFromFile(file('eski.xls', ole))).rejects.toThrow(/\.xlsx/);
  });
});
