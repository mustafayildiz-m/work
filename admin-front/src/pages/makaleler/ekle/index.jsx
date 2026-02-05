import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import Select from 'react-select';
import { getSelectStyles, getTheme } from '@/styles/select-styles';
import { createSlug, createUniqueSlug } from '@/utils/slug-utils';
import { FaBook, FaUser, FaCalendar, FaGlobe, FaFilePdf, FaImage, FaArrowLeft, FaSave, FaPlus, FaTrash, FaInfoCircle, FaNewspaper, FaSortNumericUp, FaFileAlt } from 'react-icons/fa';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/articles';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function AddArticle() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    bookId: null,
    author: '',
    publishDate: '',
    orderIndex: 0,
    translations: [
      { languageId: '', title: '', content: '', summary: '', slug: '', pdfFile: null }
    ],
  });
  const [coverImage, setCoverImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
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
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const token = localStorage.getItem('access_token');
        
        // Dilleri çek
        const langResponse = await fetch(`${BASE_URL}/languages`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (langResponse.ok) {
          const languages = await langResponse.json();
          setAvailableLanguages(languages);
        }

        // Kitapları çek
        const booksResponse = await fetch(`${BASE_URL}/books?limit=1000`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (booksResponse.ok) {
          const booksData = await booksResponse.json();
          const books = booksData.data || [];
          setAvailableBooks(books);
        }
      } catch (error) {
        toast.error('Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (coverImage) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(coverImage);
    } else {
      setPreview('');
    }
  }, [coverImage]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTranslationChange = (idx, field, value) => {
    const newTranslations = form.translations.map((trans, i) => {
      if (i === idx) {
        const updatedTrans = { ...trans, [field]: value };
        
        // Eğer başlık değişiyorsa, slug'ı otomatik oluştur
        if (field === 'title' && value) {
          updatedTrans.slug = createSlug(value);
        }
        
        return updatedTrans;
      }
      return trans;
    });
    setForm({ ...form, translations: newTranslations });
  };

  const handleTranslationFileChange = (idx, file) => {
    const newTranslations = form.translations.map((trans, i) =>
      i === idx ? { ...trans, pdfFile: file } : trans
    );
    setForm({ ...form, translations: newTranslations });
  };

  const addTranslation = () => {
    if (form.translations.length < 10) {
      setForm({
        ...form,
        translations: [
          ...form.translations,
          { languageId: '', title: '', content: '', summary: '', slug: '', pdfFile: null }
        ]
      });
    }
  };

  const removeTranslation = (idx) => {
    if (form.translations.length > 1) {
      setForm({
        ...form,
        translations: form.translations.filter((_, i) => i !== idx)
      });
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();

      // Temel bilgiler
      formData.append('bookId', form.bookId);
      if (form.author) formData.append('author', form.author);
      if (form.publishDate) formData.append('publishDate', form.publishDate);
      formData.append('orderIndex', form.orderIndex);

      // Cover image
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }

      // Translations
      form.translations.forEach((trans, idx) => {
        if (trans.languageId) {
          formData.append(`translations[${idx}][languageId]`, trans.languageId);
          formData.append(`translations[${idx}][title]`, trans.title);
          formData.append(`translations[${idx}][content]`, trans.content);
          if (trans.summary) formData.append(`translations[${idx}][summary]`, trans.summary);
          if (trans.slug) formData.append(`translations[${idx}][slug]`, trans.slug);
          if (trans.pdfFile) {
            formData.append(`translations[${idx}][pdfFile]`, trans.pdfFile);
          }
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
        throw new Error(errorData.message || 'Makale eklenemedi');
      }

      const data = await response.json();
      toast.success('Makale başarıyla eklendi!');
      navigate('/makaleler/liste');
    } catch (error) {
      toast.error(error.message || 'Makale eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const bookOptions = availableBooks.map(book => ({
    value: book.id,
    label: `${book.translations?.[0]?.title || 'İsimsiz'} - ${book.author || 'Bilinmeyen Yazar'}`
  }));

  const languageOptions = availableLanguages.map(lang => ({
    value: lang.id,
    label: lang.name
  }));

  return (
    <>
      <Helmet>
        <title>Yeni Makale Ekle - Islamic Windows Admin</title>
      </Helmet>
      
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaNewspaper className="text-blue-600" />
              Yeni Makale Ekle
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sisteme yeni bir makale ve çevirilerini ekleyin</p>
          </div>
          <Link
            to="/makaleler/liste"
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-2 shadow"
          >
            <FaArrowLeft size={14} />
            Listeye Dön
          </Link>
        </div>

        {loadingData ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Veriler yükleniyor...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Temel Bilgiler Kartı */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <FaNewspaper className="text-white text-lg" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Temel Bilgiler</h3>
              </div>

              <div className="space-y-6">
                {/* Kitap Seçimi */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    <FaBook className="text-purple-600" />
                    İlişkili Kitap
                    <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={bookOptions}
                    onChange={(option) => setForm({ ...form, bookId: option?.value || null })}
                    placeholder="Makaleyle ilişkili kitabı seçin..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={getSelectStyles(currentTheme)}
                    isClearable
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <FaInfoCircle className="inline mr-1" />
                    Bu makale hangi kitapla ilişkili?
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Yazar */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      <FaUser className="text-green-600" />
                      Makale Yazarı
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={form.author}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
                      placeholder="Dr. Mehmet Yılmaz"
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

                  {/* Order Index */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      <FaSortNumericUp className="text-indigo-600" />
                      Sıralama
                    </label>
                    <input
                      type="number"
                      name="orderIndex"
                      value={form.orderIndex}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Kapak Resmi */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    <FaImage className="text-pink-600" />
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
                        onChange={handleCoverImageChange}
                        className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700 file:cursor-pointer file:transition"
                      />
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <FaInfoCircle className="inline mr-1" />
                        PNG, JPG veya WEBP formatında yükleyebilirsiniz
                      </p>
                    </div>
                  </div>
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">Her dil için başlık, içerik ve özet ekleyin</p>
                </div>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold">
                  {form.translations.length} Dil
                </span>
              </div>

              {form.translations.map((trans, idx) => (
                <div
                  key={idx}
                  className="mb-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-800 dark:to-gray-900 hover:border-green-300 dark:hover:border-green-700 transition-all"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {trans.languageId 
                          ? availableLanguages.find(l => l.id === trans.languageId)?.name || `Çeviri ${idx + 1}`
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
                        options={languageOptions}
                        value={languageOptions.find(opt => opt.value === trans.languageId)}
                        onChange={(option) =>
                          handleTranslationChange(idx, 'languageId', option?.value || '')
                        }
                        placeholder="Dil seçin..."
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={getSelectStyles(currentTheme)}
                        isClearable
                      />
                    </div>

                    {/* Başlık */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        <FaNewspaper className="text-blue-600" />
                        Başlık
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={trans.title}
                        onChange={(e) =>
                          handleTranslationChange(idx, 'title', e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
                        placeholder="Bu dil için makale başlığı"
                        required
                      />
                    </div>

                    {/* İçerik */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        <FaFileAlt className="text-gray-600" />
                        İçerik
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={trans.content}
                        onChange={(e) =>
                          handleTranslationChange(idx, 'content', e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition resize-none"
                        rows="6"
                        placeholder="Makale içeriğini buraya yazın..."
                        required
                      />
                    </div>

                    {/* Özet */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        <FaInfoCircle className="text-gray-600" />
                        Özet
                      </label>
                      <textarea
                        value={trans.summary}
                        onChange={(e) =>
                          handleTranslationChange(idx, 'summary', e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition resize-none"
                        rows="3"
                        placeholder="Kısa özet..."
                      />
                    </div>

                    {/* Slug */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        <FaInfoCircle className="text-indigo-600" />
                        URL Slug
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={trans.slug}
                        onChange={(e) =>
                          handleTranslationChange(idx, 'slug', e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition font-mono text-sm"
                        placeholder="makale-basligi"
                        required
                      />
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <FaInfoCircle className="inline mr-1" />
                        Başlık yazdığınızda otomatik oluşturulur
                      </p>
                    </div>

                    {/* PDF Dosyası */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        <FaFilePdf className="text-red-600" />
                        PDF Dosyası
                      </label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) =>
                          handleTranslationFileChange(idx, e.target.files[0])
                        }
                        className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 file:cursor-pointer file:transition"
                      />
                      {trans.pdfFile && (
                        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                            <FaFilePdf />
                            {trans.pdfFile.name}
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
                to="/makaleler/liste"
                className="px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                İptal
              </Link>
              <button
                type="submit"
                disabled={loading || !form.bookId}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Ekleniyor...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Makaleyi Kaydet
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

export default AddArticle;


