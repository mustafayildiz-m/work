import { FormattedMessage } from "react-intl";
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
  const columnFilterValue = column.getFilterValue() || '';
  return (
    <input
      type="text"
      value={columnFilterValue}
      onChange={e => column.setFilterValue(e.target.value)}
      placeholder="Filtrele..."
      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
    />
  );
}

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/languages';
const BOOKS_API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/books';

function getCoverUrl(coverImage) {
  if (!coverImage) return `${import.meta.env.BASE_URL}media/images/book-placeholder.jpg`;
  if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) return coverImage;
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
  return `${baseUrl}${coverImage.startsWith('/') ? coverImage : `/${coverImage}`}`;
}

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

function AddLanguageModal({ open, onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', code: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      
      const responseText = await res.text();
      
      if (responseText.trim().startsWith('<!') || responseText.trim().startsWith('<html')) {
        throw new Error('API endpoint bulunamadı. Lütfen backend\'in çalıştığından emin olun.');
      }
      
      if (!res.ok) {
        let errorMessage = `Hata: ${res.status} ${res.statusText}`;
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
        throw new Error(`API'den geçersiz JSON yanıtı alındı`);
      }
      onAdded(newLang);
      onClose();
      setForm({ name: '', code: '' });
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
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"><FormattedMessage id="UI.IPTAL" /></button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              {loading ? 'Ekleniyor...' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditLanguageModal({ open, onClose, language, onUpdated }) {
  const [form, setForm] = useState(language || { name: '', code: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setForm(language || { name: '', code: '' });
    setError(null);
  }, [language, open]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/${language.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: form.name, code: form.code }),
      });
      
      const responseText = await res.text();
      
      if (responseText.trim().startsWith('<!') || responseText.trim().startsWith('<html')) {
        throw new Error('API endpoint bulunamadı. Lütfen backend\'in çalıştığından emin olun.');
      }
      
      if (!res.ok) {
        let errorMessage = `Hata: ${res.status} ${res.statusText}`;
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
        throw new Error(`API'den geçersiz JSON yanıtı alındı`);
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
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"><FormattedMessage id="UI.IPTAL" /></button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const LanguageList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [languageBooks, setLanguageBooks] = useState({});
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
      console.log('🔍 API URL:', API_URL);
      try {
        const token = localStorage.getItem('access_token');
        console.log('🔑 Token durumu:', token ? 'Mevcut' : 'Bulunamadı');
        
        const res = await fetch(API_URL, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        console.log('📡 Response status:', res.status, res.statusText);
        console.log('📡 Response headers:', Object.fromEntries(res.headers.entries()));
        
        const responseText = await res.text();
        console.log('📄 Response text (ilk 200 karakter):', responseText.substring(0, 200));
        
        // Eğer response HTML ise (örn: 404 sayfası)
        if (responseText.trim().startsWith('<!') || responseText.trim().startsWith('<html')) {
          console.error('❌ HTML response alındı - API endpoint bulunamadı');
          throw new Error(`API endpoint bulunamadı. Lütfen backend'in çalıştığından ve URL'nin doğru olduğundan emin olun. (${API_URL})`);
        }
        
        if (!res.ok) {
          let errorMessage = `Hata: ${res.status} ${res.statusText}`;
          try {
            const errorJson = JSON.parse(responseText);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
          } catch {
            // JSON parse edilemediyse, text'i göster
            errorMessage = responseText.substring(0, 200) || errorMessage;
          }
          console.error('❌ API hatası:', errorMessage);
          throw new Error(errorMessage);
        }

        // JSON parse et
        let langs;
        try {
          langs = JSON.parse(responseText);
          console.log('✅ Diller başarıyla alındı:', langs.length, 'dil');
        } catch (parseError) {
          console.error('❌ JSON parse hatası:', parseError);
          throw new Error(`API'den geçersiz JSON yanıtı alındı: ${responseText.substring(0, 100)}`);
        }
        
        setData(langs);
      } catch (err) {
        console.error('❌ Diller yüklenirken hata:', err);
        console.error('📍 API URL:', API_URL);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLanguages();
  }, []);

  useEffect(() => {
    const fetchBooksForLanguages = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${BOOKS_API_URL}?page=1&limit=300`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) return;
        const result = await res.json();
        const books = Array.isArray(result) ? result : (result?.data || []);
        const map = {};

        books.forEach((book) => {
          (book.translations || []).forEach((translation) => {
            const langId = translation?.language?.id || translation?.languageId;
            if (langId && !map[langId]) {
              map[langId] = {
                id: book.id,
                title: translation?.title || book.author || 'Kitap',
                coverImage: book.coverImage || book.coverUrl || '',
                hasPdf: Boolean(translation?.pdfUrl || translation?.pdfFile),
              };
            }
          });
        });

        setLanguageBooks(map);
      } catch {
        // Keep language list usable even if preview books fail
      }
    };

    fetchBooksForLanguages();
  }, []);

  const handleAdded = lang => setData(prev => [...prev, lang]);
  const handleUpdated = updatedLang => setData(prev => prev.map(l => l.id === updatedLang.id ? updatedLang : l));
  const handleDeleted = id => setData(prev => prev.filter(l => l.id !== id));

  const handleDelete = async (lang) => {
    if (!window.confirm(`'${lang.name}' dilini silmek istediğinize emin misiniz?`)) return;
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
        throw new Error('API endpoint bulunamadı. Lütfen backend\'in çalıştığından emin olun.');
      }
      
      if (!res.ok) {
        let errorMessage = `Hata: ${res.status} ${res.statusText}`;
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
      alert('Hata: ' + err.message);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Dil Adı',
        filterFn: 'includesString',
        Filter: DefaultColumnFilter,
      },
      {
        accessorKey: 'code',
        header: 'Dil Kodu',
        cell: ({ row }) => {
          const code = row.original?.code || '';
          return (
            <div className="flex items-center gap-2">
              <span className="text-lg leading-none" aria-hidden="true">
                {getFlagByLanguageCode(code)}
              </span>
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
        id: 'previewBook',
        header: 'Dil Kitabı',
        cell: ({ row }) => {
          const language = row.original;
          const previewBook = languageBooks[language.id];

          if (!previewBook) {
            return (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Bu dilde kitap yok
              </span>
            );
          }

          return (
            <button
              type="button"
              onClick={() => navigate(`/kitaplar/liste?languageId=${language.id}&languageName=${encodeURIComponent(language.name)}`)}
              className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-2 text-left transition hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-700 dark:hover:bg-gray-700"
              title={`${language.name} kitaplarını görüntüle`}
            >
              <img
                src={getCoverUrl(previewBook.coverImage)}
                alt={previewBook.title}
                className="h-12 w-9 rounded object-cover shadow-sm"
                loading="lazy"
                decoding="async"
              />
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-gray-800 group-hover:text-blue-700 dark:text-gray-100 dark:group-hover:text-blue-300">
                  {previewBook.title}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  {previewBook.hasPdf ? 'PDF mevcut' : 'PDF yok'}
                </div>
              </div>
            </button>
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
    [languageBooks, navigate]
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
    <div className="p-6">
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
      <div className="mb-4">
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="Dil ara..."
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
            {'İlk'}
          </button>
          <button
            className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'Önceki'}
          </button>
          <button
            className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'Sonraki'}
          </button>
          <button
            className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'Son'}
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