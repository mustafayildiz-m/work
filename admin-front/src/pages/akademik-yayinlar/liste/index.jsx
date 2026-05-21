import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/papers';
const PUBLIC_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function PaperList() {
  const intl = useIntl();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const localeTag = intl.locale === 'tr' ? 'tr-TR' : 'en-US';

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(intl.formatMessage({ id: 'UI.ERROR_HTTP_STATUS' }, { status: response.status }));
      }
      const parsed = JSON.parse(text);
      setItems(parsed.data || parsed || []);
    } catch (error) {
      toast.error(error.message || intl.formatMessage({ id: 'UI.ACADEMIC_PUBLICATION_LIST_LOAD_FAILED' }));
    } finally {
      setLoading(false);
    }
  }, [intl]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString(localeTag);
  };

  const resolveImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    return `${PUBLIC_API_URL.replace(/\/$/, '')}/${imageUrl.replace(/^\//, '')}`;
  };

  const truncate = (text, max = 110) => {
    if (!text) return '-';
    return text.length > max ? `${text.slice(0, max)}...` : text;
  };

  const handleDelete = async (item) => {
    const title = item.title || '';
    if (!window.confirm(intl.formatMessage({ id: 'UI.ACADEMIC_PUBLICATION_DELETE_CONFIRM' }, { title }))) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error(intl.formatMessage({ id: 'UI.ACADEMIC_PUBLICATION_DELETE_REQUEST_FAILED' }));
      }
      toast.success(intl.formatMessage({ id: 'UI.ACADEMIC_PUBLICATION_DELETE_SUCCESS' }));
      setItems((prev) => prev.filter((x) => x.id !== item.id));
    } catch (error) {
      toast.error(error.message || intl.formatMessage({ id: 'UI.ACADEMIC_PUBLICATION_DELETE_FAILED' }));
    }
  };

  return (
    <>
      <Helmet>
        <title>{intl.formatMessage({ id: 'UI.ACADEMIC_PUBLICATION_LIST_HELMET' })}</title>
      </Helmet>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              <FormattedMessage id="UI.ACADEMIC_PUBLICATION_LIST_HEADING" />
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              <FormattedMessage id="UI.ACADEMIC_PUBLICATION_LIST_SUBTITLE" />
            </p>
          </div>
          <Link
            to="/akademik-yayinlar/ekle"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center gap-2"
          >
            <FaPlus />
            <FormattedMessage id="MENU.YAYIN_EKLE" />
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400">
              <FormattedMessage id="UI.YUKLENIYOR" />
            </div>
          ) : (
            <table className="w-full min-w-[980px]">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                    <FormattedMessage id="UI.KAPAK" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                    <FormattedMessage id="UI.NEWSLETTER_TABLE_TITLE_INTRO" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                    <FormattedMessage id="UI.YAZAR" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                    <FormattedMessage id="UI.YAYIN_TARIHI" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                    <FormattedMessage id="UI.NEWSLETTER_TABLE_CREATED_UPDATED" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                    <FormattedMessage id="UI.TABLE_ACTIONS" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                      <FormattedMessage id="UI.ACADEMIC_PUBLICATION_EMPTY" />
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="px-4 py-3">
                        {item.imageUrl ? (
                          <img
                            src={resolveImageUrl(item.imageUrl)}
                            alt={item.title || intl.formatMessage({ id: 'UI.KAPAK' })}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center">
                            <FormattedMessage id="UI.NEWSLETTER_NO_COVER" />
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
                        <div>
                          <FormattedMessage id="UI.NEWSLETTER_CREATED_PREFIX" /> {formatDate(item.createdAt)}
                        </div>
                        <div className="mt-1">
                          <FormattedMessage id="UI.NEWSLETTER_UPDATED_PREFIX" /> {formatDate(item.updatedAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="p-2 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                            onClick={() => navigate(`/akademik-yayinlar/duzenle/${item.id}`)}
                            title={intl.formatMessage({ id: 'UI.DUZENLE' })}
                          >
                            <FaEdit />
                          </button>
                          <button
                            type="button"
                            className="p-2 rounded bg-red-500 text-white hover:bg-red-600"
                            onClick={() => handleDelete(item)}
                            title={intl.formatMessage({ id: 'UI.SIL' })}
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
