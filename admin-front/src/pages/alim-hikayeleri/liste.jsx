import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import axios from 'axios';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Star,
  Clock,
  Globe,
  Play
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AlimHikayeleriListe() {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Dilleri yükle
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/languages`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        setLanguages(response.data || []);
      } catch (error) {
        // Error handled silently
      }
    };
    fetchLanguages();
  }, []);

  // Fetch stories
  const fetchStories = async (page = 1, search = '', language = 'all', status = 'all') => {
    try {
      setLoading(true);
      
      let url = `${API_BASE_URL}/scholar-stories?page=${page}&limit=20`;
      
      if (search) {
        url = `${API_BASE_URL}/scholar-stories/search?q=${encodeURIComponent(search)}&page=${page}&limit=20`;
      } else {
        // Sadece "all" değilse filtre ekle
        if (language && language !== 'all') {
          url += `&language=${language}`;
        }
        if (status && status !== 'all') {
          url += `&isActive=${status === 'active'}`;
        } else {
          // Admin panelde tüm hikayeleri görmek için 'all' gönder
          url += `&isActive=all`;
        }
      }

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      // API response formatını kontrol et
      const storiesData = response.data.stories || response.data.data || (Array.isArray(response.data) ? response.data : []);
      
      setStories(storiesData);
      setPagination({
        page: response.data.page || response.data.currentPage || 1,
        limit: response.data.limit || 20,
        total: response.data.total || response.data.totalCount || storiesData.length,
        totalPages: response.data.totalPages || Math.ceil((response.data.total || storiesData.length) / 20)
      });
    } catch (error) {
      toast.error('Hikayeler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories(1, searchQuery, languageFilter, statusFilter);
  }, [searchQuery, languageFilter, statusFilter]);

  // Delete story
  const handleDelete = async (storyId) => {
    try {
      await axios.delete(`${API_BASE_URL}/scholar-stories/${storyId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      toast.success('Hikaye başarıyla silindi!');
      setDeleteDialogOpen(false);
      setStoryToDelete(null);
      fetchStories(pagination.page, searchQuery, languageFilter, statusFilter);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Hikaye silinirken bir hata oluştu');
    }
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get language label
  const getLanguageLabel = (languageCode) => {
    const language = languages.find(lang => lang.code === languageCode);
    return language ? language.name : languageCode;
  };

  return (
    <>
      <Helmet>
        <title>Alim Hikayeleri - Islamic Windows Admin</title>
      </Helmet>
      
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Alim Hikayeleri</h1>
          <p className="text-muted-foreground">
            İslam alimlerinin videolu hayat hikayelerini yönetin
          </p>
        </div>
        <Button onClick={() => navigate('/alim-hikayeleri/ekle')}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Hikaye Ekle
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Arama</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Hikaye başlığı veya açıklama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Dil</label>
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Dil seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Diller</SelectItem>
                  {languages.map((language) => (
                    <SelectItem key={language.id} value={language.code}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Durum</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Pasif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Toplam</label>
              <div className="flex items-center h-10 px-3 py-2 border rounded-md bg-muted">
                <span className="text-sm">{pagination.total} hikaye</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Hikayeler</CardTitle>
          <CardDescription>
            Tüm alim hikayelerinin listesi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="ml-2">Yükleniyor...</span>
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Henüz hikaye bulunmuyor</p>
              <Button 
                className="mt-4" 
                onClick={() => navigate('/alim-hikayeleri/ekle')}
              >
                İlk Hikayeyi Ekle
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Kapak</TableHead>
                    <TableHead>Başlık</TableHead>
                    <TableHead>Alim</TableHead>
                    <TableHead>Dil</TableHead>
                    <TableHead>Süre</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Görüntülenme</TableHead>
                    <TableHead>Beğeni</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead className="w-[50px]">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stories.map((story) => (
                    <TableRow key={story.id}>
                      <TableCell>
                        {story.thumbnail_url && (
                          <img
                            src={story.thumbnail_url.startsWith('http') 
                              ? story.thumbnail_url 
                              : `${API_BASE_URL}${story.thumbnail_url}`}
                            alt={story.title}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              e.target.src = `${import.meta.env.BASE_URL}media/images/book-placeholder.jpg`;
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{story.title}</div>
                          {story.is_featured && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Öne Çıkan
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {story.scholar?.fullName || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Globe className="h-3 w-3 mr-1" />
                          {getLanguageLabel(story.language)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {story.video_url ? (
                          <div className="flex items-center gap-1">
                            <Play className="h-3 w-3" />
                            {formatDuration(story.duration)}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={story.is_active ? "default" : "secondary"}>
                          {story.is_active ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {story.view_count || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        {story.like_count || 0}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(story.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => navigate(`/alim-hikayeleri/duzenle/${story.id}`)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Düzenle
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setStoryToDelete(story);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Sayfa {pagination.page} / {pagination.totalPages} 
            ({pagination.total} toplam hikaye)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => fetchStories(pagination.page - 1, searchQuery, languageFilter, statusFilter)}
            >
              Önceki
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => fetchStories(pagination.page + 1, searchQuery, languageFilter, statusFilter)}
            >
              Sonraki
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hikayeyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              "{storyToDelete?.title}" başlıklı hikayeyi silmek istediğinizden emin misiniz? 
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(storyToDelete?.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </>
  );
}
