import { FormattedMessage, useIntl } from "react-intl";
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function EditStockPage() {
  const intl = useIntl();
  const { id } = useParams();
  const [form, setForm] = useState({
    quantity: '',
    unitPrice: '',
  });
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('access_token');
    fetch(`${API_URL}/stocks/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Stok bilgisi alınamadı');
        return res.json();
      })
      .then(data => {
        setStock(data);
        setForm({
          quantity: data.quantity ?? '',
          unitPrice: data.unitPrice ?? '',
        });
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/stocks/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: Number(form.quantity),
          unitPrice: Number(form.unitPrice),
        }),
      });
      if (!res.ok) throw new Error('Stok güncellenemedi');
      await res.json();
      setSuccess('Stok başarıyla güncellendi!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 max-w-2xl mx-auto text-center text-gray-500"><FormattedMessage id="UI.YUKLENIYOR" /></div>;
  }

  return (
    <>
      <Helmet>
        <title>{intl.formatMessage({
          id: "UI.STOK_DUZENLE__ISLAMIC_WINDOWS_ADMIN"
        })}</title>
      </Helmet>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-2xl font-bold"><FormattedMessage id="UI.STOK_DUZENLE" /></h2>
        <Link
          to="/stoklar/liste"
          className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold border border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          <FormattedMessage id="UI.LISTEYE_DON" />
        </Link>
      </div>
      <div className="rounded-lg shadow-lg bg-white dark:bg-gray-900 p-6">
        {stock && (
          <div className="mb-4 text-sm text-gray-700 dark:text-gray-200">
            <div><b><FormattedMessage id="UI.KITAP_1" /></b> {stock.book?.title || '-'}</div>
            <div><b><FormattedMessage id="UI.DIL" /></b> {stock.language?.name || '-'}</div>
            <div><b><FormattedMessage id="UI.DEPO_1" /></b> {stock.warehouse?.name || '-'}</div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1"><FormattedMessage id="UI.MIKTAR" /></label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Miktar girin"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1"><FormattedMessage id="UI.BIRIM_FIYAT" /></label>
            <input
              type="number"
              name="unitPrice"
              value={form.unitPrice}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Birim fiyat girin"
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow border border-blue-600/20 hover:bg-blue-700 transition"
              disabled={saving}
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </>
  );
} 