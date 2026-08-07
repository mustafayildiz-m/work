'use client';

import { pickTranslationName } from '../qa-utils';

export default function QaCategoryFilter({
  categories, activeCategory, onChange, languageId, fallbackLanguageId, isRTL, t,
}) {
  if (!categories?.length) return null;

  const btnClass = (active) =>
    `btn btn-sm qa-filter-btn ${active ? 'qa-filter-btn--active' : 'qa-filter-btn--inactive'}`;

  return (
    <div className={`d-flex flex-wrap gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <button type="button" className={btnClass(!activeCategory)} onClick={() => onChange('')}>
        {t('qa.allCategories')}
      </button>
      {categories.map((cat) => {
        const name = pickTranslationName(cat.translations, languageId, fallbackLanguageId) || `#${cat.id}`;
        const prefix = cat.depth > 0 ? `${'— '.repeat(cat.depth)}` : '';
        const isActive = String(activeCategory) === String(cat.id);
        return (
          <button
            key={cat.id}
            type="button"
            className={btnClass(isActive)}
            onClick={() => onChange(cat.id)}
          >
            {prefix}{name}
          </button>
        );
      })}
    </div>
  );
}
