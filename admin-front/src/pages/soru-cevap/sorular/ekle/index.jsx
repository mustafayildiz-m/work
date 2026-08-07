import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { qaFetch, ensureArray, flattenCategories, categoryLabel } from '../../qa-api';
import { useQaIntl } from '../../useQaIntl';

export default function QaItemForm({ isEdit = false }) {
  const { t } = useQaIntl();
  const { id } = useParams();
  const navigate = useNavigate();

  const [languages, setLanguages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [form, setForm] = useState({
    categoryId: '',
    order: 0,
    isActive: true,
    sourceReference: '',
    sourceBookletName: '',
    sourceSection: '',
    tagIds: [],
    translations: [],
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [langs, cats, tgs] = await Promise.all([
        qaFetch('/languages'),
        qaFetch('/qa/admin/categories'),
        qaFetch('/qa/tags'),
      ]);

      const activeLangs = ensureArray(langs).filter((l) => l.isActive);
      setLanguages(activeLangs);
      setCategories(flattenCategories(cats));
      setTags(ensureArray(tgs));

      if (!isEdit && activeLangs.length) setActiveTab(activeLangs[0].id);

      if (isEdit && id) {
        const data = await qaFetch(`/qa/items/${id}`);
        setForm({
          categoryId: data.categoryId || '',
          order: data.order || 0,
          isActive: data.isActive,
          sourceReference: data.sourceReference || '',
          sourceBookletName: data.sourceBookletName || '',
          sourceSection: data.sourceSection || '',
          tagIds: data.tags?.map((tag) => tag.id) || [],
          translations: data.translations || [],
        });
        if (data.translations?.length) setActiveTab(data.translations[0].languageId);
      }
    } catch (err) {
      toast.error(err.message || t('QA.LOAD_FAILED'));
    } finally {
      setLoading(false);
    }
  };

  const handleTranslationChange = (langId, field, value) => {
    setForm((prev) => {
      const existing = prev.translations.find((tr) => tr.languageId === langId);
      if (existing) {
        return { ...prev, translations: prev.translations.map((tr) => tr.languageId === langId ? { ...tr, [field]: value } : tr) };
      }
      return { ...prev, translations: [...prev.translations, { languageId: langId, question: '', answer: '', keywords: '', [field]: value }] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        order: Number(form.order),
        translations: form.translations.filter((tr) => tr.question?.trim() && tr.answer?.trim()),
      };

      if (!payload.translations.length) {
        toast.error(t('QA.QA_REQUIRED'));
        setSaving(false);
        return;
      }

      const url = isEdit ? `/qa/items/${id}` : '/qa/items';
      const method = isEdit ? 'PUT' : 'POST';

      await qaFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      toast.success(isEdit ? t('QA.ITEM_UPDATED') : t('QA.ITEM_CREATED'));
      navigate('/soru-cevap/sorular/liste');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (tagId) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId) ? prev.tagIds.filter((tid) => tid !== tagId) : [...prev.tagIds, tagId],
    }));
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">{t('UI.YUKLENIYOR')}</div>;
  }

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {isEdit ? t('QA.ITEM_EDIT') : t('QA.ITEM_NEW')}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('UI.KATEGORI')}</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600">
              <option value="">{t('QA.SELECT')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{categoryLabel(c, c.depth)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('QA.ORDER')}</label>
            <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600" />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('UI.AKTIF')}</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('QA.SOURCE_REFERENCE')}</label>
            <input type="text" value={form.sourceReference} onChange={(e) => setForm({ ...form, sourceReference: e.target.value })}
              placeholder={t('QA.SOURCE_PLACEHOLDER')} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('QA.SOURCE_BOOKLET')}</label>
            <input type="text" value={form.sourceBookletName} onChange={(e) => setForm({ ...form, sourceBookletName: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('QA.SOURCE_SECTION')}</label>
            <input type="text" value={form.sourceSection} onChange={(e) => setForm({ ...form, sourceSection: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600" />
          </div>
        </div>

        {tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('MENU.ETIKETLER')}</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm border ${form.tagIds.includes(tag.id) ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
                  {tag.translations?.[0]?.name || `#${tag.id}`}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">{t('QA.QA_BY_LANGUAGE')}</h2>
          <div className="flex flex-wrap gap-1 mb-3 border-b dark:border-gray-700">
            {languages.map((lang) => (
              <button key={lang.id} type="button" onClick={() => setActiveTab(lang.id)}
                className={`px-4 py-2 text-sm rounded-t-lg ${activeTab === lang.id ? 'bg-white dark:bg-gray-800 border border-b-0 dark:border-gray-700 font-medium' : 'text-gray-500 hover:text-gray-700'}`}>
                {lang.name}
              </button>
            ))}
          </div>

          {languages.map((lang) => {
            if (activeTab !== lang.id) return null;
            const trans = form.translations.find((tr) => tr.languageId === lang.id) || {};
            return (
              <div key={lang.id} className="space-y-3 border rounded-lg p-4 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('QA.QUESTION')}</label>
                  <textarea value={trans.question || ''} onChange={(e) => handleTranslationChange(lang.id, 'question', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('QA.ANSWER')}</label>
                  <textarea value={trans.answer || ''} onChange={(e) => handleTranslationChange(lang.id, 'answer', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600" rows={5} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('QA.KEYWORDS')}</label>
                  <input type="text" value={trans.keywords || ''} onChange={(e) => handleTranslationChange(lang.id, 'keywords', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
                    placeholder={t('QA.KEYWORDS_PLACEHOLDER')} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? t('UI.KAYDEDILIYOR') : isEdit ? t('UI.GUNCELLE') : t('QA.CREATE')}
          </button>
          <button type="button" onClick={() => navigate('/soru-cevap/sorular/liste')}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">{t('UI.IPTAL')}</button>
        </div>
      </form>
    </div>
  );
}
