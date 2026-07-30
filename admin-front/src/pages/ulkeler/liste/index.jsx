import { FormattedMessage, useIntl } from "react-intl";
import React, { useMemo, useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  getPaginationRowModel,
} from '@tanstack/react-table';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/countries';
const LANG_API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/languages';

function getMediaUrl(filePath) {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
  return `${baseUrl}${filePath.startsWith('/') ? filePath : `/${filePath}`}`;
}

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('access_token');
  const res = await fetch(url, {
    ...options,
    headers: { 'Authorization': `Bearer ${token}`, ...options.headers },
  });
  const text = await res.text();
  if (text.trim().startsWith('<!') || text.trim().startsWith('<html')) {
    throw new Error('API endpoint bulunamadı');
  }
  if (!res.ok) {
    let msg = `Hata ${res.status}`;
    try { const j = JSON.parse(text); msg = j.message || j.error || msg; } catch {}
    throw new Error(msg);
  }
  return text ? JSON.parse(text) : null;
}

function LanguageSelect({ value, onChange, languages, intl }) {
  return (
    <select
      name="primaryLanguageId"
      value={value || ''}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
    >
      <option value="">{intl.formatMessage({ id: 'UI.DIL_SECIN_PLACEHOLDER' })}</option>
      {languages.map(l => (
        <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
      ))}
    </select>
  );
}

function LanguageMultiSelect({ selected, onChange, languages, intl }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = languages.filter(l => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q);
  });

  const toggle = (langId) => {
    const id = Number(langId);
    if (selected.includes(id)) {
      onChange(selected.filter(x => x !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const selectedNames = languages
    .filter(l => selected.includes(l.id))
    .map(l => `${l.name} (${l.code})`)
    .join(', ');

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-left text-sm"
      >
        {selected.length > 0
          ? `${selected.length} ${intl.formatMessage({ id: 'UI.DIL_SECILI' })} — ${selectedNames}`
          : intl.formatMessage({ id: 'UI.EK_DILLER_SEC' })}
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 sticky top-0 bg-white dark:bg-gray-800">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={intl.formatMessage({ id: 'UI.DIL_ARA' })}
              className="w-full px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          {filtered.map(l => (
            <label
              key={l.id}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={selected.includes(l.id)}
                onChange={() => toggle(l.id)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-gray-900 dark:text-gray-100">{l.name} ({l.code})</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function AddCountryModal({ open, onClose, onAdded, languages }) {
  const intl = useIntl();
  const initial = { name: '', nameTr: '', alpha2: '', alpha3: '', primaryLanguageId: '', displayOrder: '0', isActive: true };
  const [form, setForm] = useState(initial);
  const [additionalLangIds, setAdditionalLangIds] = useState([]);
  const [flagFile, setFlagFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('alpha2', form.alpha2);
      if (form.nameTr) fd.append('nameTr', form.nameTr);
      if (form.alpha3) fd.append('alpha3', form.alpha3);
      if (form.primaryLanguageId) fd.append('primaryLanguageId', form.primaryLanguageId);
      fd.append('displayOrder', form.displayOrder || '0');
      fd.append('isActive', String(form.isActive));
      if (flagFile) fd.append('flag', flagFile);

      const allLangIds = form.primaryLanguageId
        ? [Number(form.primaryLanguageId), ...additionalLangIds.filter(id => id !== Number(form.primaryLanguageId))]
        : additionalLangIds;
      if (allLangIds.length > 0) {
        fd.append('languageIds', JSON.stringify(allLangIds));
      }

      const created = await apiFetch(API_URL, { method: 'POST', body: fd, headers: {} });
      onAdded(created);
      onClose();
      setForm(initial);
      setAdditionalLangIds([]);
      setFlagFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4"><FormattedMessage id="UI.ULKE_EKLE" /></h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1"><FormattedMessage id="UI.ULKE_ADI_EN" /></label>
              <input name="name" value={form.name} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1"><FormattedMessage id="UI.ULKE_ADI_TR" /></label>
              <input name="nameTr" value={form.nameTr} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Alpha-2 *</label>
              <input name="alpha2" value={form.alpha2} onChange={handleChange} required maxLength={2} placeholder="TR"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 uppercase" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Alpha-3</label>
              <input name="alpha3" value={form.alpha3} onChange={handleChange} maxLength={3} placeholder="TUR"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 uppercase" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1"><FormattedMessage id="UI.BIRINCIL_DIL" /></label>
            <LanguageSelect value={form.primaryLanguageId} onChange={handleChange} languages={languages} intl={intl} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1"><FormattedMessage id="UI.EK_DILLER" /></label>
            <LanguageMultiSelect
              selected={additionalLangIds}
              onChange={setAdditionalLangIds}
              languages={languages.filter(l => String(l.id) !== String(form.primaryLanguageId))}
              intl={intl}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400"><FormattedMessage id="UI.EK_DILLER_ACIKLAMA" /></p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1"><FormattedMessage id="UI.SIRALAMA" /></label>
              <input name="displayOrder" type="number" value={form.displayOrder} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300" />
                <FormattedMessage id="UI.AKTIF" />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1"><FormattedMessage id="UI.BAYRAK_GORSELI" /></label>
            <input type="file" accept="image/*" onChange={e => setFlagFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-900 dark:text-gray-100 file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-white hover:file:bg-blue-700" />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400"><FormattedMessage id="UI.OPSIYONEL_GORSEL_FORMATLARI" /></p>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
              <FormattedMessage id="UI.IPTAL" />
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              {loading ? <FormattedMessage id="UI.EKLENIYOR" /> : <FormattedMessage id="UI.EKLE" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditCountryModal({ open, onClose, country, onUpdated, languages }) {
  const intl = useIntl();
  const [form, setForm] = useState({});
  const [additionalLangIds, setAdditionalLangIds] = useState([]);
  const [flagFile, setFlagFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (country) {
      const primaryId = country.primaryLanguageId || country.primaryLanguage?.id || '';
      setForm({
        name: country.name || '',
        nameTr: country.nameTr || '',
        alpha2: country.alpha2 || '',
        alpha3: country.alpha3 || '',
        primaryLanguageId: primaryId,
        displayOrder: country.displayOrder ?? 0,
        isActive: country.isActive ?? true,
      });
      const extras = (country.countryLanguages || [])
        .filter(cl => !cl.isPrimary && cl.languageId !== Number(primaryId))
        .map(cl => cl.languageId);
      setAdditionalLangIds(extras);
    }
    setFlagFile(null);
    setError(null);
  }, [country, open]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('alpha2', form.alpha2);
      if (form.nameTr) fd.append('nameTr', form.nameTr);
      if (form.alpha3) fd.append('alpha3', form.alpha3);
      if (form.primaryLanguageId) fd.append('primaryLanguageId', String(form.primaryLanguageId));
      fd.append('displayOrder', String(form.displayOrder || 0));
      fd.append('isActive', String(form.isActive));
      if (flagFile) fd.append('flag', flagFile);

      const allLangIds = form.primaryLanguageId
        ? [Number(form.primaryLanguageId), ...additionalLangIds.filter(id => id !== Number(form.primaryLanguageId))]
        : additionalLangIds;
      fd.append('languageIds', JSON.stringify(allLangIds));

      const updated = await apiFetch(`${API_URL}/${country.id}`, { method: 'PATCH', body: fd, headers: {} });
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4"><FormattedMessage id="UI.ULKE_DUZENLE" /></h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1"><FormattedMessage id="UI.ULKE_ADI_EN" /></label>
              <input name="name" value={form.name} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1"><FormattedMessage id="UI.ULKE_ADI_TR" /></label>
              <input name="nameTr" value={form.nameTr} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Alpha-2 *</label>
              <input name="alpha2" value={form.alpha2} onChange={handleChange} required maxLength={2} placeholder="TR"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 uppercase" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Alpha-3</label>
              <input name="alpha3" value={form.alpha3} onChange={handleChange} maxLength={3} placeholder="TUR"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 uppercase" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1"><FormattedMessage id="UI.BIRINCIL_DIL" /></label>
            <LanguageSelect value={form.primaryLanguageId} onChange={handleChange} languages={languages} intl={intl} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1"><FormattedMessage id="UI.EK_DILLER" /></label>
            <LanguageMultiSelect
              selected={additionalLangIds}
              onChange={setAdditionalLangIds}
              languages={languages.filter(l => String(l.id) !== String(form.primaryLanguageId))}
              intl={intl}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400"><FormattedMessage id="UI.EK_DILLER_ACIKLAMA" /></p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1"><FormattedMessage id="UI.SIRALAMA" /></label>
              <input name="displayOrder" type="number" value={form.displayOrder} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300" />
                <FormattedMessage id="UI.AKTIF" />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1"><FormattedMessage id="UI.BAYRAK_GORSELI" /></label>
            {country?.flagUrl && !flagFile ? (
              <img src={getMediaUrl(country.flagUrl)} alt={country.name}
                className="mb-2 h-10 w-14 rounded object-cover border border-gray-200 dark:border-gray-700" />
            ) : null}
            <input type="file" accept="image/*" onChange={e => setFlagFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-900 dark:text-gray-100 file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-white hover:file:bg-blue-700" />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400"><FormattedMessage id="UI.BAYRAK_GUNCELLEME_NOTU" /></p>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
              <FormattedMessage id="UI.IPTAL" />
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              {loading ? <FormattedMessage id="UI.KAYDEDILIYOR" /> : <FormattedMessage id="UI.KAYDET" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const CountryList = () => {
  const intl = useIntl();
  const [data, setData] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editCountry, setEditCountry] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [countries, langs] = await Promise.all([
          apiFetch(API_URL),
          apiFetch(LANG_API_URL),
        ]);
        setData(Array.isArray(countries) ? countries : []);
        setLanguages(Array.isArray(langs) ? langs : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAdded = c => setData(prev => [...prev, c]);
  const handleUpdated = c => setData(prev => prev.map(r => r.id === c.id ? c : r));

  const handleDelete = async (country) => {
    if (!window.confirm(intl.formatMessage({ id: 'UI.ULKE_SILMEK_EMIN_MISINIZ' }))) return;
    try {
      await apiFetch(`${API_URL}/${country.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      setData(prev => prev.filter(r => r.id !== country.id));
    } catch (err) {
      alert(`${intl.formatMessage({ id: 'UI.HATA' })} ${err.message}`);
    }
  };

  const columns = useMemo(() => [
    {
      id: 'flag',
      header: intl.formatMessage({ id: 'UI.BAYRAK' }),
      cell: ({ row }) => {
        const c = row.original;
        if (c.flagUrl) {
          return (
            <img src={getMediaUrl(c.flagUrl)} alt={c.name}
              className="h-8 w-12 rounded-sm object-cover border border-gray-200 dark:border-gray-700" loading="lazy" />
          );
        }
        return <span className="text-lg">🏳️</span>;
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      accessorKey: 'nameTr',
      header: intl.formatMessage({ id: 'UI.ULKE_ADI_TR' }),
      cell: ({ row }) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.original.nameTr || row.original.name}
        </span>
      ),
      filterFn: 'includesString',
    },
    {
      accessorKey: 'name',
      header: intl.formatMessage({ id: 'UI.ULKE_ADI_EN' }),
      cell: ({ row }) => (
        <span className="text-gray-600 dark:text-gray-400">{row.original.name}</span>
      ),
      filterFn: 'includesString',
    },
    {
      accessorKey: 'alpha2',
      header: 'Alpha-2',
      cell: ({ row }) => (
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-200">
          {row.original.alpha2}
        </span>
      ),
    },
    {
      id: 'primaryLanguage',
      header: intl.formatMessage({ id: 'UI.DILLER' }),
      cell: ({ row }) => {
        const lang = row.original.primaryLanguage;
        const extras = (row.original.countryLanguages || []).filter(cl => !cl.isPrimary);
        if (!lang) {
          return <span className="text-xs text-gray-400">{intl.formatMessage({ id: 'UI.ULKE_DILI_YOK' })}</span>;
        }
        return (
          <div className="flex flex-wrap items-center gap-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              {lang.name} ({lang.code})
            </span>
            {extras.length > 0 && (
              <span
                className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 cursor-help"
                title={extras.map(cl => cl.language ? `${cl.language.name} (${cl.language.code})` : '').filter(Boolean).join(', ')}
              >
                +{extras.length}
              </span>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: 'status',
      header: intl.formatMessage({ id: 'UI.DURUM' }),
      cell: ({ row }) => (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
          row.original.isActive
            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
        }`}>
          {row.original.isActive ? intl.formatMessage({ id: 'UI.AKTIF' }) : intl.formatMessage({ id: 'UI.PASIF' })}
        </span>
      ),
      enableSorting: false,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 text-xs"
            onClick={() => { setEditCountry(row.original); setEditOpen(true); }}>
            <FormattedMessage id="UI.DUZENLE" />
          </button>
          <button className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-xs"
            onClick={() => handleDelete(row.original)}>
            <FormattedMessage id="UI.SIL" />
          </button>
        </div>
      ),
    },
  ], [intl]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  if (loading) return <div className="p-6"><FormattedMessage id="UI.YUKLENIYOR" /></div>;
  if (error) return <div className="p-6 text-red-500"><FormattedMessage id="UI.HATA" /> {error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AddCountryModal open={addOpen} onClose={() => setAddOpen(false)} onAdded={handleAdded} languages={languages} />
      <EditCountryModal open={editOpen} onClose={() => setEditOpen(false)} country={editCountry} onUpdated={handleUpdated} languages={languages} />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white"><FormattedMessage id="UI.ULKELER_YONETIMI" /></h1>
          <p className="text-gray-600 dark:text-gray-400"><FormattedMessage id="UI.ULKELER_YONETIMI_ACIKLAMA" /></p>
        </div>
        <button onClick={() => setAddOpen(true)} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
          <FormattedMessage id="UI.ULKE_EKLE" />
        </button>
      </div>
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 text-lg">🌍</div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400"><FormattedMessage id="UI.TOPLAM_ULKE" /></p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{data.length}</p>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <input type="text" value={globalFilter ?? ''} onChange={e => setGlobalFilter(e.target.value)}
          placeholder={intl.formatMessage({ id: 'UI.ULKE_ARA_PLACEHOLDER' })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(header => (
                  <th key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={header.column.getToggleSortingHandler()}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: ' 🔼', desc: ' 🔽' }[header.column.getIsSorted()] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
            <FormattedMessage id="UI.ILK_SAYFA" />
          </button>
          <button className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <FormattedMessage id="UI.ONCEKI_SAYFA" />
          </button>
          <button className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <FormattedMessage id="UI.SONRAKI_SAYFA" />
          </button>
          <button className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
            <FormattedMessage id="UI.SON_SAYFA" />
          </button>
        </div>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          <FormattedMessage id="UI.SAYFA" /> {table.getState().pagination.pageIndex + 1}/ {table.getPageCount()}
        </span>
      </div>
    </div>
  );
};

export default CountryList;
