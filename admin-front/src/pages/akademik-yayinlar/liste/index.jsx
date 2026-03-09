import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/papers';
const PUBLIC_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function PaperList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`Hata: ${response.status}`);
      }
      const parsed = JSON.parse(text);
      setItems(parsed.data || parsed || []);
    } catch (error) {
      toast.error(error.message || 'Akademik yayinlar yuklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('tr-TR');
  };

  const resolveImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    return `${PUBLIC_API_URL.replace(/\/$/, '')}/${imageUrl.replace(/^\//, '')}`;
  };

  const stripHtml = (html) => {
    if (!html) return '';
    return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const truncate = (text, max = 110) => {
    if (!text) return '-';
    return text.length > max ? `${text.slice(0, max)}...` : text;
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`"${item.title}" yayinini silmek istediginize emin misiniz?`)) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Silme islemi basarisiz');
      toast.success('Yayin silindi');
      setItems((prev) => prev.filter((x) => x.id !== item.id));
    } catch (error) {
      toast.error(error.message || 'Yayin silinemedi');
    }
  };

  return (
    <>
      <Helmet>
        <title>Akademik Yayinlar</title>
      </Helmet>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Akademik Yayinlar</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Admin panelinden yayimlanan tum akademik yayinlar.</p>
          </div>
          <Link
            to="/akademik-yayinlar/ekle"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center gap-2"
          >
            <FaPlus />
            Yayin Ekle
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400">Yukleniyor...</div>
          ) : (
            <table className="w-full min-w-[980px]">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Kapak</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Baslik & Intro</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Yazar</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Yayin Tarihi</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Olusturma / Guncelleme</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Islemler</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                      Kayitli akademik yayin bulunamadi.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="px-4 py-3">
                        {item.imageUrl ? (
                          <img
                            src={resolveImageUrl(item.imageUrl)}
                            alt={item.title || 'Kapak'}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center">
                            Yok
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 align-top">
                        <div className="font-semibold mb-1">{item.title || '-'}</div>
                        <div className="text-gray-600 dark:text-gray-400">{truncate(item.intro, 120)}</div>
                        {item.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.tags.map((t) => (
                              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {item.author || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(item.publishDate)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                        <div>Olusturma: {formatDate(item.createdAt)}</div>
                        <div className="mt-1">Guncelleme: {formatDate(item.updatedAt)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            className="p-2 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                            onClick={() => navigate(`/akademik-yayinlar/duzenle/${item.id}`)}
                            title="Duzenle"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="p-2 rounded bg-red-500 text-white hover:bg-red-600"
                            onClick={() => handleDelete(item)}
                            title="Sil"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

export default PaperList;
