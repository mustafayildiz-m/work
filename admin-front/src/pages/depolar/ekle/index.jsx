import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { FaWarehouse, FaMapMarkerAlt, FaInfoCircle, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AddStorePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    location: '',
    description: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/warehouses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Depo eklenemedi');
      await res.json();
      toast.success('Depo başarıyla eklendi!');
      setTimeout(() => navigate('/depolar/liste'), 1000);
    } catch (err) {
      toast.error(err.message || 'Depo eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Yeni Depo Ekle - Islamic Windows Admin</title>
      </Helmet>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaWarehouse className="text-blue-600" />
              Yeni Depo Ekle
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sisteme yeni bir depo ekleyin</p>
          </div>
          <Link
            to="/depolar/liste"
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-2 shadow"
          >
            <FaArrowLeft size={14} />
            Listeye Dön
          </Link>
        </div>

        <div className="rounded-xl shadow-lg bg-white dark:bg-gray-900 p-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Depo Adı */}
            <div>
              <label className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FaWarehouse className="text-blue-600" />
                Depo Adı
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Örn: İstanbul Merkez Depo"
              />
            </div>

            {/* Konum */}
            <div>
              <label className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FaMapMarkerAlt className="text-red-600" />
                Konum
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Örn: İstanbul, Kadıköy"
              />
            </div>

            {/* Açıklama */}
            <div>
              <label className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FaInfoCircle className="text-gray-600" />
                Açıklama
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                placeholder="Depo hakkında detaylı bilgi girin..."
              />
            </div>

            {/* Aktif mi? */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  id="isActive"
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200 cursor-pointer">
                  <FaCheckCircle className="text-green-600" />
                  Depo Aktif
                </label>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 ml-8">
                Aktif depolarda stok işlemleri yapılabilir
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/depolar/liste"
                className="px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                İptal
              </Link>
              <button
                type="submit"
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Kaydet
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 