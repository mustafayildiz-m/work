import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { FaQuestionCircle } from 'react-icons/fa';
import { qaFetch, ensureArray, flattenCategories, categoryLabel } from '../../qa-api';
import { useQaIntl } from '../../useQaIntl';
import {
  QaPageShell,
  QaPageHeader,
  QaFormCard,
  QaPrimaryButton,
  QaSecondaryButton,
  qaInputClass,
  qaSelectClass,
  qaLabelClass,
} from '../../QaPageLayout';

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
    return (
      <QaPageShell width="medium">
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">{t('UI.YUKLENIYOR')}</div>
      </QaPageShell>
    );
  }

  return (
    <QaPageShell
      title={`${isEdit ? t('QA.ITEM_EDIT') : t('QA.ITEM_NEW')} - Islamic Windows Admin`}
      width="medium"
    >
      <QaPageHeader
        title={isEdit ? t('QA.ITEM_EDIT') : t('QA.ITEM_NEW')}
        subtitle={t('QA.ITEM_FORM_SUBTITLE')}
        icon={FaQuestionCircle}
        backTo="/soru-cevap/sorular/liste"
        backLabel={t('UI.LISTEYE_DON')}
      />

      <QaFormCard>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={qaLabelClass}>{t('UI.KATEGORI')}</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className={qaSelectClass}
              >
                <option value="">{t('QA.SELECT')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{categoryLabel(c, c.depth)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={qaLabelClass}>{t('QA.ORDER')}</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                className={qaInputClass}
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('UI.AKTIF')}</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={qaLabelClass}>{t('QA.SOURCE_REFERENCE')}</label>
              <input
                type="text"
                value={form.sourceReference}
                onChange={(e) => setForm({ ...form, sourceReference: e.target.value })}
                placeholder={t('QA.SOURCE_PLACEHOLDER')}
                className={qaInputClass}
              />
            </div>
            <div>
              <label className={qaLabelClass}>{t('QA.SOURCE_BOOKLET')}</label>
              <input
                type="text"
                value={form.sourceBookletName}
                onChange={(e) => setForm({ ...form, sourceBookletName: e.target.value })}
                className={qaInputClass}
              />
            </div>
            <div>
              <label className={qaLabelClass}>{t('QA.SOURCE_SECTION')}</label>
              <input
                type="text"
                value={form.sourceSection}
                onChange={(e) => setForm({ ...form, sourceSection: e.target.value })}
                className={qaInputClass}
              />
            </div>
          </div>

          {tags.length > 0 && (
            <div>
              <label className={qaLabelClass}>{t('MENU.ETIKETLER')}</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      form.tagIds.includes(tag.id)
                        ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                    }`}
                  >
                    {tag.translations?.[0]?.name || `#${tag.id}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('QA.QA_BY_LANGUAGE')}</h2>
            <div className="flex flex-wrap gap-1 mb-4 border-b border-gray-200 dark:border-gray-700">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setActiveTab(lang.id)}
                  className={`px-4 py-2 text-sm rounded-t-lg transition-colors ${
                    activeTab === lang.id
                      ? 'bg-white dark:bg-gray-800 border border-b-0 border-gray-200 dark:border-gray-700 font-semibold text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>

            {languages.map((lang) => {
              if (activeTab !== lang.id) return null;
              const trans = form.translations.find((tr) => tr.languageId === lang.id) || {};
              return (
                <div key={lang.id} className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
                  <div>
                    <label className={qaLabelClass}>{t('QA.QUESTION')}</label>
                    <textarea
                      value={trans.question || ''}
                      onChange={(e) => handleTranslationChange(lang.id, 'question', e.target.value)}
                      className={qaInputClass}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className={qaLabelClass}>{t('QA.ANSWER')}</label>
                    <textarea
                      value={trans.answer || ''}
                      onChange={(e) => handleTranslationChange(lang.id, 'answer', e.target.value)}
                      className={qaInputClass}
                      rows={5}
                    />
                  </div>
                  <div>
                    <label className={qaLabelClass}>{t('QA.KEYWORDS')}</label>
                    <input
                      type="text"
                      value={trans.keywords || ''}
                      onChange={(e) => handleTranslationChange(lang.id, 'keywords', e.target.value)}
                      className={qaInputClass}
                      placeholder={t('QA.KEYWORDS_PLACEHOLDER')}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-2">
            <QaPrimaryButton type="submit" disabled={saving}>
              {saving ? t('UI.KAYDEDILIYOR') : isEdit ? t('UI.GUNCELLE') : t('QA.CREATE')}
            </QaPrimaryButton>
            <QaSecondaryButton type="button" onClick={() => navigate('/soru-cevap/sorular/liste')}>
              {t('UI.IPTAL')}
            </QaSecondaryButton>
          </div>
        </form>
      </QaFormCard>
    </QaPageShell>
  );
}
