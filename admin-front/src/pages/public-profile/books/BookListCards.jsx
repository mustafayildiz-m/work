import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = API_BASE_URL + '/books';

const getBookImage = (book) => {
  if (book.coverImage) {
    const url = book.coverImage.startsWith('http') ? book.coverImage : `${API_BASE_URL}${book.coverImage}`;
    return url;
  }
  if (book.coverUrl) {
    const url = book.coverUrl.startsWith('http') ? book.coverUrl : `${API_BASE_URL}${book.coverUrl}`;
    return url;
  }
  return `${import.meta.env.BASE_URL}media/images/book-placeholder.jpg`;
};

const getPdfUrl = (pdfUrl) => {
  if (!pdfUrl) return '';
  if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
    return pdfUrl;
  }
  return API_BASE_URL.replace(/\/$/, '') + (pdfUrl.startsWith('/') ? pdfUrl : '/' + pdfUrl);
};

// Book Detail Modal Component
const BookDetailModal = ({ book, onClose }) => {
  const navigate = useNavigate();
  if (!book) return null;

  const coverUrl = getBookImage(book);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold z-10"
          aria-label="Kapat"
        >
          ×
        </button>

        {/* Content */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Book Cover */}
          {coverUrl && (
            <div className="flex-shrink-0">
              <img
                src={coverUrl}
                alt={book.title}
                className="w-full md:w-64 h-auto object-cover rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.target.src = `${import.meta.env.BASE_URL}media/images/book-placeholder.jpg`;
                }}
              />
            </div>
          )}

          {/* Book Details */}
          <div className="flex-1 space-y-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {book.title}
            </h2>

            <div className="space-y-3">
              {/* Author */}
              <div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Yazar:</span>
                <p className="text-base text-gray-900 dark:text-white">{book.author || 'Bilinmeyen'}</p>
              </div>

              {/* Categories */}
              {book.categories && book.categories.length > 0 && (
                <div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Kategoriler:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {book.categories.map((cat, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Publish Date */}
              {book.publishDate && (
                <div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Yayın Tarihi:</span>
                  <p className="text-base text-gray-900 dark:text-white">
                    {new Date(book.publishDate).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              )}

              {/* Description */}
              {book.description && (
                <div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Açıklama:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{book.description}</p>
                </div>
              )}

              {/* Summary */}
              {book.summary && (
                <div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Özet:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{book.summary}</p>
                </div>
              )}

              {/* Translations */}
              {book.translations && book.translations.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Çeviriler ve PDF'ler:
                    </span>
                    <button
                      onClick={() => {
                        onClose();
                        navigate(`/kitaplar/duzenle/${book.id}`);
                      }}
                      className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      Düzenle
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {book.translations.map((trans, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              🌍 {trans.language?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {trans.title}
                            </div>
                          </div>
                        </div>
                        {(trans.pdfUrl || trans.pdfFile) ? (
                          <a
                            href={getPdfUrl(trans.pdfUrl || trans.pdfFile)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition"
                          >
                            📄 PDF Görüntüle
                          </a>
                        ) : (
                          <div className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-sm rounded cursor-not-allowed">
                            📄 PDF Yok
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookListCards = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [pagination, setPagination] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    // localStorage'dan oku, yoksa varsayılan 'grid'
    return localStorage.getItem('bookListViewMode') || 'grid';
  });
  const [showCategories, setShowCategories] = useState(() => {
    // localStorage'dan oku, yoksa varsayılan true
    const saved = localStorage.getItem('bookListShowCategories');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    // Arama için debounce
    const timeoutId = setTimeout(() => {
      fetchBooks();
    }, searchQuery ? 500 : 0); // Arama varsa 500ms bekle

    return () => clearTimeout(timeoutId);
  }, [currentPage, itemsPerPage, selectedCategory, searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // viewMode değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('bookListViewMode', viewMode);
  }, [viewMode]);

  // showCategories değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('bookListShowCategories', showCategories.toString());
  }, [showCategories]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/books/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      // Error handled silently
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');

      // URL parametrelerini oluştur
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });

      // Kategori seçiliyse ekle
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      // Arama varsa ekle
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`${API_URL}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Kitaplar alınamadı');

      const result = await response.json();
      const booksData = Array.isArray(result) ? result : (result?.data || []);

      // Pagination bilgisini kaydet
      if (result?.pagination) {
        setPagination(result.pagination);
      }

      // Transform books - title'ı translations'dan al
      const transformedBooks = booksData.map(book => ({
        ...book,
        title: book.translations?.[0]?.title || book.author || 'Başlıksız',
        description: book.translations?.[0]?.description || '',
        summary: book.translations?.[0]?.summary || '',
      }));

      setBooks(transformedBooks);
    } catch (err) {
      setError(err.message);
      toast.error('Kitaplar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu kitabı silmek istediğinize emin misiniz?')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Kitap silinemedi');

      setBooks(prev => prev.filter(book => book.id !== id));
      toast.success('Kitap başarıyla silindi');
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Backend'ten filtrelenmiş kitaplar geliyor, frontend'te filtreleme yok
  const filteredBooks = books;

  // Sayfa değiştirme
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sayfa başına öğe sayısı değiştirme
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // İlk sayfaya dön
  };

  // Kategori değiştirme
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // İlk sayfaya dön
  };

  // Arama değiştirme (debounce ile backend'e gönderilecek)
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1); // İlk sayfaya dön
  };

  return (
    <>
      <Helmet>
        <title>Kitap Listesi - Islamic Windows Admin</title>
      </Helmet>

      <div className="p-6 max-w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kitap Listesi</h2>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                title="Kart Görünümü"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${viewMode === 'list'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                title="Liste Görünümü"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate('/kitaplar/ekle')}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
          >
            + Kitap Ekle
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Kitap ara... (başlık, yazar, açıklama)"
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            {searchQuery && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Backend'de arama yapılıyor...
              </p>
            )}
          </div>

          {/* Category Filter - Collapsible */}
          {categories.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Kategoriler
                  </span>
                  {selectedCategory && (
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                      {selectedCategory}
                    </span>
                  )}
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${showCategories ? 'transform rotate-180' : ''
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showCategories && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCategoryChange('')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedCategory === ''
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                      Tümü
                    </button>
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => handleCategoryChange(category)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedCategory === category
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  {selectedCategory && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      🏷️ Backend'den "{selectedCategory}" kategorisi filtreleniyor
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{pagination?.totalCount || 0}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Toplam Kitap</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{filteredBooks.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Bu Sayfada</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{categories.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Kategori</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-orange-600">{pagination?.totalPages || 0}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Sayfa</div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Kitaplar yükleniyor...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredBooks.length === 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-8 text-center">
            <p className="text-blue-800 dark:text-blue-200 text-lg">
              {searchQuery || selectedCategory ? 'Arama kriterlerine uygun kitap bulunamadı' : 'Henüz kitap eklenmemiş'}
            </p>
          </div>
        )}

        {/* Books Grid/List */}
        {!loading && !error && filteredBooks.length > 0 && (
          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            : "space-y-4"
          }>
            {filteredBooks.map((book) => viewMode === 'grid' ? (
              // Grid View (Card)
              <div
                key={book.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => setSelectedBook(book)}
              >
                {/* Book Cover */}
                <div className="relative h-64 bg-gray-200 dark:bg-gray-700">
                  <img
                    src={getBookImage(book)}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.target.src = `${import.meta.env.BASE_URL}media/images/book-placeholder.jpg`;
                    }}
                  />
                  {/* Hover overlay with actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBook(book);
                      }}
                      className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                    >
                      Detay
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/kitaplar/duzenle/${book.id}`);
                      }}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(book.id);
                      }}
                      className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                    >
                      Sil
                    </button>
                  </div>
                </div>

                {/* Book Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {book.author || 'Bilinmeyen Yazar'}
                  </p>

                  {/* Categories */}
                  {book.categories && book.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {book.categories.slice(0, 2).map((cat, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                        >
                          {cat}
                        </span>
                      ))}
                      {book.categories.length > 2 && (
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                          +{book.categories.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Translations with PDF indicators */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {book.translations?.slice(0, 3).map((trans, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${trans.pdfUrl || trans.pdfFile
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}
                        title={`${trans.title} ${trans.pdfUrl || trans.pdfFile ? '(PDF mevcut)' : '(PDF yok)'}`}
                      >
                        {trans.language?.name || trans.language?.code || 'N/A'}
                        {(trans.pdfUrl || trans.pdfFile) && <span className="text-[10px]">📄</span>}
                      </span>
                    ))}
                    {book.translations && book.translations.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                        +{book.translations.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Publish Date */}
                  {book.publishDate && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      📅 {new Date(book.publishDate).toLocaleDateString('tr-TR')}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              // List View
              <div
                key={book.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => setSelectedBook(book)}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 gap-4">
                  {/* Book Cover */}
                  <div className="flex-shrink-0 w-20 h-28 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                    <img
                      src={getBookImage(book)}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.src = `${import.meta.env.BASE_URL}media/images/book-placeholder.jpg`;
                      }}
                    />
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                        {book.title}
                      </h3>
                      <span className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        ID: {book.id}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      👤 {book.author || 'Bilinmeyen Yazar'}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {/* Categories */}
                      {book.categories && book.categories.length > 0 && (
                        <>
                          {book.categories.slice(0, 3).map((cat, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                            >
                              {cat}
                            </span>
                          ))}
                          {book.categories.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                              +{book.categories.length - 3}
                            </span>
                          )}
                        </>
                      )}

                      {book.publishDate && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          📅 {new Date(book.publishDate).toLocaleDateString('tr-TR')}
                        </span>
                      )}
                    </div>

                    {/* Translations with PDF buttons */}
                    {book.translations && book.translations.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold mr-1">🌍 Diller:</span>
                        {book.translations.map((trans, idx) => (
                          <div key={idx} className="inline-flex items-center gap-1">
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                              {trans.language?.name || trans.language?.code || 'N/A'}
                            </span>
                            {(trans.pdfUrl || trans.pdfFile) && (
                              <a
                                href={getPdfUrl(trans.pdfUrl || trans.pdfFile)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition"
                                title={`${trans.language?.name} PDF'i aç`}
                              >
                                📄
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex-shrink-0 flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBook(book);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition"
                    >
                      Detay
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/kitaplar/duzenle/${book.id}`);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(book.id);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && !error && pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            {/* Sayfa başına öğe seçici */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sayfa başına:</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={12}>12</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Sayfa bilgisi */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Sayfa {pagination.currentPage} / {pagination.totalPages} ({pagination.totalCount} kitap)
            </div>

            {/* Sayfa numaraları */}
            <div className="flex items-center gap-2">
              {/* İlk sayfa */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ««
              </button>

              {/* Önceki sayfa */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPreviousPage}
                className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                «
              </button>

              {/* Sayfa numaraları */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded-md border transition ${currentPage === pageNum
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Sonraki sayfa */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                »
              </button>

              {/* Son sayfa */}
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                »»
              </button>
            </div>
          </div>
        )}

        {/* Book Detail Modal */}
        {selectedBook && (
          <BookDetailModal
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
          />
        )}
      </div>
    </>
  );
};

export default BookListCards;

