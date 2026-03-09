import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/newsletters';
const PUBLIC_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
function EditNewsletter() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [form, setForm] = useState({
    title: '',
    publishDate: '',
    intro: '',
    imageUrl: '',
    content: '',
    sourceLanguage: 'tr'
  });
  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const resolveImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    return `${PUBLIC_API_URL.replace(/\/$/, '')}/${imageUrl.replace(/^\//, '')}`;
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch(`${API_URL.replace('/newsletters', '')}/languages`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((r) => r.json())
      .then((data) => setLanguages(Array.isArray(data) ? data : []))
      .catch(() => setLanguages([]))
      .finally(() => setLanguagesLoading(false));
  }, []);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        const text = await response.text();
        if (!response.ok) throw new Error(`Kayit bulunamadi (${response.status})`);
        const item = JSON.parse(text);
        setForm({
          title: item.title || '',
          publishDate: item.publishDate ? item.publishDate.split('T')[0] : '',
          intro: item.intro || '',
          imageUrl: item.imageUrl || '',
          content: item.sections?.[0]?.content || '',
          sourceLanguage: item.sourceLanguage || 'tr'
        });
      } catch (error) {
        toast.error(error.message || 'Bulten yuklenemedi');
      } finally {
        setFetching(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('publishDate', form.publishDate);
      formData.append('intro', form.intro);
      formData.append('sourceLanguage', form.sourceLanguage || 'tr');
      if (imageFile) formData.append('imageFile', imageFile);
      formData.append('sections', JSON.stringify([{ title: 'Detay', content: form.content }]));

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!response.ok) throw new Error('Guncelleme basarisiz');
      toast.success('Bulten guncellendi');
      navigate('/haber-bultenleri/liste');
    } catch (error) {
      toast.error(error.message || 'Bulten guncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-6 text-gray-600 dark:text-gray-300">Yukleniyor...</div>;
  }

  return (
    <>
      <Helmet>
        <title>Haber Bulteni Duzenle</title>
      </Helmet>

      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Haber Bulteni Duzenle</h2>
          <Link
            to="/haber-bultenleri/liste"
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center gap-2"
          >
            <FaArrowLeft size={14} />
            Listeye Don
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Temel ve Gorsel Bilgiler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input className="input-style" placeholder="Baslik *" value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
              <input type="date" className="input-style" value={form.publishDate} onChange={(e) => updateField('publishDate', e.target.value)} required />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Kaynak dil (icerigin yazildigi dil)</label>
              <select
                className="input-style"
                value={form.sourceLanguage}
                onChange={(e) => updateField('sourceLanguage', e.target.value)}
                disabled={languagesLoading}
              >
                {languagesLoading ? (
                  <option value="tr">Diller yukleniyor...</option>
                ) : languages.length === 0 ? (
                  <option value="tr">Dil bulunamadi</option>
                ) : (
                  (() => {
                    const activeLangs = languages.filter((l) => l.isActive !== false).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                    const hasCurrent = activeLangs.some((l) => l.code === form.sourceLanguage);
                    return (
                      <>
                        {!hasCurrent && form.sourceLanguage && (
                          <option value={form.sourceLanguage}>Kaynak: {form.sourceLanguage}</option>
                        )}
                        {activeLangs.map((l) => (
                          <option key={l.id} value={l.code}>{l.name}</option>
                        ))}
                      </>
                    );
                  })()
                )}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Kullanici farkli dil kullaniyorsa icerik bu dile cevrilir.</p>
            </div>
            <textarea className="input-style mb-4 min-h-24" placeholder="Intro *" value={form.intro} onChange={(e) => updateField('intro', e.target.value)} required />
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Image URL</label>
                <button
                  type="button"
                  className="input-style text-left cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imageFile?.name || (form.imageUrl ? 'Mevcut kapak resmi secili' : 'Kapak resmi secmek icin tiklayin')}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
              {(imagePreview || form.imageUrl) && (
                <img
                  src={imagePreview || resolveImageUrl(form.imageUrl)}
                  alt="Mevcut gorsel"
                  className="w-full max-w-md rounded-lg border border-gray-200 dark:border-gray-700"
                />
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Bulten Icerigi</h3>
            <div className="ck-wrapper">
              <CKEditor
                editor={ClassicEditor}
                data={form.content}
                onChange={(_, editor) => updateField('content', editor.getData())}
                config={{
                  placeholder: 'Bultenin detay metnini buraya yazin...'
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link to="/haber-bultenleri/liste" className="px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold">
              Iptal
            </Link>
            <button type="submit" disabled={loading} className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2">
              <FaSave />
              {loading ? 'Guncelleniyor...' : 'Degisiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .input-style {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid rgb(209 213 219);
          border-radius: 0.5rem;
          background: white;
          color: rgb(17 24 39);
        }
        .dark .input-style {
          border-color: rgb(75 85 99);
          background: rgb(31 41 55);
          color: rgb(243 244 246);
        }
        .ck-wrapper .ck-editor__editable_inline {
          min-height: 220px;
        }
        .dark .ck.ck-editor {
          --ck-color-base-background: rgb(31 41 55);
          --ck-color-base-foreground: rgb(55 65 81);
          --ck-color-text: rgb(243 244 246);
          --ck-color-base-border: rgb(75 85 99);
          --ck-color-toolbar-background: rgb(17 24 39);
          --ck-color-toolbar-border: rgb(75 85 99);
          --ck-color-panel-background: rgb(17 24 39);
          --ck-color-panel-border: rgb(75 85 99);
          --ck-color-input-background: rgb(31 41 55);
          --ck-color-input-border: rgb(75 85 99);
        }
        .dark .ck.ck-toolbar .ck-button .ck-button__label,
        .dark .ck.ck-toolbar .ck-button .ck-icon {
          color: rgb(229 231 235);
        }
        .dark .ck.ck-content {
          background: rgb(31 41 55);
          color: rgb(243 244 246);
          border-color: rgb(75 85 99);
        }
      `}</style>
    </>
  );
}

export default EditNewsletter;
