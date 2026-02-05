import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import axios from 'axios';
import { FaArrowLeft, FaSave, FaVideo, FaImage, FaUser, FaClock, FaGlobe, FaUpload, FaEye, FaStar, FaTrash } from 'react-icons/fa';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AsyncSelect from 'react-select/async';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

// Validation Schema
const schema = yup.object({
  title: yup.string().required('Başlık zorunludur').min(3, 'Başlık en az 3 karakter olmalıdır'),
  description: yup.string().required('Açıklama zorunludur').min(10, 'Açıklama en az 10 karakter olmalıdır'),
  video_url: yup.string().url('Geçerli bir video URL\'i giriniz'),
  duration: yup.number().positive('Süre pozitif bir sayı olmalıdır'),
  language: yup.string().required('Dil seçimi zorunludur'),
  scholar_id: yup.number().required('Alim seçimi zorunludur').positive('Geçerli bir alim seçiniz'),
  is_active: yup.boolean(),
  is_featured: yup.boolean(),
});

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AlimHikayesiEkle() {
  const navigate = useNavigate();
  const [selectedScholar, setSelectedScholar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [youtubeThumbnail, setYoutubeThumbnail] = useState(null);

  // YouTube Video ID Extraction Helper
  const getYouTubeId = (url) => {
    if (!url) return null;
    const cleanUrl = url.trim();
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = cleanUrl.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      is_active: true,
      is_featured: false,
      language: 'tr'
    }
  });

  const watchedValues = watch();

  // Watch video_url for changes
  const videoUrl = watch('video_url');

  useEffect(() => {
    const videoId = getYouTubeId(videoUrl);

    // Geçerli bir ID varsa göster
    if (videoId) {
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      // Sonner toast.custom kullanımı
      toast.custom((id) => (
        <div className="flex w-full max-w-sm bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden pointer-events-auto ring-1 ring-black ring-opacity-5 relative z-[99999]">
          <div className="w-32 bg-gray-100 flex-shrink-0 relative">
            <img
              src={thumbnailUrl}
              className="w-full h-full object-cover absolute inset-0"
              alt="Youtube Thumbnail"
            />
          </div>
          <div className="flex-1 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Kapak Resmi Bulundu
            </h3>
            <p className="text-sm text-gray-500 mb-3 leading-tight">
              Videodaki kapak resmini kullanmak ister misiniz?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setThumbnailPreview(thumbnailUrl);
                  setYoutubeThumbnail(thumbnailUrl);
                  setThumbnailFile(null); // Clear file input if any
                  toast.dismiss(id);
                  toast.success('YouTube kapak resmi seçildi');
                }}
                className="bg-indigo-600 text-white text-xs px-3 py-2 rounded-md font-medium hover:bg-indigo-700 transition shadow-sm"
              >
                Evet, Kullan
              </button>
              <button
                onClick={() => toast.dismiss(id)}
                className="text-gray-500 text-xs px-3 py-2 rounded-md font-medium hover:bg-gray-100 transition border"
              >
                Hayır
              </button>
            </div>
          </div>
        </div>
      ), { duration: 8000, id: `youtube-prompt-${videoId}` });
    }
  }, [videoUrl]);

  // Dilleri yükle
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLanguagesLoading(true);
        const response = await axios.get(`${API_BASE_URL}/languages`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        setLanguages(response.data || []);
      } catch (error) {
        toast.error('Diller yüklenirken bir hata oluştu');
        setLanguages([]);
      } finally {
        setLanguagesLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  // Thumbnail preview oluştur
  useEffect(() => {
    if (thumbnailFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(thumbnailFile);
    } else {
      setThumbnailPreview('');
    }
  }, [thumbnailFile]);

  // Backend'den arama yaparak alim getir
  const loadScholars = async (inputValue) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/scholars`, {
        params: {
          search: inputValue || '', // Arama terimi
          limit: 20, // Maksimum 20 sonuç
          page: 1
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      // API'den gelen veri formatını kontrol et - backend {scholars: [...], totalCount: X} formatında döndürüyor
      const scholarsData = response.data?.scholars ||
        (Array.isArray(response.data) ? response.data : []);

      // ReactSelect için options formatına çevir
      const options = scholarsData.map(scholar => ({
        value: scholar.id,
        label: scholar.fullName,
        scholar: scholar
      }));

      return options;
    } catch (error) {
      toast.error('Alimler aranırken bir hata oluştu');
      return [];
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // FormData oluştur (dosya yükleme için)
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('language', data.language);
      formData.append('scholar_id', data.scholar_id);
      formData.append('is_active', data.is_active);
      formData.append('is_featured', data.is_featured);

      if (data.video_url) {
        formData.append('video_url', data.video_url);
      }

      if (data.duration) {
        formData.append('duration', data.duration);
      }

      // Thumbnail dosyasını ekle
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      } else if (youtubeThumbnail) {
        formData.append('thumbnail_url', youtubeThumbnail);
      }

      const response = await axios.post(`${API_BASE_URL}/scholar-stories`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Alim hikayesi başarıyla eklendi!');
      navigate('/alim-hikayeleri/liste');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Hikaye eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDurationChange = (value) => {
    const minutes = parseInt(value) || 0;
    const seconds = minutes * 60;
    setValue('duration', seconds);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    return minutes.toString();
  };

  return (
    <>
      <Helmet>
        <title>Yeni Hikaye Ekle - Islamic Windows Admin</title>
      </Helmet>

      <div className="p-6 max-w-5xl mx-auto">
        {/* Modern Header with Gradient */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link
                to="/alim-hikayeleri/liste"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <FaArrowLeft className="text-gray-700 dark:text-gray-300" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
                    <FaVideo className="text-2xl" />
                  </div>
                  Yeni Âlim Hikayesi Ekle
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 ml-1">
                  İslam âlimlerinin videolu hayat hikayelerini sisteme ekleyin
                </p>
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" style={{ width: '33%' }} />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Temel Bilgiler */}
          <Card className="border-2 border-purple-100 dark:border-purple-900 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-purple-500 text-white">
                  <FaVideo className="text-lg" />
                </div>
                Temel Bilgiler
              </CardTitle>
              <CardDescription className="text-base">
                Hikayenin temel bilgilerini girin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center gap-2 text-base font-semibold">
                    <FaVideo className="text-purple-500" />
                    Başlık *
                  </Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Örn: İmam Gazali Hayatı"
                    className={`h-11 ${errors.title ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-purple-500'}`}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span>⚠️</span> {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scholar_id" className="flex items-center gap-2 text-base font-semibold">
                    <FaUser className="text-green-500" />
                    Âlim Seçimi *
                  </Label>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions
                    loadOptions={loadScholars}
                    value={selectedScholar}
                    onChange={(selectedOption) => {
                      setSelectedScholar(selectedOption);
                      setValue('scholar_id', selectedOption ? selectedOption.value : '');
                    }}
                    placeholder="Âlim arayın ve seçin..."
                    isSearchable={true}
                    isClearable={true}
                    noOptionsMessage={() => "Âlim bulunamadı"}
                    loadingMessage={() => "Aranıyor..."}
                    className={errors.scholar_id ? 'react-select-error' : 'react-select-container'}
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '44px',
                        borderColor: errors.scholar_id ? '#ef4444' : 'hsl(var(--border))',
                        backgroundColor: 'hsl(var(--background))',
                        color: 'hsl(var(--foreground))',
                        boxShadow: 'none',
                        '&:hover': {
                          borderColor: 'hsl(var(--ring))',
                        },
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: 'hsl(var(--muted-foreground))',
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: 'hsl(var(--foreground))',
                      }),
                      input: (base) => ({
                        ...base,
                        color: 'hsl(var(--foreground))',
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused
                          ? 'hsl(var(--accent))'
                          : state.isSelected
                            ? 'hsl(var(--primary))'
                            : 'transparent',
                        color: state.isSelected
                          ? 'hsl(var(--primary-foreground))'
                          : 'hsl(var(--foreground))',
                        '&:hover': {
                          backgroundColor: 'hsl(var(--accent))',
                          color: 'hsl(var(--accent-foreground))',
                        },
                      }),
                      noOptionsMessage: (base) => ({
                        ...base,
                        color: 'hsl(var(--muted-foreground))',
                      }),
                      loadingMessage: (base) => ({
                        ...base,
                        color: 'hsl(var(--muted-foreground))',
                      }),
                    }}
                  />
                  {errors.scholar_id && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span>⚠️</span> {errors.scholar_id.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2 text-base font-semibold">
                  <FaVideo className="text-blue-500" />
                  Açıklama *
                </Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Hikayenin detaylı açıklamasını yazın..."
                  rows={5}
                  className={`resize-none ${errors.description ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-purple-500'}`}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span>⚠️</span> {errors.description.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  💡 Hikayenin içeriğini detaylı bir şekilde anlatın
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="language" className="flex items-center gap-2 text-base font-semibold">
                    <FaGlobe className="text-indigo-500" />
                    Dil *
                  </Label>
                  <Select
                    onValueChange={(value) => setValue('language', value)}
                    value={watchedValues.language}
                    disabled={languagesLoading}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder={languagesLoading ? "Diller yükleniyor..." : "Dil seçiniz"} />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.length === 0 && !languagesLoading ? (
                        <SelectItem value="" disabled>Dil bulunamadı</SelectItem>
                      ) : (
                        languages.map((language) => (
                          <SelectItem key={language.id} value={language.code}>
                            {language.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.language && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span>⚠️</span> {errors.language.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="flex items-center gap-2 text-base font-semibold">
                    <FaClock className="text-orange-500" />
                    Süre (Dakika)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="30"
                    value={formatDuration(watchedValues.duration)}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    className="h-11 focus-visible:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    📹 Video süresini dakika cinsinden girin
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medya Bilgileri */}
          <Card className="border-2 border-blue-100 dark:border-blue-900 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-blue-500 text-white">
                  <FaImage className="text-lg" />
                </div>
                Medya Bilgileri
              </CardTitle>
              <CardDescription className="text-base">
                Video ve kapak resmi bilgilerini girin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label htmlFor="video_url" className="flex items-center gap-2 text-base font-semibold">
                  <FaVideo className="text-red-500" />
                  Video URL
                </Label>
                <Input
                  id="video_url"
                  {...register('video_url')}
                  placeholder="https://example.com/video.mp4"
                  className={`h-11 ${errors.video_url ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-500'}`}
                />
                {errors.video_url && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span>⚠️</span> {errors.video_url.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  🔗 Video dosyasının URL adresini girin
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="thumbnail" className="flex items-center gap-2 text-base font-semibold">
                  <FaImage className="text-green-500" />
                  Kapak Resmi
                </Label>
                <div className="flex flex-col md:flex-row items-start gap-4">
                  {thumbnailPreview ? (
                    <div className="relative group">
                      <div className="w-48 h-48 border-2 border-dashed border-green-300 dark:border-green-700 rounded-xl overflow-hidden shadow-lg">
                        <img
                          src={thumbnailPreview}
                          alt="Kapak önizleme"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnailFile(null);
                          setThumbnailPreview('');
                          setYoutubeThumbnail(null); // Reset youtube thumbnail selection
                        }}
                        className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg"
                        title="Resmi Kaldır"
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
                    <div className="relative">
                      <Input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setThumbnailFile(file);
                          }
                        }}
                        className="cursor-pointer h-11 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
                      />
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <FaUpload className="text-blue-500" />
                        Hikaye kapak resmi yükleyin
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        📷 Desteklenen formatlar: JPG, PNG, WEBP (Max 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ayarlar */}
          <Card className="border-2 border-orange-100 dark:border-orange-900 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-orange-500 text-white">
                  <FaEye className="text-lg" />
                </div>
                Görünürlük Ayarları
              </CardTitle>
              <CardDescription className="text-base">
                Hikayenin görünürlük ve öne çıkarma ayarlarını belirleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border-2 border-green-200 dark:border-green-800 transition-all hover:shadow-md">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="is_active" className="flex items-center gap-2 text-base font-semibold cursor-pointer">
                    <FaEye className="text-green-600 dark:text-green-400" />
                    Aktif
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Hikayenin kullanıcılara görünür olup olmayacağını belirler
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={watchedValues.is_active}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 rounded-lg border-2 border-yellow-200 dark:border-yellow-800 transition-all hover:shadow-md">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="is_featured" className="flex items-center gap-2 text-base font-semibold cursor-pointer">
                    <FaStar className="text-yellow-600 dark:text-yellow-400" />
                    Öne Çıkan
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Hikayeyi öne çıkan hikayeler arasında gösterir
                  </p>
                </div>
                <Switch
                  id="is_featured"
                  checked={watchedValues.is_featured}
                  onCheckedChange={(checked) => setValue('is_featured', checked)}
                  className="data-[state=checked]:bg-yellow-600"
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 <strong>İpucu:</strong> Öne çıkan hikayeler ana sayfada ve liste başında gösterilir
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 sticky bottom-6 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              className="h-12 px-6 text-base font-medium border-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <FaTrash className="mr-2" />
              Formu Temizle
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/alim-hikayeleri/liste')}
              className="h-12 px-6 text-base font-medium border-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <FaArrowLeft className="mr-2" />
              İptal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-12 px-8 text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 min-w-[160px]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-3 border-white border-t-transparent" />
                  Kaydediliyor...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FaSave className="text-lg" />
                  Kaydet
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
