import { FormattedMessage, useIntl } from "react-intl";
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { FaMicrophone, FaPlus, FaEdit, FaTrash, FaFilter, FaTimesCircle, FaPlay, FaPause, FaEye, FaHeart, FaClock, FaStar, FaTh, FaList, FaGlobe } from 'react-icons/fa';
import { Dialog } from '@headlessui/react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/podcasts';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getCoverUrl(coverImage) {
  if (!coverImage) return null;

  // Eğer tam URL ise direkt döndür
  if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
    return coverImage;
  }

  // Relative path ise BASE_URL ile birleştir
  const baseUrl = BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
  const imagePath = coverImage.startsWith('/') ? coverImage : `/${coverImage}`;

  return `${baseUrl}${imagePath}`;
}

export default function PodcastList() {
  const intl = useIntl();
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, podcast: null });
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('podcastViewMode') || 'card');
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [audioRef, setAudioRef] = useState(null);
  const [imageErrors, setImageErrors] = useState({}); // Track failed images
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    isActive: 'all',
    language: 'all',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
  });
  const [allData, setAllData] = useState([]);
  const [languages, setLanguages] = useState([]);
  const itemsPerPage = 12;

  // View mode değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('podcastViewMode', viewMode);
  }, [viewMode]);

  const handleImageError = (podcastId) => {
    setImageErrors(prev => ({ ...prev, [podcastId]: true }));
  };

  // İstatistikler
  const stats = React.useMemo(() => {
    if (!allData || allData.length === 0) return { total: 0, active: 0, featured: 0, totalListens: 0 };

    const total = allData.length;
    const active = allData.filter(p => p.isActive).length;
    const featured = allData.filter(p => p.isFeatured).length;
    const totalListens = allData.reduce((sum, p) => sum + (p.listenCount || 0), 0);

    return { total, active, featured, totalListens };
  }, [allData]);

  // Podcastlerde bulunan dilleri filtrelemek için
  const availableLanguages = React.useMemo(() => {
    if (!allData || !languages) return [];
    // podcastlerde geçen language codelarını benzersiz şekilde topla
    const activeLanguageCodes = new Set(allData.filter(p => p.language).map(p => String(p.language).toLowerCase()));

    // languages içinden sadece bu kodlara sahip olanları filtrele
    return languages.filter(lang => lang.code && activeLanguageCodes.has(String(lang.code).toLowerCase()));
  }, [allData, languages]);

  // İlk yükleme: Tüm veriyi ve dilleri çek
  useEffect(() => {
    const token = localStorage.getItem('access_token');

    // Dilleri çek
    fetch(`${BASE_URL}/languages`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setLanguages(Array.isArray(data) ? data : []))
      .catch(() => setLanguages([]));

    // Tüm podcastleri çek
    fetch(`${API_URL}?limit=1000`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        const podcastsData = data?.podcasts || [];
        setAllData(podcastsData);
      })
      .catch(() => setAllData([]));
  }, []);

  // Filtrelenmiş veri çekme
  const fetchPodcasts = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());

      if (filters.isActive !== 'all') {
        params.append('isActive', filters.isActive);
      }
      if (filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters.language !== 'all') {
        params.append('language', filters.language);
      }

      let url = `${API_URL}?${params.toString()}`;

      // Eğer arama varsa search endpoint'ini kullan
      if (filters.search) {
        url = `${API_URL}/search?q=${encodeURIComponent(filters.search)}&page=${currentPage}&limit=${itemsPerPage}`;
        // Arama sonuçlarını da diğer filtrelerle eşleştir
        if (filters.language !== 'all') {
          url += `&language=${filters.language}`;
        }
        if (filters.category !== 'all') {
          url += `&category=${encodeURIComponent(filters.category)}`;
        }
        if (filters.isActive !== 'all') {
          url += `&isActive=${filters.isActive}`;
        }
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Podcastler yüklenemedi');

      const data = await response.json();
      setPodcasts(data.podcasts || []);
      setPagination({
        total: data.total || 0,
        totalPages: data.totalPages || 0,
        currentPage: data.currentPage || currentPage,
      });
    } catch (error) {
      toast.error('Podcastler yüklenirken bir hata oluştu');
      setPodcasts([]);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, itemsPerPage]);

  // Filtreler değiştiğinde sayfa 1'e dön
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPodcasts();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchPodcasts]);

  const handleDelete = async () => {
    if (!deleteModal.podcast) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/${deleteModal.podcast.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Silme işlemi başarısız');

      toast.success('Podcast başarıyla silindi!');
      setDeleteModal({ open: false, podcast: null });

      // Listeyi güncelle
      setAllData(prev => prev.filter(p => p.id !== deleteModal.podcast.id));

      // Verileri yeniden çek (pagination için)
      fetchPodcasts();
    } catch (error) {
      toast.error('Podcast silinemedi!');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAudioUrl = (audioUrl) => {
    if (!audioUrl) return '';
    if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) return audioUrl;
    return BASE_URL.replace(/\/$/, '') + (audioUrl.startsWith('/') ? audioUrl : '/' + audioUrl);
  };

  const togglePlay = (podcast) => {
    if (currentlyPlaying?.id === podcast.id) {
      if (audioRef) audioRef.pause();
      setCurrentlyPlaying(null);
    } else {
      if (audioRef) audioRef.pause();
      setCurrentlyPlaying(podcast);
    }
  };

  useEffect(() => {
    if (currentlyPlaying && audioRef) {
      const audioUrl = getAudioUrl(currentlyPlaying.audioUrl);
      audioRef.src = audioUrl;
      audioRef.play().catch((err) => {
        console.error('Audio play error:', err);
        toast.error('Ses çalınamadı');
      });
    }
  }, [currentlyPlaying, audioRef]);

  const categories = ['Hadis', 'Fıkıh', 'Tefsir', 'Siyer', 'Akaid', 'Tasavvuf', 'Genel'];

  return (
    <>
      <Helmet>
        <title>{intl.formatMessage({
          id: "UI.PODCAST_YONETIMI__ISLAMIC_WINDOWS_ADMIN"
        })}</title>
      </Helmet>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Audio Player (Hidden) */}
        <audio
          ref={(ref) => setAudioRef(ref)}
          onEnded={() => setCurrentlyPlaying(null)}
          onError={() => {
            toast.error('Ses dosyası yüklenemedi');
            setCurrentlyPlaying(null);
          }}
          style={{ display: 'none' }}
        />

        {/* Sticky Mini Player */}
        {currentlyPlaying && (
          <div className="fixed top-20 right-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 border-2 border-purple-200 dark:border-purple-700 z-50 w-80">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 flex-shrink-0">
                {currentlyPlaying.coverImage && getCoverUrl(currentlyPlaying.coverImage) && !imageErrors[currentlyPlaying.id] ? (
                  <img
                    src={getCoverUrl(currentlyPlaying.coverImage)}
                    alt={currentlyPlaying.title}
                    className="w-full h-full object-cover rounded-lg"
                    onError={() => handleImageError(currentlyPlaying.id)}
                  />
                ) : (
                  <div className="w-full h-full bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <FaMicrophone className="text-purple-500 text-2xl" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h6 className="font-bold text-sm text-gray-900 dark:text-white truncate">{currentlyPlaying.title}</h6>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{currentlyPlaying.author}</p>
              </div>
              <button
                onClick={() => togglePlay(currentlyPlaying)}
                className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all"
              >
                <FaPause className="text-lg" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white"><FormattedMessage id="UI.PODCAST_YONETIMI" /></h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1"><FormattedMessage id="UI.TUM_PODCASTLERI_YONETIN_VE_DUZENLEYIN" /></p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('card')}
                className={`px-4 py-2 rounded-md transition-all duration-200 flex items-center gap-2 ${viewMode === 'card'
                  ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-400'
                  }`}
              >
                <FaTh /> <FormattedMessage id="UI.KART" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-md transition-all duration-200 flex items-center gap-2 ${viewMode === 'table'
                  ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-400'
                  }`}
              >
                <FaList /> <FormattedMessage id="UI.LISTE" />
              </button>
            </div>
            <Link
              to="/podcast/ekle"
              className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold shadow-lg hover:bg-purple-700 hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <FaPlus /> <FormattedMessage id="UI.PODCAST_EKLE" />
            </Link>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium"><FormattedMessage id="UI.TOPLAM_PODCAST" /></p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <FaMicrophone className="text-5xl text-purple-200 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium"><FormattedMessage id="UI.AKTIF" /></p>
                <p className="text-3xl font-bold mt-1">{stats.active}</p>
              </div>
              <FaPlay className="text-5xl text-green-200 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium"><FormattedMessage id="UI.ONE_CIKAN" /></p>
                <p className="text-3xl font-bold mt-1">{stats.featured}</p>
              </div>
              <FaStar className="text-5xl text-yellow-200 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium"><FormattedMessage id="UI.TOPLAM_DINLENME" /></p>
                <p className="text-3xl font-bold mt-1">{stats.totalListens}</p>
              </div>
              <FaEye className="text-5xl text-blue-200 opacity-30" />
            </div>
          </div>
        </div>

        {/* Filtreleme Alanı */}
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 border border-purple-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-600 rounded-lg">
                <FaFilter className="text-white text-lg" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white"><FormattedMessage id="UI.FILTRELE__ARA" /></h3>
            </div>

            {/* Dil Badge'leri */}
            {availableLanguages.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, language: 'all' }))}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-300 ${filters.language === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                    }`}
                >
                  <FormattedMessage id="UI.TUM_DILLER" />
                </button>
                {availableLanguages.map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => setFilters(prev => ({ ...prev, language: lang.code }))}
                    className={`px-4 py-1.5 text-xs font-bold uppercase rounded-full transition-all duration-300 shadow-sm ${filters.language === lang.code
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                      }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FaMicrophone className="text-purple-600" />
                <FormattedMessage id="UI.PODCAST_BASLIGI__YAZAR" />
              </label>
              <input
                type="text"
                placeholder={intl.formatMessage({ id: 'UI.ARA_PLACEHOLDER' })}
                value={filters.search}
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FormattedMessage id="UI.KATEGORI" />
              </label>
              <select
                value={filters.category}
                onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition cursor-pointer"
              >
                <option value="all"><FormattedMessage id="UI.TUM_KATEGORILER" /></option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FormattedMessage id="UI.DURUM" />
              </label>
              <select
                value={filters.isActive}
                onChange={e => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition cursor-pointer"
              >
                <option value="all"><FormattedMessage id="UI.TUM_DURUMLAR" /></option>
                <option value="true"><FormattedMessage id="UI.AKTIF" /></option>
                <option value="false"><FormattedMessage id="UI.PASIF" /></option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-purple-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400"><FormattedMessage id="UI.BULUNAN" /></span>
              <span className="px-3 py-1 bg-purple-600 text-white rounded-full font-bold">
                {podcasts.length}
              </span>
              <span className="text-gray-600 dark:text-gray-400"><FormattedMessage id="UI.PODCAST" /></span>
            </div>

            {(filters.search || filters.category !== 'all' || filters.isActive !== 'all' || filters.language !== 'all') && (
              <button
                onClick={() => setFilters({ search: '', category: 'all', isActive: 'all', language: 'all' })}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-medium text-sm flex items-center gap-2"
              >
                <FaTimesCircle />
                <FormattedMessage id="UI.FILTRELERI_TEMIZLE" />
              </button>
            )}
          </div>
        </div>

        {/* Podcast Listesi */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-purple-600 mb-4"></div>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-medium"><FormattedMessage id="UI.PODCASTLER_YUKLENIYOR" /></p>
            </div>
          </div>
        ) : podcasts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <FaMicrophone className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              {filters.search || filters.category !== 'all' || filters.isActive !== 'all' || filters.language !== 'all'
                ? 'Arama kriterlerine uygun podcast bulunamadı'
                : 'Henüz podcast eklenmemiş'}
            </h3>
            {!filters.search && filters.category === 'all' && filters.isActive === 'all' && filters.language === 'all' && (
              <Link
                to="/podcast/ekle"
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                <FaPlus /> <FormattedMessage id="UI.ILK_PODCASTI_EKLE" />
              </Link>
            )}
          </div>
        ) : viewMode === 'card' ? (
          /* Card View */
          (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {podcasts.map(podcast => (
              <div key={podcast.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 group">
                {/* Cover Image */}
                <div className="relative h-48 bg-gradient-to-br from-purple-400 to-pink-400">
                  {podcast.coverImage && getCoverUrl(podcast.coverImage) && !imageErrors[podcast.id] ? (
                    <img
                      src={getCoverUrl(podcast.coverImage)}
                      alt={podcast.title}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(podcast.id)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaMicrophone className="text-6xl text-white opacity-50" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    {podcast.isFeatured && (
                      <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-lg">
                        <FaStar size={10} /> <FormattedMessage id="UI.ONE_CIKAN" />
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs font-bold rounded-lg shadow-lg ${podcast.isActive
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-500 text-white'
                      }`}>
                      {podcast.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 flex-1 pr-2">
                      {podcast.title}
                    </h3>
                    {/* Play Button */}
                    <button
                      onClick={() => togglePlay(podcast)}
                      className="flex-shrink-0 p-3 bg-purple-600 rounded-full text-white hover:bg-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                      title={currentlyPlaying?.id === podcast.id ? 'Duraklat' : 'Çal'}
                    >
                      {currentlyPlaying?.id === podcast.id ? (
                        <FaPause className="text-sm" />
                      ) : (
                        <FaPlay className="text-sm ml-0.5" />
                      )}
                    </button>
                  </div>

                  {podcast.author && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <FaMicrophone className="text-purple-500" size={12} />
                      {podcast.author}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-3">
                    {podcast.category && (
                      <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full">
                        {podcast.category}
                      </span>
                    )}
                    {podcast.language && (
                      <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase rounded-full">
                        {podcast.language}
                      </span>
                    )}
                  </div>

                  {podcast.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {podcast.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="flex items-center gap-1">
                      <FaClock size={14} />
                      {formatDuration(podcast.duration)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaEye size={14} />
                      {podcast.listenCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaHeart size={14} className="text-red-500" />
                      {podcast.likeCount || 0}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      to={`/podcast/duzenle/${podcast.id}`}
                      className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-200 text-center font-semibold flex items-center justify-center gap-2"
                    >
                      <FaEdit /> <FormattedMessage id="UI.DUZENLE" />
                    </Link>
                    <button
                      onClick={() => setDeleteModal({ open: true, podcast })}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                    >
                      <FaTrash /> <FormattedMessage id="UI.SIL" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>)
        ) : (
          /* Table View */
          (<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      <FormattedMessage id="UI.PODCAST_1" />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      <FormattedMessage id="UI.KATEGORI" />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      <FormattedMessage id="USER.MENU.LANGUAGE" />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      <FormattedMessage id="UI.ISTATISTIKLER" />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      <FormattedMessage id="UI.DURUM" />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      <FormattedMessage id="UI.ISLEMLER" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {podcasts.map(podcast => (
                    <tr key={podcast.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-16 flex-shrink-0">
                            {podcast.coverImage && getCoverUrl(podcast.coverImage) && !imageErrors[podcast.id] ? (
                              <img
                                src={getCoverUrl(podcast.coverImage)}
                                alt={podcast.title}
                                className="w-full h-full object-cover rounded-lg"
                                onError={() => handleImageError(podcast.id)}
                              />
                            ) : (
                              <div className="w-full h-full bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                                <FaMicrophone className="text-purple-500" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white truncate">{podcast.title}</h4>
                            {podcast.author && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{podcast.author}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {podcast.category && (
                          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full">
                            {podcast.category}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-gray-100 uppercase font-semibold">
                          {podcast.language}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <FaClock size={12} className="text-blue-500" />
                            {formatDuration(podcast.duration)}
                          </span>
                          <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <FaEye size={12} className="text-green-500" />
                            {podcast.listenCount || 0} <FormattedMessage id="UI.DINLENME" />
                          </span>
                          <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <FaHeart size={12} className="text-red-500" />
                            {podcast.likeCount || 0} <FormattedMessage id="UI.BEGENI_1" />
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {podcast.isFeatured && (
                            <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded flex items-center gap-1 w-fit">
                              <FaStar size={10} /> <FormattedMessage id="UI.ONE_CIKAN" />
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs font-bold rounded w-fit ${podcast.isActive
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-500 text-white'
                            }`}>
                            {podcast.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => togglePlay(podcast)}
                            className={`p-2 rounded-lg transition-all duration-200 ${currentlyPlaying?.id === podcast.id
                              ? 'bg-purple-700 text-white hover:bg-purple-800'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                              }`}
                            title={currentlyPlaying?.id === podcast.id ? 'Duraklat' : 'Çal'}
                          >
                            {currentlyPlaying?.id === podcast.id ? <FaPause /> : <FaPlay />}
                          </button>
                          <Link
                            to={`/podcast/duzenle/${podcast.id}`}
                            className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-200"
                            title="Düzenle"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => setDeleteModal({ open: true, podcast })}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                            title="Sil"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>)
        )}

        {/* Pagination */}
        {!loading && podcasts.length > 0 && pagination.totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Pagination Info */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <FormattedMessage id="UI.GOSTERILEN" /> <span className="font-semibold text-gray-900 dark:text-white">
                {((currentPage - 1) * itemsPerPage) + 1}
              </span>- <span className="font-semibold text-gray-900 dark:text-white">
                {Math.min(currentPage * itemsPerPage, pagination.total)}
              </span>/ <span className="font-semibold text-gray-900 dark:text-white">
                {pagination.total}
              </span> <FormattedMessage id="UI.PODCAST" />
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center gap-2">
              {/* First Page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg font-medium transition-all ${currentPage === 1
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900 border border-gray-300 dark:border-gray-600'
                  }`}
                title="İlk Sayfa"
              >
                <span className="sr-only"><FormattedMessage id="UI.ILK" /></span>
                ««
              </button>

              {/* Previous Page */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg font-medium transition-all ${currentPage === 1
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900 border border-gray-300 dark:border-gray-600'
                  }`}
                title="Önceki Sayfa"
              >
                <span className="sr-only"><FormattedMessage id="UI.ONCEKI" /></span>
                «
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {[...Array(pagination.totalPages)].map((_, index) => {
                  const pageNumber = index + 1;

                  // Show first page, last page, current page and 2 pages around current
                  if (
                    pageNumber === 1 ||
                    pageNumber === pagination.totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-all ${currentPage === pageNumber
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900 border border-gray-300 dark:border-gray-600'
                          }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <span key={pageNumber} className="px-2 text-gray-500 dark:text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Next Page */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={currentPage === pagination.totalPages}
                className={`px-3 py-2 rounded-lg font-medium transition-all ${currentPage === pagination.totalPages
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900 border border-gray-300 dark:border-gray-600'
                  }`}
                title="Sonraki Sayfa"
              >
                <span className="sr-only"><FormattedMessage id="UI.SONRAKI" /></span>
                »
              </button>

              {/* Last Page */}
              <button
                onClick={() => setCurrentPage(pagination.totalPages)}
                disabled={currentPage === pagination.totalPages}
                className={`px-3 py-2 rounded-lg font-medium transition-all ${currentPage === pagination.totalPages
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900 border border-gray-300 dark:border-gray-600'
                  }`}
                title="Son Sayfa"
              >
                <span className="sr-only"><FormattedMessage id="UI.SON" /></span>
                »»
              </button>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        <Dialog
          as="div"
          className="relative z-50"
          open={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, podcast: null })}
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-md rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-2xl transform transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <FaTrash className="text-red-600 dark:text-red-400 text-xl" />
                </div>
                <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  <FormattedMessage id="UI.PODCASTI_SIL" />
                </Dialog.Title>
              </div>

              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-bold text-red-600 dark:text-red-400">"{deleteModal.podcast?.title}"</span> <FormattedMessage id="UI.BASLIKLI_PODCASTI_SILMEK_UZERESINIZ" />
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  <FormattedMessage id="UI._BU_ISLEM_GERI_ALINAMAZ_VE_TUM_ILGILI_VE" />
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteModal({ open: false, podcast: null })}
                  className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
                >
                  <FormattedMessage id="UI.IPTAL" />
                </button>
                <button
                  onClick={handleDelete}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  <FormattedMessage id="UI.EVET_SIL" />
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </>
  );
}

