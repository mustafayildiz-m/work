import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, X, Check } from 'lucide-react';
import { qaFetch, ensureArray } from '../../qa-api';
import { useQaIntl } from '../../useQaIntl';

export default function QaTagList() {
  const { t } = useQaIntl();
  const [tags, setTags] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState([]);

  useEffect(() => {
    fetchTags();
    qaFetch('/languages')
      .then((data) => setLanguages(ensureArray(data).filter((l) => l.isActive)))
      .catch(() => setLanguages([]));
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const data = await qaFetch('/qa/tags');
      setTags(ensureArray(data));
    } catch (err) {
      toast.error(err.message || t('QA.TAGS_LOAD_FAILED'));
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData(languages.map((l) => ({ languageId: l.id, name: '' })));
    setShowForm(true);
  };

  const openEdit = (tag) => {
    setEditingId(tag.id);
    setFormData(languages.map((l) => {
      const existing = tag.translations?.find((tr) => tr.languageId === l.id);
      return { languageId: l.id, name: existing?.name || '' };
    }));
    setShowForm(true);
  };

  const handleSave = async () => {
    const translations = formData.filter((tr) => tr.name.trim());
    if (!translations.length) { toast.error(t('QA.TAG_NAME_REQUIRED')); return; }

    try {
      const url = editingId ? `/qa/tags/${editingId}` : '/qa/tags';
      const method = editingId ? 'PUT' : 'POST';
      await qaFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ translations }),
      });
      toast.success(editingId ? t('QA.TAG_UPDATED') : t('QA.TAG_CREATED'));
      setShowForm(false);
      fetchTags();
    } catch (err) {
      toast.error(err.message || t('QA.OPERATION_FAILED'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('QA.TAG_DELETE_CONFIRM'))) return;
    try {
      await qaFetch(`/qa/tags/${id}`, { method: 'DELETE' });
      toast.success(t('QA.TAG_DELETED'));
      fetchTags();
    } catch (err) {
      toast.error(err.message || t('QA.DELETE_FAILED'));
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('QA.TAGS_TITLE')}</h1>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> {t('QA.TAG_NEW_BTN')}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-xl p-4 mb-6">
          <h3 className="font-medium mb-3">{editingId ? t('QA.TAG_EDIT') : t('QA.TAG_NEW')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {languages.map((lang, i) => (
              <div key={lang.id} className="flex items-center gap-2">
                <span className="text-sm text-gray-500 w-16">{lang.code}</span>
                <input type="text" value={formData[i]?.name || ''}
                  onChange={(e) => { const d = [...formData]; d[i] = { ...d[i], name: e.target.value }; setFormData(d); }}
                  placeholder={t('QA.TAG_TRANSLATION', { lang: lang.name })}
                  className="flex-1 border rounded-lg px-3 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-600" />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleSave} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700">
              <Check className="w-3 h-3" /> {t('UI.KAYDET')}
            </button>
            <button onClick={() => setShowForm(false)} className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-300">
              <X className="w-3 h-3" /> {t('UI.IPTAL')}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">{t('UI.YUKLENIYOR')}</div>
      ) : tags.length === 0 ? (
        <div className="text-center py-10 text-gray-500">{t('QA.NO_TAGS')}</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-700 divide-y dark:divide-gray-700">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {tag.translations?.map((tr) => tr.name).join(' / ') || `#${tag.id}`}
                </span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(tag)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(tag.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
