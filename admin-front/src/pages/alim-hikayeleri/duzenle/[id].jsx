import { FormattedMessage } from "react-intl";
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Upload, Video, Image, Loader2 } from 'lucide-react';

// Validation Schema
const schema = yup.object({
  title: yup.string().required('Başlık zorunludur').min(3, 'Başlık en az 3 karakter olmalıdır'),
  description: yup.string().required('Açıklama zorunludur').min(10, 'Açıklama en az 10 karakter olmalıdır'),
  video_url: yup.string().url('Geçerli bir video URL\'i giriniz'),
  thumbnail_url: yup.string().url('Geçerli bir thumbnail URL\'i giriniz'),
  duration: yup.number().positive('Süre pozitif bir sayı olmalıdır'),
  language: yup.string().required('Dil seçimi zorunludur'),
  scholar_id: yup.number().required('Alim seçimi zorunludur').positive('Geçerli bir alim seçiniz'),
  is_active: yup.boolean(),
  is_featured: yup.boolean(),
});

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AlimHikayesiDuzenle() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [scholars, setScholars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scholarsLoading, setScholarsLoading] = useState(true);
  const [storyLoading, setStoryLoading] = useState(true);
  const [currentStory, setCurrentStory] = useState(null);

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

  // Fetch scholars
  useEffect(() => {
    const fetchScholars = async () => {
      try {
        setScholarsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/scholars`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setScholars(response.data || []);
      } catch (error) {
        console.error('Alimler yüklenirken hata:', error);
        toast.error('Alimler yüklenirken bir hata oluştu');
      } finally {
        setScholarsLoading(false);
      }
    };

    fetchScholars();
  }, []);

  // Fetch current story
  useEffect(() => {
    const fetchStory = async () => {
      try {
        setStoryLoading(true);
        const response = await axios.get(`${API_BASE_URL}/scholar-stories/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const story = response.data;
        setCurrentStory(story);

        // Set form values
        reset({
          title: story.title,
          description: story.description,
          video_url: story.video_url,
          thumbnail_url: story.thumbnail_url,
          duration: story.duration,
          language: story.language,
          scholar_id: story.scholar_id,
          is_active: story.is_active,
          is_featured: story.is_featured,
        });
      } catch (error) {
        console.error('Hikaye yüklenirken hata:', error);
        toast.error('Hikaye yüklenirken bir hata oluştu');
        navigate('/alim-hikayeleri/liste');
      } finally {
        setStoryLoading(false);
      }
    };

    if (id) {
      fetchStory();
    }
  }, [id, navigate, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const response = await axios.patch(`${API_BASE_URL}/scholar-stories/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      toast.success('Alim hikayesi başarıyla güncellendi!');
      navigate('/alim-hikayeleri/liste');
    } catch (error) {
      console.error('Hikaye güncellenirken hata:', error);
      toast.error(error.response?.data?.message || 'Hikaye güncellenirken bir hata oluştu');
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

  if (storyLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p><FormattedMessage id="UI.HIKAYE_YUKLENIYOR" /></p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentStory) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-muted-foreground"><FormattedMessage id="UI.HIKAYE_BULUNAMADI" /></p>
          <Button 
            className="mt-4" 
            onClick={() => navigate('/alim-hikayeleri/liste')}
          >
            <FormattedMessage id="UI.GERI_DON" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/alim-hikayeleri/liste')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <FormattedMessage id="UI.GERI_DON" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold"><FormattedMessage id="UI.HIKAYE_DUZENLE" /></h1>
          <p className="text-muted-foreground">"{currentStory.title}<FormattedMessage id="UI._HIKAYESINI_DUZENLEYIN" />
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Temel Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              <FormattedMessage id="UI.TEMEL_BILGILER" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage id="UI.HIKAYENIN_TEMEL_BILGILERINI_GUNCELLEYIN" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title"><FormattedMessage id="UI.BASLIK_" /></Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Örn: İmam Gazali Hayatı"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="scholar_id"><FormattedMessage id="UI.ALIM_SECIMI_" /></Label>
                <Select
                  onValueChange={(value) => setValue('scholar_id', parseInt(value))}
                  disabled={scholarsLoading}
                  defaultValue={currentStory.scholar_id?.toString()}
                >
                  <SelectTrigger className={errors.scholar_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder={scholarsLoading ? "Alimler yükleniyor..." : "Alim seçiniz"} />
                  </SelectTrigger>
                  <SelectContent>
                    {scholars.map((scholar) => (
                      <SelectItem key={scholar.id} value={scholar.id.toString()}>
                        {scholar.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.scholar_id && (
                  <p className="text-sm text-red-500">{errors.scholar_id.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description"><FormattedMessage id="UI.ACIKLAMA_" /></Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Hikayenin detaylı açıklamasını yazın..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language"><FormattedMessage id="UI.DIL_" /></Label>
                <Select
                  onValueChange={(value) => setValue('language', value)}
                  defaultValue={currentStory.language}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Dil seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tr"><FormattedMessage id="UI.TURKCE" /></SelectItem>
                    <SelectItem value="en"><FormattedMessage id="UI.INGILIZCE" /></SelectItem>
                    <SelectItem value="ar"><FormattedMessage id="UI.ARAPCA" /></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration"><FormattedMessage id="UI.SURE_DAKIKA" /></Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="30"
                  value={formatDuration(watchedValues.duration)}
                  onChange={(e) => handleDurationChange(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medya Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              <FormattedMessage id="UI.MEDYA_BILGILERI" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage id="UI.VIDEO_VE_THUMBNAIL_URLLERINI_GUNCELLEYIN" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video_url"><FormattedMessage id="UI.VIDEO_URL" /></Label>
              <Input
                id="video_url"
                {...register('video_url')}
                placeholder="https://example.com/video.mp4"
                className={errors.video_url ? 'border-red-500' : ''}
              />
              {errors.video_url && (
                <p className="text-sm text-red-500">{errors.video_url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail_url"><FormattedMessage id="UI.THUMBNAIL_URL" /></Label>
              <Input
                id="thumbnail_url"
                {...register('thumbnail_url')}
                placeholder="https://example.com/thumbnail.jpg"
                className={errors.thumbnail_url ? 'border-red-500' : ''}
              />
              {errors.thumbnail_url && (
                <p className="text-sm text-red-500">{errors.thumbnail_url.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ayarlar */}
        <Card>
          <CardHeader>
            <CardTitle><FormattedMessage id="UI.AYARLAR" /></CardTitle>
            <CardDescription>
              <FormattedMessage id="UI.HIKAYENIN_GORUNURLUK_VE_ONE_CIKARMA_AYAR" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_active"><FormattedMessage id="UI.AKTIF" /></Label>
                <p className="text-sm text-muted-foreground">
                  <FormattedMessage id="UI.HIKAYENIN_GORUNUR_OLUP_OLMAYACAGINI_BELI" />
                </p>
              </div>
              <Switch
                id="is_active"
                checked={watchedValues.is_active}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_featured"><FormattedMessage id="UI.ONE_CIKAN" /></Label>
                <p className="text-sm text-muted-foreground">
                  <FormattedMessage id="UI.HIKAYEYI_ONE_CIKAN_HIKAYELER_ARASINDA_GO" />
                </p>
              </div>
              <Switch
                id="is_featured"
                checked={watchedValues.is_featured}
                onCheckedChange={(checked) => setValue('is_featured', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* İstatistikler */}
        <Card>
          <CardHeader>
            <CardTitle><FormattedMessage id="UI.ISTATISTIKLER" /></CardTitle>
            <CardDescription>
              <FormattedMessage id="UI.HIKAYENIN_PERFORMANS_VERILERI" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{currentStory.view_count || 0}</div>
                <div className="text-sm text-muted-foreground"><FormattedMessage id="UI.GORUNTULENME" /></div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{currentStory.like_count || 0}</div>
                <div className="text-sm text-muted-foreground"><FormattedMessage id="UI.BEGENI" /></div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {formatDuration(currentStory.duration)}
                </div>
                <div className="text-sm text-muted-foreground"><FormattedMessage id="UI.DAKIKA" /></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/alim-hikayeleri/liste')}
          >
            <FormattedMessage id="UI.IPTAL" />
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                <FormattedMessage id="UI.GUNCELLENIYOR" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                <FormattedMessage id="UI.GUNCELLE" />
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
