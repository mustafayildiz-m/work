import { FormattedMessage, useIntl } from "react-intl";
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import Select from 'react-select';
import { useTheme } from 'next-themes';
import { FaArrowLeft, FaBoxes, FaBook, FaGlobe, FaWarehouse, FaHashtag, FaDollarSign, FaSave, FaPlus, FaMinus, FaInfoCircle } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AddStockPage() {
  const intl = useIntl();
  const [mode, setMode] = useState('add'); // 'add' veya 'update'
  const [form, setForm] = useState({
    bookId: '',
    languageId: '',
    warehouseId: '',
    quantity: '',
    unitPrice: '',
  });
  const [updateForm, setUpdateForm] = useState({
    stockId: '',
    quantity: '',
    operation: 'add', // 'add' veya 'subtract'
  });
  const [books, setBooks] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [stocks, setStocks] = useState([]); // Var olan stoklar
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { theme } = useTheme();
  const safeTheme = theme || 'light';

  // Kitap, depo ve stok listesini çek
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch(`${API_URL}/books?limit=1000`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(response => {
        // Backend { data: [...], pagination: {...} } formatında dönüyor
        const booksData = response?.data || response;
        setBooks(Array.isArray(booksData) ? booksData : []);
      })
      .catch(() => setBooks([]));
    fetch(`${API_URL}/warehouses`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(response => {
        const warehousesData = Array.isArray(response) ? response : (response?.data || []);
        setWarehouses(Array.isArray(warehousesData) ? warehousesData : []);
      })
      .catch(() => setWarehouses([]));
    fetch(`${API_URL}/stocks`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(response => {
        const stocksData = Array.isArray(response) ? response : [];
        setStocks(stocksData);
      })
      .catch(() => setStocks([]));
  }, []);

  // Kitap seçilince dilleri güncelle
  useEffect(() => {
    if (!form.bookId) {
      setLanguages([]);
      setForm(f => ({ ...f, languageId: '' }));
      return;
    }
    const selectedBook = books.find(b => b.id === Number(form.bookId));
    if (selectedBook && selectedBook.translations && selectedBook.translations.length > 0) {
      // translations array'inden unique dilleri çıkar
      const uniqueLanguages = selectedBook.translations
        .map(t => t.language)
        .filter((lang, index, self) => 
          lang && self.findIndex(l => l.id === lang.id) === index
        );
      setLanguages(uniqueLanguages);
    } else {
      setLanguages([]);
    }
    setForm(f => ({ ...f, languageId: '' }));
  }, [form.bookId, books]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/stocks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId: Number(form.bookId),
          languageId: Number(form.languageId),
          warehouseId: Number(form.warehouseId),
          quantity: Number(form.quantity),
          unitPrice: Number(form.unitPrice),
        }),
      });
      if (res.status === 409) {
        const errData = await res.json();
        throw new Error(errData.message || 'Bu kitap, dil ve depo kombinasyonu için zaten bir stok kaydı var.');
      }
      if (!res.ok) throw new Error('Stok eklenemedi');
      setSuccess('Stok başarıyla eklendi!');
      setForm({ bookId: '', languageId: '', warehouseId: '', quantity: '', unitPrice: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const token = localStorage.getItem('access_token');
      const selectedStock = stocks.find(s => s.id === Number(updateForm.stockId));
      
      if (!selectedStock) {
        throw new Error('Stok bulunamadı');
      }
      
      const currentQuantity = Number(selectedStock.quantity);
      const changeAmount = Number(updateForm.quantity);
      
      let newQuantity;
      if (updateForm.operation === 'add') {
        newQuantity = currentQuantity + changeAmount;
      } else {
        newQuantity = currentQuantity - changeAmount;
        if (newQuantity < 0) {
          throw new Error('Stok miktarı negatif olamaz!');
        }
      }
      
      const res = await fetch(`${API_URL}/stocks/${updateForm.stockId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: newQuantity,
        }),
      });
      
      if (!res.ok) throw new Error('Stok güncellenemedi');
      
      setSuccess(`Stok başarıyla güncellendi! Yeni miktar: ${newQuantity} adet`);
      setUpdateForm({ stockId: '', quantity: '', operation: 'add' });
      
      // Stok listesini yenile
      fetch(`${API_URL}/stocks`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(response => {
          const stocksData = Array.isArray(response) ? response : [];
          setStocks(stocksData);
        });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Seçilen stok bilgisini al
  const selectedStock = stocks.find(s => s.id === Number(updateForm.stockId));

  return (
    <>
      <Helmet>
        <title>{intl.formatMessage({
          id: "UI.STOK_YONETIMI__ISLAMIC_WINDOWS_ADMIN"
        })}</title>
      </Helmet>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Modern Header with Gradient */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link 
                to="/stoklar/liste"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <FaArrowLeft className="text-gray-700 dark:text-gray-300" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
                    <FaBoxes className="text-2xl" />
                  </div>
                  <FormattedMessage id="UI.STOK_YONETIMI" />
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 ml-1">
                  <FormattedMessage id="UI.YENI_STOK_EKLEYIN_VEYA_MEVCUT_STOKLARI_G" />
                </p>
              </div>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full animate-pulse transition-all duration-500 ${
              mode === 'add' 
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 w-1/2' 
                : 'bg-gradient-to-r from-green-500 to-emerald-500 w-full'
            }`} />
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-3 mb-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setMode('add')}
            className={`flex-1 px-6 py-4 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
              mode === 'add'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xl scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
            }`}
          >
            <FaPlus className="text-lg" /> <FormattedMessage id="UI.YENI_STOK_EKLE" />
          </button>
          <button
            type="button"
            onClick={() => setMode('update')}
            className={`flex-1 px-6 py-4 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
              mode === 'update'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
            }`}
          >
            <span className="text-lg">↕</span> <FormattedMessage id="UI.VAR_OLAN_STOGU_GUNCELLE" />
          </button>
        </div>

      {mode === 'add' ? (
        /* Yeni Stok Ekle Formu */
        (<div className="rounded-xl shadow-xl bg-white dark:bg-gray-900 p-8 border-2 border-blue-100 dark:border-blue-900 hover:shadow-2xl transition-all duration-300">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-xl p-5 mb-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-2xl font-bold flex items-center gap-3 text-blue-700 dark:text-blue-300">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FaPlus className="text-white" />
              </div>
              <FormattedMessage id="UI.YENI_STOK_KAYDI_OLUSTUR" />
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 ml-12">
              <FormattedMessage id="UI.SISTEME_YENI_BIR_STOK_KAYDI_EKLEYIN" />
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="flex items-center gap-2 font-bold mb-3 text-base">
              <FaBook className="text-purple-500" />
              <FormattedMessage id="UI.KITAP" />
            </label>
            <Select
              name="bookId"
              options={books.map(book => ({
                value: book.id,
                label: book.translations?.[0]?.title || book.title || 'İsimsiz Kitap',
                book: book // Tüm kitap bilgisini sakla
              }))}
              value={books
                .filter(b => b.id === Number(form.bookId))
                .map(book => ({
                  value: book.id,
                  label: book.translations?.[0]?.title || book.title || 'İsimsiz Kitap'
                }))[0] || null}
              onChange={(selectedOption) => {
                if (selectedOption) {
                  setForm({ ...form, bookId: String(selectedOption.value) });
                } else {
                  setForm({ ...form, bookId: '' });
                }
              }}
              placeholder="Kitap arayın veya seçin..."
              isClearable
              isSearchable
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                control: (base, state) => ({
                  ...base,
                  backgroundColor: safeTheme === 'dark' ? '#18181b' : '#fff',
                  borderColor: state.isFocused ? '#3b82f6' : (safeTheme === 'dark' ? '#374151' : '#d1d5db'),
                  '&:hover': { borderColor: '#3b82f6' },
                  minHeight: '42px'
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: safeTheme === 'dark' ? '#1f2937' : '#fff',
                  zIndex: 9999
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected 
                    ? '#3b82f6' 
                    : state.isFocused 
                      ? (safeTheme === 'dark' ? '#374151' : '#e5e7eb')
                      : (safeTheme === 'dark' ? '#1f2937' : '#fff'),
                  color: state.isSelected 
                    ? '#fff' 
                    : (safeTheme === 'dark' ? '#f3f4f6' : '#111827'),
                }),
                input: (base) => ({
                  ...base,
                  color: safeTheme === 'dark' ? '#f3f4f6' : '#111827'
                }),
                placeholder: (base) => ({
                  ...base,
                  color: safeTheme === 'dark' ? '#9ca3af' : '#6b7280'
                }),
                singleValue: (base) => ({
                  ...base,
                  color: safeTheme === 'dark' ? '#f3f4f6' : '#111827'
                })
              }}
            />
          </div>
          <div>
            <label className="flex items-center gap-2 font-bold mb-3 text-base">
              <FaGlobe className="text-indigo-500" />
              <FormattedMessage id="USER.MENU.LANGUAGE" />
            </label>
            <select
              name="languageId"
              value={form.languageId}
              onChange={handleChange}
              required
              disabled={!form.bookId || languages.length === 0}
              className="w-full px-4 py-3 h-11 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!form.bookId ? (
                <option value=""><FormattedMessage id="UI.ONCE_KITAP_SECIN" /></option>
              ) : languages.length === 0 ? (
                <option value=""><FormattedMessage id="UI.BU_KITAP_ICIN_DIL_YOK" /></option>
              ) : (
                <option value=""><FormattedMessage id="UI.SECINIZ" /></option>
              )}
              {languages.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              <FormattedMessage id="UI._SECILEN_KITABIN_MEVCUT_DILLERINDEN_BIRI" />
            </p>
          </div>
          <div>
            <label className="flex items-center gap-2 font-bold mb-3 text-base">
              <FaWarehouse className="text-orange-500" />
              <FormattedMessage id="UI.DEPO" />
            </label>
            <select
              name="warehouseId"
              value={form.warehouseId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 h-11 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value=""><FormattedMessage id="UI.SECINIZ" /></option>
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.id}>{wh.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              <FormattedMessage id="UI._STOKUN_BULUNACAGI_DEPOYU_SECIN" />
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 font-bold mb-3 text-base">
                <FaHashtag className="text-green-500" />
                <FormattedMessage id="UI.MIKTAR" />
              </label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-3 h-11 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Örn: 100"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                <FormattedMessage id="UI._EKLENECEK_STOK_MIKTARI_ADET" />
              </p>
            </div>
            <div>
              <label className="flex items-center gap-2 font-bold mb-3 text-base">
                <FaDollarSign className="text-emerald-500" />
                <FormattedMessage id="UI.BIRIM_FIYAT" />
              </label>
              <input
                type="number"
                name="unitPrice"
                value={form.unitPrice}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 h-11 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Örn: 45.50"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                <FormattedMessage id="UI._BIRIM_FIYAT_TL" />
              </p>
            </div>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="text-green-600 text-sm bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-2">
              <span>✅</span> {success}
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setForm({ bookId: '', languageId: '', warehouseId: '', quantity: '', unitPrice: '' })}
              className="px-6 py-3 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              <FormattedMessage id="UI.TEMIZLE" />
            </button>
            <button
              type="submit"
              className="px-8 py-3 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <FormattedMessage id="UI.KAYDEDILIYOR" />
                </>
              ) : (
                <>
                  <FaSave />
                  <FormattedMessage id="UI.KAYDET" />
                </>
              )}
            </button>
          </div>
        </form>
        </div>)
      ) : (
        /* Var Olan Stok Güncelleme Formu */
        (<div className="rounded-xl shadow-xl bg-white dark:bg-gray-900 p-8 border-2 border-green-100 dark:border-green-900 hover:shadow-2xl transition-all duration-300">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl p-5 mb-6 border border-green-200 dark:border-green-800">
            <h3 className="text-2xl font-bold flex items-center gap-3 text-green-700 dark:text-green-300">
              <div className="p-2 bg-green-600 rounded-lg">
                <span className="text-white text-xl">↕</span>
              </div>
              <FormattedMessage id="UI.MEVCUT_STOGA_EKLEMECIKARMA" />
            </h3>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2 ml-12">
              <FormattedMessage id="UI.VAR_OLAN_STOK_KAYITLARINI_GUNCELLEYIN" />
            </p>
          </div>
          <form onSubmit={handleUpdateSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 font-bold mb-3 text-base">
                <FaBoxes className="text-purple-500" />
                <FormattedMessage id="UI.STOK_SECIN" />
              </label>
              <Select
                name="stockId"
                options={stocks.map(stock => {
                  const bookTitle = stock.book?.translations?.[0]?.title || stock.book?.title || 'İsimsiz Kitap';
                  return {
                    value: stock.id,
                    label: `${bookTitle} - ${stock.language?.name} - ${stock.warehouse?.name}`,
                    sublabel: `Mevcut: ${stock.quantity} adet`,
                    stock: stock
                  };
                })}
                value={stocks
                  .filter(s => s.id === Number(updateForm.stockId))
                  .map(stock => {
                    const bookTitle = stock.book?.translations?.[0]?.title || stock.book?.title || 'İsimsiz Kitap';
                    return {
                      value: stock.id,
                      label: `${bookTitle} - ${stock.language?.name} - ${stock.warehouse?.name}`,
                      sublabel: `Mevcut: ${stock.quantity} adet`
                    };
                  })[0] || null}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    setUpdateForm({ ...updateForm, stockId: String(selectedOption.value) });
                  } else {
                    setUpdateForm({ ...updateForm, stockId: '' });
                  }
                }}
                placeholder="Stok arayın veya seçin..."
                isClearable
                isSearchable
                formatOptionLabel={(option) => (
                  <div className="py-1">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{option.sublabel}</div>
                  </div>
                )}
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    backgroundColor: safeTheme === 'dark' ? '#18181b' : '#fff',
                    borderColor: state.isFocused ? '#3b82f6' : (safeTheme === 'dark' ? '#374151' : '#d1d5db'),
                    '&:hover': { borderColor: '#3b82f6' },
                    minHeight: '42px'
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: safeTheme === 'dark' ? '#1f2937' : '#fff',
                    zIndex: 9999
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected 
                      ? '#3b82f6' 
                      : state.isFocused 
                        ? (safeTheme === 'dark' ? '#374151' : '#e5e7eb')
                        : (safeTheme === 'dark' ? '#1f2937' : '#fff'),
                    color: state.isSelected 
                      ? '#fff' 
                      : (safeTheme === 'dark' ? '#f3f4f6' : '#111827'),
                  }),
                  input: (base) => ({
                    ...base,
                    color: safeTheme === 'dark' ? '#f3f4f6' : '#111827'
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: safeTheme === 'dark' ? '#9ca3af' : '#6b7280'
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: safeTheme === 'dark' ? '#f3f4f6' : '#111827'
                  })
                }}
              />
            </div>

            {selectedStock && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-5 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-3">
                  <FaInfoCircle className="text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-blue-700 dark:text-blue-300"><FormattedMessage id="UI.MEVCUT_STOK_BILGISI" /></span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1"><FormattedMessage id="UI.MEVCUT_MIKTAR" /></span>
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{selectedStock.quantity} <FormattedMessage id="UI.ADET" /></span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1"><FormattedMessage id="UI.BIRIM_FIYAT" /></span>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">{selectedStock.unitPrice} ₺</span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 font-bold mb-3 text-base">
                <span className="text-lg">↕</span>
                <FormattedMessage id="UI.ISLEM_TURU" />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUpdateForm({ ...updateForm, operation: 'add' })}
                  className={`px-6 py-4 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${
                    updateForm.operation === 'add'
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 shadow-lg scale-105'
                      : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-400 hover:shadow-md'
                  }`}
                >
                  <FaPlus className="text-xl" /> <FormattedMessage id="UI.STOK_EKLE" />
                </button>
                <button
                  type="button"
                  onClick={() => setUpdateForm({ ...updateForm, operation: 'subtract' })}
                  className={`px-6 py-4 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${
                    updateForm.operation === 'subtract'
                      ? 'border-red-500 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 text-red-700 dark:text-red-400 shadow-lg scale-105'
                      : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-400 hover:shadow-md'
                  }`}
                >
                  <FaMinus className="text-xl" /> <FormattedMessage id="UI.STOK_CIKAR" />
                </button>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 font-bold mb-3 text-base">
                <FaHashtag className={updateForm.operation === 'add' ? 'text-green-500' : 'text-red-500'} />
                {updateForm.operation === 'add' ? 'Eklenecek' : 'Çıkarılacak'} <FormattedMessage id="UI.MIKTAR" />
              </label>
              <input
                type="number"
                name="quantity"
                value={updateForm.quantity}
                onChange={(e) => setUpdateForm({ ...updateForm, quantity: e.target.value })}
                required
                min="1"
                max={updateForm.operation === 'subtract' ? selectedStock?.quantity : undefined}
                className="w-full px-4 py-3 h-11 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Miktar girin"
              />
              {updateForm.operation === 'subtract' && selectedStock && Number(updateForm.quantity) > Number(selectedStock.quantity) && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                    <span>⚠️</span> <FormattedMessage id="UI.MEVCUT_STOKTAN_" />{selectedStock.quantity} <FormattedMessage id="UI.ADET_FAZLA_CIKARAMAZSINIZ" />
                  </p>
                </div>
              )}
              {selectedStock && updateForm.quantity && (
                <div className={`mt-3 p-4 rounded-lg border-2 ${
                  updateForm.operation === 'add' 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                }`}>
                  <p className={`text-base font-bold flex items-center justify-between ${
                    updateForm.operation === 'add' 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-orange-700 dark:text-orange-300'
                  }`}>
                    <span><FormattedMessage id="UI.YENI_MIKTAR" /></span>
                    <span className="text-2xl">{updateForm.operation === 'add' 
                        ? Number(selectedStock.quantity) + Number(updateForm.quantity)
                        : Number(selectedStock.quantity) - Number(updateForm.quantity)
                      } <FormattedMessage id="UI.ADET" /></span>
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}
            {success && (
              <div className="text-green-600 text-sm bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-2">
                <span>✅</span> {success}
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setUpdateForm({ stockId: '', quantity: '', operation: 'add' })}
                className="px-6 py-3 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                <FormattedMessage id="UI.TEMIZLE" />
              </button>
              <button
                type="submit"
                className={`px-8 py-3 h-12 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                  updateForm.operation === 'add'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                    : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white'
                }`}
                disabled={loading || !updateForm.stockId || !updateForm.quantity}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <FormattedMessage id="UI.ISLENIYOR" />
                  </>
                ) : (
                  <>
                    {updateForm.operation === 'add' ? <FaPlus /> : <FaMinus />}
                    {updateForm.operation === 'add' ? 'Stok Ekle' : 'Stok Çıkar'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>)
      )}
      </div>
    </>
  );
} 