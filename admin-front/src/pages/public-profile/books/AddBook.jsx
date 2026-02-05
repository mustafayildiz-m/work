import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import Select from 'react-select';
import { getSelectStyles, getTheme } from '@/styles/select-styles';
import { FaBook, FaUser, FaTags, FaCalendar, FaGlobe, FaFilePdf, FaImage, FaArrowLeft, FaSave, FaPlus, FaTrash, FaInfoCircle } from 'react-icons/fa';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/books';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function AddBook() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    author: '',
    categories: [],
    publishDate: '',
    translations: [{ language: '', title: '', description: '', summary: '', file: null }],
    coverImage: '',
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categoryInput, setCategoryInput] = useState('');
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [loadingLanguages, setLoadingLanguages] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(getTheme());

  // Tema değişikliğini izle
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setCurrentTheme(getTheme());
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

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
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }, [file]);

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
      const token = localStorage.getItem('access_token');
      const formData = new FormData();

      // Temel bilgileri ekle
      formData.append('author', form.author);
      formData.append('publishDate', form.publishDate);

      // Kategorileri ekle
      form.categories.forEach(cat => {
        formData.append('category[]', cat);
      });

      // Kapak resmi ekle
      if (file) {
        formData.append('coverImage', file);
      }

      // Translations (çeviriler) ekle - Her dil için title, description, summary ve PDF
      form.translations.forEach((translation, index) => {
        if (!translation.language) {
          throw new Error('Lütfen tüm diller için bir dil seçin');
        }
        if (!translation.title) {
          throw new Error('Lütfen tüm diller için başlık girin');
        }
        
        formData.append(`translations[${index}][languageId]`, translation.language);
        formData.append(`translations[${index}][title]`, translation.title);
        formData.append(`translations[${index}][description]`, translation.description || '');
        formData.append(`translations[${index}][summary]`, translation.summary || '');
        
        if (translation.file) {
          formData.append(`translations[${index}][pdfFile]`, translation.file);
        } else {
          throw new Error('Lütfen tüm diller için bir PDF dosyası ekleyin');
        }
      });

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kitap eklenirken bir hata oluştu');
      }

      const data = await response.json();
      toast.success('Kitap başarıyla eklendi');
      navigate('/kitaplar/liste');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Kitap eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Yeni Kitap Ekle - Islamic Windows Admin</title>
      </Helmet>
      
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaBook className="text-blue-600" />
              Yeni Kitap Ekle
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sisteme yeni bir kitap ve çevirilerini ekleyin</p>
          </div>
          <Link
            to="/kitaplar/liste"
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-2 shadow"
          >
            <FaArrowLeft size={14} />
            Listeye Dön
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Temel Bilgiler Kartı */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FaBook className="text-white text-lg" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Temel Bilgiler</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kapak Resmi */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  <FaImage className="text-purple-600" />
                  Kapak Resmi
                </label>
                <div className="flex items-start gap-4">
                  <div className="w-40 h-56 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                    {preview ? (
                      <img src={preview} alt="Kapak önizleme" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="text-center p-4">
                        <FaImage className="text-4xl text-gray-400 mx-auto mb-2" />
                        <span className="text-xs text-gray-400">Önizleme</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer file:transition"
                    />
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <FaInfoCircle className="inline mr-1" />
                      PNG, JPG veya WEBP formatında yükleyebilirsiniz
                    </p>
                  </div>
                </div>
              </div>

              {/* Yazar */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  <FaUser className="text-green-600" />
                  Yazar
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  required
                  placeholder="Kitabın yazarını girin"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
                />
              </div>

              {/* Yayın Tarihi */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  <FaCalendar className="text-orange-600" />
                  Yayın Tarihi
                </label>
                <input
                  type="date"
                  name="publishDate"
                  value={form.publishDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
                />
              </div>

              {/* Kategoriler */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  <FaTags className="text-pink-600" />
                  Kategoriler
                </label>
                <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg min-h-[50px] border border-gray-200 dark:border-gray-700">
                  {form.categories.length === 0 ? (
                    <span className="text-sm text-gray-400 italic">Henüz kategori eklenmedi</span>
                  ) : (
                    form.categories.map((cat, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      >
                        {cat}
                        <button
                          type="button"
                          onClick={() => handleCategoryRemove(cat)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
                <input
                  type="text"
                  value={categoryInput}
                  onChange={handleCategoryInput}
                  onKeyDown={handleCategoryKeyDown}
                  placeholder="Kategori adı yazın ve Enter/Tab ile ekleyin..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <FaInfoCircle className="inline mr-1" />
                  Kategori eklemek için yazıp Enter veya Tab tuşuna basın
                </p>
              </div>
            </div>
          </div>

          {/* Çeviriler Kartı */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-green-600 rounded-lg">
                <FaGlobe className="text-white text-lg" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dil Çevirileri</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Her dil için başlık, açıklama ve PDF ekleyin</p>
              </div>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold">
                {form.translations.length} Dil
              </span>
            </div>

            {form.translations.map((translation, idx) => (
              <div key={idx} className="mb-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {translation.language 
                        ? availableLanguages.find(l => l.id === translation.language)?.name || `Çeviri ${idx + 1}`
                        : `Çeviri ${idx + 1}`}
                    </h4>
                  </div>
                  {form.translations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTranslation(idx)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 flex items-center gap-1.5"
                    >
                      <FaTrash size={14} />
                      <span className="text-xs font-medium">Sil</span>
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  {/* Dil Seçimi */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      <FaGlobe className="text-green-600" />
                      Dil
                      <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={availableLanguages.map(l => ({ value: l.id, label: l.name }))}
                      value={availableLanguages
                        .filter(l => l.id === translation.language)
                        .map(l => ({ value: l.id, label: l.name }))[0]}
                      onChange={option => handleTranslationChange(idx, 'language', option.value)}
                      isLoading={loadingLanguages}
                      placeholder="Dil seçin..."
                      styles={getSelectStyles(currentTheme)}
                    />
                  </div>

                  {/* Başlık */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      <FaBook className="text-blue-600" />
                      Başlık
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={translation.title}
                      onChange={e => handleTranslationChange(idx, 'title', e.target.value)}
                      required
                      placeholder="Bu dil için kitap başlığı"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
                    />
                  </div>

                  {/* Açıklama */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      <FaInfoCircle className="text-gray-600" />
                      Açıklama
                    </label>
                    <textarea
                      value={translation.description}
                      onChange={e => handleTranslationChange(idx, 'description', e.target.value)}
                      rows="3"
                      placeholder="Bu dil için detaylı açıklama..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition resize-none"
                    />
                  </div>

                  {/* Özet */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      <FaInfoCircle className="text-gray-600" />
                      Özet
                    </label>
                    <textarea
                      value={translation.summary}
                      onChange={e => handleTranslationChange(idx, 'summary', e.target.value)}
                      rows="3"
                      placeholder="Bu dil için kısa özet..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition resize-none"
                    />
                  </div>

                  {/* PDF Dosyası */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      <FaFilePdf className="text-red-600" />
                      PDF Dosyası
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={e => handleTranslationFileChange(idx, e.target.files[0])}
                      required
                      className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 file:cursor-pointer file:transition"
                    />
                    {translation.file && (
                      <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                          <FaFilePdf />
                          {translation.file.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {form.translations.length < 10 && (
              <button
                type="button"
                onClick={addTranslation}
                className="w-full py-3 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-green-500 dark:hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 transition-all flex items-center justify-center gap-2 font-semibold"
              >
                <FaPlus /> Yeni Dil Çevirisi Ekle
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
            <Link
              to="/kitaplar/liste"
              className="px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <FaSave />
                  Kitabı Kaydet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default AddBook; 