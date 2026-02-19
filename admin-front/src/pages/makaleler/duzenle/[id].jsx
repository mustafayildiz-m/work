import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import Select from 'react-select';
import { getSelectStyles, getTheme } from '@/styles/select-styles';
import { createSlug, createUniqueSlug } from '@/utils/slug-utils';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = BASE_URL + '/articles';

function getCoverUrl(coverImage) {
  if (!coverImage) return '';
  if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
    return coverImage;
  }
  return BASE_URL.replace(/\/$/, '') + (coverImage.startsWith('/') ? coverImage : '/' + coverImage);
}

function EditArticle() {
  const { id } = useParams();
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
  const [existingCoverUrl, setExistingCoverUrl] = useState('');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingArticle, setFetchingArticle] = useState(true);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
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

        // Makaleyi çek
        const articleResponse = await fetch(`${API_URL}/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!articleResponse.ok) {
          throw new Error('Makale bulunamadı');
        }

        const article = await articleResponse.json();

        setForm({
          bookId: article.bookId || null,
          author: article.author || '',
          publishDate: article.publishDate ? article.publishDate.split('T')[0] : '',
          orderIndex: article.orderIndex || 0,
          translations: article.translations?.map(trans => ({
            id: trans.id, // Translation ID'sini ekle
            languageId: trans.languageId,
            title: trans.title || '',
            content: trans.content || '',
            summary: trans.summary || '',
            slug: trans.slug || '',
            pdfFile: null,
            existingPdfUrl: trans.pdfUrl || '',
          })) || []
        });

        if (article.coverImage) {
          setExistingCoverUrl(getCoverUrl(article.coverImage));
          setPreview(getCoverUrl(article.coverImage));
        }
      } catch (error) {
        toast.error(error.message || 'Veriler yüklenemedi');
        navigate('/makaleler/liste');
      } finally {
        setFetchingArticle(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  useEffect(() => {
    if (coverImage) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(coverImage);
    } else if (existingCoverUrl && !preview) {
      setPreview(existingCoverUrl);
    }
  }, [coverImage, existingCoverUrl]);

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
          if (trans.id) formData.append(`translations[${idx}][id]`, trans.id); // Translation ID'sini gönder
          formData.append(`translations[${idx}][languageId]`, trans.languageId);
          formData.append(`translations[${idx}][title]`, trans.title);
          formData.append(`translations[${idx}][content]`, trans.content);
          if (trans.summary) formData.append(`translations[${idx}][summary]`, trans.summary);
          if (trans.slug) formData.append(`translations[${idx}][slug]`, trans.slug);

          // PDF handling: Yeni dosya yüklendiyse onu, yoksa mevcut URL'i gönder
          if (trans.pdfFile) {
            // Yeni PDF dosyası yüklendi
            formData.append(`translations[${idx}][pdfFile]`, trans.pdfFile);
          } else if (trans.existingPdfUrl) {
            // Mevcut PDF'i koru
            formData.append(`translations[${idx}][pdfUrl]`, trans.existingPdfUrl);
          }
        }
      });

      const submitData = async (ignoreErrors = false) => {
        let url = `${API_URL}/${id}`;
        if (ignoreErrors) url += '?ignorePdfErrors=true';

        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.message === 'PDF_INVALID_CONFIRM_NEEDED') {
            if (window.confirm('⚠️ UYARI: PDF Metin İçeriği Bozuk!\n\nBu PDF dosyasının metni okunamıyor. Otomatik çeviri yapılamayacak.\n\nYine de yüklemek istiyor musunuz?')) {
              return submitData(true);
            }
            setLoading(false);
            return;
          }
          throw new Error(errorData.message || 'Makale güncellenemedi');
        }

        toast.success('Makale başarıyla güncellendi!');
        navigate('/makaleler/liste');
      };

      await submitData();
    } catch (error) {
      toast.error(error.message || 'Makale güncellenirken bir hata oluştu');
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

  if (fetchingArticle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Makale yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Makale Düzenle
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Kitap Seçimi */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Kitap Seçimi <span className="text-red-500">*</span>
            </label>
            <Select
              options={bookOptions}
              value={bookOptions.find(opt => opt.value === form.bookId)}
              onChange={(option) => setForm({ ...form, bookId: option?.value || null })}
              placeholder="Kitap seçin..."
              className="react-select-container"
              classNamePrefix="react-select"
              styles={getSelectStyles(currentTheme)}
              isClearable
              required
            />
          </div>

          {/* Yazar */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Makale Yazarı
            </label>
            <input
              type="text"
              name="author"
              value={form.author}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="Dr. Mehmet Yılmaz"
            />
          </div>

          {/* Yayın Tarihi ve Sıra */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Yayın Tarihi
              </label>
              <input
                type="date"
                name="publishDate"
                value={form.publishDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Sıra (Order Index)
              </label>
              <input
                type="number"
                name="orderIndex"
                value={form.orderIndex}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                min="0"
              />
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Kapak Resmi
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
            />
            {preview && (
              <div className="mt-3">
                <img
                  src={preview}
                  alt="Önizleme"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Translations */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Çeviriler <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addTranslation}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                disabled={form.translations.length >= 10}
              >
                + Çeviri Ekle
              </button>
            </div>

            {form.translations.map((trans, idx) => (
              <div
                key={idx}
                className="p-4 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Çeviri {idx + 1}
                  </h3>
                  {form.translations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTranslation(idx)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Kaldır
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Dil Seçimi */}
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Dil <span className="text-red-500">*</span>
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
                    <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Başlık <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={trans.title}
                      onChange={(e) =>
                        handleTranslationChange(idx, 'title', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                      placeholder="Makale başlığı"
                      required
                    />
                  </div>

                  {/* İçerik */}
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                      İçerik <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={trans.content}
                      onChange={(e) =>
                        handleTranslationChange(idx, 'content', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                      rows="6"
                      placeholder="Makale içeriği..."
                      required
                    />
                  </div>

                  {/* Özet */}
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Özet
                    </label>
                    <textarea
                      value={trans.summary}
                      onChange={(e) =>
                        handleTranslationChange(idx, 'summary', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                      rows="3"
                      placeholder="Kısa özet..."
                    />
                  </div>


                  {/* PDF Dosyası */}
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                      PDF Dosyası
                    </label>
                    {trans.existingPdfUrl && !trans.pdfFile && (
                      <div className="mb-2">
                        <a
                          href={BASE_URL + trans.existingPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs"
                        >
                          Mevcut PDF'i görüntüle
                        </a>
                      </div>
                    )}
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) =>
                        handleTranslationFileChange(idx, e.target.files[0])
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-gray-100"
                    />
                    {trans.pdfFile && (
                      <p className="mt-1 text-xs text-green-600">
                        Yeni dosya seçildi: {trans.pdfFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/makaleler/liste')}
              className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || !form.bookId}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Güncelleniyor...' : 'Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditArticle;

