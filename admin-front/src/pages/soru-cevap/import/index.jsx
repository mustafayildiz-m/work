import { useState } from 'react';
import { toast } from 'sonner';
import { FaFileImport, FaDatabase, FaUpload } from 'react-icons/fa';
import { FileJson, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { qaFetch, authHeaders, API_URL } from '../qa-api';
import { useQaIntl } from '../useQaIntl';
import {
  QaPageShell,
  QaPageHeader,
  QaPrimaryButton,
  QaContentCard,
  qaLabelClass,
} from '../QaPageLayout';

export default function QaImportPage() {
  const { t } = useQaIntl();
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState(null);

  const handleSeed = async (force = false) => {
    if (force && !window.confirm(t('QA.SEED_FORCE_CONFIRM'))) return;
    setSeeding(true);
    try {
      const data = await qaFetch('/qa/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(force ? { force: true, full: true } : {}),
      });
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
    <QaPageShell title={`${t('QA.IMPORT_TITLE')} - Islamic Windows Admin`} width="narrow">
      <QaPageHeader
        title={t('QA.IMPORT_TITLE')}
        subtitle={t('QA.IMPORT_SUBTITLE')}
        icon={FaFileImport}
      />

      <QaContentCard className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-blue-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('QA.SAMPLE_DATA')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('QA.SAMPLE_DATA_DESC')}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <QaPrimaryButton onClick={() => handleSeed(false)} disabled={seeding}>
              <FaDatabase /> {seeding ? t('QA.SEEDING') : t('QA.ADD_SAMPLE_DATA')}
            </QaPrimaryButton>
            <QaPrimaryButton onClick={() => handleSeed(true)} disabled={seeding} className="bg-indigo-600 hover:bg-indigo-700">
              <FaDatabase /> {seeding ? t('QA.SEEDING') : t('QA.FULL_SEED_BTN')}
            </QaPrimaryButton>
          </div>
        </div>
      </QaContentCard>

      <QaContentCard className="p-6 md:p-8 mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('QA.SUPPORTED_FORMATS')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
            <FileJson className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">JSON</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('QA.FORMAT_JSON_DESC')}</p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
            <FileSpreadsheet className="w-8 h-8 text-green-500 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">CSV</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('QA.FORMAT_CSV_DESC')}</p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
            <FileSpreadsheet className="w-8 h-8 text-emerald-500 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Excel (.xlsx)</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('QA.FORMAT_XLSX_DESC')}</p>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('QA.REQUIRED_COLUMNS')}</h3>
          <code className="text-sm text-gray-700 dark:text-gray-300">question, answer, language_code</code>
          <h3 className="font-semibold text-gray-900 dark:text-white mt-4 mb-2">{t('QA.OPTIONAL_COLUMNS')}</h3>
          <code className="text-sm text-gray-700 dark:text-gray-300">
            category, keywords, tags, source_reference, source_booklet, source_section
          </code>
        </div>

        <div className="space-y-4">
          <div>
            <label className={qaLabelClass}>{t('QA.SELECT_FILE')}</label>
            <input
              type="file"
              accept=".json,.csv,.xlsx,.xls"
              onChange={(e) => { setFile(e.target.files[0]); setResult(null); }}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>
          {file && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('QA.SELECTED_FILE', { name: file.name, size: (file.size / 1024).toFixed(1) })}
            </p>
          )}
          <QaPrimaryButton onClick={handleImport} disabled={!file || importing}>
            <FaUpload /> {importing ? t('QA.IMPORTING') : t('QA.IMPORT_BTN')}
          </QaPrimaryButton>
        </div>
      </QaContentCard>

      {result && (
        <QaContentCard className="p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('QA.RESULT')}</h2>
          <div className="flex gap-4 mb-4 flex-wrap">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-6 py-4">
              <span className="text-3xl font-bold text-green-700 dark:text-green-400">{result.imported}</span>
              <p className="text-sm text-green-600 dark:text-green-300">{t('QA.SUCCESS')}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-6 py-4">
              <span className="text-3xl font-bold text-red-700 dark:text-red-400">{result.errors?.length || 0}</span>
              <p className="text-sm text-red-600 dark:text-red-300">{t('QA.ERRORS')}</p>
            </div>
          </div>
          {result.errors?.length > 0 && (
            <div className="max-h-60 overflow-y-auto space-y-1">
              {result.errors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}
        </QaContentCard>
      )}
    </QaPageShell>
  );
}
