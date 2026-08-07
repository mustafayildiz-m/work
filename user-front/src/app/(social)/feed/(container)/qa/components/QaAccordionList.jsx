'use client';

import QaAccordionItem from './QaAccordionItem';

export default function QaAccordionList({
  items, loading, total, page, limit, onLoadMore, languageId, fallbackLanguageId, isRTL, t,
}) {
  const hasMore = page * limit < total;

  if (loading && page === 1) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">{t('qa.loading')}</span>
        </div>
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className="text-center py-5 qa-results-count">
        <p className="mb-0">{t('qa.noResults')}</p>
      </div>
    );
  }

  return (
    <div className="qa-accordion-list">
      {items.map((item, index) => (
        <QaAccordionItem
          key={item.id}
          item={item}
          index={index}
          languageId={languageId}
          fallbackLanguageId={fallbackLanguageId}
          isRTL={isRTL}
        />
      ))}

      {hasMore && (
        <div className="text-center mt-4">
          <button type="button" className="btn qa-load-more-btn" onClick={onLoadMore} disabled={loading}>
            {loading ? t('qa.loading') : t('qa.loadMore')}
          </button>
        </div>
      )}

      <p className="qa-results-count text-center mt-3 mb-0">
        {items.length} / {total} {t('qa.results')}
      </p>
    </div>
  );
}
