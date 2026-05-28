import { FormattedMessage, useIntl } from "react-intl";
import React, { useMemo, useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';

function DefaultColumnFilter({ column }) {
  const intl = useIntl();
  const columnFilterValue = column.getFilterValue() || '';
  return (
    <input
      type="text"
      value={columnFilterValue}
      onChange={e => column.setFilterValue(e.target.value)}
      placeholder={intl.formatMessage({ id: 'UI.DILE_GORE_FILTRELE_PLACEHOLDER' })}
      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
    />
  );
}

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/languages';
const PODCAST_API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/podcasts';

function getFlagByLanguageCode(code) {
  if (!code) return '🏳️';
  const normalized = String(code).toLowerCase();
  const flagMap = {
    tr: '🇹🇷',
    en: '🇬🇧',
    ar: '🇸🇦',
    bs: '🇧🇦',
    sq: '🇦🇱',
    de: '🇩🇪',
    fr: '🇫🇷',
    ru: '🇷🇺',
    es: '🇪🇸',
    it: '🇮🇹',
    fa: '🇮🇷',
    ur: '🇵🇰',
    id: '🇮🇩',
    az: '🇦🇿',
  };
  return flagMap[normalized] || '🌐';
}

function getMediaUrl(filePath) {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
  return `${baseUrl}${filePath.startsWith('/') ? filePath : `/${filePath}`}`;
}

function AddLanguageModal({ open, onClose, onAdded }) {
  const intl = useIntl();
  const [form, setForm] = useState({ name: '', code: '', flagFile: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('code', form.code);
      if (form.flagFile) {
        formData.append('flag', form.flagFile);
      }

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      const responseText = await res.text();
      
      if (responseText.trim().startsWith('<!') || responseText.trim().startsWith('<html')) {
        throw new Error(intl.formatMessage({ id: 'UI.API_ENDPOINT_BULUNAMADI' }));
      }
      
      if (!res.ok) {
        let errorMessage = `${intl.formatMessage({ id: 'UI.HATA' })} ${res.status} ${res.statusText}`;
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = responseText.substring(0, 200) || errorMessage;
        }
        throw new Error(errorMessage);
      }

      let newLang;
      try {
        newLang = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(intl.formatMessage({ id: 'UI.GECERSIZ_JSON_YANITI' }));
      }
      onAdded(newLang);
      onClose();
      setForm({ name: '', code: '', flagFile: null });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4"><FormattedMessage id="UI.DIL_EKLE" /></h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1"><FormattedMessage id="UI.DIL_ADI" /></label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1"><FormattedMessage id="UI.DIL_KODU" /></label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1"><FormattedMessage id="UI.BAYRAK_GORSELI" /></label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setForm(prev => ({ ...prev, flagFile: e.target.files?.[0] || null }))}
              className="w-full text-sm text-gray-900 dark:text-gray-100 file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-white hover:file:bg-blue-700"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400"><FormattedMessage id="UI.OPSIYONEL_GORSEL_FORMATLARI" /></p>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"><FormattedMessage id="UI.IPTAL" /></button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              {loading ? <FormattedMessage id="UI.EKLENIYOR" /> : <FormattedMessage id="UI.EKLE" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditLanguageModal({ open, onClose, language, onUpdated }) {
  const intl = useIntl();
  const [form, setForm] = useState(language || { name: '', code: '', flagFile: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setForm({ ...(language || { name: '', code: '' }), flagFile: null });
    setError(null);
  }, [language, open]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('code', form.code);
      if (form.flagFile) {
        formData.append('flag', form.flagFile);
      }

      const res = await fetch(`${API_URL}/${language.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      const responseText = await res.text();
      
      if (responseText.trim().startsWith('<!') || responseText.trim().startsWith('<html')) {
        throw new Error(intl.formatMessage({ id: 'UI.API_ENDPOINT_BULUNAMADI' }));
      }
      
      if (!res.ok) {
        let errorMessage = `${intl.formatMessage({ id: 'UI.HATA' })} ${res.status} ${res.statusText}`;
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = responseText.substring(0, 200) || errorMessage;
        }
        throw new Error(errorMessage);
      }

      let updatedLang;
      try {
        updatedLang = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(intl.formatMessage({ id: 'UI.GECERSIZ_JSON_YANITI' }));
      }
      onUpdated(updatedLang);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4"><FormattedMessage id="UI.DILI_DUZENLE" /></h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1"><FormattedMessage id="UI.DIL_ADI" /></label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1"><FormattedMessage id="UI.DIL_KODU" /></label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1"><FormattedMessage id="UI.BAYRAK_GORSELI" /></label>
            {form.flagUrl && !form.flagFile ? (
              <img
                src={getMediaUrl(form.flagUrl)}
                alt={form.name}
                className="mb-2 h-10 w-14 rounded object-cover border border-gray-200 dark:border-gray-700"
              />
            ) : null}
            <input
              type="file"
              accept="image/*"
              onChange={e => setForm(prev => ({ ...prev, flagFile: e.target.files?.[0] || null }))}
              className="w-full text-sm text-gray-900 dark:text-gray-100 file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-white hover:file:bg-blue-700"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400"><FormattedMessage id="UI.BAYRAK_GUNCELLEME_NOTU" /></p>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"><FormattedMessage id="UI.IPTAL" /></button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              {loading ? <FormattedMessage id="UI.KAYDEDILIYOR" /> : <FormattedMessage id="UI.KAYDET" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const LanguageList = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [bookCounts, setBookCounts] = useState({});
  const [articleCounts, setArticleCounts] = useState({});
  const [podcastCounts, setPodcastCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editLanguage, setEditLanguage] = useState(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token');
        
        const res = await fetch(API_URL, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        const responseText = await res.text();
        if (responseText.trim().startsWith('<!') || responseText.trim().startsWith('<html')) {
          throw new Error(intl.formatMessage({ id: 'UI.API_ENDPOINT_BULUNAMADI' }));
        }
        
        if (!res.ok) {
          let errorMessage = `${intl.formatMessage({ id: 'UI.HATA' })} ${res.status} ${res.statusText}`;
          try {
            const errorJson = JSON.parse(responseText);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
          } catch {
            errorMessage = responseText.substring(0, 200) || errorMessage;
          }
          throw new Error(errorMessage);
        }

        let langs;
        try {
          langs = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error(intl.formatMessage({ id: 'UI.GECERSIZ_JSON_YANITI' }));
        }
        
        setData(langs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLanguages();
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

        const [bookRes, articleRes, podcastRes] = await Promise.all([
          fetch(`${API_URL}/book-counts`, { headers }).then(r => r.ok ? r.json() : []),
          fetch(`${API_URL}/article-counts`, { headers }).then(r => r.ok ? r.json() : []),
          fetch(`${PODCAST_API_URL}?page=1&limit=9999`, { headers }).then(r => r.ok ? r.json() : {}),
        ]);

        const bMap = {};
        (Array.isArray(bookRes) ? bookRes : []).forEach(r => { bMap[r.languageId] = Number(r.bookCount || r.count || 0); });
        setBookCounts(bMap);

        const aMap = {};
        (Array.isArray(articleRes) ? articleRes : []).forEach(r => { aMap[r.languageId] = Number(r.articleCount || r.count || 0); });
        setArticleCounts(aMap);

        const pMap = {};
        const podcasts = Array.isArray(podcastRes) ? podcastRes : (podcastRes?.podcasts || podcastRes?.data || []);
        podcasts.forEach(p => {
          const code = (p.language || '').toLowerCase();
          if (code) pMap[code] = (pMap[code] || 0) + 1;
        });
        setPodcastCounts(pMap);
      } catch {
        // Keep language list usable even if counts fail
      }
    };

    fetchCounts();
  }, []);

  const handleAdded = lang => setData(prev => [...prev, lang]);
  const handleUpdated = updatedLang => setData(prev => prev.map(l => l.id === updatedLang.id ? updatedLang : l));
  const handleDeleted = id => setData(prev => prev.filter(l => l.id !== id));

  const handleDelete = async (lang) => {
    if (!window.confirm(intl.formatMessage({ id: 'UI.DILI_SILMEK_EMIN_MISINIZ' }))) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/${lang.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const responseText = await res.text();
      
      if (responseText.trim().startsWith('<!') || responseText.trim().startsWith('<html')) {
        throw new Error(intl.formatMessage({ id: 'UI.API_ENDPOINT_BULUNAMADI' }));
      }
      
      if (!res.ok) {
        let errorMessage = `${intl.formatMessage({ id: 'UI.HATA' })} ${res.status} ${res.statusText}`;
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = responseText.substring(0, 200) || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      handleDeleted(lang.id);
    } catch (err) {
      alert(`${intl.formatMessage({ id: 'UI.HATA' })} ${err.message}`);
    }
  };

  const columns = useMemo(
    () => [
      {
        id: 'flag',
        header: intl.formatMessage({ id: 'UI.BAYRAK' }),
        cell: ({ row }) => {
          const code = row.original?.code || '';
          const flagUrl = row.original?.flagUrl;

          if (flagUrl) {
            return (
              <img
                src={getMediaUrl(flagUrl)}
                alt={row.original?.name || code}
                className="h-8 w-12 rounded-sm object-cover border border-gray-200 dark:border-gray-700"
                loading="lazy"
                decoding="async"
              />
            );
          }

          return (
            <span className="text-lg leading-none" aria-hidden="true">
              {getFlagByLanguageCode(code)}
            </span>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'name',
        header: intl.formatMessage({ id: 'UI.DIL_ADI' }),
        filterFn: 'includesString',
        Filter: DefaultColumnFilter,
      },
      {
        accessorKey: 'code',
        header: intl.formatMessage({ id: 'UI.DIL_KODU' }),
        cell: ({ row }) => {
          const code = row.original?.code || '';
          const flagUrl = row.original?.flagUrl;
          return (
            <div className="flex items-center gap-2">
              {flagUrl ? (
                <img
                  src={getMediaUrl(flagUrl)}
                  alt={row.original?.name || code}
                  className="h-7 w-10 rounded-sm object-cover border border-gray-200 dark:border-gray-700"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span className="text-lg leading-none" aria-hidden="true">
                  {getFlagByLanguageCode(code)}
                </span>
              )}
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                {code}
              </span>
            </div>
          );
        },
        filterFn: 'includesString',
        Filter: DefaultColumnFilter,
      },
      {
        id: 'usageStats',
        header: intl.formatMessage({ id: 'UI.KULLANIM_ALANI' }),
        cell: ({ row }) => {
          const language = row.original;
          const bCount = bookCounts[language.id] || 0;
          const aCount = articleCounts[language.id] || 0;
          const pCount = podcastCounts[(language.code || '').toLowerCase()] || 0;

          return (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => navigate(`/kitaplar/liste?languageId=${language.id}&languageName=${encodeURIComponent(language.name)}`)}
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                title={intl.formatMessage({ id: 'UI.KITAPLARI_GORUNTULE' })}
              >
                <span>📚</span> {bCount} {intl.formatMessage({ id: 'UI.KITAP_2' })}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/makaleler/liste?languageId=${language.id}`)}
                className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 transition hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
              >
                <span>📄</span> {aCount} {intl.formatMessage({ id: 'UI.MAKALE' })}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/podcast/liste?language=${(language.code || '').toLowerCase()}`)}
                className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700 transition hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-900/50"
              >
                <span>🎙️</span> {pCount} {intl.formatMessage({ id: 'UI.PODCAST' })}
              </button>
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 text-xs"
              onClick={() => {
                setEditLanguage(row.original);
                setEditOpen(true);
              }}
            >
              <FormattedMessage id="UI.DUZENLE" />
            </button>
            <button
              className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-xs"
              onClick={() => handleDelete(row.original)}
            >
              <FormattedMessage id="UI.SIL" />
            </button>
          </div>
        ),
      },
    ],
    [bookCounts, articleCounts, podcastCounts, navigate]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) return <div className="p-6"><FormattedMessage id="UI.YUKLENIYOR" /></div>;
  if (error) return <div className="p-6 text-red-500"><FormattedMessage id="UI.HATA" /> {error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AddLanguageModal open={addOpen} onClose={() => setAddOpen(false)} onAdded={handleAdded} />
      <EditLanguageModal open={editOpen} onClose={() => setEditOpen(false)} language={editLanguage} onUpdated={handleUpdated} />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white"><FormattedMessage id="UI.KITAP_DILLERI" /></h1>
          <p className="text-gray-600 dark:text-gray-400"><FormattedMessage id="UI.KITAP_DILLERININ_LISTESI" /></p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          <FormattedMessage id="UI._DIL_EKLE" />
        </button>
      </div>
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-lg">🌐</div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400"><FormattedMessage id="UI.TOPLAM_DIL" /></p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{data.length}</p>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder={intl.formatMessage({ id: 'UI.DIL_ARA_PLACEHOLDER' })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted()] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <FormattedMessage id="UI.ILK_SAYFA" />
          </button>
          <button
            className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <FormattedMessage id="UI.ONCEKI_SAYFA" />
          </button>
          <button
            className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <FormattedMessage id="UI.SONRAKI_SAYFA" />
          </button>
          <button
            className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <FormattedMessage id="UI.SON_SAYFA" />
          </button>
        </div>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          <FormattedMessage id="UI.SAYFA" /> {table.getState().pagination.pageIndex + 1}/ {table.getPageCount()}
        </span>
      </div>
    </div>
  );
};

export default LanguageList; 