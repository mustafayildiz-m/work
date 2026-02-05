import React, { useMemo, useState, useEffect } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { FaWarehouse, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle, FaEdit, FaTrash, FaBoxes, FaChartLine } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function StoreList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    name: '',
    location: '',
    isActive: 'all', // 'all', 'true', 'false'
  });

  // İstatistikler - tüm veriden hesaplanacak
  const [allData, setAllData] = useState([]);
  const stats = React.useMemo(() => {
    if (!allData || allData.length === 0) return { total: 0, active: 0, inactive: 0 };
    
    const total = allData.length;
    const active = allData.filter(d => d.isActive).length;
    const inactive = total - active;
    
    return { total, active, inactive };
  }, [allData]);

  // Fetch all data for stats on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch(`${API_URL}/warehouses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.ok ? res.json() : [])
      .then(setAllData)
      .catch(() => {});
  }, []);

  // Fetch filtered data
  const fetchWarehouses = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      
      if (filters.name) params.append('name', filters.name);
      if (filters.location) params.append('location', filters.location);
      if (filters.isActive !== 'all') params.append('isActive', filters.isActive);
      
      const url = `${API_URL}/warehouses${params.toString() ? '?' + params.toString() : ''}`;
      
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) throw new Error('Depolar alınamadı');
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWarehouses();
    }, 300); // Debounce

    return () => clearTimeout(timer);
  }, [fetchWarehouses]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/warehouses/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Depo silinemedi');
      setData(prev => prev.filter(d => d.id !== id));
      toast.success('Depo başarıyla silindi!');
    } catch (err) {
      toast.error(err.message || 'Depo silinirken hata oluştu');
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Depo Adı',
      cell: info => (
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <FaWarehouse className="text-blue-600 dark:text-blue-400" />
          </div>
          <span className="font-bold text-gray-900 dark:text-gray-100">{info.getValue()}</span>
        </div>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Konum',
      cell: info => (
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="text-red-500 flex-shrink-0" />
          <span className="text-gray-700 dark:text-gray-300">{info.getValue() || '-'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Açıklama',
      cell: info => (
        <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {info.getValue() || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Durum',
      cell: info => {
        const isActive = info.getValue();
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isActive 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            {isActive ? <FaCheckCircle /> : <FaTimesCircle />}
            {isActive ? 'Aktif' : 'Pasif'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'İşlemler',
      cell: ({ row }) => (
        <div className="flex gap-2 items-center justify-end">
          <Link
            to={`/depolar/duzenle/${row.original.id}`}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 flex items-center gap-1.5"
            title="Düzenle"
          >
            <FaEdit size={16} />
            <span className="text-xs font-medium hidden lg:inline">Düzenle</span>
          </Link>
          <button
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 flex items-center gap-1.5"
            onClick={() => {
              setWarehouseToDelete(row.original);
              setDeleteModalOpen(true);
            }}
            title="Sil"
          >
            <FaTrash size={16} />
            <span className="text-xs font-medium hidden lg:inline">Sil</span>
          </button>
        </div>
      ),
      enableSorting: false,
      size: 150,
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <Helmet>
        <title>Depo Yönetimi - Islamic Windows Admin</title>
      </Helmet>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Depo Yönetimi</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tüm depolarınızı yönetin ve stok durumlarını takip edin</p>
          </div>
          <Link
            to="/depolar/ekle"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <span className="text-lg">+</span> Depo Ekle
          </Link>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Toplam Depo</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
                <p className="text-blue-100 text-xs mt-1">Kayıtlı depo sayısı</p>
              </div>
              <FaWarehouse className="text-5xl text-blue-200 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Aktif Depo</p>
                <p className="text-3xl font-bold mt-1">{stats.active}</p>
                <p className="text-green-100 text-xs mt-1">Kullanımda olan</p>
              </div>
              <FaCheckCircle className="text-5xl text-green-200 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm font-medium">Pasif Depo</p>
                <p className="text-3xl font-bold mt-1">{stats.inactive}</p>
                <p className="text-gray-100 text-xs mt-1">Kullanımda değil</p>
              </div>
              <FaTimesCircle className="text-5xl text-gray-200 opacity-30" />
            </div>
          </div>
        </div>

        {/* Filtreleme Alanı */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FaBoxes className="text-white text-lg" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filtrele & Ara</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Depo Adı */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FaWarehouse className="text-blue-600" />
                Depo Adı
              </label>
              <input
                type="text"
                placeholder="Depo adı ara..."
                value={filters.name}
                onChange={e => setFilters(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition"
              />
            </div>

            {/* Konum */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FaMapMarkerAlt className="text-red-600" />
                Konum
              </label>
              <input
                type="text"
                placeholder="Konum ara..."
                value={filters.location}
                onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition"
              />
            </div>

            {/* Durum */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FaCheckCircle className="text-green-600" />
                Durum
              </label>
              <select
                value={filters.isActive}
                onChange={e => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition cursor-pointer"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="true">Aktif Depolar</option>
                <option value="false">Pasif Depolar</option>
              </select>
            </div>
          </div>

          {/* Reset Button & Results Count */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-blue-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Bulunan:</span>
              <span className="px-3 py-1 bg-blue-600 text-white rounded-full font-bold">
                {data.length}
              </span>
              <span className="text-gray-600 dark:text-gray-400">depo</span>
            </div>
            
            {(filters.name || filters.location || filters.isActive !== 'all') && (
              <button
                onClick={() => setFilters({ name: '', location: '', isActive: 'all' })}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-medium text-sm flex items-center gap-2"
              >
                <FaTimesCircle />
                Filtreleri Temizle
              </button>
            )}
          </div>
        </div>
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="py-20 text-center bg-white dark:bg-gray-900">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Depolar yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-500 bg-white dark:bg-gray-900">
            <div className="text-6xl mb-4">⚠️</div>
            <p>{error}</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 select-none cursor-pointer group border-b-2 border-primary-500/20"
                        style={{ width: header.getSize() }}
                        onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-xs text-gray-400 group-hover:text-primary-600 transition">
                              {header.column.getIsSorted() === 'asc' && '↑'}
                              {header.column.getIsSorted() === 'desc' && '↓'}
                              {!header.column.getIsSorted() && '⇅'}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="py-20 text-center bg-gray-50 dark:bg-gray-800/50">
                      <div className="text-6xl mb-4">🏢</div>
                      <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                        {(filters.name || filters.location || filters.isActive !== 'all') 
                          ? 'Filtreleme sonucu bulunamadı' 
                          : 'Henüz depo eklenmemiş'}
                      </p>
                      {!(filters.name || filters.location || filters.isActive !== 'all') && (
                        <Link 
                          to="/depolar/ekle"
                          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          İlk Depoyu Ekle
                        </Link>
                      )}
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr
                      key={row.id}
                      className="hover:bg-blue-50 dark:hover:bg-gray-800/50 transition-all duration-200 group"
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="py-4 px-6 align-middle text-sm text-gray-700 dark:text-gray-200">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
        )}
      </div>
      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-white dark:bg-gray-900 p-4 rounded-lg shadow">
        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ← Önceki
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sayfa <strong className="text-primary-600 dark:text-primary-400">{table.getState().pagination.pageIndex + 1}</strong> / <strong>{table.getPageCount()}</strong>
          </span>
          <button
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Sonraki →
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">Sayfa başına:</span>
          <select
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
          >
            {[5, 10, 20, 50, 100].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize} kayıt
              </option>
            ))}
          </select>
        </div>
      </div>
      {deleteModalOpen && warehouseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-600 dark:text-red-400 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Depoyu Silmek İstediğinize Emin misiniz?
              </h3>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4 text-left">
                <p className="text-sm text-gray-800 dark:text-gray-200 mb-3">
                  <span className="font-bold text-red-600 dark:text-red-400">{warehouseToDelete.name}</span> deposu silinecek.
                </p>
                <ul className="space-y-2 text-xs text-red-700 dark:text-red-400">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">⚠️</span>
                    <span>Bu depoya ait tüm stok kayıtları silinecektir</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">⚠️</span>
                    <span>Bu depo ile ilgili tüm transfer kayıtları silinecektir</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">⚠️</span>
                    <span className="font-bold">Bu işlem geri alınamaz!</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-left text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Depo ID:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{warehouseToDelete.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Konum:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{warehouseToDelete.location || '-'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setWarehouseToDelete(null);
                }}
              >
                İptal
              </button>
              <button
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-lg hover:shadow-xl"
                onClick={async () => {
                  setDeleteModalOpen(false);
                  await handleDelete(warehouseToDelete.id);
                  setWarehouseToDelete(null);
                }}
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
      </div>
    </>
  );
}
