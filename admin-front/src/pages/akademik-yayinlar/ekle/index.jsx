import React, { useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { getLocalizedLanguageName } from '@/utils/languageUtils';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/papers';
const getTodayDate = () => new Date().toISOString().split('T')[0];

function AddPaper() {
  const intl = useIntl();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [form, setForm] = useState({
    title: '',
    author: '',
    publishDate: getTodayDate(),
    intro: '',
    tags: '',
    content: '',
    sourceLanguage: 'tr'
  });

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  React.useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch(`${API_URL.replace('/papers', '')}/languages`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((r) => r.json())
      .then((data) => setLanguages(Array.isArray(data) ? data : []))
      .catch(() => setLanguages([]))
      .finally(() => setLanguagesLoading(false));
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();

      formData.append('title', form.title);
      formData.append('author', form.author);
      formData.append('publishDate', form.publishDate);
      formData.append('intro', form.intro);
      formData.append('sourceLanguage', form.sourceLanguage || 'tr');
      const tagsArr = form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
      formData.append('tags', JSON.stringify(tagsArr));
      if (imageFile) formData.append('imageFile', imageFile);
      formData.append(
        'sections',
        JSON.stringify([{ title: intl.formatMessage({ id: 'UI.DETAY' }), content: form.content }]),
      );

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const text = await response.text();
      if (!response.ok) {
        let message = intl.formatMessage({ id: 'UI.ERROR_HTTP_STATUS' }, { status: response.status });
        try {
          const parsed = JSON.parse(text);
          message = parsed.message || message;
        } catch (_) {}
        throw new Error(message);
      }

      toast.success(intl.formatMessage({ id: 'UI.ACADEMIC_PUBLICATION_ADD_SUCCESS' }));
      navigate('/akademik-yayinlar/liste');
    } catch (error) {
      toast.error(error.message || intl.formatMessage({ id: 'UI.ACADEMIC_PUBLICATION_ADD_FAILED' }));
    } finally {
      setLoading(false);
    }
  };

  const ckPlaceholder = intl.formatMessage({ id: 'UI.ACADEMIC_PUBLICATION_DETAIL_PLACEHOLDER' });

  return (
    <>
      <Helmet>
        <title>{intl.formatMessage({ id: 'UI.ACADEMIC_PUBLICATION_ADD_HELMET' })}</title>
      </Helmet>

      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              <FormattedMessage id="UI.ACADEMIC_PUBLICATION_ADD_HEADING" />
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              <FormattedMessage id="UI.ACADEMIC_PUBLICATION_ADD_SUBTITLE" />
            </p>
          </div>
          <Link
            to="/akademik-yayinlar/liste"
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center gap-2"
          >
            <FaArrowLeft size={14} />
            <FormattedMessage id="UI.LISTEYE_DON" />
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="UI.NEWSLETTER_BASIC_IMAGE_SECTION" />
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                className="input-style"
                placeholder={intl.formatMessage({ id: 'UI.NEWSLETTER_TITLE_PLACEHOLDER' })}
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                required
              />
              <input
                type="date"
                className="input-style"
                value={form.publishDate}
                onChange={(e) => updateField('publishDate', e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FormattedMessage id="UI.NEWSLETTER_SOURCE_LANGUAGE_LABEL" />
              </label>
              <select
                className="input-style"
                value={form.sourceLanguage}
                onChange={(e) => updateField('sourceLanguage', e.target.value)}
                disabled={languagesLoading}
              >
                {languagesLoading ? (
                  <option value="tr">{intl.formatMessage({ id: 'UI.YUKLENIYOR' })}</option>
                ) : languages.length === 0 ? (
                  <option value="tr">{intl.formatMessage({ id: 'UI.DIL_BULUNAMADI' })}</option>
                ) : (
                  languages
                    .filter((l) => l.isActive !== false)
                    .sort((a, b) => getLocalizedLanguageName(a, intl).localeCompare(getLocalizedLanguageName(b, intl)))
                    .map((l) => (
                      <option key={l.id} value={l.code}>
                        {getLocalizedLanguageName(l, intl)}
                      </option>
                    ))
                )}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                <FormattedMessage id="UI.NEWSLETTER_SOURCE_LANGUAGE_HINT" />
              </p>
            </div>
            <input
              className="input-style mb-4"
              placeholder={intl.formatMessage({ id: 'UI.ACADEMIC_PUBLICATION_AUTHOR_PLACEHOLDER' })}
              value={form.author}
              onChange={(e) => updateField('author', e.target.value)}
            />
            <input
              className="input-style mb-4"
              placeholder={intl.formatMessage({ id: 'UI.ACADEMIC_PUBLICATION_TAGS_PLACEHOLDER' })}
              value={form.tags}
              onChange={(e) => updateField('tags', e.target.value)}
            />
            <textarea
              className="input-style mb-4 min-h-24"
              placeholder={intl.formatMessage({ id: 'UI.NEWSLETTER_INTRO_PLACEHOLDER' })}
              value={form.intro}
              onChange={(e) => updateField('intro', e.target.value)}
              required
            />
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  <FormattedMessage id="UI.NEWSLETTER_COVER_LABEL" />
                </label>
                <button
                  type="button"
                  className="input-style text-left cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imageFile?.name || intl.formatMessage({ id: 'UI.NEWSLETTER_COVER_CLICK_TO_SELECT' })}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt={intl.formatMessage({ id: 'UI.NEWSLETTER_IMAGE_PREVIEW_ALT' })}
                  className="w-full max-w-md rounded-lg border border-gray-200 dark:border-gray-700"
                />
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              <FormattedMessage id="UI.ACADEMIC_PUBLICATION_CONTENT_HEADING" />
            </h3>
            <div className="ck-wrapper">
              <CKEditor
                editor={ClassicEditor}
                data={form.content}
                onChange={(_, editor) => updateField('content', editor.getData())}
                config={{
                  placeholder: ckPlaceholder
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link to="/akademik-yayinlar/liste" className="px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold">
              <FormattedMessage id="UI.IPTAL" />
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              <FaSave />
              {loading ? (
                <FormattedMessage id="UI.ACADEMIC_PUBLICATION_SAVING" />
              ) : (
                <FormattedMessage id="UI.ACADEMIC_PUBLICATION_SAVE" />
              )}
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

export default AddPaper;
