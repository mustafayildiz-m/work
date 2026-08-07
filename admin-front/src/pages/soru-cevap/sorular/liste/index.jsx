import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { qaFetch, ensureArray, flattenCategories, categoryLabel } from '../../qa-api';
import { useQaIntl } from '../../useQaIntl';

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

  const columns = useMemo(() => [
    { header: 'ID', accessorKey: 'id', size: 60 },
    {
      header: t('QA.QUESTION_COL'),
      cell: ({ row }) => {
        const q = row.original.translations?.[0]?.question || '-';
        return <span className="line-clamp-2 text-sm">{q}</span>;
      },
    },
    {
      header: t('UI.KATEGORI'),
      cell: ({ row }) => row.original.category?.translations?.[0]?.name || '-',
      size: 150,
    },
    {
      header: t('QA.LANGUAGE_COUNT'),
      cell: ({ row }) => <span className="text-sm">{row.original.translations?.length || 0}</span>,
      size: 80,
    },
    {
      header: t('UI.DURUM'),
      cell: ({ row }) => (
        <span className={`text-xs px-2 py-0.5 rounded ${row.original.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {row.original.isActive ? t('UI.AKTIF') : t('UI.PASIF')}
        </span>
      ),
      size: 80,
    },
    {
      header: t('UI.ISLEMLER'),
      size: 100,
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button onClick={() => navigate(`/soru-cevap/sorular/duzenle/${row.original.id}`)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => handleDelete(row.original.id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ], [navigate, t]);

  const table = useReactTable({ data: items, columns, getCoreRowModel: getCoreRowModel() });
  const totalPages = Math.ceil(total / filters.limit);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('QA.ITEMS_TITLE')}</h1>
        <button onClick={() => navigate('/soru-cevap/sorular/ekle')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> {t('QA.ITEM_NEW_BTN')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input type="text" placeholder={t('UI.ARA')} value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })}
            className="w-full border rounded-lg pl-9 pr-3 py-2 dark:bg-gray-800 dark:border-gray-600" />
        </div>
        <select value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value, page: 1 })}
          className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600">
          <option value="">{t('UI.TUM_KATEGORILER')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{categoryLabel(c, c.depth)}</option>
          ))}
        </select>
        <select value={filters.languageId} onChange={(e) => setFilters({ ...filters, languageId: e.target.value, page: 1 })}
          className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600">
          <option value="">{t('QA.ALL_LANGUAGES')}</option>
          {languages.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <div className="text-sm text-gray-500 flex items-center">{t('QA.TOTAL_COUNT', { count: total })}</div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-gray-500">{t('UI.YUKLENIYOR')}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-10 text-gray-500">{t('QA.NO_RECORDS')}</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            className="px-3 py-1 border rounded disabled:opacity-50">{t('UI.ONCEKI')}</button>
          <span className="text-sm text-gray-600">{filters.page} / {totalPages}</span>
          <button disabled={filters.page >= totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            className="px-3 py-1 border rounded disabled:opacity-50">{t('UI.SONRAKI')}</button>
        </div>
      )}
    </div>
  );
}
