import React, { useMemo, useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { Dialog } from '@headlessui/react';
import { Fragment } from 'react';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaNewspaper, FaBook, FaGlobe, FaFilter, FaEdit, FaTrash, FaTimesCircle, FaPlus, FaImage, FaUser, FaCalendar } from 'react-icons/fa';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/articles';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getCoverUrl(coverImage) {
  if (!coverImage) return '';
  if (
    coverImage.startsWith('http://') ||
    coverImage.startsWith('https://') ||
    coverImage.startsWith(BASE_URL)
  ) {
    return coverImage;
  }
  return BASE_URL.replace(/\/$/, '') + (coverImage.startsWith('/') ? coverImage : '/' + coverImage);
}

const columns = [
  {
    accessorKey: 'coverImage',
    header: 'Kapak',
    cell: info => {
      const coverUrl = getCoverUrl(info.getValue());
      return coverUrl ? (
        <img
          src={coverUrl}
          alt="Kapak"
          className="w-14 h-14 object-cover rounded shadow border border-gray-200 dark:border-gray-700"
        />
      ) : null;
    },
    enableSorting: false,
    enableColumnFilter: false,
    size: 80,
  },
  {
    accessorKey: 'title',
    header: 'Başlık',
    cell: info => (
      <div className="flex items-center gap-2">
        <FaNewspaper className="text-blue-500 flex-shrink-0" />
        <span className="font-semibold text-gray-900 dark:text-gray-100">{info.getValue()}</span>
      </div>
    ),
  },
  {
    accessorKey: 'author',
    header: 'Yazar',
    cell: info => (
      <div className="flex items-center gap-2">
        <FaUser className="text-green-500 flex-shrink-0" />
        <span className="text-gray-700 dark:text-gray-300">{info.getValue() || '-'}</span>
      </div>
    ),
  },
  {
    accessorKey: 'bookTitle',
    header: 'Kitap',
    cell: info => (
      <div className="flex items-center gap-2">
        <FaBook className="text-purple-500 flex-shrink-0" />
        <span className="text-gray-700 dark:text-gray-300">{info.getValue()}</span>
      </div>
    ),
  },
  {
    accessorKey: 'translations',
    header: 'Diller',
    cell: info => (
      <div className="flex flex-wrap gap-1">
        {(info.getValue() || []).map(trans => (
          <span
            key={trans.languageId}
            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
          >
            {trans.language?.name || trans.language?.code}
          </span>
        ))}
      </div>
    ),
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'publishDate',
    header: 'Yayın Tarihi',
    cell: info => {
      const date = info.getValue();
      return date ? new Date(date).toLocaleDateString('tr-TR') : '-';
    },
  },
];

function ArticleList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    languageId: 'all',
    bookId: 'all',
  });
  
  // Options for dropdowns
  const [languages, setLanguages] = useState([]);
  const [books, setBooks] = useState([]);
  
  // All data for statistics
  const [allData, setAllData] = useState([]);
  
  // İstatistikler
  const stats = React.useMemo(() => {
    if (!allData || allData.length === 0) return { total: 0, totalBooks: 0, totalLanguages: 0 };
    
    const total = allData.length;
    const totalBooks = new Set(allData.map(a => a.bookId).filter(Boolean)).size;
    const totalLanguages = new Set(
      allData.flatMap(a => a.translations?.map(t => t.languageId) || [])
    ).size;
    
    return { total, totalBooks, totalLanguages };
  }, [allData]);

  // Fetch languages, books and all data for stats on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    const fetchWithErrorHandling = async (url, name) => {
      try {
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        const text = await res.text();
        
        if (text.trim().startsWith('<!') || text.trim().startsWith('<html')) {
          console.error(`❌ ${name} için HTML response alındı - API endpoint bulunamadı: ${url}`);
          return null;
        }
        
        if (!res.ok) {
          console.error(`❌ ${name} yüklenirken hata: ${res.status} ${res.statusText}`);
          return null;
        }
        
        return JSON.parse(text);
      } catch (err) {
        console.error(`❌ ${name} yüklenirken hata:`, err);
        return null;
      }
    };
    
    Promise.all([
      fetchWithErrorHandling(`${BASE_URL}/languages`, 'Diller'),
      fetchWithErrorHandling(`${BASE_URL}/books?limit=1000`, 'Kitaplar'),
      fetchWithErrorHandling(`${API_URL}?limit=1000`, 'Makaleler'),
    ]).then(([langs, booksResp, articlesResp]) => {
      if (langs) setLanguages(Array.isArray(langs) ? langs : []);
      if (booksResp) {
        const booksData = booksResp?.data || booksResp;
        setBooks(Array.isArray(booksData) ? booksData : []);
      }
      if (articlesResp) {
        const articlesData = articlesResp?.data || [];
        const processedAll = articlesData.map(article => ({
          ...article,
          title: article.translations?.[0]?.title || 'İsimsiz Makale',
          bookTitle: article.book?.translations?.[0]?.title || article.book?.author || '-',
        }));
        setAllData(processedAll);
      }
    }).catch((err) => {
      console.error('İlk veri yükleme hatası:', err);
    });
  }, []);

  // Fetch filtered articles
  const fetchArticles = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      params.append('limit', '1000');
      
      if (filters.search) params.append('search', filters.search);
      if (filters.languageId !== 'all') params.append('languageId', filters.languageId);
      if (filters.bookId !== 'all') params.append('bookIds', filters.bookId);
      
      const url = `${API_URL}?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const responseText = await response.text();
      
      if (responseText.trim().startsWith('<!') || responseText.trim().startsWith('<html')) {
        throw new Error(`API endpoint bulunamadı. Lütfen backend'in çalıştığından emin olun. (${url})`);
      }

      if (!response.ok) {
        let errorMessage = `Hata: ${response.status} ${response.statusText}`;
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = responseText.substring(0, 200) || errorMessage;
        }
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`API'den geçersiz JSON yanıtı alındı`);
      }
      
      const articles = result.data || [];

      const processedData = articles.map(article => ({
        ...article,
        title: article.translations?.[0]?.title || 'İsimsiz Makale',
        bookTitle: article.book?.translations?.[0]?.title || article.book?.author || '-',
      }));

      setData(processedData);
    } catch (err) {
      console.error('❌ Makaleler yüklenirken hata:', err);
      setError(err.message);
      toast.error('Makaleler yüklenemedi!');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArticles();
    }, 300); // Debounce

    return () => clearTimeout(timer);
  }, [fetchArticles]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 20 },
    },
  });

  const handleDelete = async () => {
    if (!selectedArticle) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/${selectedArticle.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const responseText = await response.text();
      
      if (responseText.trim().startsWith('<!') || responseText.trim().startsWith('<html')) {
        throw new Error('API endpoint bulunamadı. Lütfen backend\'in çalıştığından emin olun.');
      }

      if (!response.ok) {
        let errorMessage = `Hata: ${response.status} ${response.statusText}`;
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = responseText.substring(0, 200) || errorMessage;
        }
        throw new Error(errorMessage);
      }

      toast.success('Makale başarıyla silindi!');
      setDeleteModalOpen(false);
      setSelectedArticle(null);
      
      // Update both data and allData
      setData(prev => prev.filter(a => a.id !== selectedArticle.id));
      setAllData(prev => prev.filter(a => a.id !== selectedArticle.id));
    } catch (err) {
      console.error('❌ Makale silme hatası:', err);
      toast.error(err.message || 'Makale silinemedi!');
    }
  };

  const openDeleteModal = (article) => {
    setSelectedArticle(article);
    setDeleteModalOpen(true);
  };

  const handleEdit = (article) => {
    navigate(`/makaleler/duzenle/${article.id}`);
  };

  const openPreviewModal = (article) => {
    setSelectedArticle(article);
    setPreviewModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Makale Yönetimi - Islamic Windows Admin</title>
      </Helmet>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Makale Yönetimi</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tüm makalelerinizi yönetin ve düzenleyin</p>
          </div>
          <Link
            to="/makaleler/ekle"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <span className="text-lg">+</span> Makale Ekle
          </Link>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Toplam Makale</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
                <p className="text-blue-100 text-xs mt-1">Kayıtlı makale</p>
              </div>
              <FaNewspaper className="text-5xl text-blue-200 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">İlişkili Kitap</p>
                <p className="text-3xl font-bold mt-1">{stats.totalBooks}</p>
                <p className="text-purple-100 text-xs mt-1">Farklı kitap</p>
              </div>
              <FaBook className="text-5xl text-purple-200 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Dil Çeşitliliği</p>
                <p className="text-3xl font-bold mt-1">{stats.totalLanguages}</p>
                <p className="text-green-100 text-xs mt-1">Farklı dil</p>
              </div>
              <FaGlobe className="text-5xl text-green-200 opacity-30" />
            </div>
          </div>
        </div>

        {/* Filtreleme Alanı */}
        <div className="mb-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 border border-orange-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-orange-600 rounded-lg">
              <FaFilter className="text-white text-lg" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filtrele & Ara</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Başlık Arama */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FaNewspaper className="text-blue-600" />
                Makale Başlığı
              </label>
              <input
                type="text"
                placeholder="Başlık ara..."
                value={filters.search}
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition"
              />
            </div>

            {/* Dil */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FaGlobe className="text-green-600" />
                Dil
              </label>
              <select
                value={filters.languageId}
                onChange={e => setFilters(prev => ({ ...prev, languageId: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition cursor-pointer"
              >
                <option value="all">Tüm Diller</option>
                {languages.map(lang => (
                  <option key={lang.id} value={lang.id}>{lang.name}</option>
                ))}
              </select>
            </div>

            {/* Kitap */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FaBook className="text-purple-600" />
                Kitap
              </label>
              <select
                value={filters.bookId}
                onChange={e => setFilters(prev => ({ ...prev, bookId: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition cursor-pointer"
              >
                <option value="all">Tüm Kitaplar</option>
                {books.map(book => (
                  <option key={book.id} value={book.id}>
                    {book.translations?.[0]?.title || book.author || `Kitap #${book.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Button & Results Count */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-orange-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Bulunan:</span>
              <span className="px-3 py-1 bg-orange-600 text-white rounded-full font-bold">
                {data.length}
              </span>
              <span className="text-gray-600 dark:text-gray-400">makale</span>
            </div>
            
            {(filters.search || filters.languageId !== 'all' || filters.bookId !== 'all') && (
              <button
                onClick={() => setFilters({ search: '', languageId: 'all', bookId: 'all' })}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-medium text-sm flex items-center gap-2"
              >
                <FaTimesCircle />
                Filtreleri Temizle
              </button>
            )}
          </div>
        </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
          ⚠️ Hata: {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-blue-600 mb-4"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">Makaleler yükleniyor...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider"
                          style={{ width: header.getSize() }}
                        >
                          {header.isPlaceholder ? null : (
                            <div
                              className={
                                header.column.getCanSort()
                                  ? 'cursor-pointer select-none flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
                                  : 'flex items-center gap-2'
                              }
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                {header.column.getCanSort() && (
                                  <span className="ml-2 text-blue-500">
                                    {{
                                      asc: '↑',
                                      desc: '↓',
                                    }[header.column.getIsSorted()] ?? '↕'}
                                  </span>
                                )}
                              </div>
                          )}
                        </th>
                      ))}
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <FaNewspaper className="text-6xl text-gray-300 dark:text-gray-600" />
                          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
                            {filters.search || filters.languageId !== 'all' || filters.bookId !== 'all'
                              ? 'Arama kriterlerine uygun makale bulunamadı'
                              : 'Henüz makale eklenmemiş'}
                          </p>
                          {!filters.search && filters.languageId === 'all' && filters.bookId === 'all' && (
                            <Link
                              to="/makaleler/ekle"
                              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <span className="text-lg">+</span> İlk Makaleyi Ekle
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map(row => (
                      <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        {row.getVisibleCells().map(cell => (
                          <td
                            key={cell.id}
                            className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100"
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openPreviewModal(row.original)}
                              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 hover:shadow-lg"
                              title="Önizleme"
                            >
                              <FaNewspaper />
                            </button>
                            <button
                              onClick={() => handleEdit(row.original)}
                              className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-200 hover:shadow-lg"
                              title="Düzenle"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => openDeleteModal(row.original)}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 hover:shadow-lg"
                              title="Sil"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {table.getPageCount() > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Toplam <span className="font-bold text-blue-600 dark:text-blue-400">{data.length}</span> makale içinden{' '}
                <span className="font-bold">
                  {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                </span>
                {' '}-{' '}
                <span className="font-bold">
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    data.length
                  )}
                </span>
                {' '}arası gösteriliyor
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all disabled:cursor-not-allowed shadow-sm"
                  title="İlk Sayfa"
                >
                  «
                </button>
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all disabled:cursor-not-allowed shadow-sm"
                >
                  Önceki
                </button>
                <div className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-sm">
                  {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                </div>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all disabled:cursor-not-allowed shadow-sm"
                >
                  Sonraki
                </button>
                <button
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all disabled:cursor-not-allowed shadow-sm"
                  title="Son Sayfa"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      <Dialog
        as="div"
        className="relative z-50"
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
      >
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <Dialog.Panel className="mx-auto max-w-4xl w-full rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transform transition-all my-8">
            {selectedArticle && (
              <div className="max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Dialog.Title className="text-2xl font-bold text-white mb-2">
                        {selectedArticle.title}
                      </Dialog.Title>
                      <div className="flex flex-wrap gap-3 text-white/90 text-sm">
                        {selectedArticle.author && (
                          <div className="flex items-center gap-1">
                            <FaUser className="text-white/70" />
                            <span>{selectedArticle.author}</span>
                          </div>
                        )}
                        {selectedArticle.publishDate && (
                          <div className="flex items-center gap-1">
                            <FaCalendar className="text-white/70" />
                            <span>{new Date(selectedArticle.publishDate).toLocaleDateString('tr-TR')}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <FaBook className="text-white/70" />
                          <span>{selectedArticle.bookTitle}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setPreviewModalOpen(false)}
                      className="ml-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <FaTimesCircle className="text-white text-xl" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Cover Image */}
                  {selectedArticle.coverImage && (
                    <div className="flex justify-center">
                      <img
                        src={getCoverUrl(selectedArticle.coverImage)}
                        alt={selectedArticle.title}
                        className="max-w-md w-full h-auto rounded-lg shadow-lg"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Translations */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FaGlobe className="text-blue-500" />
                      Çeviriler
                    </h3>
                    <div className="space-y-4">
                      {selectedArticle.translations?.map((trans) => (
                        <div
                          key={trans.id}
                          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                                {trans.language?.name || trans.language?.code}
                              </span>
                              <h4 className="font-bold text-gray-900 dark:text-white">
                                {trans.title}
                              </h4>
                            </div>
                            {trans.pdfUrl && (
                              <a
                                href={`${BASE_URL}${trans.pdfUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                              >
                                📄 PDF
                              </a>
                            )}
                          </div>
                          {trans.summary && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 italic">
                              {trans.summary}
                            </p>
                          )}
                          <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4">
                            {trans.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={() => {
                        setPreviewModalOpen(false);
                        handleEdit(selectedArticle);
                      }}
                      className="flex-1 px-4 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                    >
                      <FaEdit />
                      Düzenle
                    </button>
                    <button
                      onClick={() => setPreviewModalOpen(false)}
                      className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        as="div"
        className="relative z-50"
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      >
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-2xl transform transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <FaTrash className="text-red-600 dark:text-red-400 text-xl" />
              </div>
              <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Makaleyi Sil
              </Dialog.Title>
            </div>
            
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-bold text-red-600 dark:text-red-400">"{selectedArticle?.title}"</span> başlıklı makaleyi silmek üzeresiniz.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                ⚠️ Bu işlem geri alınamaz ve tüm ilgili veriler kalıcı olarak silinecektir.
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Evet, Sil
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
    </>
  );
}

export default ArticleList;

