import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/newsletters';

function NewsletterList() {
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
      toast.error(error.message || 'Bultenler yuklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (item) => {
    if (!window.confirm(`"${item.title}" bultenini silmek istediginize emin misiniz?`)) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Silme islemi basarisiz');
      toast.success('Bulten silindi');
      setItems((prev) => prev.filter((x) => x.id !== item.id));
    } catch (error) {
      toast.error(error.message || 'Bulten silinemedi');
    }
  };

  return (
    <>
      <Helmet>
        <title>Haber Bultenleri</title>
      </Helmet>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Haber Bultenleri</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Admin panelinden yayimlanan tum bultenler.</p>
          </div>
          <Link
            to="/haber-bultenleri/ekle"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center gap-2"
          >
            <FaPlus />
            Bulten Ekle
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400">Yukleniyor...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Baslik</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Yayin Tarihi</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Islemler</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                      Kayitli bulten bulunamadi.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.title || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {item.publishDate ? new Date(item.publishDate).toLocaleDateString('tr-TR') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            className="p-2 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                            onClick={() => navigate(`/haber-bultenleri/duzenle/${item.id}`)}
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

export default NewsletterList;
