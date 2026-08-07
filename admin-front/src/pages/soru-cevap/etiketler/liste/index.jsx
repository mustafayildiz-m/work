import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FaTags, FaPlus, FaCheck } from 'react-icons/fa';
import { X } from 'lucide-react';
import { qaFetch, ensureArray } from '../../qa-api';
import { useQaIntl } from '../../useQaIntl';
import {
  QaPageShell,
  QaPageHeader,
  QaPrimaryButton,
  QaSecondaryButton,
  QaStatsGrid,
  QaStatCard,
  QaContentCard,
  QaActionButtons,
  qaInputClass,
  qaLabelClass,
  qaTableThClass,
  qaTableTdClass,
} from '../../QaPageLayout';

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
    <QaPageShell title={`${t('QA.TAGS_TITLE')} - Islamic Windows Admin`}>
      <QaPageHeader
        title={t('QA.TAGS_TITLE')}
        subtitle={t('QA.TAGS_SUBTITLE')}
        icon={FaTags}
        action={(
          <QaPrimaryButton onClick={openCreate}>
            <FaPlus /> {t('QA.TAG_NEW_BTN')}
          </QaPrimaryButton>
        )}
      />

      <QaStatsGrid>
        <QaStatCard
          label={t('QA.STAT_TOTAL_TAGS')}
          value={tags.length}
          gradient="from-purple-500 to-purple-600"
          icon={FaTags}
        />
        <QaStatCard
          label={t('QA.STAT_LANGUAGES')}
          value={languages.length}
          gradient="from-indigo-500 to-indigo-600"
          icon={FaTags}
        />
      </QaStatsGrid>

      {showForm && (
        <QaContentCard className="p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {editingId ? t('QA.TAG_EDIT') : t('QA.TAG_NEW')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {languages.map((lang, i) => (
              <div key={lang.id}>
                <label className={qaLabelClass}>{lang.name} ({lang.code})</label>
                <input
                  type="text"
                  value={formData[i]?.name || ''}
                  onChange={(e) => {
                    const d = [...formData];
                    d[i] = { ...d[i], name: e.target.value };
                    setFormData(d);
                  }}
                  placeholder={t('QA.TAG_TRANSLATION', { lang: lang.name })}
                  className={qaInputClass}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <QaPrimaryButton onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <FaCheck /> {t('UI.KAYDET')}
            </QaPrimaryButton>
            <QaSecondaryButton onClick={() => setShowForm(false)}>
              <X className="w-4 h-4 inline mr-1" /> {t('UI.IPTAL')}
            </QaSecondaryButton>
          </div>
        </QaContentCard>
      )}

      {loading ? (
        <QaContentCard>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">{t('UI.YUKLENIYOR')}</div>
        </QaContentCard>
      ) : tags.length === 0 ? (
        <QaContentCard>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">{t('QA.NO_TAGS')}</div>
        </QaContentCard>
      ) : (
        <QaContentCard>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className={qaTableThClass}>{t('MENU.ETIKETLER')}</th>
                  <th className={qaTableThClass}>{t('QA.LANGUAGE_COUNT')}</th>
                  <th className={`${qaTableThClass} text-right`}>{t('UI.ISLEMLER')}</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {tags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className={qaTableTdClass}>
                      <span className="font-medium">
                        {tag.translations?.map((tr) => tr.name).join(' / ') || `#${tag.id}`}
                      </span>
                    </td>
                    <td className={qaTableTdClass}>{tag.translations?.length || 0}</td>
                    <td className={qaTableTdClass}>
                      <QaActionButtons
                        editLabel={t('UI.DUZENLE')}
                        deleteLabel={t('UI.SIL')}
                        onEdit={() => openEdit(tag)}
                        onDelete={() => handleDelete(tag.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </QaContentCard>
      )}
    </QaPageShell>
  );
}
