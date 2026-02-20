import { FormattedMessage, useIntl } from "react-intl";
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { FaBoxes, FaWarehouse, FaExchangeAlt, FaTruck, FaCalendar, FaMoneyBillWave, FaArrowLeft, FaSave, FaInfoCircle, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function EditStockTransferPage() {
  const intl = useIntl();
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    quantity: '',
    notes: '',
    cargoCompany: '',
    trackingNumber: '',
    estimatedDeliveryDate: '',
    cargoFee: '',
  });
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch(`${API_URL}/stock-transfers/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Transfer bilgisi alınamadı');
        return res.json();
      })
      .then(data => {
        setTransfer(data);
        setForm({
          quantity: data.quantity || '',
          notes: data.notes || '',
          cargoCompany: data.cargoCompany || '',
          trackingNumber: data.trackingNumber || '',
          estimatedDeliveryDate: data.estimatedDeliveryDate ? data.estimatedDeliveryDate.slice(0, 10) : '',
          cargoFee: data.cargoFee || '',
        });
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}/stock-transfers/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantity: Number(form.quantity),
          notes: form.notes,
          cargoCompany: form.cargoCompany || undefined,
          trackingNumber: form.trackingNumber || undefined,
          estimatedDeliveryDate: form.estimatedDeliveryDate || undefined,
          cargoFee: form.cargoFee ? Number(form.cargoFee) : undefined,
        }),
      });
      if (!res.ok) throw new Error('Transfer güncellenemedi');
      toast.success('Transfer başarıyla güncellendi!');
      setTimeout(() => navigate('/stok-transfer/liste'), 1200);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>{intl.formatMessage({
            id: "UI.TRANSFER_DUZENLE__ISLAMIC_WINDOWS_ADMIN"
          })}</title>
        </Helmet>
        <div className="p-6 max-w-5xl mx-auto text-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400"><FormattedMessage id="UI.TRANSFER_BILGILERI_YUKLENIYOR" /></p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>{intl.formatMessage({
            id: "UI.HATA__ISLAMIC_WINDOWS_ADMIN"
          })}</title>
        </Helmet>
        <div className="p-6 max-w-5xl mx-auto text-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-12">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-red-500 mb-4">{error}</p>
            <Link
              to="/stok-transfer/liste"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FormattedMessage id="UI.LISTEYE_DON" />
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Durum badge rengi
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            <FaClock /> <FormattedMessage id="UI.BEKLEMEDE" />
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <FaCheckCircle /> <FormattedMessage id="UI.TAMAMLANDI" />
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <FaTimesCircle /> <FormattedMessage id="UI.IPTAL_EDILDI" />
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <>
      <Helmet>
        <title>{intl.formatMessage({
          id: "UI.TRANSFER_DUZENLE_"
        })}{id} {intl.formatMessage({
          id: "UI._ISLAMIC_WINDOWS_ADMIN"
        })}</title>
      </Helmet>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaExchangeAlt className="text-blue-600" />
              <FormattedMessage id="UI.TRANSFER_DUZENLE_" />{id}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1"><FormattedMessage id="UI.TRANSFER_BILGILERINI_GUNCELLEYIN" /></p>
          </div>
          <Link
            to="/stok-transfer/liste"
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-2 shadow"
          >
            <FaArrowLeft size={14} />
            <FormattedMessage id="UI.LISTEYE_DON" />
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transfer Bilgileri (Salt Okunur) */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-gray-600 rounded-lg">
                <FaInfoCircle className="text-white text-lg" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white"><FormattedMessage id="UI.TRANSFER_OZETI" /></h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FaWarehouse className="text-red-600" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium"><FormattedMessage id="UI.KAYNAK_DEPO" /></span>
                </div>
                <p className="font-bold text-gray-900 dark:text-gray-100">{transfer?.fromWarehouse?.name}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FaWarehouse className="text-green-600" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium"><FormattedMessage id="UI.HEDEF_DEPO" /></span>
                </div>
                <p className="font-bold text-gray-900 dark:text-gray-100">{transfer?.toWarehouse?.name}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FaBoxes className="text-purple-600" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium"><FormattedMessage id="UI.DURUM" /></span>
                </div>
                <div>{getStatusBadge(transfer?.status)}</div>
              </div>
            </div>

            {/* Transfer Direction Visual */}
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="font-bold text-blue-600 dark:text-blue-400">{transfer?.fromWarehouse?.name}</div>
                  <div className="text-xs text-gray-500"><FormattedMessage id="UI.CIKIS" /></div>
                </div>
                <FaExchangeAlt className="text-3xl text-gray-400 dark:text-gray-500" />
                <div className="text-center">
                  <div className="font-bold text-green-600 dark:text-green-400">{transfer?.toWarehouse?.name}</div>
                  <div className="text-xs text-gray-500"><FormattedMessage id="UI.VARIS" /></div>
                </div>
              </div>
            </div>
          </div>

          {/* Düzenlenebilir Alanlar */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-purple-600 rounded-lg">
                <FaBoxes className="text-white text-lg" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white"><FormattedMessage id="UI.DUZENLENEBILIR_BILGILER" /></h3>
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FaBoxes className="text-purple-600" />
                <FormattedMessage id="UI.MIKTAR" />
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min={1}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FaInfoCircle className="text-gray-600" />
                <FormattedMessage id="UI.ACIKLAMA__NOTLAR" />
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition resize-none"
                rows={4}
                placeholder="Transfer hakkında detaylı bilgi veya not ekleyebilirsiniz..."
              />
            </div>
          </div>

          {/* Kargo Bilgileri */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-orange-600 rounded-lg">
                <FaTruck className="text-white text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white"><FormattedMessage id="UI.KARGO_BILGILERI" /></h3>
                <p className="text-xs text-gray-500 dark:text-gray-400"><FormattedMessage id="UI.ISTEGE_BAGLI" /></p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  <FaTruck className="text-orange-600" />
                  <FormattedMessage id="UI.KARGO_SIRKETI" />
                </label>
                <select
                  name="cargoCompany"
                  value={form.cargoCompany}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition cursor-pointer"
                >
                  <option value=""><FormattedMessage id="UI.SECINIZ_ISTEGE_BAGLI" /></option>
                  <option value="MNG Kargo"><FormattedMessage id="UI.MNG_KARGO" /></option>
                  <option value="Yurtiçi Kargo"><FormattedMessage id="UI.YURTICI_KARGO" /></option>
                  <option value="Aras Kargo"><FormattedMessage id="UI.ARAS_KARGO" /></option>
                  <option value="PTT Kargo"><FormattedMessage id="UI.PTT_KARGO" /></option>
                  <option value="Sürat Kargo"><FormattedMessage id="UI.SURAT_KARGO" /></option>
                  <option value="UPS"><FormattedMessage id="UI.UPS" /></option>
                  <option value="DHL"><FormattedMessage id="UI.DHL" /></option>
                  <option value="FedEx"><FormattedMessage id="UI.FEDEX" /></option>
                  <option value="Diğer"><FormattedMessage id="UI.DIGER" /></option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  <FaInfoCircle className="text-blue-600" />
                  <FormattedMessage id="UI.KARGO_TAKIP_NUMARASI" />
                </label>
                <input
                  type="text"
                  name="trackingNumber"
                  value={form.trackingNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
                  placeholder="Örn: 1234567890"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  <FaCalendar className="text-green-600" />
                  <FormattedMessage id="UI.TAHMINI_TESLIMAT_TARIHI" />
                </label>
                <input
                  type="date"
                  name="estimatedDeliveryDate"
                  value={form.estimatedDeliveryDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  <FaMoneyBillWave className="text-green-600" />
                  <FormattedMessage id="UI.KARGO_UCRETI_" />
                </label>
                <input
                  type="number"
                  name="cargoFee"
                  value={form.cargoFee}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
                  placeholder="0.00"
                />
              </div>
            </div>

            {form.cargoCompany && (
              <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-800 dark:text-orange-200 flex items-start gap-2">
                  <FaTruck className="mt-0.5 flex-shrink-0" />
                  <span>
                    <span className="font-semibold"><FormattedMessage id="UI.KARGO_SECILDI" /></span> {form.cargoCompany} <FormattedMessage id="UI.ILE_GONDERILECEK" />
                    {form.trackingNumber && ' Takip numarası ile sevkiyat durumunu kolayca izleyebilirsiniz.'}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
            <Link
              to="/stok-transfer/liste"
              className="px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              <FormattedMessage id="UI.IPTAL" />
            </Link>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <FormattedMessage id="UI.GUNCELLENIYOR" />
                </>
              ) : (
                <>
                  <FaSave />
                  <FormattedMessage id="UI.DEGISIKLIKLERI_KAYDET" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
} 