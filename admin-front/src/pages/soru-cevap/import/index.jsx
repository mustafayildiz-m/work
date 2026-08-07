import { useState } from 'react';
import { toast } from 'sonner';
import { Upload, FileJson, FileSpreadsheet, AlertCircle, Database } from 'lucide-react';
import { qaFetch, authHeaders, API_URL } from '../qa-api';
import { useQaIntl } from '../useQaIntl';

export default function QaImportPage() {
  const { t } = useQaIntl();
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState(null);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const data = await qaFetch('/qa/seed', { method: 'POST' });
      if (data.seeded) {
        toast.success(t('QA.SEED_SUCCESS', { categories: data.categories, items: data.items, tags: data.tags }));
      } else {
        toast.info(t('QA.SEED_SKIPPED'));
      }
    } catch (err) {
      toast.error(err.message || t('QA.SEED_FAILED'));
    } finally {
      setSeeding(false);
    }
  };

  const handleImport = async () => {
    if (!file) { toast.error(t('QA.SELECT_FILE_REQUIRED')); return; }
    setImporting(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/qa/import`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || t('QA.IMPORT_FAILED'));

      setResult(data);
      if (data.imported > 0) toast.success(t('QA.IMPORT_SUCCESS', { count: data.imported }));
      if (data.errors?.length) toast.warning(t('QA.IMPORT_ERRORS', { count: data.errors.length }));
    } catch (err) {
      toast.error(err.message || t('QA.IMPORT_FAILED'));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t('QA.IMPORT_TITLE')}</h1>

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-blue-900 dark:text-blue-100">{t('QA.SAMPLE_DATA')}</h2>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{t('QA.SAMPLE_DATA_DESC')}</p>
          </div>
          <button onClick={handleSeed} disabled={seeding}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap">
            <Database className="w-4 h-4" /> {seeding ? t('QA.SEEDING') : t('QA.ADD_SAMPLE_DATA')}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">{t('QA.SUPPORTED_FORMATS')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="border rounded-lg p-4 dark:border-gray-700">
            <FileJson className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="font-medium">JSON</h3>
            <p className="text-sm text-gray-500 mt-1">{t('QA.FORMAT_JSON_DESC')}</p>
          </div>
          <div className="border rounded-lg p-4 dark:border-gray-700">
            <FileSpreadsheet className="w-8 h-8 text-green-500 mb-2" />
            <h3 className="font-medium">CSV</h3>
            <p className="text-sm text-gray-500 mt-1">{t('QA.FORMAT_CSV_DESC')}</p>
          </div>
          <div className="border rounded-lg p-4 dark:border-gray-700">
            <FileSpreadsheet className="w-8 h-8 text-emerald-500 mb-2" />
            <h3 className="font-medium">Excel (.xlsx)</h3>
            <p className="text-sm text-gray-500 mt-1">{t('QA.FORMAT_XLSX_DESC')}</p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-2">{t('QA.REQUIRED_COLUMNS')}</h3>
          <code className="text-sm text-gray-700 dark:text-gray-300">question, answer, language_code</code>
          <h3 className="font-medium mt-3 mb-2">{t('QA.OPTIONAL_COLUMNS')}</h3>
          <code className="text-sm text-gray-700 dark:text-gray-300">
            category, keywords, tags, source_reference, source_booklet, source_section
          </code>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('QA.SELECT_FILE')}</label>
            <input type="file" accept=".json,.csv,.xlsx,.xls"
              onChange={(e) => { setFile(e.target.files[0]); setResult(null); }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
          {file && (
            <p className="text-sm text-gray-600">
              {t('QA.SELECTED_FILE', { name: file.name, size: (file.size / 1024).toFixed(1) })}
            </p>
          )}
          <button onClick={handleImport} disabled={!file || importing}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            <Upload className="w-4 h-4" /> {importing ? t('QA.IMPORTING') : t('QA.IMPORT_BTN')}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-3">{t('QA.RESULT')}</h2>
          <div className="flex gap-4 mb-4">
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold text-green-700">{result.imported}</span>
              <p className="text-sm text-green-600">{t('QA.SUCCESS')}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold text-red-700">{result.errors?.length || 0}</span>
              <p className="text-sm text-red-600">{t('QA.ERRORS')}</p>
            </div>
          </div>
          {result.errors?.length > 0 && (
            <div className="max-h-60 overflow-y-auto space-y-1">
              {result.errors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded px-3 py-1">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
