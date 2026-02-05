import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import Select from 'react-select';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useTheme } from 'next-themes';
import { FaArrowLeft, FaUser, FaBook, FaMapMarkedAlt, FaImage, FaLink, FaSave, FaPlus, FaTimes, FaGraduationCap } from 'react-icons/fa';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/scholars`;
const BOOKS_URL = `${BASE_URL}/books`;
const AUTH_TOKEN = localStorage.getItem('access_token');

function getImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith(BASE_URL)) return url;
  return BASE_URL.replace(/\/$/, '') + (url.startsWith('/') ? url : '/' + url);
}

const AddScholarPage = () => {
  const navigate = useNavigate();
  const initialForm = {
    fullName: '',
    lineage: '',
    birthDate: '',
    deathDate: '',
    biography: '',
    photoUrl: '',
    latitude: '',
    longitude: '',
    locationName: '',
    locationDescription: '',
    ownBooks: [{ title: '', description: '', coverUrl: '', pdfUrl: '' }],
    sources: [{ content: '', url: '' }],
    relatedBooks: [],
  };
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [books, setBooks] = useState([]);
  const [portraitFile, setPortraitFile] = useState(null);
  const [portraitPreview, setPortraitPreview] = useState('');
  const [ownBookFiles, setOwnBookFiles] = useState([]);
  const [ownBookPreviews, setOwnBookPreviews] = useState([]);
  const [ownBookPdfFiles, setOwnBookPdfFiles] = useState([]);
  const [mapCenter, setMapCenter] = useState([39.9334, 32.8597]); // Türkiye merkezi
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();
  const safeTheme = theme || 'light';
  const mapRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    // Tüm kitapları çekmek için limit=1000 kullanıyoruz
    fetch(`${BOOKS_URL}?limit=1000`, { headers })
      .then(res => {
        if (res.status === 401) {
          toast.error('Oturum süresi doldu, lütfen tekrar giriş yapın.');
          return { data: [] };
        }
        return res.json();
      })
      .then(response => {
        // Backend { data: [...], pagination: {...} } formatında dönüyor
        const booksData = response?.data || response;
        setBooks(Array.isArray(booksData) ? booksData : []);
      })
      .catch(() => setBooks([]));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Dinamik kitap ve kaynak ekleme/çıkarma
  const handleOwnBookChange = (idx, field, value) => {
    const updated = form.ownBooks.map((b, i) => (i === idx ? { ...b, [field]: value } : b));
    setForm({ ...form, ownBooks: updated });
  };
  const addOwnBook = () => setForm({
    ...form,
    ownBooks: [
      ...form.ownBooks,
      { title: '', description: '', coverUrl: '', pdfUrl: '', tempId: crypto.randomUUID ? crypto.randomUUID() : (Date.now() + Math.random()) }
    ]
  });
  const removeOwnBook = idx => setForm({ ...form, ownBooks: form.ownBooks.filter((_, i) => i !== idx) });

  const handleSourceChange = (idx, field, value) => {
    const updated = form.sources.map((s, i) => (i === idx ? { ...s, [field]: value } : s));
    setForm({ ...form, sources: updated });
  };
  const addSource = () => setForm({ ...form, sources: [...form.sources, { content: '', url: '' }] });
  const removeSource = idx => setForm({ ...form, sources: form.sources.filter((_, i) => i !== idx) });

  const handleRelatedBooksChange = e => {
    const selected = Array.from(e.target.selectedOptions).map(opt => Number(opt.value));
    setForm({ ...form, relatedBooks: selected });
  };

  // Portre dosya seçimi (sadece preview)
  const handlePortraitFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPortraitFile(file);
    setPortraitPreview(URL.createObjectURL(file));
  };

  // Kendi kitapları için dosya seçimi (sadece preview)
  const handleOwnBookFile = (idx, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setOwnBookFiles(prev => {
      const arr = [...prev];
      arr[idx] = file;
      return arr;
    });
    setOwnBookPreviews(prev => {
      const arr = [...prev];
      arr[idx] = URL.createObjectURL(file);
      return arr;
    });
  };

  // Kendi kitapları için PDF dosyası seçimi
  const handleOwnBookPdfFile = (idx, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setOwnBookPdfFiles(prev => {
      const arr = [...prev];
      arr[idx] = file;
      return arr;
    });
  };

  // Nominatim ile adres arama
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
        setSelectedLocation([parseFloat(lat), parseFloat(lon)]);
        setForm(prev => ({
          ...prev,
          latitude: lat,
          longitude: lon,
          locationName: display_name
        }));
      } else {
        toast.error('Konum bulunamadı');
      }
    } catch {
      toast.error('Konum arama hatası');
    }
  };

  // Harita tıklama ile konum seçimi ve reverse geocoding
  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setSelectedLocation([lat, lng]);
        setForm(prev => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString()
        }));
        // Reverse geocoding
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.display_name) {
              setForm(prev => ({ ...prev, locationName: data.display_name }));
            }
          });
      }
    });
    return selectedLocation ? (
      <Marker position={selectedLocation} icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] })} />
    ) : null;
  }

  // Marker değiştiğinde haritayı otomatik ortalamak için
  function MapUpdater({ position }) {
    const map = useMap();
    useEffect(() => {
      if (position && !isNaN(position[0]) && !isNaN(position[1])) {
        map.setView(position, 13);
      }
    }, [position, map]);
    return null;
  }

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Lütfen giriş yapın.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('fullName', form.fullName);
      formData.append('lineage', form.lineage);
      formData.append('birthDate', form.birthDate || '');
      if (form.deathDate) {
        formData.append('deathDate', form.deathDate);
      }
      formData.append('biography', form.biography);
      if (form.latitude) formData.append('latitude', form.latitude);
      if (form.longitude) formData.append('longitude', form.longitude);
      if (form.locationName) formData.append('locationName', form.locationName);
      if (form.locationDescription) formData.append('locationDescription', form.locationDescription);
      if (portraitFile) {
        formData.append('photo', portraitFile);
      } else if (form.photoUrl) {
        formData.append('photoUrl', form.photoUrl);
      }
      form.ownBooks.forEach((book, idx) => {
        formData.append(`ownBooks[${idx}][title]`, book.title);
        formData.append(`ownBooks[${idx}][description]`, book.description);
        formData.append(`ownBooks[${idx}][pdfUrl]`, book.pdfUrl);
        if (ownBookFiles[idx]) {
          formData.append(`ownBooks[${idx}][cover]`, ownBookFiles[idx]);
        } else if (book.coverUrl) {
          formData.append(`ownBooks[${idx}][coverUrl]`, book.coverUrl);
        }
        if (ownBookPdfFiles[idx]) {
          formData.append(`ownBooks[${idx}][pdf]`, ownBookPdfFiles[idx]);
        }
      });
      form.sources.forEach((source, idx) => {
        formData.append(`sources[${idx}][content]`, source.content);
        formData.append(`sources[${idx}][url]`, source.url);
      });
      form.relatedBooks.forEach((bookId, idx) => {
        formData.append(`relatedBooks[${idx}]`, bookId);
      });
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: formData,
      });
      if (!res.ok) throw new Error('Alim eklenemedi');
      const data = await res.json();
      toast.success('Alim başarıyla eklendi!');
      navigate('/alimler/liste');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Kaydet butonunu aktif/pasif yapmak için validasyon
  const isFormValid =
    form.fullName.trim() !== '' &&
    form.biography.trim() !== '' &&
    form.ownBooks.length > 0 &&
    form.ownBooks.every(b => b.title.trim() !== '');

  return (
    <>
      <Helmet>
        <title>Yeni Âlim Ekle - Islamic Windows Admin</title>
      </Helmet>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Modern Header with Gradient */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link 
                to="/alimler/liste"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <FaArrowLeft className="text-gray-700 dark:text-gray-300" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
                    <FaGraduationCap className="text-2xl" />
                  </div>
                  Yeni Âlim Ekle
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 ml-1">
                  İslam âlimlerinin bilgilerini sisteme ekleyin
                </p>
              </div>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse" style={{ width: '25%' }} />
          </div>
        </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-semibold">Adı Soyad</label>
            <input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Adı Soyadı" className="px-3 py-2 border rounded bg-white dark:bg-gray-800" />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-semibold">Nesebi (isteğe bağlı)</label>
            <input name="lineage" value={form.lineage} onChange={handleChange} placeholder="Nesebi (isteğe bağlı)" className="px-3 py-2 border rounded bg-white dark:bg-gray-800" />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-semibold">Doğum Yılı</label>
            <input name="birthDate" value={form.birthDate} onChange={handleChange} type="text" placeholder="Doğum Yılı" className="px-3 py-2 border rounded bg-white dark:bg-gray-800" />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-semibold">Vefat Yılı (isteğe bağlı)</label>
            <input name="deathDate" value={form.deathDate} onChange={handleChange} type="text" placeholder="Vefat Yılı (isteğe bağlı)" className="px-3 py-2 border rounded bg-white dark:bg-gray-800" />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 text-xs font-semibold">Portre (URL) veya Dosya</label>
            <div className="flex gap-2 items-center">
              <input name="photoUrl" value={form.photoUrl} onChange={handleChange} placeholder="Portre (URL)" className="px-3 py-2 border rounded bg-white dark:bg-gray-800 flex-1" />
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  id="portrait-upload"
                  onChange={handlePortraitFile}
                  className="hidden"
                />
                <label htmlFor="portrait-upload" className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 transition flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0 0V8m0 4h4m-4 0H8m12 4.5V19a2 2 0 01-2 2H6a2 2 0 01-2-2v-2.5M16 3.5V5m0 0A2.5 2.5 0 0118.5 7.5h-13A2.5 2.5 0 013 5V3.5" />
                  </svg>
                  Dosya Seç
                </label>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-300">
                {portraitFile ? portraitFile.name : 'Dosya seçilmedi'}
              </span>
            </div>
            {(portraitPreview || form.photoUrl) && (
              <img src={portraitPreview || getImageUrl(form.photoUrl)} alt="Portre" className="w-16 h-16 mt-2 object-cover rounded border" />
            )}
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 text-xs font-semibold">Biyografi</label>
            <CKEditor
              editor={ClassicEditor}
              data={form.biography}
              onChange={(event, editor) => {
                const data = editor.getData();
                setForm({ ...form, biography: data });
              }}
              config={{
                toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo'],
                placeholder: 'Biyografi'
              }}
              style={{ minHeight: '500px' }}
            />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm">Kendi Kitapları</span>
            <button type="button" onClick={addOwnBook} className="text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded hover:bg-blue-200 transition">+ Kitap Ekle</button>
          </div>
          {form.ownBooks.map((book, idx) => (
            <div key={book.tempId || `ownbook-${idx}`} className="flex flex-col gap-2 mb-2 bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <input value={book.title} onChange={e => handleOwnBookChange(idx, 'title', e.target.value)} placeholder="Kitap Adı" className="px-2 py-1 border rounded bg-white dark:bg-gray-800" />
              <input value={book.coverUrl} onChange={e => handleOwnBookChange(idx, 'coverUrl', e.target.value)} placeholder="Kapak URL" className="px-2 py-1 border rounded bg-white dark:bg-gray-800" />
              <input value={book.description} onChange={e => handleOwnBookChange(idx, 'description', e.target.value)} placeholder="Açıklama" className="px-2 py-1 border rounded bg-white dark:bg-gray-800" />
              <div className="flex gap-2 items-center">
                <input value={book.pdfUrl} onChange={e => handleOwnBookChange(idx, 'pdfUrl', e.target.value)} placeholder="PDF URL (isteğe bağlı)" className="px-2 py-1 border rounded bg-white dark:bg-gray-800 flex-1" />
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    id={`ownbook-pdf-upload-${idx}`}
                    onChange={e => handleOwnBookPdfFile(idx, e)}
                    className="hidden"
                  />
                  <label htmlFor={`ownbook-pdf-upload-${idx}`} className="px-3 py-1 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600 transition flex items-center gap-1 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    PDF Seç
                  </label>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-300">
                {ownBookPdfFiles[idx] ? `PDF seçildi: ${ownBookPdfFiles[idx].name}` : 'PDF dosyası seçilmedi'}
              </div>
              <div className="flex gap-2 items-center">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    id={`ownbook-upload-${idx}`}
                    onChange={e => handleOwnBookFile(idx, e)}
                    className="hidden"
                  />
                  <label htmlFor={`ownbook-upload-${idx}`} className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 transition flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0 0V8m0 4h4m-4 0H8m12 4.5V19a2 2 0 01-2 2H6a2 2 0 01-2-2v-2.5M16 3.5V5m0 0A2.5 2.5 0 0118.5 7.5h-13A2.5 2.5 0 013 5V3.5" />
                    </svg>
                    Kapak Dosyası Seç
                  </label>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-300">
                  {ownBookFiles[idx] ? ownBookFiles[idx].name : 'Dosya seçilmedi'}
                </span>
                {(ownBookPreviews[idx] || (book.coverUrl && book.coverUrl.trim() !== '')) ? (
                  <img src={ownBookPreviews[idx] || getImageUrl(book.coverUrl)} alt="Kapak" className="w-10 h-10 object-cover rounded border" />
                ) : null}
                {form.ownBooks.length > 1 && (
                  <button type="button" onClick={() => removeOwnBook(idx)} className="text-red-500 text-xs">Sil</button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm">Kaynaklar</span>
            <button type="button" onClick={addSource} className="text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded hover:bg-blue-200 transition">+ Kaynak Ekle</button>
          </div>
          {form.sources.map((source, idx) => (
            <div key={`source-${idx}`} className="flex flex-col md:flex-row gap-2 mb-2">
              <input value={source.content} onChange={e => handleSourceChange(idx, 'content', e.target.value)} placeholder="Başlık" className="px-2 py-1 border rounded bg-white dark:bg-gray-800 flex-1" />
              <input value={source.url} onChange={e => handleSourceChange(idx, 'url', e.target.value)} placeholder="URL" className="px-2 py-1 border rounded bg-white dark:bg-gray-800 flex-1" />
              {form.sources.length > 1 && (
                <button type="button" onClick={() => removeSource(idx)} className="text-red-500 text-xs">Sil</button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label className="block font-semibold text-sm mb-2">İlişkili Kitaplar</label>
          {books.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Henüz kitap bulunmuyor. Önce kitap ekleyin.
            </div>
          ) : (
            <Select
              isMulti
              name="relatedBooks"
              options={books.map(book => ({
                value: book.id,
                label: book.translations?.[0]?.title || book.title || 'İsimsiz Kitap'
              }))}
              value={books
                .filter(b => form.relatedBooks.includes(b.id))
                .map(book => ({
                  value: book.id,
                  label: book.translations?.[0]?.title || book.title || 'İsimsiz Kitap'
                }))}
              onChange={(selectedOptions) => {
                const selectedIds = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
                setForm({ ...form, relatedBooks: selectedIds });
              }}
              placeholder="Kitap seçin..."
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                control: (base, state) => ({
                  ...base,
                  backgroundColor: safeTheme === 'dark' ? '#18181b' : '#fff',
                  borderColor: state.isFocused ? '#3b82f6' : (safeTheme === 'dark' ? '#374151' : '#d1d5db'),
                  '&:hover': {
                    borderColor: '#3b82f6'
                  }
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: safeTheme === 'dark' ? '#1f2937' : '#fff',
                  zIndex: 9999
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected 
                    ? '#3b82f6' 
                    : state.isFocused 
                      ? (safeTheme === 'dark' ? '#374151' : '#e5e7eb')
                      : (safeTheme === 'dark' ? '#1f2937' : '#fff'),
                  color: state.isSelected 
                    ? '#fff' 
                    : (safeTheme === 'dark' ? '#f3f4f6' : '#111827'),
                  '&:active': {
                    backgroundColor: '#3b82f6'
                  }
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: safeTheme === 'dark' ? '#374151' : '#e5e7eb'
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: safeTheme === 'dark' ? '#f3f4f6' : '#111827'
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: safeTheme === 'dark' ? '#f3f4f6' : '#111827',
                  '&:hover': {
                    backgroundColor: '#ef4444',
                    color: '#fff'
                  }
                }),
                input: (base) => ({
                  ...base,
                  color: safeTheme === 'dark' ? '#f3f4f6' : '#111827'
                }),
                placeholder: (base) => ({
                  ...base,
                  color: safeTheme === 'dark' ? '#9ca3af' : '#6b7280'
                }),
                singleValue: (base) => ({
                  ...base,
                  color: safeTheme === 'dark' ? '#f3f4f6' : '#111827'
                })
              }}
            />
          )}
        </div>
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">Konum Bilgileri</h4>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Konum ara..."
                className="flex-1 px-3 py-2 border rounded bg-white dark:bg-gray-800"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Ara
              </button>
            </div>
            <div className="h-[300px] rounded-lg overflow-hidden">
              <MapContainer center={mapCenter} zoom={5} style={{ width: '100%', height: '100%' }} whenCreated={mapInstance => { mapRef.current = mapInstance; }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker />
                <MapUpdater position={selectedLocation} />
              </MapContainer>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-1 text-xs font-semibold">Konum Adı</label>
                <input
                  name="locationName"
                  value={form.locationName}
                  onChange={e => setForm({ ...form, locationName: e.target.value })}
                  placeholder="Örn: İstanbul, Türkiye"
                  className="px-3 py-2 border rounded bg-white dark:bg-gray-800"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-xs font-semibold">Konum Açıklaması (İsteğe bağlı)</label>
                <input
                  name="locationDescription"
                  value={form.locationDescription}
                  onChange={e => setForm({ ...form, locationDescription: e.target.value })}
                  placeholder="Örn: Doğum yeri"
                  className="px-3 py-2 border rounded bg-white dark:bg-gray-800"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col">
                <label className="mb-1 text-xs font-semibold">Enlem (Latitude)</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={form.latitude}
                  onChange={e => {
                    setForm({ ...form, latitude: e.target.value });
                    if (e.target.value && form.longitude) {
                      const lat = parseFloat(e.target.value);
                      const lng = parseFloat(form.longitude);
                      setSelectedLocation([lat, lng]);
                      setMapCenter([lat, lng]);
                      if (mapRef.current) {
                        mapRef.current.setView([lat, lng], 13);
                      }
                    }
                  }}
                  placeholder="Örn: 39.9334"
                  className="px-3 py-2 border rounded bg-white dark:bg-gray-800"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-xs font-semibold">Boylam (Longitude)</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={form.longitude}
                  onChange={e => {
                    setForm({ ...form, longitude: e.target.value });
                    if (form.latitude && e.target.value) {
                      const lat = parseFloat(form.latitude);
                      const lng = parseFloat(e.target.value);
                      setSelectedLocation([lat, lng]);
                      setMapCenter([lat, lng]);
                      if (mapRef.current) {
                        mapRef.current.setView([lat, lng], 13);
                      }
                    }
                  }}
                  placeholder="Örn: 32.8597"
                  className="px-3 py-2 border rounded bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={() => navigate('/alimler/liste')} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">İptal</button>
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors" disabled={loading || !isFormValid}>
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
      <style>{`
        .ck-editor__editable_inline {
          min-height: 500px !important;
          background: ${safeTheme === 'dark' ? '#18181b' : '#fff'} !important;
          color: ${safeTheme === 'dark' ? '#f3f4f6' : '#18181b'} !important;
        }
      `}</style>
      </div>
    </>
  );
};

export default AddScholarPage; 