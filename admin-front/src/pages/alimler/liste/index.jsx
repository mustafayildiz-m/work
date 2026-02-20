import { FormattedMessage, useIntl } from "react-intl";
import React, { useMemo, useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { Dialog } from '@headlessui/react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, BookOpen, Edit, Trash2, Eye, FileText, ChevronLeft, ChevronRight, Grid3x3, List } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/scholars`;
const BOOKS_URL = `${BASE_URL}/books`;
const AUTH_TOKEN = localStorage.getItem('access_token');

function DefaultColumnFilter({ column }) {
  const columnFilterValue = column.getFilterValue() || '';
  return (
    <input
      type="text"
      value={columnFilterValue}
      onChange={e => column.setFilterValue(e.target.value)}
      placeholder={`Filtrele...`}
      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
    />
  );
}

function getImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith(BASE_URL)) return url;
  return BASE_URL.replace(/\/$/, '') + (url.startsWith('/') ? url : '/' + url);
}

function AddScholarModal({ open, onClose, onAdd }) {
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
  const [mapCenter, setMapCenter] = useState([39.9334, 32.8597]); // Türkiye merkezi
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (open) {
      setForm(initialForm);
      setError(null);
      setLoading(false);
      setPortraitFile(null);
      setPortraitPreview('');
      setOwnBookFiles([]);
      setOwnBookPreviews([]);
      // Kitapları çek
      fetch(BOOKS_URL, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      })
        .then(res => res.json())
        .then(data => setBooks(data))
        .catch(() => setBooks([]));
    }
    // eslint-disable-next-line
  }, [open]);

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
        toast.error(intl.formatMessage({ id: "UI.KONUM_BULUNAMADI" }));
      }
    } catch {
      toast.error(intl.formatMessage({ id: "UI.KONUM_ARAMA_HATASI" }));
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

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
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
      // Kendi kitapları
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
      // Kaynaklar
      form.sources.forEach((source, idx) => {
        formData.append(`sources[${idx}][content]`, source.content);
        formData.append(`sources[${idx}][url]`, source.url);
      });
      // İlişkili kitaplar (id dizisi)
      form.relatedBooks.forEach((bookId, idx) => {
        formData.append(`relatedBooks[${idx}]`, bookId);
      });
      // POST /scholars
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error(intl.formatMessage({ id: "UI.ALIM_EKLENEMEDI" }));
      const data = await res.json();
      onAdd(data);
      toast.success(intl.formatMessage({ id: "UI.ALIM_BASARIYLA_EKLENDI" }));
      onClose();
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
    form.ownBooks.every(b => b.title.trim() !== '' && b.description.trim() !== '');

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={onClose}>
      <form
        onClick={e => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-3xl w-full p-6 relative animate-fade-in overflow-y-auto max-h-[90vh]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
          aria-label={intl.formatMessage({ id: "UI.KAPAT" })}
        >
          ×
        </button>
        <h3 className="text-lg font-bold mb-4 text-center"><FormattedMessage id="UI.ALIM_EKLE_1" /> <span className="text-xs font-normal"><FormattedMessage id="UI.NESEBI_VE_VEFAT_YILI_ISTEGE_BAGLI_1" /></span></h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-semibold"><FormattedMessage id="UI.ADI" /></label>
            <input name="fullName" value={form.fullName} onChange={handleChange} required placeholder={intl.formatMessage({ id: "UI.ADI" })} className="px-3 py-2 border rounded bg-white dark:bg-gray-800" />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-semibold"><FormattedMessage id="UI.NESEBI_ISTEGE_BAGLI" /></label>
            <input name="lineage" value={form.lineage} onChange={handleChange} placeholder={intl.formatMessage({ id: "UI.NESEBI_ISTEGE_BAGLI" })} className="px-3 py-2 border rounded bg-white dark:bg-gray-800" />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-semibold"><FormattedMessage id="UI.DOGUM_YILI" /></label>
            <input name="birthDate" value={form.birthDate} onChange={handleChange} type="date" placeholder={intl.formatMessage({ id: "UI.DOGUM_YILI" })} className="px-3 py-2 border rounded bg-white dark:bg-gray-800" />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-semibold"><FormattedMessage id="UI.VEFAT_YILI_ISTEGE_BAGLI" /></label>
            <input name="deathDate" value={form.deathDate} onChange={handleChange} type="date" placeholder={intl.formatMessage({ id: "UI.VEFAT_YILI_ISTEGE_BAGLI" })} className="px-3 py-2 border rounded bg-white dark:bg-gray-800" />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 text-xs font-semibold"><FormattedMessage id="UI.PORTRE_URL_VEYA_DOSYA" /></label>
            <div className="flex gap-2 items-center">
              <input name="photoUrl" value={form.photoUrl} onChange={handleChange} placeholder={intl.formatMessage({ id: "UI.PORTRE" })} className="px-3 py-2 border rounded bg-white dark:bg-gray-800 flex-1" />
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
                {portraitFile ? portraitFile.name : <FormattedMessage id="UI.DOSYA_SECILMADI" />}
              </span>
            </div>
            {(portraitPreview || form.photoUrl) && (
              <img src={portraitPreview || getImageUrl(form.photoUrl)} alt="Portre" className="w-16 h-16 mt-2 object-cover rounded border" />
            )}
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 text-xs font-semibold"><FormattedMessage id="UI.BIYOGRAFI" /></label>
            <textarea name="biography" value={form.biography} onChange={handleChange} placeholder={intl.formatMessage({ id: "UI.BIYOGRAFI" })} className="px-3 py-2 border rounded bg-white dark:bg-gray-800" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm"><FormattedMessage id="UI.KENDI_KITAPLARI" /></span>
            <button type="button" onClick={addOwnBook} className="text-xs text-blue-500"><FormattedMessage id="UI._KITAP_EKLE" /></button>
          </div>
          {form.ownBooks.map((book, idx) => (
            <div key={book.tempId || `ownbook-${idx}`} className="flex flex-col gap-2 mb-2 bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <input value={book.title} onChange={e => handleOwnBookChange(idx, 'title', e.target.value)} placeholder={intl.formatMessage({ id: "UI.BASLIK" })} className="px-2 py-1 border rounded bg-white dark:bg-gray-800" />
              <input value={book.coverUrl} onChange={e => handleOwnBookFile(idx, e.target.value)} placeholder={intl.formatMessage({ id: "UI.KAPAK_URL" })} className="px-2 py-1 border rounded bg-white dark:bg-gray-800" />
              <input value={book.description} onChange={e => handleOwnBookChange(idx, 'description', e.target.value)} placeholder={intl.formatMessage({ id: "UI.ACIKLAMA" })} className="px-2 py-1 border rounded bg-white dark:bg-gray-800" />
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
                    <FormattedMessage id="UI.PDF_SEC" />
                  </label>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-300">
                {ownBookPdfFiles[idx] ? `${intl.formatMessage({ id: "UI.PDF_SEC" })}: ${ownBookPdfFiles[idx].name}` : <FormattedMessage id="UI.PDF_DOSYASI_SECILMADI" />}
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
                    <FormattedMessage id="UI.KAPAK_DOSYASI_SEC" />
                  </label>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-300">
                  {ownBookFiles[idx] ? ownBookFiles[idx].name : <FormattedMessage id="UI.DOSYA_SECILMADI" />}
                </span>
                {(ownBookPreviews[idx] || (book.coverUrl && book.coverUrl.trim() !== '')) ? (
                  <img src={ownBookPreviews[idx] || getImageUrl(book.coverUrl)} alt="Kapak" className="w-10 h-10 object-cover rounded border" />
                ) : null}
                {form.ownBooks.length > 1 && (
                  <button type="button" onClick={() => removeOwnBook(idx)} className="text-red-500 text-xs"><FormattedMessage id="UI.SIL" /></button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm"><FormattedMessage id="UI.KAYNAKLAR" /></span>
            <button type="button" onClick={addSource} className="text-xs text-blue-500"><FormattedMessage id="UI._KAYNAK_EKLE" /></button>
          </div>
          {form.sources.map((source, idx) => (
            <div key={`source-${idx}`} className="flex flex-col md:flex-row gap-2 mb-2">
              <input value={source.content} onChange={e => handleSourceChange(idx, 'content', e.target.value)} placeholder={intl.formatMessage({ id: "UI.BASLIK" })} className="px-2 py-1 border rounded bg-white dark:bg-gray-800 flex-1" />
              <input value={source.url} onChange={e => handleSourceChange(idx, 'url', e.target.value)} placeholder="URL" className="px-2 py-1 border rounded bg-white dark:bg-gray-800 flex-1" />
              {form.sources.length > 1 && (
                <button type="button" onClick={() => removeSource(idx)} className="text-red-500 text-xs"><FormattedMessage id="UI.SIL" /></button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label className="block font-semibold text-sm mb-2"><FormattedMessage id="UI.ILISKILI_KITAPLAR" /></label>
          <div className="flex flex-wrap gap-2 mb-2">
            {books.filter(b => form.relatedBooks.includes(b.id)).map(book => (
              <span key={`selected-book-${book.id}`} className="inline-flex items-center bg-primary-600 text-white rounded-full px-3 py-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, relatedBooks: form.relatedBooks.filter(id => id !== book.id) })}
                  className="mr-1 text-white hover:text-red-300 font-bold"
                  style={{ fontSize: '1.1em' }}
                  aria-label={intl.formatMessage({ id: "UI.KALDIR" })}
                >
                  -
                </button>
                {book.title}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {books.filter(b => !form.relatedBooks.includes(b.id)).map(book => (
              <span key={`available-book-${book.id}`} className="inline-flex items-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full px-3 py-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, relatedBooks: [...form.relatedBooks, book.id] })}
                  className="mr-1 text-primary-600 hover:text-primary-800 font-bold"
                  style={{ fontSize: '1.1em' }}
                  aria-label={intl.formatMessage({ id: "UI.EKLE" })}
                >
                  +
                </button>
                {book.title}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2"><FormattedMessage id="UI.KONUM_BILGILERI" /></h4>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={intl.formatMessage({ id: "UI.KONUM_ARA" })}
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
              </MapContainer>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="mb-1 text-xs font-semibold"><FormattedMessage id="UI.KONUM_ADI" /></label>
                <input
                  name="locationName"
                  value={form.locationName}
                  onChange={e => setForm({ ...form, locationName: e.target.value })}
                  placeholder={intl.formatMessage({ id: "UI.ORN_ISTANBUL_TURKIYE" })}
                  className="px-3 py-2 border rounded bg-white dark:bg-gray-800"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-xs font-semibold"><FormattedMessage id="UI.KONUM_ACIKLAMASI_ISTEGE_BAGLI" /></label>
                <input
                  name="locationDescription"
                  value={form.locationDescription}
                  onChange={e => setForm({ ...form, locationDescription: e.target.value })}
                  placeholder={intl.formatMessage({ id: "UI.ORN_DOGUM_YERI" })}
                  className="px-3 py-2 border rounded bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"><FormattedMessage id="UI.KAPAT" /></button>
          <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white font-semibold" disabled={loading || !isFormValid}>
            {loading ? <FormattedMessage id="UI.KAYDEDILIYOR" /> : <FormattedMessage id="UI.KAYDET" />}
          </button>
        </div>
      </form>
    </div>
  );
}

const ScholarPreviewModal = ({ scholar, onClose }) => {
  const [coverPreview, setCoverPreview] = React.useState(null);
  if (!scholar) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-2xl w-full p-6 relative animate-fade-in overflow-y-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
          aria-label={intl.formatMessage({ id: "UI.KAPAT" })}
        >
          ×
        </button>
        <div className="flex flex-col items-center gap-4">
          {scholar.photoUrl && (
            <img
              src={getImageUrl(scholar.photoUrl)}
              alt={scholar.fullName}
              className="w-32 h-32 object-cover rounded shadow border border-gray-200 dark:border-gray-700 mb-2"
            />
          )}
          <h3 className="text-xl font-bold mb-1 text-center">{scholar.fullName}</h3>
          <div className="text-sm text-gray-700 dark:text-gray-200 mb-2 text-center">
            {scholar.lineage && <><span className="font-semibold"><FormattedMessage id="UI.NESEBI" /></span> {scholar.lineage}<br /></>}
            {scholar.birthDate && <><span className="font-semibold"><FormattedMessage id="UI.DOGUM_YILI_1" /></span> {scholar.birthDate.slice(0, 10)}<br /></>}
            {scholar.deathDate && <><span className="font-semibold"><FormattedMessage id="UI.VEFAT_YILI" /></span> {scholar.deathDate.slice(0, 10)}<br /></>}
          </div>
          <div className="w-full text-sm text-gray-700 dark:text-gray-200 mb-2">
            <span className="font-semibold"><FormattedMessage id="UI.BIYOGRAFI_1" /></span>
            <div
              className="ml-2 mt-1 prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: scholar.biography }}
            />
          </div>
          {scholar.ownBooks && scholar.ownBooks.length > 0 && (
            <div className="w-full text-sm text-gray-700 dark:text-gray-200 mb-2">
              <span className="font-semibold"><FormattedMessage id="UI.KENDI_KITAPLARI_1" /></span>
              <ul className="ml-4 mt-1 list-disc">
                {scholar.ownBooks.map((b, i) => {
                  // coverUrl kontrolü - uploads/ ile başlıyorsa tam URL oluştur
                  const coverImageUrl = b.coverUrl
                    ? (b.coverUrl.startsWith('http://') || b.coverUrl.startsWith('https://')
                      ? b.coverUrl
                      : getImageUrl(b.coverUrl))
                    : null;

                  return (
                    <li key={b.id ? b.id : b.tempId ? b.tempId : `ownBook_${i}_${b.title}`}
                      className="flex items-start gap-2 mb-2">
                      {coverImageUrl ? (
                        <img
                          src={coverImageUrl}
                          alt={b.title}
                          className="w-10 h-10 object-cover rounded border cursor-pointer transition-transform hover:scale-105"
                          onClick={() => setCoverPreview(coverImageUrl)}
                          onError={(e) => {
                            // Resim yüklenemezse default kitap ikonu göster
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      {/* Fallback icon - resim yoksa veya yüklenemezse */}
                      <div
                        className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded border flex items-center justify-center text-gray-500 dark:text-gray-400"
                        style={{ display: coverImageUrl ? 'none' : 'flex' }}
                      >
                        📚
                      </div>
                      <div>
                        <div>
                          <span className="font-semibold">{b.title}</span>
                          {b.description && <>: {b.description}</>}
                        </div>
                        {b.pdfUrl && (
                          <a
                            href={b.pdfUrl.startsWith('http://') || b.pdfUrl.startsWith('https://') ? b.pdfUrl : getImageUrl(b.pdfUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline text-xs hover:text-blue-700"
                          >
                            <FormattedMessage id="UI._PDF_INDIR" />
                          </a>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {scholar.sources && scholar.sources.length > 0 && (
            <div className="w-full text-sm text-gray-700 dark:text-gray-200 mb-2">
              <span className="font-semibold"><FormattedMessage id="UI.KAYNAKLAR_1" /></span>
              <ul className="ml-4 mt-1 list-disc">
                {scholar.sources.map((s, i) => (
                  <li key={s.id || i}>
                    {s.content}
                    {s.url && (
                      <>
                        {' '}
                        <a
                          href={s.url.startsWith('http://') || s.url.startsWith('https://') ? s.url : `https://${s.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          <FormattedMessage id="UI.KAYNAK_LINKI" />
                        </a>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {scholar.relatedBooks && scholar.relatedBooks.length > 0 && (
            <div className="w-full text-sm text-gray-700 dark:text-gray-200 mb-2">
              <span className="font-semibold"><FormattedMessage id="UI.ILISKILI_KITAPLAR_1" /></span>
              <ul className="ml-4 mt-1 list-disc">
                {scholar.relatedBooks.map((b, i) => {
                  const bookTitle = b.translations?.[0]?.title || b.title || intl.formatMessage({ id: "UI.ISIMSIZ_KITAP" });
                  const pdfUrl = b.translations?.[0]?.pdfUrl || b.pdfUrl;
                  // Cover image URL'sini al
                  const coverUrl = b.coverImage || b.coverUrl;
                  const coverImageUrl = coverUrl
                    ? (coverUrl.startsWith('http://') || coverUrl.startsWith('https://')
                      ? coverUrl
                      : getImageUrl(coverUrl))
                    : null;

                  return (
                    <li key={b.id ? b.id : b.tempId ? b.tempId : `relatedBook_${i}_${bookTitle}`}
                      className="flex items-start gap-2 mb-2">
                      {coverImageUrl ? (
                        <img
                          src={coverImageUrl}
                          alt={bookTitle}
                          className="w-10 h-10 object-cover rounded border cursor-pointer transition-transform hover:scale-105"
                          onClick={() => setCoverPreview(coverImageUrl)}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      {/* Fallback icon */}
                      <div
                        className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded border flex items-center justify-center text-gray-500 dark:text-gray-400"
                        style={{ display: coverImageUrl ? 'none' : 'flex' }}
                      >
                        📚
                      </div>
                      <div>
                        <div>
                          <span className="font-semibold">{bookTitle}</span>
                        </div>
                        {pdfUrl && (
                          <a
                            href={pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://') ? pdfUrl : getImageUrl(pdfUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline text-xs hover:text-blue-700"
                          >
                            <FormattedMessage id="UI._PDF_INDIR" />
                          </a>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
        {/* Kapak büyük önizleme modalı */}
        {coverPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in" onClick={() => setCoverPreview(null)}>
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setCoverPreview(null)}
                className="absolute -top-4 -right-4 bg-white dark:bg-gray-900 rounded-full shadow p-1 text-xl font-bold text-gray-700 dark:text-gray-200 hover:text-red-500"
                aria-label={intl.formatMessage({ id: "UI.KAPAT" })}
                style={{ zIndex: 10 }}
              >
                ×
              </button>
              <img
                src={coverPreview}
                alt="Kapak Büyük Önizleme"
                className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-lg border-4 border-white dark:border-gray-800 transition-all"
                style={{ display: 'block', margin: '0 auto' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ScholarList = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [globalFilter, setGlobalFilter] = useState('');
  const [debouncedFilter, setDebouncedFilter] = useState('');
  const [scholars, setScholars] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewScholar, setPreviewScholar] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingScholar, setDeletingScholar] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [viewMode, setViewMode] = useState(() => {
    // localStorage'dan görünüm modunu oku
    const savedMode = localStorage.getItem('scholars_view_mode');
    return savedMode || 'card'; // Default: 'card'
  });

  useEffect(() => {
    // Token değişirse güncelle
    const handleStorage = () => {
      setToken(localStorage.getItem('access_token'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Debounce for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilter(globalFilter);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [globalFilter]);

  useEffect(() => {
    if (!token) {
      setLoading(true);
      return;
    }
    setLoading(true);
    setError(null);

    // Arama varsa search endpoint'ini kullan, yoksa normal endpoint
    const searchUrl = debouncedFilter.trim()
      ? `${BASE_URL}/search/scholars?q=${encodeURIComponent(debouncedFilter)}&page=${currentPage}&limit=10`
      : `${API_URL}?page=${currentPage}&limit=10`;

    fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Alimler alınamadı');
        return res.json();
      })
      .then(data => {
        // API response'u { scholars: [...], totalCount: 1566, ... } şeklinde geliyor
        const scholarsArray = data?.scholars || data || [];
        const count = data?.totalCount || scholarsArray.length;

        setScholars(Array.isArray(scholarsArray) ? scholarsArray : []);
        setTotalCount(count);
        setCurrentPage(data?.currentPage || 1);
        setTotalPages(data?.totalPages || 1);
        setHasMore(data?.hasMore || false);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [token, currentPage, debouncedFilter]);

  const handleScholarAdded = scholar => {
    setScholars(prev => {
      const currentScholars = Array.isArray(prev) ? prev : [];
      return [scholar, ...currentScholars];
    });
  };

  const handleScholarUpdated = updated => {
    setScholars(prev => {
      const currentScholars = Array.isArray(prev) ? prev : [];
      return currentScholars.map(s => s.id === updated.id ? updated : s);
    });
  };

  const data = useMemo(() => Array.isArray(scholars) ? scholars : [], [scholars]);

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const columns = [
    {
      accessorKey: 'photoUrl',
      header: 'Portre',
      cell: info => {
        const url = info.getValue();
        return url ? (
          <img
            src={getImageUrl(url)}
            alt="Portre"
            className="w-14 h-14 object-cover rounded shadow border border-gray-200 dark:border-gray-700"
          />
        ) : null;
      },
      enableSorting: false,
      enableColumnFilter: false,
      size: 80,
    },
    {
      accessorKey: 'fullName',
      header: 'Adı',
      cell: info => <span className="font-semibold">{info.getValue()}</span>,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'lineage',
      header: 'Nesebi',
      filterFn: 'includesString',
    },
    {
      accessorKey: 'birthDate',
      header: 'Doğum Yılı',
      cell: info => info.getValue()?.slice(0, 10),
      filterFn: 'includesString',
    },
    {
      accessorKey: 'deathDate',
      header: 'Vefat Yılı',
      cell: info => info.getValue()?.slice(0, 10),
      filterFn: 'includesString',
    },
    {
      accessorKey: 'ownBooks',
      header: 'Kendi Kitapları',
      cell: info => info.getValue()?.map(b => b.title).join(', '),
      filterFn: (row, columnId, filterValue) => {
        const books = row.getValue(columnId) || [];
        return books.some(b => b.title.toLowerCase().includes(filterValue.toLowerCase()));
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-2 items-center justify-center">
          <button
            className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 transition"
            onClick={e => {
              e.stopPropagation();
              if (row.original) {
                navigate(`/alimler/duzenle/${row.original.id}`);
              }
            }}
          >
            <FormattedMessage id="UI.DUZENLE" />
          </button>
          <button
            className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 transition"
            onClick={e => {
              e.stopPropagation();
              setDeletingScholar(row.original);
              setDeleteModalOpen(true);
            }}
          >
            <FormattedMessage id="UI.SIL" />
          </button>
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
      size: 100,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const scholar = row.original;
      const search = filterValue.toLowerCase();
      return (
        scholar.fullName.toLowerCase().includes(search) ||
        scholar.lineage?.toLowerCase().includes(search) ||
        scholar.birthDate?.includes(search) ||
        scholar.deathDate?.includes(search) ||
        (scholar.ownBooks && scholar.ownBooks.some(b => b.title.toLowerCase().includes(search))) ||
        (scholar.relatedBooks && scholar.relatedBooks.some(b => b.title.toLowerCase().includes(search))) ||
        (scholar.sources && scholar.sources.some(s => s.content.toLowerCase().includes(search)))
      );
    },
    defaultColumn: {
      Filter: DefaultColumnFilter,
    },
  });

  const handleDeleteScholar = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
      });
      if (!res.ok) throw new Error('Alim silinemedi');
      setScholars(prev => prev.filter(s => s.id !== id));
      toast.success('Alim başarıyla silindi!');
    } catch (err) {
      toast.error('Silme sırasında hata oluştu!');
    }
    setDeleteModalOpen(false);
    setDeletingScholar(null);
  };

  return (
    <>
      <Helmet>
        <title>{intl.formatMessage({
          id: "UI.ISLAM_LIMLERI_LISTESI__ISLAMIC_WINDOWS_A"
        })}</title>
      </Helmet>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold"><FormattedMessage id="UI.ISLAM_ALIMLERI_LISTESI" /></h2>
          <button
            onClick={() => navigate('/alimler/ekle')}
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 transition border border-blue-700"
          >
            <FormattedMessage id="UI._ALIM_EKLE" />
          </button>
        </div>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <input
            type="text"
            placeholder={intl.formatMessage({ id: "UI.ALIMLERI_ARAYIN" })}
            value={globalFilter}
            onChange={e => {
              setGlobalFilter(e.target.value);
              setCurrentPage(1); // Arama değiştiğinde sayfa 1'e dön
            }}
            className="flex-1 sm:max-w-md px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm"
          />
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg shadow-sm">
            <button
              onClick={() => {
                setViewMode('card');
                localStorage.setItem('scholars_view_mode', 'card');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${viewMode === 'card'
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              <Grid3x3 size={18} />
              <span className="hidden sm:inline text-sm font-medium"><FormattedMessage id="UI.KART" /></span>
            </button>
            <button
              onClick={() => {
                setViewMode('table');
                localStorage.setItem('scholars_view_mode', 'table');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${viewMode === 'table'
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              <List size={18} />
              <span className="hidden sm:inline text-sm font-medium"><FormattedMessage id="UI.LISTE" /></span>
            </button>
          </div>
        </div>
        {loading ? (
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2"><FormattedMessage id="UI.YUKLENIYOR" /></p>
          </div>
        ) : error && token ? (
          <div className="py-10 text-center text-red-500">{error}</div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.isArray(scholars) && scholars.map(scholar => (
              <Card key={scholar.id} className="flex flex-col justify-between hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden relative group cursor-pointer"
                onClick={() => navigate(`/alimler/profile/${scholar.id}`)}
              >
                {/* Hover Actions Overlay */}
                <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <div className="flex justify-end gap-1">
                    <button
                      className="p-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow hover:bg-blue-500 hover:text-white transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewScholar(scholar);
                      }}
                      title={intl.formatMessage({ id: "UI.ONIZLE" })}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      className="p-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow hover:bg-green-500 hover:text-white transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/alimler/duzenle/${scholar.id}`);
                      }}
                      title={intl.formatMessage({ id: "UI.DUZENLE" })}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="p-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow hover:bg-red-500 hover:text-white transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingScholar(scholar);
                        setDeleteModalOpen(true);
                      }}
                      title={intl.formatMessage({ id: "UI.SIL" })}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <CardContent className="flex flex-col items-center gap-2 p-4">
                  {scholar.photoUrl && (
                    <div className="relative mb-1">
                      <img
                        src={getImageUrl(scholar.photoUrl)}
                        alt={scholar.fullName}
                        className="w-16 h-16 object-cover rounded-full border-2 border-primary-500 shadow-md"
                      />
                    </div>
                  )}
                  <div className="text-center w-full">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5 line-clamp-1" title={scholar.fullName}>
                      {scholar.fullName}
                    </h3>
                    {scholar.lineage && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 line-clamp-1" title={scholar.lineage}>
                        {scholar.lineage}
                      </p>
                    )}
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {scholar.birthDate && (
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                          🎂 {scholar.birthDate.slice(0, 4)}
                        </span>
                      )}
                      {scholar.deathDate && (
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                          📅 {scholar.deathDate.slice(0, 4)}
                        </span>
                      )}
                    </div>
                  </div>
                  {scholar.ownBooks && scholar.ownBooks.length > 0 && (
                    <div className="flex items-center justify-center gap-1 mt-2 w-full">
                      <BookOpen size={12} className="text-primary-600 dark:text-primary-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                        {scholar.ownBooks.length} <FormattedMessage id="UI.KITAP" />
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Table View */
          (<div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <FormattedMessage id="UI.LIM" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    <FormattedMessage id="UI.DOGUMVEFAT" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    <FormattedMessage id="UI.KITAPLARI" />
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <FormattedMessage id="UI.ISLEMLER" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {Array.isArray(scholars) && scholars.map((scholar) => (
                  <tr
                    key={scholar.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/alimler/profile/${scholar.id}`)}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {scholar.photoUrl && (
                          <img
                            src={getImageUrl(scholar.photoUrl)}
                            alt={scholar.fullName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-primary-500"
                          />
                        )}
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {scholar.fullName}
                          </div>
                          {scholar.lineage && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {scholar.lineage}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {scholar.birthDate && (
                          <div>🎂 {scholar.birthDate.slice(0, 10)}</div>
                        )}
                        {scholar.deathDate && (
                          <div>📅 {scholar.deathDate.slice(0, 10)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      {scholar.ownBooks && scholar.ownBooks.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {scholar.ownBooks.slice(0, 2).map((b, i) => (
                            <span
                              key={b.id || i}
                              className="inline-flex items-center gap-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-200 px-2 py-0.5 rounded text-xs"
                            >
                              <BookOpen size={12} /> {b.title}
                            </span>
                          ))}
                          {scholar.ownBooks.length > 2 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">+{scholar.ownBooks.length - 2} <FormattedMessage id="UI.DAHA" />
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewScholar(scholar);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title={intl.formatMessage({ id: "UI.ONIZLE" })}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/alimler/duzenle/${scholar.id}`);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title={intl.formatMessage({ id: "UI.DUZENLE" })}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingScholar(scholar);
                            setDeleteModalOpen(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title={intl.formatMessage({ id: "UI.SIL" })}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!scholars || scholars.length === 0) && (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                {globalFilter ? <FormattedMessage id="UI.ARAMA_SONUCU_BULUNAMADI" /> : <FormattedMessage id="UI.HENUZ_ALIM_EKLENMEMIS" />}
              </div>
            )}
          </div>)
        )}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <span className="text-sm text-gray-400"><FormattedMessage id="UI.TOPLAM" /> {totalCount} <FormattedMessage id="UI.ALIM" /></span>
            {totalPages > 1 && (
              <span className="text-sm text-gray-500">
                <FormattedMessage id="UI.SAYFA" /> {currentPage}/ {totalPages}
              </span>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <FormattedMessage id="UI.ONCEKI" />
              </Button>

              <div className="flex items-center gap-1">
                {/* Sayfa numaraları */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="min-w-[40px]"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                <FormattedMessage id="UI.SONRAKI" />
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <ScholarPreviewModal scholar={previewScholar} onClose={() => setPreviewScholar(null)} />
        <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} className="z-50">
          <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <Dialog.Panel className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-sm w-full p-6">
              <Dialog.Title className="text-lg font-bold mb-2"><FormattedMessage id="UI.ALIMI_SIL" /></Dialog.Title>
              <Dialog.Description className="mb-4 text-gray-700 dark:text-gray-200">
                <FormattedMessage id="UI.BU_ALIMI_SILMEK_ISTEDIGINIZE_EMIN_MISINI" />
              </Dialog.Description>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  <FormattedMessage id="UI.VAZGEC" />
                </button>
                <button
                  onClick={() => handleDeleteScholar(deletingScholar?.id)}
                  className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition"
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
};

export default ScholarList; 