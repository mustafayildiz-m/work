import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { FaFolderOpen, FaCheckCircle, FaPlus, FaSitemap } from 'react-icons/fa';
import { ChevronRight } from 'lucide-react';
import { qaFetch, ensureArray } from '../../qa-api';
import { useQaIntl } from '../../useQaIntl';
import {
  QaPageShell,
  QaPageHeader,
  QaPrimaryButton,
  QaStatsGrid,
  QaStatCard,
  QaContentCard,
  QaActionButtons,
} from '../../QaPageLayout';

function collectParentIds(categories) {
  const ids = new Set();
  const walk = (items) => {
    for (const item of ensureArray(items)) {
      if (item.children?.length) {
        ids.add(item.id);
        walk(item.children);
      }
    }
  };
  walk(categories);
  return ids;
}

function countCategories(categories) {
  let total = 0;
  let active = 0;
  const walk = (items) => {
    for (const item of ensureArray(items)) {
      total += 1;
      if (item.isActive) active += 1;
      if (item.children?.length) walk(item.children);
    }
  };
  walk(categories);
  return { total, active };
}

export default function QaCategoryList() {
  const { t } = useQaIntl();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const navigate = useNavigate();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await qaFetch('/qa/admin/categories');
      const list = ensureArray(data);
      setCategories(list);
      setExpandedIds(collectParentIds(list.filter((c) => !c.parentId)));
    } catch (err) {
      toast.error(err.message || t('QA.CATEGORIES_LOAD_FAILED'));
      setCategories([]);
      setExpandedIds(new Set());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const stats = useMemo(() => countCategories(categories.filter((c) => !c.parentId)), [categories]);

  const toggleExpand = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDelete = async (id) => {
    if (!confirm(t('QA.CATEGORY_DELETE_CONFIRM'))) return;
    try {
      await qaFetch(`/qa/categories/${id}`, { method: 'DELETE' });
      toast.success(t('QA.CATEGORY_DELETED'));
      fetchCategories();
    } catch (err) {
      toast.error(err.message || t('QA.DELETE_FAILED'));
    }
  };

  const renderCategory = (cat, depth = 0) => {
    const name = cat.translations?.[0]?.name || t('QA.CATEGORY_FALLBACK', { id: cat.id });
    const hasChildren = ensureArray(cat.children).length > 0;
    const isExpanded = expandedIds.has(cat.id);

    return (
      <div key={cat.id}>
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          style={{ paddingLeft: `${depth * 24 + 24}px` }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpand(cat.id)}
                className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0"
                aria-label={isExpanded ? t('QA.COLLAPSE_CHILDREN') : t('QA.EXPAND_CHILDREN')}
                aria-expanded={isExpanded}
              >
                <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
              </button>
            ) : (
              <span className="w-5 flex-shrink-0" aria-hidden="true" />
            )}
            <span className="font-medium text-gray-900 dark:text-white truncate">{name}</span>
            <span className="text-xs text-gray-500 flex-shrink-0">
              ({t('QA.LANG_COUNT', { count: cat.translations?.length || 0 })})
            </span>
            {!cat.isActive && (
              <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full flex-shrink-0">
                {t('UI.PASIF')}
              </span>
            )}
          </div>
          <QaActionButtons
            editLabel={t('UI.DUZENLE')}
            deleteLabel={t('UI.SIL')}
            onEdit={() => navigate(`/soru-cevap/kategoriler/ekle?edit=${cat.id}`)}
            onDelete={() => handleDelete(cat.id)}
          />
        </div>
        {hasChildren && isExpanded && ensureArray(cat.children).map((child) => renderCategory(child, depth + 1))}
      </div>
    );
  };

  const rootCategories = ensureArray(categories).filter((c) => !c.parentId);

  return (
    <QaPageShell title={`${t('QA.CATEGORIES_TITLE')} - Islamic Windows Admin`}>
      <QaPageHeader
        title={t('QA.CATEGORIES_TITLE')}
        subtitle={t('QA.CATEGORIES_SUBTITLE')}
        icon={FaFolderOpen}
        action={(
          <QaPrimaryButton onClick={() => navigate('/soru-cevap/kategoriler/ekle')}>
            <FaPlus /> {t('QA.CATEGORY_NEW_BTN')}
          </QaPrimaryButton>
        )}
      />

      <QaStatsGrid>
        <QaStatCard
          label={t('QA.STAT_TOTAL_CATEGORIES')}
          value={stats.total}
          gradient="from-blue-500 to-blue-600"
          icon={FaSitemap}
        />
        <QaStatCard
          label={t('UI.AKTIF')}
          value={stats.active}
          hint={t('QA.STAT_ACTIVE_CATEGORIES')}
          gradient="from-green-500 to-green-600"
          icon={FaCheckCircle}
        />
        <QaStatCard
          label={t('UI.PASIF')}
          value={stats.total - stats.active}
          gradient="from-gray-500 to-gray-600"
          icon={FaFolderOpen}
        />
      </QaStatsGrid>

      {loading ? (
        <QaContentCard>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">{t('UI.YUKLENIYOR')}</div>
        </QaContentCard>
      ) : rootCategories.length === 0 ? (
        <QaContentCard>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">{t('QA.NO_CATEGORIES')}</div>
        </QaContentCard>
      ) : (
        <QaContentCard>{rootCategories.map((cat) => renderCategory(cat))}</QaContentCard>
      )}
    </QaPageShell>
  );
}
