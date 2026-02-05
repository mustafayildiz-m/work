import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { FaBoxes, FaWarehouse, FaExchangeAlt, FaTruck, FaCalendar, FaMoneyBillWave, FaArrowLeft, FaCheckCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function StockTransferAdd() {
  const [stocks, setStocks] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({
    stockId: '',
    fromWarehouseId: '',
    toWarehouseId: '',
    quantity: '',
    notes: '',
    cargoCompany: '',
    trackingNumber: '',
    estimatedDeliveryDate: '',
    cargoFee: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    Promise.all([
      fetch(`${API_URL}/stocks`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_URL}/warehouses`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([stocksData, warehousesData]) => {
      setStocks(stocksData);
      setWarehouses(warehousesData);
    });
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    // Eğer stok değişirse, kaynak depoyu otomatik ayarla
    if (name === 'stockId') {
      const selected = stocks.find(s => String(s.id) === String(value));
      setForm(f => ({
        ...f,
        stockId: value,
        fromWarehouseId: selected && selected.warehouse ? String(selected.warehouse.id) : '',
      }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}/stock-transfers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stockId: Number(form.stockId),
          fromWarehouseId: Number(form.fromWarehouseId),
          toWarehouseId: Number(form.toWarehouseId),
          quantity: Number(form.quantity),
          notes: form.notes,
          cargoCompany: form.cargoCompany || undefined,
          trackingNumber: form.trackingNumber || undefined,
          estimatedDeliveryDate: form.estimatedDeliveryDate || undefined,
          cargoFee: form.cargoFee ? Number(form.cargoFee) : undefined,
        }),
      });
      if (!res.ok) throw new Error('Transfer eklenemedi');
      toast.success('Transfer başarıyla eklendi!');
      setTimeout(() => navigate('/stok-transfer/liste'), 1000);
    } catch (err) {
      toast.error(err.message || 'Transfer eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Depo selectlerinde aynı deponun seçilmesini engelle
  const filteredFromWarehouses = warehouses.filter(w => w.id !== Number(form.toWarehouseId));
  const filteredToWarehouses = warehouses.filter(w => w.id !== Number(form.fromWarehouseId));

  // Seçili stokun mevcut miktarını bul
  const selectedStock = stocks.find(s => String(s.id) === String(form.stockId));
  const maxQuantity = selectedStock ? selectedStock.quantity : undefined;
  const quantityError =
    form.quantity && maxQuantity !== undefined && Number(form.quantity) > maxQuantity;

  const isFormValid =
    form.stockId &&
    form.fromWarehouseId &&
    form.toWarehouseId &&
    form.quantity &&
    Number(form.quantity) > 0 &&
    !quantityError;

  return (
    <>
      <Helmet>
        <title>Yeni Stok Transferi - Islamic Windows Admin</title>
      </Helmet>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaExchangeAlt className="text-blue-600" />
              Yeni Stok Transferi Ekle
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Depolar arası stok transferi oluşturun</p>
          </div>
          <Link
            to="/stok-transfer/liste"
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-2 shadow"
          >
            <FaArrowLeft size={14} />
            Listeye Dön
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transfer Bilgileri */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FaBoxes className="text-white text-lg" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Transfer Bilgileri</h3>
            </div>

            {/* Stok Seçimi */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FaBoxes className="text-blue-600" />
                Stok
                <span className="text-red-500">*</span>
              </label>
              <select
                name="stockId"
                value={form.stockId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition cursor-pointer"
                required
              >
                <option value="">Transfer edilecek stoğu seçin</option>
                {stocks.map(stock => {
                  const bookTitle = stock.book?.translations?.[0]?.title || stock.book?.title || `Stok #${stock.id}`;
                  return (
                    <option key={stock.id} value={stock.id}>
                      {bookTitle}
                      {stock.language ? ` (${stock.language.name})` : ''}
                      {stock.warehouse ? ` - ${stock.warehouse.name}` : ''}
                      {typeof stock.quantity !== 'undefined' ? ` [${stock.quantity} adet]` : ''}
                    </option>
                  );
                })}
              </select>
              {selectedStock && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <FaInfoCircle className="inline mr-1" />
                    <span className="font-semibold">Mevcut Stok:</span> {selectedStock.quantity} adet
                  </p>
                </div>
              )}
            </div>
            {/* Depolar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  <FaWarehouse className="text-red-600" />
                  Kaynak Depo
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="fromWarehouseId"
                    value={form.fromWarehouseId}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed opacity-75"
                    required
                  >
                    <option value="">Stok seçildiğinde otomatik gelir</option>
                    {warehouses
                      .filter(w => w.id === Number(form.fromWarehouseId))
                      .map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                  </select>
                  <div className="absolute right-3 top-3.5 text-gray-400">
                    <FaWarehouse />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <FaInfoCircle className="inline mr-1" />
                  Stok seçimine göre otomatik belirlenir
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  <FaWarehouse className="text-green-600" />
                  Hedef Depo
                  <span className="text-red-500">*</span>
                </label>
                <select
                  name="toWarehouseId"
                  value={form.toWarehouseId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition cursor-pointer"
                  required
                >
                  <option value="">Transfer edilecek depoyu seçin</option>
                  {filteredToWarehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Transfer Göstergesi */}
            {form.fromWarehouseId && form.toWarehouseId && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-800 rounded-lg border border-blue-200 dark:border-gray-700">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="font-bold text-blue-600 dark:text-blue-400">
                      {warehouses.find(w => w.id === Number(form.fromWarehouseId))?.name}
                    </div>
                    <div className="text-xs text-gray-500">Kaynak</div>
                  </div>
                  <FaExchangeAlt className="text-3xl text-gray-400 dark:text-gray-500 animate-pulse" />
                  <div className="text-center">
                    <div className="font-bold text-green-600 dark:text-green-400">
                      {warehouses.find(w => w.id === Number(form.toWarehouseId))?.name}
                    </div>
                    <div className="text-xs text-gray-500">Hedef</div>
                  </div>
                </div>
              </div>
            )}

            {/* Miktar */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FaBoxes className="text-purple-600" />
                Transfer Miktarı
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min={1}
                max={maxQuantity !== undefined ? maxQuantity : undefined}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition ${
                  quantityError 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                }`}
                placeholder="Transfer edilecek adet"
                required
              />
              {quantityError && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-2">
                  <FaExclamationTriangle className="text-red-600 dark:text-red-400" />
                  <span className="text-sm text-red-600 dark:text-red-400 font-semibold">
                    Yetersiz stok! Maksimum {maxQuantity} adet transfer edebilirsiniz.
                  </span>
                </div>
              )}
              {form.quantity && !quantityError && maxQuantity && (
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <span className="text-sm text-green-600 dark:text-green-400">
                    <FaCheckCircle className="inline mr-1" />
                    Transfer sonrası kalan: {maxQuantity - Number(form.quantity)} adet
                  </span>
                </div>
              )}
            </div>

            {/* Açıklama */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FaInfoCircle className="text-gray-600" />
                Açıklama / Notlar
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition resize-none"
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Kargo Bilgileri</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">İsteğe bağlı</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  <FaTruck className="text-orange-600" />
                  Kargo Şirketi
                </label>
                <select
                  name="cargoCompany"
                  value={form.cargoCompany}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition cursor-pointer"
                >
                  <option value="">Seçiniz (İsteğe Bağlı)</option>
                  <option value="MNG Kargo">MNG Kargo</option>
                  <option value="Yurtiçi Kargo">Yurtiçi Kargo</option>
                  <option value="Aras Kargo">Aras Kargo</option>
                  <option value="PTT Kargo">PTT Kargo</option>
                  <option value="Sürat Kargo">Sürat Kargo</option>
                  <option value="UPS">UPS</option>
                  <option value="DHL">DHL</option>
                  <option value="FedEx">FedEx</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  <FaInfoCircle className="text-blue-600" />
                  Kargo Takip Numarası
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
                  Tahmini Teslimat Tarihi
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
                  Kargo Ücreti (₺)
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
                    <span className="font-semibold">Kargo Seçildi:</span> {form.cargoCompany} ile gönderilecek. 
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
              İptal
            </Link>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={loading || !isFormValid}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Ekleniyor...
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Transfer Ekle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
} 