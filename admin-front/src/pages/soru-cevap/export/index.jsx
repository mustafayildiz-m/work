import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FaFileExport, FaDownload } from 'react-icons/fa';
import { qaFetch, ensureArray, flattenCategories, categoryLabel, authHeaders, API_URL } from '../qa-api';
import { useQaIntl } from '../useQaIntl';
import {
  QaPageShell,
  QaPageHeader,
  QaPrimaryButton,
  QaFormCard,
  qaSelectClass,
  qaLabelClass,
} from '../QaPageLayout';

export default function QaExportPage() {
  const { t } = useQaIntl();
  const [format, setFormat] = useState('json');
  const [languageId, setLanguageId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [languages, setLanguages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    qaFetch('/languages')
      .then((data) => setLanguages(ensureArray(data).filter((l) => l.isActive)))
      .catch(() => setLanguages([]));
    qaFetch('/qa/admin/categories')
      .then((data) => setCategories(flattenCategories(data)))
      .catch(() => setCategories([]));
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ format });
      if (languageId) params.set('languageId', languageId);
      if (categoryId) params.set('categoryId', categoryId);

      const res = await fetch(`${API_URL}/qa/export?${params}`, {
        headers: authHeaders(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || t('QA.EXPORT_FAILED'));
      }

      const blob = await res.blob();
      const disposition = res.headers.get('content-disposition');
      const filename = disposition?.match(/filename="(.+)"/)?.[1] || `qa_export.${format === 'jsonl' ? 'jsonl' : format}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t('QA.EXPORT_SUCCESS'));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <QaPageShell title={`${t('QA.EXPORT_TITLE')} - Islamic Windows Admin`} width="narrow">
      <QaPageHeader
        title={t('QA.EXPORT_TITLE')}
        subtitle={t('QA.EXPORT_SUBTITLE')}
        icon={FaFileExport}
      />

      <QaFormCard>
        <div className="space-y-5">
          <div>
            <label className={qaLabelClass}>{t('QA.EXPORT_FORMAT')}</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className={qaSelectClass}>
              <option value="json">{t('QA.EXPORT_JSON')}</option>
              <option value="jsonl">{t('QA.EXPORT_JSONL')}</option>
              <option value="csv">{t('QA.EXPORT_CSV')}</option>
            </select>
          </div>

          <div>
            <label className={qaLabelClass}>{t('QA.LANGUAGE_FILTER')}</label>
            <select value={languageId} onChange={(e) => setLanguageId(e.target.value)} className={qaSelectClass}>
              <option value="">{t('QA.ALL_LANGUAGES')}</option>
              {languages.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          <div>
            <label className={qaLabelClass}>{t('QA.CATEGORY_FILTER')}</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={qaSelectClass}>
              <option value="">{t('UI.TUM_KATEGORILER')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{categoryLabel(c, c.depth)}</option>
              ))}
            </select>
          </div>

          <QaPrimaryButton onClick={handleExport} disabled={exporting} className="bg-green-600 hover:bg-green-700">
            <FaDownload /> {exporting ? t('QA.EXPORTING') : t('QA.EXPORT_BTN')}
          </QaPrimaryButton>
        </div>
      </QaFormCard>
    </QaPageShell>
  );
}
