'use client';

import QaAccordionItem from '../../../qa/components/QaAccordionItem';

export default function QuestionItem({
  item,
  index,
  isRTL,
  languageId,
  fallbackLanguageId = null,
}) {
  return (
    <QaAccordionItem
      item={item}
      index={index}
      languageId={languageId}
      fallbackLanguageId={fallbackLanguageId}
      isRTL={isRTL}
      testId={`question-item-${item.id}`}
    />
  );
}
