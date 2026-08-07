import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { FaFolderOpen } from 'react-icons/fa';
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

export default function QaCategoryForm() {
  const { t } = useQaIntl();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEdit = !!editId;
  const navigate = useNavigate();

  const [languages, setLanguages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    parentId: '',
    order: 0,
    isActive: true,
    iconUrl: '',
    translations: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [editId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [langs, cats] = await Promise.all([
        qaFetch('/languages'),
        qaFetch('/qa/admin/categories'),
      ]);
      setLanguages(ensureArray(langs).filter((l) => l.isActive));
      setCategories(flattenCategories(cats));

      if (isEdit && editId) {
        const data = await qaFetch(`/qa/categories/${editId}`);
        setForm({
          parentId: data.parentId || '',
          order: data.order || 0,
          isActive: data.isActive,
          iconUrl: data.iconUrl || '',
          translations: data.translations || [],
        });
      }
    } catch (err) {
      toast.error(err.message || t('QA.LOAD_FAILED'));
      setLanguages([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslationChange = (langId, field, value) => {
    setForm((prev) => {
      const existing = prev.translations.find((tr) => tr.languageId === langId);
      if (existing) {
        return {
          ...prev,
          translations: prev.translations.map((tr) =>
            tr.languageId === langId ? { ...tr, [field]: value } : tr
          ),
        };
      }
      return {
        ...prev,
        translations: [...prev.translations, { languageId: langId, name: '', description: '', [field]: value }],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        parentId: form.parentId ? Number(form.parentId) : null,
        order: Number(form.order),
        translations: form.translations.filter((tr) => tr.name?.trim()),
      };

      if (!payload.translations.length) {
        toast.error(t('QA.CATEGORY_NAME_REQUIRED'));
        setSaving(false);
        return;
      }

      const url = isEdit ? `/qa/categories/${editId}` : '/qa/categories';
      const method = isEdit ? 'PUT' : 'POST';

      await qaFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      toast.success(isEdit ? t('QA.CATEGORY_UPDATED') : t('QA.CATEGORY_CREATED'));
      navigate('/soru-cevap/kategoriler/liste');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const flatCategories = ensureArray(categories);

  if (loading) {
    return (
      <QaPageShell width="narrow">
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">{t('UI.YUKLENIYOR')}</div>
      </QaPageShell>
    );
  }

  return (
    <QaPageShell
      title={`${isEdit ? t('QA.CATEGORY_EDIT') : t('QA.CATEGORY_NEW')} - Islamic Windows Admin`}
      width="narrow"
    >
      <QaPageHeader
        title={isEdit ? t('QA.CATEGORY_EDIT') : t('QA.CATEGORY_NEW')}
        subtitle={t('QA.CATEGORY_FORM_SUBTITLE')}
        icon={FaFolderOpen}
        backTo="/soru-cevap/kategoriler/liste"
        backLabel={t('UI.LISTEYE_DON')}
      />

      <QaFormCard>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={qaLabelClass}>{t('QA.PARENT_CATEGORY')}</label>
              <select
                value={form.parentId}
                onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                className={qaSelectClass}
              >
                <option value="">{t('QA.ROOT_CATEGORY')}</option>
                {flatCategories.filter((c) => c.id !== Number(editId)).map((c) => (
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
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300"
              id="isActive"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('UI.AKTIF')}</label>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('QA.TRANSLATIONS')}</h2>
            <div className="space-y-4">
              {languages.map((lang) => {
                const trans = form.translations.find((tr) => tr.languageId === lang.id) || {};
                return (
                  <div key={lang.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2 mb-3">
                      {lang.flagUrl && <img src={lang.flagUrl} alt="" className="w-5 h-4 object-cover rounded" />}
                      <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{lang.name}</span>
                    </div>
                    <input
                      type="text"
                      placeholder={t('QA.CATEGORY_NAME')}
                      value={trans.name || ''}
                      onChange={(e) => handleTranslationChange(lang.id, 'name', e.target.value)}
                      className={`${qaInputClass} mb-3`}
                    />
                    <textarea
                      placeholder={t('QA.DESCRIPTION_OPTIONAL')}
                      value={trans.description || ''}
                      onChange={(e) => handleTranslationChange(lang.id, 'description', e.target.value)}
                      className={qaInputClass}
                      rows={2}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <QaPrimaryButton type="submit" disabled={saving}>
              {saving ? t('UI.KAYDEDILIYOR') : isEdit ? t('UI.GUNCELLE') : t('QA.CREATE')}
            </QaPrimaryButton>
            <QaSecondaryButton type="button" onClick={() => navigate('/soru-cevap/kategoriler/liste')}>
              {t('UI.IPTAL')}
            </QaSecondaryButton>
          </div>
        </form>
      </QaFormCard>
    </QaPageShell>
  );
}
