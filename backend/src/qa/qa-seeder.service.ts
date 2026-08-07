import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { QaCategory } from './entities/qa-category.entity';
import { QaCategoryTranslation } from './entities/qa-category-translation.entity';
import { QaItem } from './entities/qa-item.entity';
import { QaItemTranslation } from './entities/qa-item-translation.entity';
import { QaTag } from './entities/qa-tag.entity';
import { QaTagTranslation } from './entities/qa-tag-translation.entity';
import { Language } from '../languages/entities/language.entity';

@Injectable()
export class QaSeederService {
  constructor(
    @InjectRepository(QaCategory)
    private categoryRepo: Repository<QaCategory>,
    @InjectRepository(QaCategoryTranslation)
    private categoryTransRepo: Repository<QaCategoryTranslation>,
    @InjectRepository(QaItem)
    private itemRepo: Repository<QaItem>,
    @InjectRepository(QaItemTranslation)
    private itemTransRepo: Repository<QaItemTranslation>,
    @InjectRepository(QaTag)
    private tagRepo: Repository<QaTag>,
    @InjectRepository(QaTagTranslation)
    private tagTransRepo: Repository<QaTagTranslation>,
    @InjectRepository(Language)
    private languageRepo: Repository<Language>,
  ) {}

  async seedIfEmpty(): Promise<{ seeded: boolean; categories: number; items: number; tags: number }> {
    const existingItems = await this.itemRepo.count();
    if (existingItems > 0) {
      return { seeded: false, categories: 0, items: 0, tags: 0 };
    }

    const langs = await this.languageRepo.find({ where: { isActive: true } });
    const lang = (code: string) => langs.find((l) => l.code === code)?.id;

    const trId = lang('tr');
    const enId = lang('en');
    const arId = lang('ar');
    if (!trId) throw new Error('Türkçe dil kaydı bulunamadı');

    const ibadet = await this.createCategory(null, 1, {
      tr: { name: 'İbadet', description: 'Namaz, oruç, hac ve zekât konuları' },
      en: { name: 'Worship', description: 'Prayer, fasting, hajj and zakat' },
      ar: { name: 'العبادات', description: 'الصلاة والصوم والحج والزكاة' },
    }, trId, enId, arId);

    const namaz = await this.createCategory(ibadet.id, 1, {
      tr: { name: 'Namaz', description: 'Namaz ile ilgili sorular' },
      en: { name: 'Prayer', description: 'Questions about salah' },
      ar: { name: 'الصلاة', description: 'أسئلة حول الصلاة' },
    }, trId, enId, arId);

    const ahlak = await this.createCategory(null, 2, {
      tr: { name: 'Ahlak', description: 'Güzel ahlak ve adab konuları' },
      en: { name: 'Ethics', description: 'Good character and manners' },
      ar: { name: 'الأخلاق', description: 'حسن الخلق والآداب' },
    }, trId, enId, arId);

    const tagNamaz = await this.createTag({ tr: 'namaz', en: 'prayer', ar: 'صلاة' }, trId, enId, arId);
    const tagAbdest = await this.createTag({ tr: 'abdest', en: 'wudu', ar: 'وضوء' }, trId, enId, arId);
    const tagOruc = await this.createTag({ tr: 'oruç', en: 'fasting', ar: 'صوم' }, trId, enId, arId);

    const items = [
      {
        categoryId: namaz.id,
        order: 1,
        sourceBookletName: 'Hanefi İlmihali',
        sourceSection: 'Namaz Bölümü',
        tagIds: [tagNamaz.id, tagAbdest.id],
        translations: {
          tr: {
            question: 'Abdest alırken hangi uzuvlar yıkanmalıdır?',
            answer: 'Abdestte yüz, kollar dirseklerle birlikte, başın dörtte biri mesh edilerek ve ayaklar topuklarla birlikte yıkanır. Bu dört uzuv, farz olan abdest organlarıdır.',
            keywords: 'abdest, farz, yüz, kol, mesh, ayak',
          },
          en: {
            question: 'Which limbs must be washed in wudu?',
            answer: 'In wudu, the face, arms including elbows, a quarter of the head is wiped, and feet including ankles are washed. These are the obligatory parts of wudu.',
            keywords: 'wudu, ablution, face, arms, wipe, feet',
          },
          ar: {
            question: 'ما هي أعضاء الوضوء التي تُغسل؟',
            answer: 'في الوضوء يُغسل الوجه واليدان إلى المرفقين ويُمسح ربع الرأس ويُغسل الرجلان إلى الكعبين، وهذه أركان الوضوء.',
            keywords: 'وضوء, وجه, يد, مسح, رجل',
          },
        },
      },
      {
        categoryId: namaz.id,
        order: 2,
        sourceBookletName: 'Hanefi İlmihali',
        sourceSection: 'Namaz Bölümü',
        tagIds: [tagNamaz.id],
        translations: {
          tr: {
            question: 'Namazda Fatiha okumak farz mıdır?',
            answer: 'Hanefi mezhebine göre namazda Fatiha okumak vaciptir; terk edilirse namaz bozulur ve kaza edilmesi gerekir.',
            keywords: 'namaz, fatiha, vacip, hanefi',
          },
          en: {
            question: 'Is reciting Al-Fatiha obligatory in prayer?',
            answer: 'According to the Hanafi school, reciting Al-Fatiha in prayer is wajib; omitting it invalidates the prayer and requires make-up.',
            keywords: 'prayer, fatiha, wajib, hanafi',
          },
          ar: {
            question: 'هل قراءة الفاتحة في الصلاة واجبة؟',
            answer: 'عند الحنفية قراءة الفاتحة في الصلاة واجبة، وتركها يبطل الصلاة ويجب قضاؤها.',
            keywords: 'صلاة, فاتحة, واجب, حنفي',
          },
        },
      },
      {
        categoryId: ibadet.id,
        order: 3,
        sourceBookletName: 'Temel İlmihal',
        sourceSection: 'Oruç',
        tagIds: [tagOruc.id],
        translations: {
          tr: {
            question: 'Oruç bozan durumlar nelerdir?',
            answer: 'Bilerek yemek, içmek ve cinsel ilişki orucu bozar. Ayrıca kasten kusmak da orucu bozar. Unutarak yemek-içmek orucu bozmaz.',
            keywords: 'oruç, bozulma, yemek, içmek, kusmak',
          },
          en: {
            question: 'What breaks the fast?',
            answer: 'Deliberately eating, drinking, and sexual intercourse break the fast. Intentional vomiting also breaks it. Eating or drinking forgetfully does not.',
            keywords: 'fasting, break, eat, drink, vomit',
          },
          ar: {
            question: 'ما الذي يفطر الصائم؟',
            answer: 'الأكل والشرب والجماع عامداً يفطر الصائم، كما يفطر القيء عامداً. الأكل والشرب ناسياً لا يفطر.',
            keywords: 'صوم, إفطار, أكل, شرب',
          },
        },
      },
      {
        categoryId: ahlak.id,
        order: 1,
        sourceBookletName: 'Ahlak Kitapçığı',
        sourceSection: 'Güzel Ahlak',
        tagIds: [],
        translations: {
          tr: {
            question: 'Müslümanın komşuya karşı görevleri nelerdir?',
            answer: 'Komşuya iyilik etmek, sıkıntılarına karşı ilgisiz kalmamak, yemekten tatmak, hastalandığında ziyaret etmek ve selam vermek güzel ahlakın gereğidir.',
            keywords: 'ahlak, komşu, iyilik, selam',
          },
          en: {
            question: 'What are a Muslim\'s duties toward neighbors?',
            answer: 'Being kind to neighbors, not ignoring their hardships, sharing food, visiting when ill, and greeting them are part of good character.',
            keywords: 'ethics, neighbor, kindness, greeting',
          },
          ar: {
            question: 'ما واجبات المسلم تجاه جاره؟',
            answer: 'من حسن الخلق الإحسان إلى الجار وعدم إهمال همومه وإطعامه وزيارته عند المرض وإسلام عليه.',
            keywords: 'أخلاق, جار, إحسان',
          },
        },
      },
    ];

    for (const entry of items) {
      const item = this.itemRepo.create({
        categoryId: entry.categoryId,
        order: entry.order,
        sourceBookletName: entry.sourceBookletName,
        sourceSection: entry.sourceSection,
        sourceReference: `${entry.sourceBookletName} / ${entry.sourceSection}`,
        isActive: true,
      });
      const saved = await this.itemRepo.save(item);

      const translations: Partial<QaItemTranslation>[] = [];
      if (entry.translations.tr && trId) {
        translations.push({
          qaItemId: saved.id,
          languageId: trId,
          ...entry.translations.tr,
        });
      }
      if (entry.translations.en && enId) {
        translations.push({
          qaItemId: saved.id,
          languageId: enId,
          ...entry.translations.en,
        });
      }
      if (entry.translations.ar && arId) {
        translations.push({
          qaItemId: saved.id,
          languageId: arId,
          ...entry.translations.ar,
        });
      }
      await this.itemTransRepo.save(translations.map((t) => this.itemTransRepo.create(t)));

      if (entry.tagIds?.length) {
        const tags = await this.tagRepo.findBy({ id: In(entry.tagIds) });
        saved.tags = tags;
        await this.itemRepo.save(saved);
      }
    }

    return { seeded: true, categories: 3, items: items.length, tags: 3 };
  }

  private async createCategory(
    parentId: number | null,
    order: number,
    names: Record<string, { name: string; description?: string }>,
    trId: number,
    enId?: number,
    arId?: number,
  ) {
    const category = await this.categoryRepo.save(this.categoryRepo.create({
      parentId: parentId ?? undefined,
      order,
      isActive: true,
    }));

    const translations: Partial<QaCategoryTranslation>[] = [];
    if (names.tr) translations.push({ categoryId: category.id, languageId: trId, name: names.tr.name, description: names.tr.description });
    if (names.en && enId) translations.push({ categoryId: category.id, languageId: enId, name: names.en.name, description: names.en.description });
    if (names.ar && arId) translations.push({ categoryId: category.id, languageId: arId, name: names.ar.name, description: names.ar.description });

    await this.categoryTransRepo.save(translations.map((t) => this.categoryTransRepo.create(t)));
    return category;
  }

  private async createTag(
    names: Record<string, string>,
    trId: number,
    enId?: number,
    arId?: number,
  ) {
    const tag = await this.tagRepo.save(this.tagRepo.create());
    const translations: Partial<QaTagTranslation>[] = [];
    if (names.tr) translations.push({ tagId: tag.id, languageId: trId, name: names.tr });
    if (names.en && enId) translations.push({ tagId: tag.id, languageId: enId, name: names.en });
    if (names.ar && arId) translations.push({ tagId: tag.id, languageId: arId, name: names.ar });
    await this.tagTransRepo.save(translations.map((t) => this.tagTransRepo.create(t)));
    return tag;
  }
}
