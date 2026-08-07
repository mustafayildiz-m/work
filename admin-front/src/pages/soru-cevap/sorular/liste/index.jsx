import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { toast } from 'sonner';
import { FaQuestionCircle, FaCheckCircle, FaGlobe, FaPlus, FaSearch } from 'react-icons/fa';
import { qaFetch, ensureArray, flattenCategories, categoryLabel } from '../../qa-api';
import { useQaIntl } from '../../useQaIntl';
import {
  QaPageShell,
  QaPageHeader,
  QaPrimaryButton,
  QaStatsGrid,
  QaStatCard,
  QaFilterPanel,
  QaTableShell,
  QaPagination,
  QaActionButtons,
  qaSelectClass,
  qaInputClass,
  qaLabelClass,
  qaTableThClass,
  qaTableTdClass,
} from '../../QaPageLayout';

export default function QaItemList() {
  const { t } = useQaIntl();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [filters, setFilters] = useState({ q: '', categoryId: '', languageId: '', page: 1, limit: 20 });
  const navigate = useNavigate();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.categoryId) params.set('categoryId', filters.categoryId);
      if (filters.languageId) params.set('languageId', filters.languageId);
      params.set('page', filters.page);
      params.set('limit', filters.limit);

      const data = await qaFetch(`/qa/admin/items?${params}`);
      setItems(ensureArray(data.items));
      setTotal(data.total || 0);
    } catch (err) {
      toast.error(err.message || t('QA.LOAD_FAILED'));
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([
      qaFetch('/qa/admin/categories').then((data) => setCategories(flattenCategories(data))).catch(() => setCategories([])),
      qaFetch('/languages').then((data) => setLanguages(ensureArray(data).filter((l) => l.isActive))).catch(() => setLanguages([])),
    ]);
  }, []);

  useEffect(() => { fetchItems(); }, [filters]);

  const handleDelete = async (id) => {
    if (!confirm(t('QA.ITEM_DELETE_CONFIRM'))) return;
    try {
      await qaFetch(`/qa/items/${id}`, { method: 'DELETE' });
      toast.success(t('QA.ITEM_DELETED'));
      fetchItems();
    } catch (err) {
      toast.error(err.message || t('QA.DELETE_FAILED'));
    }
  };

  const activeCount = useMemo(() => items.filter((item) => item.isActive).length, [items]);

  const columns = useMemo(() => [
    { header: 'ID', accessorKey: 'id', size: 60 },
    {
      header: t('QA.QUESTION_COL'),
      cell: ({ row }) => {
        const q = row.original.translations?.[0]?.question || '-';
        return <span className="line-clamp-2">{q}</span>;
      },
    },
    {
      header: t('UI.KATEGORI'),
      cell: ({ row }) => row.original.category?.translations?.[0]?.name || '-',
      size: 150,
    },
    {
      header: t('QA.LANGUAGE_COUNT'),
      cell: ({ row }) => row.original.translations?.length || 0,
      size: 80,
    },
    {
      header: t('UI.DURUM'),
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          row.original.isActive
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {row.original.isActive ? t('UI.AKTIF') : t('UI.PASIF')}
        </span>
      ),
      size: 80,
    },
    {
      header: t('UI.ISLEMLER'),
      size: 120,
      cell: ({ row }) => (
        <QaActionButtons
          editLabel={t('UI.DUZENLE')}
          deleteLabel={t('UI.SIL')}
          onEdit={() => navigate(`/soru-cevap/sorular/duzenle/${row.original.id}`)}
          onDelete={() => handleDelete(row.original.id)}
        />
      ),
    },
  ], [navigate, t]);

  const table = useReactTable({ data: items, columns, getCoreRowModel: getCoreRowModel() });
  const totalPages = Math.ceil(total / filters.limit);

  return (
    <QaPageShell title={`${t('QA.ITEMS_TITLE')} - Islamic Windows Admin`}>
      <QaPageHeader
        title={t('QA.ITEMS_TITLE')}
        subtitle={t('QA.ITEMS_SUBTITLE')}
        icon={FaQuestionCircle}
        action={(
          <QaPrimaryButton onClick={() => navigate('/soru-cevap/sorular/ekle')}>
            <FaPlus /> {t('QA.ITEM_NEW_BTN')}
          </QaPrimaryButton>
        )}
      />

      <QaStatsGrid>
        <QaStatCard
          label={t('QA.STAT_TOTAL_ITEMS')}
          value={total}
          hint={t('QA.TOTAL_COUNT', { count: total })}
          gradient="from-blue-500 to-blue-600"
          icon={FaQuestionCircle}
        />
        <QaStatCard
          label={t('UI.AKTIF')}
          value={activeCount}
          hint={t('QA.STAT_ACTIVE_ITEMS')}
          gradient="from-green-500 to-green-600"
          icon={FaCheckCircle}
        />
        <QaStatCard
          label={t('QA.STAT_LANGUAGES')}
          value={languages.length}
          gradient="from-indigo-500 to-indigo-600"
          icon={FaGlobe}
        />
      </QaStatsGrid>

      <QaFilterPanel title={t('UI.FILTRELE__ARA')}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={qaLabelClass}>
              <FaSearch className="inline mr-2 text-blue-600" />
              {t('UI.ARA')}
            </label>
            <input
              type="text"
              placeholder={t('UI.ARA')}
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })}
              className={qaInputClass}
            />
          </div>
          <div>
            <label className={qaLabelClass}>{t('UI.KATEGORI')}</label>
            <select
              value={filters.categoryId}
              onChange={(e) => setFilters({ ...filters, categoryId: e.target.value, page: 1 })}
              className={qaSelectClass}
            >
              <option value="">{t('UI.TUM_KATEGORILER')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{categoryLabel(c, c.depth)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={qaLabelClass}>{t('UI.DILE_GORE_FILTRELE')}</label>
            <select
              value={filters.languageId}
              onChange={(e) => setFilters({ ...filters, languageId: e.target.value, page: 1 })}
              className={qaSelectClass}
            >
              <option value="">{t('QA.ALL_LANGUAGES')}</option>
              {languages.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>
      </QaFilterPanel>

      <QaTableShell loading={loading} loadingText={t('UI.YUKLENIYOR')} empty={!loading && items.length === 0 ? t('QA.NO_RECORDS') : null}>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className={qaTableThClass}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={qaTableTdClass}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </QaTableShell>

      <QaPagination
        page={filters.page}
        totalPages={totalPages}
        onPrev={() => setFilters({ ...filters, page: filters.page - 1 })}
        onNext={() => setFilters({ ...filters, page: filters.page + 1 })}
        prevLabel={t('UI.ONCEKI_SAYFA')}
        nextLabel={t('UI.SONRAKI_SAYFA')}
        pageLabel={`${t('UI.SAYFA')} ${filters.page} / ${totalPages || 1}`}
      />
    </QaPageShell>
  );
}
