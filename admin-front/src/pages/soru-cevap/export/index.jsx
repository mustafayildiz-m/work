import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import { qaFetch, ensureArray, flattenCategories, categoryLabel, authHeaders, API_URL } from '../qa-api';
import { useQaIntl } from '../useQaIntl';

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
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t('QA.EXPORT_TITLE')}</h1>

      <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-xl p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('QA.EXPORT_FORMAT')}</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600">
              <option value="json">{t('QA.EXPORT_JSON')}</option>
              <option value="jsonl">{t('QA.EXPORT_JSONL')}</option>
              <option value="csv">{t('QA.EXPORT_CSV')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('QA.LANGUAGE_FILTER')}</label>
            <select value={languageId} onChange={(e) => setLanguageId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600">
              <option value="">{t('QA.ALL_LANGUAGES')}</option>
              {languages.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('QA.CATEGORY_FILTER')}</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600">
              <option value="">{t('UI.TUM_KATEGORILER')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{categoryLabel(c, c.depth)}</option>
              ))}
            </select>
          </div>

          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
            <Download className="w-4 h-4" /> {exporting ? t('QA.EXPORTING') : t('QA.EXPORT_BTN')}
          </button>
        </div>
      </div>
    </div>
  );
}
