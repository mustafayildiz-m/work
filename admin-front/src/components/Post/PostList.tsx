// @ts-ignore
import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, CardMedia, Typography, IconButton, Grid, Dialog, DialogContent, DialogTitle, DialogActions, TextField, Button, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';
import { Delete, Download, Close, Translate, Add } from '@mui/icons-material';
import { postService, Post, Translation } from '../../services/postService';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';

interface PostListProps {
  scholarId: string;
  refreshKey?: number;
}

const LANGUAGES = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

export const PostList: React.FC<PostListProps> = ({ scholarId, refreshKey }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openImage, setOpenImage] = useState<string | null>(null);
  const [editTranslation, setEditTranslation] = useState<{ post: Post; translation: Translation } | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [editFileUrls, setEditFileUrls] = useState<string[]>([]);
  const [editMediaUrls, setEditMediaUrls] = useState<string[]>([]);
  // Her post için ayrı dil seçimi - key: postId, value: languageCode
  const [selectedLanguages, setSelectedLanguages] = useState<{[postId: string]: string}>({});
  
  // Yeni çeviri ekleme için state'ler
  const [addTranslationPost, setAddTranslationPost] = useState<Post | null>(null);
  const [newTranslationLanguage, setNewTranslationLanguage] = useState('');
  const [newTranslationContent, setNewTranslationContent] = useState('');
  const [newTranslationFiles, setNewTranslationFiles] = useState<File[]>([]);
  const [addTranslationLoading, setAddTranslationLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      const fetchedPosts = await postService.getScholarPosts(scholarId);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [scholarId, refreshKey]);

  useEffect(() => {
    if (editTranslation) {
      setEditContent(editTranslation.translation.content);
      setEditFileUrls(editTranslation.translation.fileUrls || []);
      setEditMediaUrls(editTranslation.translation.mediaUrls || []);
      setEditFiles([]);
    }
  }, [editTranslation]);

  useEffect(() => {
    if (addTranslationPost) {
      // Yeni çeviri eklerken state'leri temizle
      setNewTranslationLanguage('');
      setNewTranslationContent('');
      setNewTranslationFiles([]);
    }
  }, [addTranslationPost]);

  const handleDelete = async (postId: string) => {
    if (!confirm('Bu gönderiyi ve tüm çevirilerini silmek istediğinizden emin misiniz?')) {
      return;
    }
    try {
      await postService.deletePost(postId);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  // Sadece bir dildeki çeviriyi silme
  const handleDeleteTranslation = async (postId: string, language: string) => {
    const post = posts.find(p => p.id === postId);
    
    // Eğer sadece 1 çeviri kaldıysa, tüm post'u silmek isteyip istemediğini sor
    if (post && post.translations && post.translations.length === 1) {
      if (confirm('Bu son çeviri. Gönderiyi tamamen silmek ister misiniz?')) {
        await handleDelete(postId);
      }
      return;
    }

    const languageName = LANGUAGES.find(l => l.code === language)?.name || language;
    if (!confirm(`${languageName} çevirisini silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      await postService.deleteTranslation(postId, language);
      // Postları yeniden yükle
      fetchPosts();
    } catch (error) {
      console.error('Error deleting translation:', error);
      alert('Çeviri silinirken bir hata oluştu.');
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEditFiles([...editFiles, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveEditFileUrl = (idx: number) => {
    setEditFileUrls(editFileUrls.filter((_, i) => i !== idx));
  };

  const handleEditSave = async () => {
    if (!editTranslation) return;
    setEditLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', editContent);
      formData.append('fileUrls', JSON.stringify(editFileUrls));
      formData.append('mediaUrls', JSON.stringify(editMediaUrls));
      // status nullable olarak kalacak, sonradan moderasyon eklenecek
      if (editTranslation.translation.status) {
        formData.append('status', editTranslation.translation.status);
      }
      editFiles.forEach(file => {
        formData.append('files', file);
      });
      await postService.updateTranslation(
        editTranslation.post.id,
        editTranslation.translation.language,
        formData
      );
      setEditTranslation(null);
      setEditContent('');
      setEditFiles([]);
      setEditFileUrls([]);
      setEditMediaUrls([]);
      fetchPosts();
    } catch (e) {
      console.error('Error updating translation:', e);
    } finally {
      setEditLoading(false);
    }
  };

  // Yeni çeviri ekleme handler'ı
  const handleAddTranslation = async () => {
    if (!addTranslationPost || !newTranslationLanguage || !newTranslationContent.trim()) return;
    
    setAddTranslationLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', newTranslationContent);
      newTranslationFiles.forEach(file => {
        formData.append('files', file);
      });
      
      await postService.updateTranslation(
        addTranslationPost.id,
        newTranslationLanguage,
        formData
      );
      
      // Modal'ı kapat ve state'leri temizle
      setAddTranslationPost(null);
      setNewTranslationLanguage('');
      setNewTranslationContent('');
      setNewTranslationFiles([]);
      
      // Postları yenile
      fetchPosts();
    } catch (error) {
      console.error('Error adding translation:', error);
    } finally {
      setAddTranslationLoading(false);
    }
  };

  const handleNewTranslationFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewTranslationFiles([...newTranslationFiles, ...Array.from(e.target.files)]);
    }
  };

  if (isLoading) {
    return <Typography>Yükleniyor...</Typography>;
  }

  return (
    <Box>
      {/* Lightbox Modal */}
      <Dialog open={!!openImage} onClose={() => setOpenImage(null)} maxWidth="md" fullWidth>
        <DialogContent sx={{ position: 'relative', p: 0, bgcolor: 'black' }}>
          <IconButton
            onClick={() => setOpenImage(null)}
            sx={{ position: 'absolute', top: 8, right: 8, color: 'white', zIndex: 2 }}
          >
            <Close />
          </IconButton>
          {openImage && (
            <img
              src={openImage}
              alt="Büyük Görsel"
              style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block', margin: '0 auto', background: 'black' }}
            />
          )}
        </DialogContent>
      </Dialog>
      {/* Add Translation Modal */}
      <Dialog open={!!addTranslationPost} onClose={() => setAddTranslationPost(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Çeviri Ekle</DialogTitle>
        <DialogContent>
          {/* Dil Seçici - Sadece mevcut olmayan dilleri göster */}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="new-translation-language-label">Dil Seçin</InputLabel>
            <Select
              labelId="new-translation-language-label"
              value={newTranslationLanguage}
              label="Dil Seçin"
              onChange={(e) => setNewTranslationLanguage(e.target.value)}
            >
              {LANGUAGES.filter(lang => {
                // Sadece bu post'ta olmayan dilleri göster
                return !addTranslationPost?.translations?.some(t => t.language === lang.code);
              }).map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  <span style={{ marginRight: '8px' }}>{lang.flag}</span>
                  {lang.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            minRows={5}
            value={newTranslationContent}
            onChange={e => setNewTranslationContent(e.target.value)}
            placeholder="Çeviri içeriğini girin..."
            sx={{ mt: 2 }}
          />

          {/* Dosya ekleme */}
          <Button component="label" variant="outlined" sx={{ mt: 2 }}>
            Dosya Ekle
            <input type="file" hidden multiple onChange={handleNewTranslationFileChange} />
          </Button>
          {newTranslationFiles.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {newTranslationFiles.map((file, idx) => (
                <Chip
                  key={idx}
                  label={file.name}
                  size="small"
                  onDelete={() => setNewTranslationFiles(newTranslationFiles.filter((_, i) => i !== idx))}
                />
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddTranslationPost(null)} disabled={addTranslationLoading}>
            İptal
          </Button>
          <Button 
            onClick={handleAddTranslation} 
            variant="contained" 
            disabled={addTranslationLoading || !newTranslationLanguage || !newTranslationContent.trim()}
          >
            Çeviri Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Translation Modal */}
      <Dialog open={!!editTranslation} onClose={() => setEditTranslation(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Çeviriyi Düzenle
          {editTranslation && (
            <Chip 
              label={LANGUAGES.find(l => l.code === editTranslation.translation.language)?.name || editTranslation.translation.language}
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            placeholder="İçeriği güncelle..."
            sx={{ mt: 2 }}
          />
          {/* Mevcut dosya yolları */}
          {editFileUrls.length > 0 && (
            <Box sx={{ mt: 2, mb: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {editFileUrls.map((url, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', bgcolor: 'grey.200', px: 1, py: 0.5, borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: 'inherit', mr: 1 }}>{url.split('/').pop()}</Typography>
                  <IconButton size="small" onClick={() => handleRemoveEditFileUrl(idx)}>
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
          {/* Yeni dosya ekleme */}
          <Button component="label" variant="outlined" sx={{ mt: 2 }}>
            Dosya Ekle
            <input type="file" hidden multiple onChange={handleEditFileChange} />
          </Button>
          {editFiles.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {editFiles.map((file, idx) => (
                <Typography key={idx} variant="body2" sx={{ color: 'inherit' }}>{file.name}</Typography>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTranslation(null)} disabled={editLoading}>İptal</Button>
          <Button onClick={handleEditSave} variant="contained" disabled={editLoading || !editContent.trim()}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
      {posts.map((post) => {
        // Her post için seçili dili al, yoksa varsayılan olarak Türkçe veya ilk çeviri
        const currentLanguage = selectedLanguages[post.id] || 'tr';
        const translation = post.translations?.find(t => t.language === currentLanguage) || post.translations?.[0];
        
        if (!translation) {
          return null;
        }

        return (
        <div key={post.id} className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 mb-6">
          <Box>
            {/* Dil seçici ve kontroller */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                {post.translations?.map((trans) => (
                  <Chip
                    key={trans.language}
                    label={LANGUAGES.find(l => l.code === trans.language)?.flag + ' ' + LANGUAGES.find(l => l.code === trans.language)?.name}
                    size="small"
                    color={trans.language === translation.language ? 'primary' : 'default'}
                    onClick={() => setSelectedLanguages(prev => ({ ...prev, [post.id]: trans.language }))}
                    onDelete={() => handleDeleteTranslation(post.id, trans.language)}
                    icon={<Translate />}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
                {/* Çeviri Ekle Butonu - Sadece 4'ten az dil varsa göster */}
                {post.translations && post.translations.length < LANGUAGES.length && (
                  <IconButton
                    size="small"
                    onClick={() => setAddTranslationPost(post)}
                    sx={{ 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      width: 28,
                      height: 28
                    }}
                    title="Yeni Çeviri Ekle"
                  >
                    <Add fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Box>
                <IconButton
                  size="small"
                  className="mr-2 bg-gray-200 dark:bg-gray-800 hover:bg-blue-600 dark:hover:bg-blue-700"
                  sx={{ borderRadius: 2 }}
                  onClick={() => setEditTranslation({ post, translation })}
                >
                  <EditIcon />
                </IconButton>
              </Box>
            </Box>
            <div style={{ marginBottom: 16, color: 'inherit', fontWeight: 500, fontSize: 18 }}
                 dangerouslySetInnerHTML={{ __html: translation.content }} />
            {translation.mediaUrls && translation.mediaUrls.length > 0 && (
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {translation.mediaUrls.map((url, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box
                      sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: 3,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'scale(1.04)',
                          boxShadow: 8,
                        },
                        mb: 1,
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={url}
                        alt={`Post media ${index + 1}`}
                        sx={{ height: 200, objectFit: 'cover', width: '100%' }}
                        onClick={() => setOpenImage(url)}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
            {translation.fileUrls && translation.fileUrls.length > 0 && (
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {translation.fileUrls.map((url, index) => {
                  const ext = url.split('.').pop()?.toLowerCase();
                  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
                  const isPdf = ext === 'pdf';
                  const isWord = ['doc', 'docx'].includes(ext || '');
                  const fileName = url.split('/').pop();
                  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                  const fileUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
                  if (isImage) {
                    return (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Box
                          sx={{
                            borderRadius: 3,
                            overflow: 'hidden',
                            boxShadow: 3,
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            cursor: 'pointer',
                            '&:hover': {
                              transform: 'scale(1.04)',
                              boxShadow: 8,
                            },
                            mb: 1,
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={fileUrl}
                            alt={fileName}
                            sx={{ height: 200, width: '100%', objectFit: 'cover' }}
                            onClick={() => setOpenImage(fileUrl)}
                          />
                        </Box>
                      </Grid>
                    );
                  }
                  return (
                    <Grid item xs={12} key={index}>
                      <div className="flex items-center mb-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow">
                        {isPdf ? (
                          <PictureAsPdfIcon sx={{ mr: 1, color: 'red' }} />
                        ) : isWord ? (
                          <DescriptionIcon sx={{ mr: 1, color: '#2b579a' }} />
                        ) : (
                          <InsertDriveFileIcon sx={{ mr: 1, color: 'grey.400' }} />
                        )}
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-inherit no-underline">
                          <Typography variant="body2" sx={{ color: 'inherit' }}>
                            {fileName}
                          </Typography>
                        </a>
                        <IconButton href={fileUrl} target="_blank" rel="noopener noreferrer" size="small" className="ml-1 text-gray-700 dark:text-gray-200">
                          <Download />
                        </IconButton>
                      </div>
                    </Grid>
                  );
                })}
              </Grid>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Typography variant="caption" color="grey.400">
                {format(new Date(translation.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="grey.500" sx={{ mr: 1 }}>
                  Tüm gönderiyi sil:
                </Typography>
                <IconButton
                  color="error"
                  onClick={() => handleDelete(post.id)}
                  size="small"
                  className="bg-gray-200 dark:bg-gray-800 hover:bg-red-600 dark:hover:bg-red-700"
                  sx={{ borderRadius: 2 }}
                  title="Tüm gönderiyi ve tüm çevirileri sil"
                >
                  <Delete />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </div>
        );
      })}
    </Box>
  );
}; 