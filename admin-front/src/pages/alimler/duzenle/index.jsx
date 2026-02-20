import { FormattedMessage, useIntl } from "react-intl";
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import Select from 'react-select';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useTheme } from 'next-themes';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/scholars`;
const BOOKS_URL = `${BASE_URL}/books`;

function getImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith(BASE_URL)) return url;
  return BASE_URL.replace(/\/$/, '') + (url.startsWith('/') ? url : '/' + url);
}

const EditScholarPage = () => {
  const intl = useIntl();
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
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
    ownBooks: [],
    sources: [],
    relatedBooks: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [books, setBooks] = useState([]);
  const [portraitFile, setPortraitFile] = useState(null);
  const [portraitPreview, setPortraitPreview] = useState('');
  const [ownBookFiles, setOwnBookFiles] = useState([]);
  const [ownBookPreviews, setOwnBookPreviews] = useState([]);
  const [ownBookPdfFiles, setOwnBookPdfFiles] = useState([]);
  const [mapCenter, setMapCenter] = useState([39.9334, 32.8597]);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();
  const safeTheme = theme || 'light';

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Yetkilendirme token\'ı bulunamadı');
      setLoading(false);
      return;
    }

    // Alim bilgilerini çek
    fetch(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Alim bilgileri alınamadı');
        return res.json();
      })
      .then(data => {
        setForm({
          fullName: data.fullName || '',
          lineage: data.lineage || '',
          birthDate: data.birthDate ? data.birthDate.slice(0, 10) : '',
          deathDate: data.deathDate ? data.deathDate.slice(0, 10) : '',
          biography: data.biography || '',
          photoUrl: data.photoUrl || '',
          locationName: data.locationName || '',
          locationDescription: data.locationDescription || '',
          latitude: data.latitude || '',
          longitude: data.longitude || '',
          ownBooks: (data.ownBooks || []).map(b => ({
            id: b.id,
            title: b.title || '',
            description: b.description || '',
            coverUrl: b.coverUrl || '',
            pdfUrl: b.pdfUrl || '',
          })),
          sources: (data.sources || []).map(s => ({ content: s.content || '', url: s.url || '' })),
          relatedBooks: (data.relatedBooks || []).map(b => b.id),
        });
        setPortraitPreview(data.photoUrl ? getImageUrl(data.photoUrl) : '');
        if (data.latitude && data.longitude) {
          setMapCenter([parseFloat(data.latitude), parseFloat(data.longitude)]);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });

    // Kitapları çek - Tüm kitapları çekmek için limit=1000 kullanıyoruz
    fetch(`${BOOKS_URL}?limit=1000`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(response => {
        // Backend { data: [...], pagination: {...} } formatında dönüyor
        const booksData = response?.data || response;
        setBooks(Array.isArray(booksData) ? booksData : []);
      })
      .catch(() => setBooks([]));
  }, [id]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

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

  const handlePortraitFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPortraitFile(file);
    setPortraitPreview(URL.createObjectURL(file));
  };

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
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

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
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
    return form.latitude && form.longitude ? (
      <Marker position={[parseFloat(form.latitude), parseFloat(form.longitude)]} icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] })} />
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
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Yetkilendirme token\'ı bulunamadı');
      }

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
        formData.append(`ownBooks[${idx}][pdfUrl]`, book.pdfUrl || '');
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
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Alim güncellenemedi');
      const data = await res.json();
      toast.success('Alim başarıyla güncellendi!');
      navigate('/alimler/liste');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const isFormValid =
    form.fullName.trim() !== '' &&
    form.biography.trim() !== '' &&
    form.ownBooks.length > 0 &&
    form.ownBooks.every(b => b.title.trim() !== '');

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-10"><FormattedMessage id="UI.YUKLENIYOR" /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-10 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{intl.formatMessage({
          id: "UI.LIM_DUZENLE__ISLAMIC_WINDOWS_ADMIN"
        })}</title>
      </Helmet>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold"><FormattedMessage id="UI.ALIM_DUZENLE" /></h2>
        <button
          onClick={() => navigate('/alimler/liste')}
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        >
          <FormattedMessage id="UI.GERI_DON" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-semibold"><FormattedMessage id="UI.ADI_SOYAD" /></label>
            <input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Adı" className="px-3 py-2 border rounded bg-white dark:bg-gray-800" />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-semibold"><FormattedMessage id="UI.NESEBI_ISTEGE_BAGLI" /></label>
            <input name="lineage" value={form.lineage} onChange={handleChange} placeholder="Nesebi (isteğe bağlı)" className="px-3 py-2 border rounded bg-white dark:bg-gray-800" />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-semibold"><FormattedMessage id="UI.DOGUM_YILI" /></label>
            <input name="birthDate" value={form.birthDate} onChange={handleChange} type="text" placeholder="Doğum Yılı" className="px-3 py-2 border rounded bg-white dark:bg-gray-800" />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-semibold"><FormattedMessage id="UI.VEFAT_YILI_ISTEGE_BAGLI" /></label>
            <input name="deathDate" value={form.deathDate} onChange={handleChange} type="text" placeholder="Vefat Yılı (isteğe bağlı)" className="px-3 py-2 border rounded bg-white dark:bg-gray-800" />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 text-xs font-semibold"><FormattedMessage id="UI.PORTRE_URL_VEYA_DOSYA" /></label>
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
                  <FormattedMessage id="UI.DOSYA_SEC" />
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
            <label className="mb-1 text-xs font-semibold"><FormattedMessage id="UI.BIYOGRAFI" /></label>
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
            <span className="font-semibold text-sm"><FormattedMessage id="UI.KENDI_KITAPLARI" /></span>
            <button type="button" onClick={addOwnBook} className="text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded hover:bg-blue-200 transition"><FormattedMessage id="UI._KITAP_EKLE" /></button>
          </div>
          {form.ownBooks.map((book, idx) => (
            <div key={book.tempId || `ownbook-${idx}`} className="flex flex-col gap-2 mb-2 bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <input value={book.title} onChange={e => handleOwnBookChange(idx, 'title', e.target.value)} placeholder="Kitap Adı" className="px-2 py-1 border rounded bg-white dark:bg-gray-800" />
              <input value={book.description || ''} onChange={e => handleOwnBookChange(idx, 'description', e.target.value)} placeholder="Açıklama" className="px-2 py-1 border rounded bg-white dark:bg-gray-800" />
              <input value={book.coverUrl || ''} onChange={e => handleOwnBookChange(idx, 'coverUrl', e.target.value)} placeholder="Kapak URL" className="px-2 py-1 border rounded bg-white dark:bg-gray-800" />
              <div className="flex gap-2 items-center">
                <input value={book.pdfUrl || ''} onChange={e => handleOwnBookChange(idx, 'pdfUrl', e.target.value)} placeholder="PDF URL (isteğe bağlı)" className="px-2 py-1 border rounded bg-white dark:bg-gray-800 flex-1" />
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
                    <FormattedMessage id="UI.PDF_SEC" />
                  </label>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-300">
                {ownBookPdfFiles[idx] ? `PDF seçildi: ${ownBookPdfFiles[idx].name}` : 'PDF dosyası seçilmedi'}
              </div>
              {form.ownBooks.length > 1 && (
                <button type="button" onClick={() => removeOwnBook(idx)} className="text-red-500 text-xs"><FormattedMessage id="UI.SIL" /></button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm"><FormattedMessage id="UI.KAYNAKLAR" /></span>
            <button type="button" onClick={addSource} className="text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded hover:bg-blue-200 transition"><FormattedMessage id="UI._KAYNAK_EKLE" /></button>
          </div>
          {form.sources.map((source, idx) => (
            <div key={`source-${idx}`} className="flex flex-col md:flex-row gap-2 mb-2">
              <input value={source.content} onChange={e => handleSourceChange(idx, 'content', e.target.value)} placeholder="Başlık" className="px-2 py-1 border rounded bg-white dark:bg-gray-800 flex-1" />
              <input value={source.url} onChange={e => handleSourceChange(idx, 'url', e.target.value)} placeholder="URL" className="px-2 py-1 border rounded bg-white dark:bg-gray-800 flex-1" />
              {form.sources.length > 1 && (
                <button type="button" onClick={() => removeSource(idx)} className="text-red-500 text-xs"><FormattedMessage id="UI.SIL" /></button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label className="block font-semibold text-sm mb-2"><FormattedMessage id="UI.ILISKILI_KITAPLAR" /></label>
          {books.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              <FormattedMessage id="UI.HENUZ_KITAP_BULUNMUYOR_ONCE_KITAP_EKLEYI" />
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
          <h4 className="text-sm font-semibold mb-2"><FormattedMessage id="UI.KONUM_BILGILERI" /></h4>
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
                <FormattedMessage id="UI.ARA" />
              </button>
            </div>
            <div className="h-[300px] rounded-lg overflow-hidden">
              <MapContainer center={mapCenter} zoom={5} style={{ width: '100%', height: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker />
                <MapUpdater position={form.latitude && form.longitude ? [parseFloat(form.latitude), parseFloat(form.longitude)] : null} />
              </MapContainer>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-1 text-xs font-semibold"><FormattedMessage id="UI.KONUM_ADI" /></label>
                <input
                  name="locationName"
                  value={form.locationName}
                  onChange={e => setForm({ ...form, locationName: e.target.value })}
                  placeholder="Örn: İstanbul, Türkiye"
                  className="px-3 py-2 border rounded bg-white dark:bg-gray-800"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-xs font-semibold"><FormattedMessage id="UI.KONUM_ACIKLAMASI_ISTEGE_BAGLI" /></label>
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
                <label className="mb-1 text-xs font-semibold"><FormattedMessage id="UI.ENLEM_LATITUDE" /></label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={form.latitude}
                  onChange={e => {
                    setForm({ ...form, latitude: e.target.value });
                  }}
                  placeholder="Örn: 39.9334"
                  className="px-3 py-2 border rounded bg-white dark:bg-gray-800"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-xs font-semibold"><FormattedMessage id="UI.BOYLAM_LONGITUDE" /></label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={form.longitude}
                  onChange={e => {
                    setForm({ ...form, longitude: e.target.value });
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
          <button type="button" onClick={() => navigate('/alimler/liste')} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"><FormattedMessage id="UI.IPTAL" /></button>
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors" disabled={saving || !isFormValid}>
            {saving ? 'Güncelleniyor...' : 'Güncelle'}
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

export default EditScholarPage; 