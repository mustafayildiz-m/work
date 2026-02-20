import { FormattedMessage } from "react-intl";
import { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CoverImageDialog({ open, onOpenChange, onImageUpload, loading = false }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Lütfen geçerli bir resim dosyası seçin.');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Dosya boyutu 5MB\'dan küçük olmalıdır.');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (selectedFile && onImageUpload) {
      await onImageUpload(selectedFile);
      // Reset state after upload
      setSelectedFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle><FormattedMessage id="UI.KAPAK_RESMI_GUNCELLE" /></DialogTitle>
          <DialogDescription>
            <FormattedMessage id="UI.YENI_BIR_KAPAK_RESMI_YUKLEYIN_DESTEKLENE" />
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="cover-image"><FormattedMessage id="UI.RESIM_SECIN" /></Label>
            <div className="flex items-center gap-2">
              <Input
                id="cover-image"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div className="space-y-2">
              <Label><FormattedMessage id="UI.ONIZLEME" /></Label>
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* No file selected state */}
          {!selectedFile && (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <FormattedMessage id="UI.BIR_RESIM_DOSYASI_SECIN" />
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleCancel}>
            <FormattedMessage id="UI.IPTAL" />
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="min-w-[100px]"
          >
            {loading ? 'Yükleniyor...' : 'Yükle'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
