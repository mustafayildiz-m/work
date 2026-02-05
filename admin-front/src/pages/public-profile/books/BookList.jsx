import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { Dialog } from '@headlessui/react';
import { Fragment } from 'react';
import { toast } from 'sonner';
import Select from 'react-select';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/books';
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

function getPdfUrl(pdfUrl) {
  if (!pdfUrl) return '';
  if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
    return pdfUrl;
  }
  return BASE_URL.replace(/\/$/, '') + (pdfUrl.startsWith('/') ? pdfUrl : '/' + pdfUrl);
}

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
    cell: info => <span className="font-semibold">{info.getValue()}</span>,
    filterFn: 'includesString',
  },
  {
    accessorKey: 'author',
    header: 'Yazar',
    filterFn: 'includesString',
  },
  {
    accessorKey: 'categories',
    header: 'Kategoriler',
    cell: info => info.getValue()?.join(', '),
    filterFn: (row, columnId, filterValue) => {
      const cats = row.getValue(columnId) || [];
      return cats.some(c => c.toLowerCase().includes(filterValue.toLowerCase()));
    },
  },
  {
    accessorKey: 'translations',
    header: 'Diller',
    cell: info => (
      <div>
        {(info.getValue() || []).map(trans => (
          <a
            key={trans.languageId}
            href={getPdfUrl(trans.pdfUrl || trans.pdfFile)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline mr-2"
            title={trans.title}
          >
            {trans.language?.name || 'N/A'}
          </a>
        ))}
      </div>
    ),
    filterFn: (row, columnId, filterValue) => {
      const translations = row.getValue(columnId) || [];
      return translations.some(t => t.language?.name?.toLowerCase().includes(filterValue.toLowerCase()) || t.title?.toLowerCase().includes(filterValue.toLowerCase()));
    },
  },
  {
    accessorKey: 'publishDate',
    header: 'Yayın Tarihi',
    cell: info => info.getValue()?.slice(0, 10),
    filterFn: 'includesString',
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <div className="flex gap-2 items-center justify-center">
        <EditButton book={row.original} onUpdated={row.original.onUpdated} />
        <DeleteButton bookId={row.original.id} onDeleted={row.original.onDeleted} />
      </div>
    ),
    enableSorting: false,
    enableColumnFilter: false,
    size: 100,
  },
];

function EditButton({ book, onUpdated }) {
  const [open, setOpen] = useState(false);
  const initialForm = {
    author: book.author || '',
    categories: book.categories || [],
    publishDate: book.publishDate ? book.publishDate.slice(0, 10) : '',
    translations: book.translations && book.translations.length > 0 
      ? book.translations.map(t => ({ 
          language: t.language?.id || t.languageId || '',
          title: t.title || '',
          description: t.description || '',
          summary: t.summary || '',
          pdfUrl: t.pdfUrl || t.pdfFile || '',
          file: null
        })) 
      : [{ language: '', title: '', description: '', summary: '', pdfUrl: '', file: null }],
    coverImage: '', // file veya string
  };
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categoryInput, setCategoryInput] = useState('');
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [loadingLanguages, setLoadingLanguages] = useState(false);

  useEffect(() => {
    const fetchLanguages = async () => {
      setLoadingLanguages(true);
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${BASE_URL}/languages`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Diller yüklenirken bir hata oluştu');
        const data = await response.json();
        setAvailableLanguages(data);
      } catch (error) {
        toast.error('Diller yüklenirken bir hata oluştu');
      } finally {
        setLoadingLanguages(false);
      }
    };
    if (open) fetchLanguages();
  }, [open]);

  useEffect(() => {
    if (open) {
      setForm(initialForm);
      setFile(null);
      setPreview(getCoverUrl(book.coverImage));
    }
  }, [open, book]);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else if (form.coverImage) {
      setPreview(getCoverUrl(form.coverImage));
    } else {
      setPreview(getCoverUrl(book.coverImage));
    }
    // eslint-disable-next-line
  }, [file, form.coverImage]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTranslationChange = (idx, field, value) => {
    const newTranslations = form.translations.map((t, i) =>
      i === idx ? { ...t, [field]: value } : t
    );
    setForm({ ...form, translations: newTranslations });
  };

  const handleTranslationFileChange = (idx, file) => {
    const newTranslations = form.translations.map((t, i) =>
      i === idx ? { ...t, file } : t
    );
    setForm({ ...form, translations: newTranslations });
  };

  const addTranslation = () => {
    if (form.translations.length < 10) {
      setForm({ ...form, translations: [...form.translations, { language: '', title: '', description: '', summary: '', file: null }] });
    }
  };

  const removeTranslation = (idx) => {
    if (form.translations.length > 1) {
      setForm({ ...form, translations: form.translations.filter((_, i) => i !== idx) });
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCategoryInput = (e) => {
    setCategoryInput(e.target.value);
  };

  const handleCategoryRemove = (cat) => {
    setForm({ ...form, categories: form.categories.filter(c => c !== cat) });
  };

  const handleCategoryKeyDown = (e) => {
    if ((e.key === 'Tab' || e.key === 'Enter') && categoryInput.trim()) {
      e.preventDefault();
      if (!form.categories.includes(categoryInput.trim())) {
        setForm({ ...form, categories: [...form.categories, categoryInput.trim()] });
      }
      setCategoryInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('author', form.author);
      formData.append('publishDate', form.publishDate);
      form.categories.forEach((cat, idx) => {
        formData.append(`category[${idx}]`, cat);
      });
      if (form.translations.length === 0 || form.translations.some(t => !t.language || !t.title)) {
        setError('En az bir dil, başlık ve PDF dosyası eklemelisiniz.');
        setLoading(false);
        return;
      }
      form.translations.forEach((trans, idx) => {
        formData.append(`translations[${idx}][languageId]`, trans.language);
        formData.append(`translations[${idx}][title]`, trans.title || '');
        formData.append(`translations[${idx}][description]`, trans.description || '');
        formData.append(`translations[${idx}][summary]`, trans.summary || '');
        if (trans.file) {
          formData.append(`translations[${idx}][pdfFile]`, trans.file);
        }
      });
      if (file) {
        formData.append('coverImage', file);
      } else if (form.coverImage) {
        formData.append('coverImage', form.coverImage);
      }
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/${book.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Kitap güncellenemedi');
      const updated = await res.json();
      onUpdated(updated);
      toast.success('Kitap başarıyla güncellendi!');
      setOpen(false);
    } catch (err) {
      setError(err.message);
      toast.error('Güncelleme sırasında hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={e => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        title="Düzenle"
      >
        Düzenle
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={() => setOpen(false)}>
          <form
            onClick={e => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-4xl w-full p-6 relative my-8 max-h-[90vh] overflow-y-auto"
            encType="multipart/form-data"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
              aria-label="Kapat"
            >
              ×
            </button>
            {preview && (
              <div className="flex justify-center mb-4">
                <img src={preview} alt="Kapak Önizleme" className="w-24 h-24 object-cover rounded shadow border border-gray-200 dark:border-gray-700" />
              </div>
            )}
            <h3 className="text-xl font-bold mb-6 text-center">Kitap Düzenle</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="author" value={form.author} onChange={handleChange} required placeholder="Yazar" className="px-3 py-2 border rounded bg-white dark:bg-gray-800" />
              <input name="publishDate" value={form.publishDate} onChange={handleChange} required type="date" placeholder="Yayın Tarihi" className="px-3 py-2 border rounded bg-white dark:bg-gray-800" />
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Kategoriler</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.categories.map(cat => (
                    <span key={cat} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {cat}
                      <button type="button" onClick={() => handleCategoryRemove(cat)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={categoryInput}
                  onChange={handleCategoryInput}
                  onKeyDown={handleCategoryKeyDown}
                  placeholder="Kategori ekle... (Tab veya Enter ile ekle)"
                  className="px-3 py-2 border rounded bg-white dark:bg-gray-800 w-full"
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-base">Dil Çevirileri</span>
                  <button type="button" onClick={addTranslation} className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded" disabled={form.translations.length >= 10}>+ Çeviri Ekle</button>
                </div>
                <div className="flex flex-col gap-4">
                  {form.translations.map((trans, idx) => (
                    <div key={idx} className="p-4 border-2 rounded-lg bg-gray-50 dark:bg-gray-800 w-full">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1">
                          <Select
                            value={availableLanguages.find(opt => opt.id === trans.language) || null}
                            onChange={selected => handleTranslationChange(idx, 'language', selected ? selected.id : '')}
                            options={availableLanguages}
                          getOptionLabel={opt => opt.name}
                          getOptionValue={opt => opt.id}
                          isDisabled={loadingLanguages}
                          placeholder="Bir dil seçin"
                          classNamePrefix="react-select"
                          styles={{
                            container: base => ({ ...base, minWidth: 0, width: '100%' }),
                            control: (base, state) => ({
                              ...base,
                              backgroundColor: document.documentElement.classList.contains('dark') ? '#181e29' : '#fff',
                              color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#222',
                              borderColor: state.isFocused ? '#2563eb' : (document.documentElement.classList.contains('dark') ? '#374151' : '#d1d5db'),
                              boxShadow: state.isFocused ? '0 0 0 2px #2563eb33' : undefined,
                            }),
                            menu: base => ({
                              ...base,
                              backgroundColor: document.documentElement.classList.contains('dark') ? '#181e29' : '#fff',
                              color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#222',
                            }),
                            option: (base, state) => ({
                              ...base,
                              backgroundColor: state.isSelected
                                ? (document.documentElement.classList.contains('dark') ? '#2563eb' : '#e0e7ff')
                                : state.isFocused
                                  ? (document.documentElement.classList.contains('dark') ? '#1e293b' : '#f3f4f6')
                                  : (document.documentElement.classList.contains('dark') ? '#181e29' : '#fff'),
                              color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#222',
                            }),
                            singleValue: base => ({
                              ...base,
                              color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#222',
                            }),
                            input: base => ({
                              ...base,
                              color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#222',
                            }),
                            placeholder: base => ({
                              ...base,
                              color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
                            }),
                          }}
                        />
                        </div>
                        {form.translations.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeTranslation(idx)} 
                            className="text-red-500 text-sm px-2"
                          >
                            Sil
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={trans.title || ''}
                        onChange={e => handleTranslationChange(idx, 'title', e.target.value)}
                        placeholder="Başlık (bu dilde)"
                        className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 mb-2"
                        required
                      />
                      <textarea
                        value={trans.description || ''}
                        onChange={e => handleTranslationChange(idx, 'description', e.target.value)}
                        placeholder="Açıklama (bu dilde)"
                        className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 mb-2"
                        rows="2"
                      />
                      <textarea
                        value={trans.summary || ''}
                        onChange={e => handleTranslationChange(idx, 'summary', e.target.value)}
                        placeholder="Özet (bu dilde)"
                        className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 mb-2"
                        rows="2"
                      />
                      <div className="relative">
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={e => handleTranslationFileChange(idx, e.target.files[0])}
                          className="hidden"
                          id={`pdf-upload-${idx}`}
                        />
                        <label
                          htmlFor={`pdf-upload-${idx}`}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/50 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium">{trans.file ? trans.file.name : (trans.pdfUrl ? 'PDF Değiştir' : 'PDF Yükle')}</span>
                        </label>
                        {trans.file && (
                          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            ✓
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Kapak Görseli</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="cover-upload"
                    onChange={e => setFile(e.target.files[0])}
                    className="hidden"
                  />
                  <label
                    htmlFor="cover-upload"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/50 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer transition-colors min-w-[120px]"
                    style={{ minWidth: 120 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5zm3 2a1 1 0 110 2 1 1 0 010-2zm-2 8l2.293-2.293a1 1 0 011.414 0L11 13l3.293-3.293a1 1 0 011.414 0L18 12v2H4v-1z" />
                    </svg>
                    <span className="text-sm font-medium">Kapak Yükle</span>
                  </label>
                  {file && (
                    <span className="text-xs text-gray-700 dark:text-gray-200 truncate max-w-[120px]">{file.name}</span>
                  )}
                </div>
                <input name="coverImage" value={form.coverImage} onChange={handleChange} placeholder="Veya URL/Path" className="px-3 py-2 border rounded bg-white dark:bg-gray-800 mt-2" />
              </div>
            </div>
            {error && <div className="text-red-500 text-sm mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded">{error}</div>}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t sticky bottom-0 bg-white dark:bg-gray-900">
              <button type="button" onClick={() => setOpen(false)} className="px-6 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition">Kapat</button>
              <button type="submit" className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
                {loading ? '⏳ Kaydediliyor...' : '✓ Kaydet'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function DeleteButton({ bookId, onDeleted }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cancelButtonRef = useRef(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/${bookId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Kitap silinemedi');
      if (onDeleted) onDeleted(bookId);
      toast.success('Kitap başarıyla silindi!');
      setOpen(false);
    } catch (err) {
      setError(err.message);
      toast.error('Silme sırasında hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={e => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 transition"
        title="Sil"
      >
        Sil
      </button>
      <Dialog
        as={Fragment}
        open={open}
        onClose={() => setOpen(false)}
        initialFocus={cancelButtonRef}
      >
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <Dialog.Panel className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 m-4 transform transition-all animate-in fade-in zoom-in duration-200">
            {/* Icon Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-shrink-0 w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Kitabı Sil
                </Dialog.Title>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Bu işlem geri alınamaz
                </p>
              </div>
            </div>
            
            {/* Warning Message */}
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-l-4 border-red-500">
              <Dialog.Description className="text-sm text-gray-700 dark:text-gray-300">
                Bu kitabı <span className="font-bold text-red-600 dark:text-red-400">kalıcı olarak</span> silmek üzeresiniz. 
                Bu işlem geri alınamaz ve kitaba ait tüm veriler (çeviriler, PDF'ler, kapak görseli) silinecektir.
              </Dialog.Description>
              <div className="mt-3 flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-red-700 dark:text-red-300">
                  <strong>Dikkat:</strong> Bu kitap başka sayfalarda veya sistemlerde kullanılıyor olabilir.
                </p>
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                ref={cancelButtonRef}
                onClick={() => setOpen(false)}
                className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50"
                disabled={loading}
              >
                Vazgeç
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Siliniyor...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Evet, Sil
                  </>
                )}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}

function BookDetailModal({ book, onClose }) {
  if (!book) return null;
  const coverUrl = getCoverUrl(book.coverImage);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-lg w-full p-6 relative animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
          aria-label="Kapat"
        >
          ×
        </button>
        <div className="flex flex-col items-center gap-4">
          {coverUrl && (
            <img
              src={coverUrl}
              alt={book.title}
              className="w-32 h-32 object-cover rounded shadow border border-gray-200 dark:border-gray-700 mb-2"
            />
          )}
          <h3 className="text-xl font-bold mb-1 text-center">{book.title}</h3>
          <div className="text-sm text-gray-700 dark:text-gray-200 mb-2 text-center">
            <span className="font-semibold">Yazar:</span> {book.author}
            <br />
            <span className="font-semibold">Kategoriler:</span> {book.categories?.join(', ')}
            <br />
            <span className="font-semibold">Yayın Tarihi:</span> {book.publishDate?.slice(0, 10)}
          </div>
          <div className="w-full text-sm text-gray-700 dark:text-gray-200 mb-2">
            <span className="font-semibold">Açıklama:</span>
            <div className="ml-2 mt-1">{book.description}</div>
          </div>
          <div className="w-full text-sm text-gray-700 dark:text-gray-200 mb-2">
            <span className="font-semibold">Özet:</span>
            <div className="ml-2 mt-1">{book.summary}</div>
          </div>
          <div className="w-full text-sm text-gray-700 dark:text-gray-200 mb-2">
            <span className="font-semibold">Çeviriler:</span>
            <div className="ml-2 mt-1 flex flex-wrap gap-2">
              {(book.translations || []).map(trans => (
                <div key={trans.languageId} className="border rounded p-2 bg-gray-50 dark:bg-gray-700">
                  <div className="font-semibold">{trans.language?.name}</div>
                  <div className="text-xs">{trans.title}</div>
                  {trans.pdfUrl && (
                    <a
                      href={getPdfUrl(trans.pdfUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline text-xs"
                    >
                      PDF İndir
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const languageOptions = [
  'İngilizce',
  'Fransızca',
  'Almanca',
  'Türkçe',
  'Arapça',
  'Rusça',
  'İspanyolca',
  'İtalyanca',
  'Çince',
  'Japonca',
];

function AddBookModal({ open, onClose, onAdd }) {
  const initialForm = {
    author: '',
    categories: [],
    publishDate: '',
    translations: [{ language: '', title: '', description: '', summary: '', file: null }],
    coverImage: '',
  };
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categoryInput, setCategoryInput] = useState('');
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [loadingLanguages, setLoadingLanguages] = useState(false);

  useEffect(() => {
    const fetchLanguages = async () => {
      setLoadingLanguages(true);
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${BASE_URL}/languages`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Diller yüklenirken bir hata oluştu');
        const data = await response.json();
        setAvailableLanguages(data);
      } catch (error) {
        toast.error('Diller yüklenirken bir hata oluştu');
      } finally {
        setLoadingLanguages(false);
      }
    };

    if (open) {
      fetchLanguages();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setForm(initialForm);
      setFile(null);
      setError(null);
    }
  }, [open]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTranslationChange = (idx, field, value) => {
    const newTranslations = form.translations.map((t, i) =>
      i === idx ? { ...t, [field]: value } : t
    );
    setForm({ ...form, translations: newTranslations });
  };

  const handleTranslationFileChange = (idx, file) => {
    const newTranslations = form.translations.map((t, i) =>
      i === idx ? { ...t, file } : t
    );
    setForm({ ...form, translations: newTranslations });
  };

  const addTranslation = () => {
    if (form.translations.length < 10) {
      setForm({ ...form, translations: [...form.translations, { language: '', title: '', description: '', summary: '', file: null }] });
    }
  };

  const removeTranslation = (idx) => {
    if (form.translations.length > 1) {
      setForm({ ...form, translations: form.translations.filter((_, i) => i !== idx) });
    }
  };

  const handleCategoryInput = (e) => {
    setCategoryInput(e.target.value);
  };

  const handleCategoryRemove = (cat) => {
    setForm({ ...form, categories: form.categories.filter(c => c !== cat) });
  };

  const handleCategoryKeyDown = (e) => {
    if ((e.key === 'Tab' || e.key === 'Enter') && categoryInput.trim()) {
      e.preventDefault();
      if (!form.categories.includes(categoryInput.trim())) {
        setForm({ ...form, categories: [...form.categories, categoryInput.trim()] });
      }
      setCategoryInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('author', form.author);
      formData.append('publishDate', form.publishDate);
      form.categories.forEach((cat, idx) => {
        formData.append(`category[${idx}]`, cat);
      });
      if (form.translations.length === 0 || form.translations.some(t => !t.language || !t.title)) {
        setError('En az bir dil, başlık ve PDF dosyası eklemelisiniz.');
        setLoading(false);
        return;
      }
      form.translations.forEach((trans, idx) => {
        formData.append(`translations[${idx}][languageId]`, trans.language);
        formData.append(`translations[${idx}][title]`, trans.title || '');
        formData.append(`translations[${idx}][description]`, trans.description || '');
        formData.append(`translations[${idx}][summary]`, trans.summary || '');
        formData.append(`translations[${idx}][pdfFile]`, trans.file);
      });
      if (file) {
        formData.append('coverImage', file);
      } else if (form.coverImage) {
        formData.append('coverImage', form.coverImage);
      }
      const token = localStorage.getItem('access_token');
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Kitap eklenemedi');
      const data = await res.json();
      onAdd(data);
      toast.success('Kitap başarıyla eklendi!');
      setForm(initialForm);
      setFile(null);
      onClose();
    } catch (err) {
      setError(err.message);
      toast.error('Ekleme sırasında hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={onClose}>
      <form onClick={e => e.stopPropagation()} onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-4xl w-full p-6 relative my-8 max-h-[90vh] overflow-y-auto" encType="multipart/form-data">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl font-bold z-10"
          aria-label="Kapat"
        >
          ×
        </button>
        <h3 className="text-xl font-bold mb-6 text-center">Kitap Ekle</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="author" value={form.author} onChange={handleChange} required placeholder="Yazar" className="px-3 py-2 border rounded bg-white dark:bg-gray-800" />
          <input name="publishDate" value={form.publishDate} onChange={handleChange} required type="date" placeholder="Yayın Tarihi" className="px-3 py-2 border rounded bg-white dark:bg-gray-800" />
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2">Kategoriler</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.categories.map(cat => (
                <span key={cat} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {cat}
                  <button type="button" onClick={() => handleCategoryRemove(cat)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={categoryInput}
              onChange={handleCategoryInput}
              onKeyDown={handleCategoryKeyDown}
              placeholder="Kategori ekle... (Tab veya Enter ile ekle)"
              className="px-3 py-2 border rounded bg-white dark:bg-gray-800 w-full"
            />
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-base">Dil Çevirileri</span>
              <button type="button" onClick={addTranslation} className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded" disabled={form.translations.length >= 10}>+ Çeviri Ekle</button>
            </div>
            <div className="flex flex-col gap-4">
              {form.translations.map((trans, idx) => (
                <div key={idx} className="p-4 border-2 rounded-lg bg-gray-50 dark:bg-gray-800 w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1">
                      <Select
                        value={availableLanguages.find(opt => opt.id === trans.language) || null}
                        onChange={selected => handleTranslationChange(idx, 'language', selected ? selected.id : '')}
                      options={availableLanguages}
                      getOptionLabel={opt => opt.name}
                      getOptionValue={opt => opt.id}
                      isDisabled={loadingLanguages}
                      placeholder="Bir dil seçin"
                      classNamePrefix="react-select"
                      styles={{
                        container: base => ({ ...base, minWidth: 0, width: '100%' }),
                        control: (base, state) => ({
                          ...base,
                          backgroundColor: document.documentElement.classList.contains('dark') ? '#181e29' : '#fff',
                          color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#222',
                          borderColor: state.isFocused ? '#2563eb' : (document.documentElement.classList.contains('dark') ? '#374151' : '#d1d5db'),
                          boxShadow: state.isFocused ? '0 0 0 2px #2563eb33' : undefined,
                        }),
                        menu: base => ({
                          ...base,
                          backgroundColor: document.documentElement.classList.contains('dark') ? '#181e29' : '#fff',
                          color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#222',
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isSelected
                            ? (document.documentElement.classList.contains('dark') ? '#2563eb' : '#e0e7ff')
                            : state.isFocused
                              ? (document.documentElement.classList.contains('dark') ? '#1e293b' : '#f3f4f6')
                              : (document.documentElement.classList.contains('dark') ? '#181e29' : '#fff'),
                          color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#222',
                        }),
                        singleValue: base => ({
                          ...base,
                          color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#222',
                        }),
                        input: base => ({
                          ...base,
                          color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#222',
                        }),
                        placeholder: base => ({
                          ...base,
                          color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
                        }),
                      }}
                    />
                    </div>
                    {form.translations.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeTranslation(idx)} 
                        className="text-red-500 text-sm px-2"
                      >
                        Sil
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={trans.title || ''}
                    onChange={e => handleTranslationChange(idx, 'title', e.target.value)}
                    placeholder="Başlık (bu dilde)"
                    className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 mb-2"
                    required
                  />
                  <textarea
                    value={trans.description || ''}
                    onChange={e => handleTranslationChange(idx, 'description', e.target.value)}
                    placeholder="Açıklama (bu dilde)"
                    className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 mb-2"
                    rows="2"
                  />
                  <textarea
                    value={trans.summary || ''}
                    onChange={e => handleTranslationChange(idx, 'summary', e.target.value)}
                    placeholder="Özet (bu dilde)"
                    className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 mb-2"
                    rows="2"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={e => handleTranslationFileChange(idx, e.target.files[0])}
                      className="hidden"
                      id={`add-pdf-upload-${idx}`}
                    />
                    <label
                      htmlFor={`add-pdf-upload-${idx}`}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/50 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">{trans.file ? trans.file.name : 'PDF Yükle'}</span>
                    </label>
                    {trans.file && (
                      <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        ✓
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2">Kapak Görseli</label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                id="cover-upload"
                onChange={e => setFile(e.target.files[0])}
                className="hidden"
              />
              <label
                htmlFor="cover-upload"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/50 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer transition-colors min-w-[120px]"
                style={{ minWidth: 120 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5zm3 2a1 1 0 110 2 1 1 0 010-2zm-2 8l2.293-2.293a1 1 0 011.414 0L11 13l3.293-3.293a1 1 0 011.414 0L18 12v2H4v-1z" />
                </svg>
                <span className="text-sm font-medium">Kapak Yükle</span>
              </label>
              {file && (
                <span className="text-xs text-gray-700 dark:text-gray-200 truncate max-w-[120px]">{file.name}</span>
              )}
            </div>
            <input name="coverImage" value={form.coverImage} onChange={handleChange} placeholder="Veya URL/Path" className="px-3 py-2 border rounded bg-white dark:bg-gray-800 mt-2" />
          </div>
        </div>
        {error && <div className="text-red-500 text-sm mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded">{error}</div>}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t sticky bottom-0 bg-white dark:bg-gray-900">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition">Kapat</button>
          <button type="submit" className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
            {loading ? '⏳ Ekleniyor...' : '+ Ekle'}
          </button>
        </div>
      </form>
    </div>
  );
}

const BookList = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('access_token');
    fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Kitaplar alınamadı');
        return res.json();
      })
      .then((data) => {
        // Backend artık {data: [...], pagination: {...}} formatında dönüyor
        const booksArray = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
        setBooks(booksArray);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setBooks([]); // Reset to empty array on error
        setLoading(false);
      });
  }, []);

  const handleBookDeleted = (deletedId) => {
    setBooks(prev => prev.filter(book => book.id !== deletedId));
  };

  const handleBookUpdated = (updatedBook) => {
    setBooks(prev => prev.map(book => {
      if (book.id === updatedBook.id) {
        return updatedBook;
      }
      return book;
    }));
  };

  // Backend'den gelen verileri transform et (title translations'dan al)
  const transformedData = useMemo(() => {
    // Ensure books is always an array before mapping
    if (!Array.isArray(books)) {
      return [];
    }
    return books.map(book => ({
      ...book,
      title: book.translations?.[0]?.title || book.author || 'Başlıksız',
      description: book.translations?.[0]?.description || '',
      summary: book.translations?.[0]?.summary || '',
      onDeleted: handleBookDeleted,
      onUpdated: handleBookUpdated
    }));
  }, [books]);

  const table = useReactTable({
    data: transformedData,
    columns,
    state: {
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const book = row.original;
      const search = filterValue.toLowerCase();
      return (
        (book.title?.toLowerCase().includes(search) || false) ||
        (book.author?.toLowerCase().includes(search) || false) ||
        book.categories?.some(c => c.toLowerCase().includes(search)) ||
        book.translations?.some(t => 
          t.language?.name?.toLowerCase().includes(search) ||
          t.title?.toLowerCase().includes(search)
        )
      );
    },
    defaultColumn: {
      Filter: DefaultColumnFilter,
    },
  });

  const handleAddBook = (newBook) => {
    // Dummy: Sadece mevcut listeye ekle (API entegrasyonu sonra)
    setBooks(prev => [
      {
        ...newBook,
        _id: Math.random().toString(36).slice(2),
        translations: newBook.translations?.filter(t => t.language && t.file) || [],
      },
      ...prev,
    ]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Kitap Listesi</h2>
        <button
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow border border-blue-600/20 hover:bg-blue-700 transition"
        >
          + Kitap Ekle
        </button>
      </div>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
        <input
          type="text"
          placeholder="Genel arama..."
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        />
      </div>
      <div className="overflow-x-auto rounded-lg shadow-lg">
        {loading ? (
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">Yükleniyor...</div>
        ) : error ? (
          <div className="py-10 text-center text-red-500">{error}</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900 rounded-lg">
            <thead className="bg-gray-100 dark:bg-gray-800">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="py-4 px-6 text-left font-semibold text-gray-700 dark:text-gray-200 select-none cursor-pointer group"
                      style={{ width: header.getSize() }}
                      onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="ml-1 text-xs">
                              {header.column.getIsSorted() === 'asc' && '▲'}
                              {header.column.getIsSorted() === 'desc' && '▼'}
                              {!header.column.getIsSorted() && (
                                <span className="opacity-30">⇅</span>
                              )}
                            </span>
                          )}
                        </div>
                        {header.column.getCanFilter() && (
                          <div>{flexRender(header.column.columnDef.Filter ?? DefaultColumnFilter, { column: header.column })}</div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => setSelectedBook(row.original)}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="py-4 px-6 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4">
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Önceki
          </button>
          <span className="text-sm">
            Sayfa{' '}
            <strong>
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </strong>
          </span>
          <button
            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Sonraki
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Göster:</span>
          <select
            className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
          >
            {[5, 10, 20, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
      <AddBookModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onAdd={handleAddBook} />
    </div>
  );
};

export default BookList; 