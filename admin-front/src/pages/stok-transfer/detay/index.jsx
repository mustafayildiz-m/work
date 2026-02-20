import { FormattedMessage, useIntl } from "react-intl";
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaTruck, FaWarehouse, FaBoxes, FaInfoCircle, FaCalendar, FaMoneyBillWave, FaArrowLeft, FaCheckCircle, FaClock, FaTimesCircle, FaExchangeAlt, FaMapMarkerAlt, FaEdit } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function StockTransferDetail() {
  const intl = useIntl();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/stock-transfers/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Transfer detayı alınamadı');
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <Helmet>
          <title>{intl.formatMessage({
            id: "UI.TRANSFER_DETAYI__ISLAMIC_WINDOWS_ADMIN"
          })}</title>
        </Helmet>
        <div className="p-6 max-w-6xl mx-auto text-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400"><FormattedMessage id="UI.TRANSFER_DETAYLARI_YUKLENIYOR" /></p>
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
        <div className="p-6 max-w-6xl mx-auto text-center">
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

  if (!data) return null;

  // Durum badge rengi
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            <FaClock /> <FormattedMessage id="UI.BEKLEMEDE" />
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <FaCheckCircle /> <FormattedMessage id="UI.TAMAMLANDI" />
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
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
          id: "UI.TRANSFER_DETAYI_"
        })}{id} {intl.formatMessage({
          id: "UI._ISLAMIC_WINDOWS_ADMIN"
        })}</title>
      </Helmet>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaExchangeAlt className="text-blue-600" />
              <FormattedMessage id="UI.TRANSFER_DETAYI_" />{id}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1"><FormattedMessage id="UI.TRANSFER_ISLEMININ_TUM_DETAYLARINI_GORUN" /></p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/stok-transfer/duzenle/${id}`}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow"
            >
              <FaEdit size={14} />
              <FormattedMessage id="UI.DUZENLE" />
            </Link>
            <Link
              to="/stok-transfer/liste"
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-2 shadow"
            >
              <FaArrowLeft size={14} />
              <FormattedMessage id="UI.LISTEYE_DON" />
            </Link>
          </div>
        </div>

        {/* Durum Kartı */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">📦</div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white"><FormattedMessage id="UI.TRANSFER_ID_" />{data.id}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <FormattedMessage id="UI.OLUSTURULMA" /> {new Date(data.createdAt).toLocaleString('tr-TR')}
                </p>
              </div>
            </div>
            <div>{getStatusBadge(data.status)}</div>
          </div>
        </div>

        {/* Transfer Yönü */}
        <div className="mb-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center flex-1">
              <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
                <FaWarehouse className="text-4xl text-red-600 dark:text-red-400 mx-auto mb-3" />
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2"><FormattedMessage id="UI.KAYNAK_DEPO" /></div>
                <div className="font-bold text-xl text-gray-900 dark:text-white mb-1">{data.fromWarehouse?.name}</div>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <FaMapMarkerAlt className="text-red-500" />
                  {data.fromWarehouse?.location || '-'}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <FaExchangeAlt className="text-5xl text-blue-600 dark:text-blue-400 animate-pulse" />
              <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <span className="font-bold text-blue-700 dark:text-blue-300">{data.quantity} <FormattedMessage id="UI.ADET" /></span>
              </div>
            </div>

            <div className="text-center flex-1">
              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                <FaWarehouse className="text-4xl text-green-600 dark:text-green-400 mx-auto mb-3" />
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2"><FormattedMessage id="UI.HEDEF_DEPO" /></div>
                <div className="font-bold text-xl text-gray-900 dark:text-white mb-1">{data.toWarehouse?.name}</div>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <FaMapMarkerAlt className="text-green-500" />
                  {data.toWarehouse?.location || '-'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detay Bilgileri */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Genel Bilgiler */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-purple-600 rounded-lg">
                <FaInfoCircle className="text-white text-lg" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white"><FormattedMessage id="UI.GENEL_BILGILER" /></h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1"><FormattedMessage id="UI.TRANSFER_MIKTARI" /></div>
                  <div className="font-bold text-lg text-purple-600 dark:text-purple-400">{data.quantity} <FormattedMessage id="UI.ADET" /></div>
                </div>
                <FaBoxes className="text-2xl text-purple-600 dark:text-purple-400" />
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2"><FormattedMessage id="UI.ACIKLAMA__NOTLAR" /></div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {data.notes || <span className="text-gray-400 italic"><FormattedMessage id="UI.NOT_EKLENMEMIS" /></span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1"><FormattedMessage id="UI.OLUSTURULMA_1" /></div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {new Date(data.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(data.createdAt).toLocaleTimeString('tr-TR')}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1"><FormattedMessage id="UI.GUNCELLENME" /></div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {new Date(data.updatedAt).toLocaleDateString('tr-TR')}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(data.updatedAt).toLocaleTimeString('tr-TR')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stok Bilgileri */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FaBoxes className="text-white text-lg" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white"><FormattedMessage id="UI.STOK_BILGILERI" /></h3>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-xs text-blue-600 dark:text-blue-400 mb-1"><FormattedMessage id="UI.STOK_ID" /></div>
                <div className="font-bold text-lg text-blue-700 dark:text-blue-300">#{data.stock?.id}</div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1"><FormattedMessage id="UI.MEVCUT_STOK_MIKTARI" /></div>
                <div className="font-semibold text-gray-900 dark:text-white">{data.stock?.quantity || 0} <FormattedMessage id="UI.ADET" /></div>
              </div>

              {data.stock?.book && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1"><FormattedMessage id="UI.KITAP_BILGISI" /></div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {data.stock.book?.translations?.[0]?.title || data.stock.book?.title || '-'}
                  </div>
                  {data.stock.language && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <FormattedMessage id="UI.DIL" /> {data.stock.language.name}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kargo Bilgileri */}
        {(data.cargoCompany || data.trackingNumber || data.estimatedDeliveryDate || data.cargoFee) && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-orange-600 rounded-lg">
                <FaTruck className="text-white text-lg" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white"><FormattedMessage id="UI.KARGO_BILGILERI" /></h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.cargoCompany && (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-2">
                    <FaTruck className="text-orange-600 dark:text-orange-400 text-xl" />
                    <div className="text-xs text-orange-600 dark:text-orange-400 font-medium"><FormattedMessage id="UI.KARGO_SIRKETI" /></div>
                  </div>
                  <div className="font-bold text-lg text-gray-900 dark:text-white">{data.cargoCompany}</div>
                </div>
              )}

              {data.trackingNumber && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <FaInfoCircle className="text-blue-600 dark:text-blue-400 text-xl" />
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium"><FormattedMessage id="UI.TAKIP_NUMARASI" /></div>
                  </div>
                  <div className="font-mono text-base bg-white dark:bg-gray-800 px-4 py-2 rounded-lg font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 tracking-wider">
                    {data.trackingNumber}
                  </div>
                </div>
              )}

              {data.estimatedDeliveryDate && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCalendar className="text-green-600 dark:text-green-400 text-xl" />
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium"><FormattedMessage id="UI.TAHMINI_TESLIMAT" /></div>
                  </div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {new Date(data.estimatedDeliveryDate).toLocaleDateString('tr-TR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              )}

              {data.cargoFee && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <FaMoneyBillWave className="text-green-600 dark:text-green-400 text-xl" />
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium"><FormattedMessage id="UI.KARGO_UCRETI" /></div>
                  </div>
                  <div className="font-bold text-2xl text-green-600 dark:text-green-400">
                    {Number(data.cargoFee).toFixed(2)} ₺
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
} 