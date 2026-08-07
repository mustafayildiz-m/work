import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { qaFetch, ensureArray } from '../../qa-api';
import { useQaIntl } from '../../useQaIntl';

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
          className="flex items-center justify-between p-3 border-b hover:bg-gray-50 dark:hover:bg-gray-800"
          style={{ paddingLeft: `${depth * 24 + 16}px` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpand(cat.id)}
                className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0"
                aria-label={isExpanded ? t('QA.COLLAPSE_CHILDREN') : t('QA.EXPAND_CHILDREN')}
                aria-expanded={isExpanded}
              >
                <ChevronRight
                  className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                />
              </button>
            ) : (
              <span className="w-5 flex-shrink-0" aria-hidden="true" />
            )}
            <span className="font-medium text-gray-900 dark:text-white truncate">{name}</span>
            <span className="text-xs text-gray-500 flex-shrink-0">
              ({t('QA.LANG_COUNT', { count: cat.translations?.length || 0 })})
            </span>
            {!cat.isActive && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded flex-shrink-0">{t('UI.PASIF')}</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => navigate(`/soru-cevap/kategoriler/ekle?edit=${cat.id}`)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(cat.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        {hasChildren && isExpanded && ensureArray(cat.children).map((child) => renderCategory(child, depth + 1))}
      </div>
    );
  };

  const rootCategories = ensureArray(categories).filter((c) => !c.parentId);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('QA.CATEGORIES_TITLE')}</h1>
        <button
          type="button"
          onClick={() => navigate('/soru-cevap/kategoriler/ekle')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> {t('QA.CATEGORY_NEW_BTN')}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">{t('UI.YUKLENIYOR')}</div>
      ) : rootCategories.length === 0 ? (
        <div className="text-center py-10 text-gray-500">{t('QA.NO_CATEGORIES')}</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {rootCategories.map((cat) => renderCategory(cat))}
        </div>
      )}
    </div>
  );
}
