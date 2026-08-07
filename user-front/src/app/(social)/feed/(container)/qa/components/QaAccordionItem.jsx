'use client';

import { useState } from 'react';
import { BsChevronDown, BsChevronUp, BsTag } from 'react-icons/bs';
import { pickTranslation, pickTranslationName } from '../qa-utils';

export default function QaAccordionItem({ item, index, languageId, fallbackLanguageId, isRTL }) {
  const [isOpen, setIsOpen] = useState(false);

  const translation = pickTranslation(item.translations, languageId, fallbackLanguageId);
  if (!translation) return null;

  const categoryName = pickTranslationName(item.category?.translations, languageId, fallbackLanguageId);
  const tags = item.tags
    ?.map((tag) => pickTranslationName(tag.translations, languageId, fallbackLanguageId))
    .filter(Boolean) || [];

  return (
    <div className={`qa-accordion-item ${isOpen ? 'qa-accordion-item--open' : ''}`}>
      <button
        type="button"
        className="qa-accordion-header d-flex align-items-start justify-content-between gap-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className={`d-flex align-items-start gap-2 flex-grow-1 min-w-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="qa-accordion-index">{index + 1}</span>
          <span className="qa-accordion-question">{translation.question}</span>
        </div>
        <span className="qa-accordion-chevron">
          {isOpen ? <BsChevronUp /> : <BsChevronDown />}
        </span>
      </button>

      {isOpen && (
        <div className={`qa-accordion-body ${isRTL ? 'text-end' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="qa-accordion-answer">{translation.answer}</div>

          <div className={`d-flex flex-wrap gap-2 align-items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            {categoryName && (
              <span className="qa-tag qa-tag--category">{categoryName}</span>
            )}
            {tags.map((tag, i) => (
              <span key={i} className="qa-tag">
                <BsTag size={10} /> {tag}
              </span>
            ))}
            {item.sourceBookletName && (
              <span className="qa-tag qa-tag--source">
                {item.sourceBookletName}{item.sourceSection ? ` / ${item.sourceSection}` : ''}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
