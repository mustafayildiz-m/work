// @ts-ignore
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, IconButton, Avatar, Chip, Stack, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { PhotoCamera, AttachFile, Send, Close } from '@mui/icons-material';
import { postService } from '../../services/postService';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useTheme } from 'next-themes';

interface CreatePostProps {
  scholarId: string;
  onPostCreated: () => void;
}

const LANGUAGES = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

export const CreatePost: React.FC<CreatePostProps> = ({ scholarId, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('tr');
  const [isLoading, setIsLoading] = useState(false);

  const { theme } = useTheme();
  const safeTheme = theme || 'light';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // @ts-ignore
      setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveFile = (idx: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('scholarId', scholarId);
      formData.append('language', selectedLanguage);
      // status şimdilik nullable, sonradan moderasyon eklenecek
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      await postService.createPost(formData);
      setContent('');
      setSelectedFiles([]);
      setSelectedLanguage('tr');
      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 mb-6">
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="language-select-label">Dil Seçin</InputLabel>
            <Select
              labelId="language-select-label"
              value={selectedLanguage}
              label="Dil Seçin"
              onChange={(e) => setSelectedLanguage(e.target.value)}
              sx={{ 
                bgcolor: safeTheme === 'dark' ? '#18181b' : '#fff',
                color: safeTheme === 'dark' ? '#fff' : '#222',
              }}
            >
              {LANGUAGES.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  <span style={{ marginRight: '8px' }}>{lang.flag}</span>
                  {lang.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44, mr: 2 }}>
            <PhotoCamera />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <CKEditor
              editor={ClassicEditor}
              data={content}
              onChange={(event, editor) => setContent(editor.getData())}
              config={{
                placeholder: 'Ne düşünüyorsunuz?',
              }}
            />
            <style>{`
              .ck-editor__editable_inline {
                min-height: 100px;
                background: ${safeTheme === 'dark' ? '#18181b' : '#fff'};
                color: ${safeTheme === 'dark' ? '#fff' : '#222'};
                border-radius: 8px;
                border: 1px solid ${safeTheme === 'dark' ? '#333' : '#e0e0e0'};
                transition: background 0.2s, color 0.2s;
              }
              .ck.ck-editor__main > .ck-editor__editable:not(.ck-focused) {
                border-color: ${safeTheme === 'dark' ? '#333' : '#e0e0e0'};
              }
            `}</style>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Stack direction="row" spacing={1}>
            <IconButton color="primary" component="label" sx={{ bgcolor: 'rgba(40,40,40,0.08)', borderRadius: 2, '&:hover': { bgcolor: 'primary.dark' } }}>
              <PhotoCamera />
              <input
                type="file"
                hidden
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                multiple
                onChange={handleFileChange}
              />
            </IconButton>
            <IconButton color="primary" component="label" sx={{ bgcolor: 'rgba(40,40,40,0.08)', borderRadius: 2, '&:hover': { bgcolor: 'primary.dark' } }}>
              <AttachFile />
              <input
                type="file"
                hidden
                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                multiple
                onChange={handleFileChange}
              />
            </IconButton>
          </Stack>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            endIcon={<Send />}
            disabled={isLoading || !content.trim()}
            sx={{
              borderRadius: 2,
              px: 4,
              fontWeight: 700,
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.2)',
              textTransform: 'none',
            }}
          >
            Paylaş
          </Button>
        </Box>
        {selectedFiles.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
            {selectedFiles.map((file, idx) => (
              <Chip
                key={idx}
                label={file.name}
                onDelete={() => handleRemoveFile(idx)}
                sx={{ bgcolor: 'grey.900', color: 'grey.100', border: '1px solid #333', m: 0.5 }}
                deleteIcon={<Close sx={{ color: 'grey.400' }} />}
              />
            ))}
          </Stack>
        )}
      </form>
      <style>{`
        .ck-editor__editable_inline {
          min-height: 200px !important;
          background: ${safeTheme === 'dark' ? '#18181b' : '#fff'} !important;
          color: ${safeTheme === 'dark' ? '#f3f4f6' : '#18181b'} !important;
        }
      `}</style>
    </div>
  );
}; 