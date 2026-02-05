import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { FaArrowLeft, FaSave, FaMicrophone, FaImage, FaMusic, FaUser, FaClock, FaGlobe, FaUpload, FaEye, FaStar, FaTrash, FaList } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AddPodcast() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    author: '',
    language: 'tr',
    category: '',
    duration: '',
    publishDate: '',
    isActive: true,
    isFeatured: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch(`${API_URL}/languages`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setLanguages(Array.isArray(data) ? data : []))
      .catch(() => setLanguages([]));
  }, []);

  useEffect(() => {
    if (coverFile) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result);
      reader.readAsDataURL(coverFile);
    } else {
      setCoverPreview('');
    }
  }, [coverFile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('author', form.author);
      formData.append('language', form.language);
      formData.append('category', form.category);
      formData.append('isActive', form.isActive);
      formData.append('isFeatured', form.isFeatured);
      
      if (form.duration) {
        formData.append('duration', Number(form.duration) * 60); // Dakika to saniye
      }
      
      if (form.publishDate) {
        formData.append('publishDate', form.publishDate);
      }
      
      if (audioFile) {
        formData.append('audio', audioFile);
      }
      
      if (coverFile) {
        formData.append('cover', coverFile);
      }

      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/podcasts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Podcast eklenemedi');

      toast.success('Podcast başarıyla eklendi!');
      navigate('/podcast/liste');
    } catch (error) {
      toast.error(error.message || 'Podcast eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Hadis', 'Fıkıh', 'Tefsir', 'Siyer', 'Akaid', 'Tasavvuf', 'Genel'];

  return (
    <>
      <Helmet>
        <title>Yeni Podcast Ekle - Islamic Windows Admin</title>
      </Helmet>
      
      <div className="p-6 max-w-5xl mx-auto">
        {/* Modern Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link 
                to="/podcast/liste"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <FaArrowLeft className="text-gray-700 dark:text-gray-300" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
                    <FaMicrophone className="text-2xl" />
                  </div>
                  Yeni Podcast Ekle
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 ml-1">
                  Sesli içerik ekleyin ve yayınlayın
                </p>
              </div>
            </div>
          </div>
          
          <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" style={{ width: '33%' }} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Temel Bilgiler */}
          <div className="rounded-xl shadow-xl bg-white dark:bg-gray-900 p-8 border-2 border-purple-100 dark:border-purple-900">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-xl p-5 mb-6 border border-purple-200 dark:border-purple-800">
              <h3 className="text-2xl font-bold flex items-center gap-3 text-purple-700 dark:text-purple-300">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <FaMicrophone className="text-white" />
                </div>
                Temel Bilgiler
              </h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-2 font-bold mb-3 text-base">
                  <FaMicrophone className="text-purple-500" />
                  Başlık *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Podcast başlığı..."
                  className="w-full px-4 py-3 h-11 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 font-bold mb-3 text-base">
                  <FaList className="text-blue-500" />
                  Açıklama
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Podcast hakkında detaylı açıklama..."
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  💡 Podcast içeriğini detaylı bir şekilde anlatın
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-2 font-bold mb-3 text-base">
                    <FaUser className="text-green-500" />
                    Konuşmacı / Yazar
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={form.author}
                    onChange={handleChange}
                    placeholder="Konuşmacı adı..."
                    className="w-full px-4 py-3 h-11 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 font-bold mb-3 text-base">
                    <FaList className="text-orange-500" />
                    Kategori
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 h-11 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="">Seçiniz</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 font-bold mb-3 text-base">
                    <FaGlobe className="text-indigo-500" />
                    Dil
                  </label>
                  <select
                    name="language"
                    value={form.language}
                    onChange={handleChange}
                    className="w-full px-4 py-3 h-11 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    {languages.map(lang => (
                      <option key={lang.id} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 font-bold mb-3 text-base">
                    <FaClock className="text-teal-500" />
                    Süre (Dakika)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    placeholder="Örn: 45"
                    min="0"
                    className="w-full px-4 py-3 h-11 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    🎙️ Podcast süresini dakika cinsinden girin
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 font-bold mb-3 text-base">
                    📅 Yayın Tarihi
                  </label>
                  <input
                    type="date"
                    name="publishDate"
                    value={form.publishDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 h-11 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Medya Dosyaları */}
          <div className="rounded-xl shadow-xl bg-white dark:bg-gray-900 p-8 border-2 border-blue-100 dark:border-blue-900">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-xl p-5 mb-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-2xl font-bold flex items-center gap-3 text-blue-700 dark:text-blue-300">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <FaMusic className="text-white" />
                </div>
                Medya Dosyaları
              </h3>
            </div>

            <div className="space-y-6">
              {/* Audio Upload */}
              <div>
                <label className="flex items-center gap-2 font-bold mb-3 text-base">
                  <FaMusic className="text-red-500" />
                  Ses Dosyası *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-all">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files[0])}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label
                    htmlFor="audio-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    {audioFile ? (
                      <>
                        <FaMusic className="text-5xl text-purple-500" />
                        <p className="font-semibold text-gray-900 dark:text-white">{audioFile.name}</p>
                        <p className="text-sm text-gray-500">
                          Boyut: {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setAudioFile(null);
                          }}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center gap-2"
                        >
                          <FaTrash /> Dosyayı Kaldır
                        </button>
                      </>
                    ) : (
                      <>
                        <FaUpload className="text-5xl text-gray-400" />
                        <p className="font-semibold text-gray-700 dark:text-gray-300">
                          Ses dosyası yüklemek için tıklayın
                        </p>
                        <p className="text-sm text-gray-500">
                          MP3, WAV, M4A (Max 100MB)
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="flex items-center gap-2 font-bold mb-3 text-base">
                  <FaImage className="text-green-500" />
                  Kapak Resmi
                </label>
                <div className="flex flex-col md:flex-row items-start gap-4">
                  {coverPreview ? (
                    <div className="relative group">
                      <div className="w-48 h-48 border-2 border-dashed border-green-300 dark:border-green-700 rounded-xl overflow-hidden shadow-lg">
                        <img 
                          src={coverPreview} 
                          alt="Kapak önizleme" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCoverFile(null);
                          setCoverPreview('');
                        }}
                        className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-48 h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                      <div className="text-center">
                        <FaImage className="text-4xl text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Önizleme</p>
                      </div>
                    </div>
                  )}
                  <div className="flex-1 space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCoverFile(e.target.files[0])}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
                    />
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <FaUpload className="text-blue-500" />
                        Podcast kapak resmi yükleyin
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        📷 JPG, PNG, WEBP (Max 5MB, 1:1 oran önerilir)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Görünürlük Ayarları */}
          <div className="rounded-xl shadow-xl bg-white dark:bg-gray-900 p-8 border-2 border-orange-100 dark:border-orange-900">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 rounded-xl p-5 mb-6 border border-orange-200 dark:border-orange-800">
              <h3 className="text-2xl font-bold flex items-center gap-3 text-orange-700 dark:text-orange-300">
                <div className="p-2 bg-orange-600 rounded-lg">
                  <FaEye className="text-white" />
                </div>
                Görünürlük Ayarları
              </h3>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border-2 border-green-200 dark:border-green-800">
                <div className="flex-1">
                  <label htmlFor="isActive" className="flex items-center gap-2 font-bold text-base cursor-pointer">
                    <FaEye className="text-green-600 dark:text-green-400" />
                    Aktif
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Podcast'in kullanıcılara görünür olup olmayacağını belirler
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="w-12 h-6 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
                <div className="flex-1">
                  <label htmlFor="isFeatured" className="flex items-center gap-2 font-bold text-base cursor-pointer">
                    <FaStar className="text-yellow-600 dark:text-yellow-400" />
                    Öne Çıkan
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Podcast'i öne çıkan içerikler arasında gösterir
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}
                  className="w-12 h-6 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 sticky bottom-6 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/podcast/liste')}
              className="h-12 px-6 text-base font-medium border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
            >
              <FaArrowLeft />
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || !form.title}
              className="h-12 px-8 text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-3 border-white border-t-transparent" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <FaSave />
                  Kaydet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

