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
import { FaCheckCircle, FaTimesCircle, FaClock, FaTruck, FaWarehouse, FaFilter, FaExchangeAlt, FaBoxes } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function StockTransferList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transferAction, setTransferAction] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, transfer: null, type: null });
  
  // Filter states
  const [filters, setFilters] = useState({
    fromWarehouseId: 'all',
    toWarehouseId: 'all',
    cargoCompany: '',
    status: 'all',
  });
  
  // Options for dropdowns
  const [warehouses, setWarehouses] = useState([]);
  
  // All data for statistics
  const [allData, setAllData] = useState([]);

  // İstatistikler - tüm veriden hesapla
  const stats = React.useMemo(() => {
    if (!allData || allData.length === 0) return { total: 0, pending: 0, completed: 0, cancelled: 0 };
    
    const total = allData.length;
    const pending = allData.filter(t => t.status === 'pending').length;
    const completed = allData.filter(t => t.status === 'completed').length;
    const cancelled = allData.filter(t => t.status === 'cancelled').length;
    
    return { total, pending, completed, cancelled };
  }, [allData]);

  // Fetch warehouses and all data for stats on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    Promise.all([
      fetch(`${API_URL}/warehouses`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_URL}/stock-transfers`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([wars, transfers]) => {
      setWarehouses(Array.isArray(wars) ? wars : []);
      setAllData(Array.isArray(transfers) ? transfers : []);
    }).catch(() => {
      // Silent fail for initial options
    });
  }, []);

  // Fetch filtered transfers
  const fetchTransfers = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      
      if (filters.fromWarehouseId !== 'all') params.append('fromWarehouseId', filters.fromWarehouseId);
      if (filters.toWarehouseId !== 'all') params.append('toWarehouseId', filters.toWarehouseId);
      if (filters.cargoCompany) params.append('cargoCompany', filters.cargoCompany);
      if (filters.status !== 'all') params.append('status', filters.status);
      
      const url = `${API_URL}/stock-transfers${params.toString() ? '?' + params.toString() : ''}`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error('Transferler alınamadı');
      const result = await res.json();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err.message);
      toast.error('Transferler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransfers();
    }, 300); // Debounce

    return () => clearTimeout(timer);
  }, [fetchTransfers]);

  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: 'Transfer ID',
      cell: info => <span className="font-semibold">{info.getValue()}</span>,
    },
    {
      accessorKey: 'fromWarehouse.name',
      header: 'Kaynak Depo',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'toWarehouse.name',
      header: 'Hedef Depo',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'quantity',
      header: 'Miktar',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'cargoCompany',
      header: 'Kargo',
      cell: info => {
        const transfer = info.row.original;
        if (!transfer.cargoCompany) return <span className="text-gray-400 text-xs">-</span>;
        return (
          <div className="text-xs">
            <div className="flex items-center gap-1 font-semibold text-gray-900 dark:text-gray-100">
              <FaTruck className="text-blue-500" />
              {transfer.cargoCompany}
            </div>
            {transfer.trackingNumber && (
              <div className="text-gray-500 dark:text-gray-400 mt-0.5">
                #{transfer.trackingNumber}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Durum',
      cell: info => {
        const status = info.getValue();
        let color, icon, label;
        switch (status) {
          case 'pending':
            color = 'bg-yellow-500';
            icon = <FaClock className="inline mr-1" />;
            label = 'Beklemede';
            break;
          case 'completed':
            color = 'bg-green-500';
            icon = <FaCheckCircle className="inline mr-1" />;
            label = 'Tamamlandı';
            break;
          case 'cancelled':
            color = 'bg-red-500';
            icon = <FaTimesCircle className="inline mr-1" />;
            label = 'İptal Edildi';
            break;
          default:
            color = 'bg-gray-500';
            icon = null;
            label = status;
        }
        return (
          <span className={`px-2 py-1 rounded text-white flex items-center justify-center gap-1 ${color}`}
            style={{ minWidth: 120, display: 'inline-flex' }}>
            {icon} {label}
          </span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Oluşturulma Tarihi',
      cell: info => new Date(info.getValue()).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <div className="flex gap-2 items-center justify-center">
            {status === 'pending' && (
              <>
                <button
                  className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition"
                  onClick={() => handleCompleteTransfer(row.original)}
                  disabled={transferAction === 'completing'}
                >
                  Onayla
                </button>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition"
                  onClick={() => handleCancelTransferWithConfirm(row.original)}
                  disabled={transferAction === 'cancelling'}
                >
                  Reddet
                </button>
              </>
            )}
            <Link
              to={`/stok-transfer/detay/${row.original.id}`}
              className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition"
            >
              Detay
            </Link>
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
      size: 100,
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Function to handle transfer completion (with confirm)
  const handleCompleteTransfer = (transfer) => {
    setConfirmModal({ open: true, transfer, type: 'complete' });
  };

  const handleCancelTransferWithConfirm = (transfer) => {
    setConfirmModal({ open: true, transfer, type: 'cancel' });
  };

  const confirmModalAction = async () => {
    const { transfer, type } = confirmModal;
    setTransferAction(type === 'complete' ? 'completing' : 'cancelling');
    setConfirmModal({ open: false, transfer: null, type: null });
    const token = localStorage.getItem('access_token');
    try {
      let url = '';
      if (type === 'complete') {
        url = `${API_URL}/stock-transfers/${transfer.id}/complete`;
      } else {
        url = `${API_URL}/stock-transfers/${transfer.id}/cancel`;
      }
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(type === 'complete' ? 'Transfer tamamlanamadı' : 'Transfer iptal edilemedi');
      toast.success(type === 'complete' ? 'Transfer başarıyla tamamlandı!' : 'Transfer başarıyla iptal edildi!');
      
      // Update both data and allData
      await fetchTransfers();
      const token2 = localStorage.getItem('access_token');
      const allTransfers = await fetch(`${API_URL}/stock-transfers`, { headers: { Authorization: `Bearer ${token2}` } }).then(r => r.json());
      setAllData(Array.isArray(allTransfers) ? allTransfers : []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTransferAction(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Stok Transferleri - Islamic Windows Admin</title>
      </Helmet>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Stok Transfer Yönetimi</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tüm stok transferlerinizi yönetin ve takip edin</p>
          </div>
          <Link
            to="/stok-transfer/ekle"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <span className="text-lg">+</span> Transfer Ekle
          </Link>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Toplam Transfer</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
                <p className="text-blue-100 text-xs mt-1">Tüm transferler</p>
              </div>
              <FaExchangeAlt className="text-5xl text-blue-200 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Beklemede</p>
                <p className="text-3xl font-bold mt-1">{stats.pending}</p>
                <p className="text-yellow-100 text-xs mt-1">İşlem bekliyor</p>
              </div>
              <FaClock className="text-5xl text-yellow-200 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Tamamlandı</p>
                <p className="text-3xl font-bold mt-1">{stats.completed}</p>
                <p className="text-green-100 text-xs mt-1">Başarılı</p>
              </div>
              <FaCheckCircle className="text-5xl text-green-200 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">İptal Edildi</p>
                <p className="text-3xl font-bold mt-1">{stats.cancelled}</p>
                <p className="text-red-100 text-xs mt-1">İptal edilenler</p>
              </div>
              <FaTimesCircle className="text-5xl text-red-200 opacity-30" />
            </div>
          </div>
        </div>

        {/* Filtreleme Alanı */}
        <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 border border-indigo-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <FaFilter className="text-white text-lg" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filtrele & Ara</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Kaynak Depo */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FaWarehouse className="text-blue-600" />
                Kaynak Depo
              </label>
              <select
                value={filters.fromWarehouseId}
                onChange={e => setFilters(prev => ({ ...prev, fromWarehouseId: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition cursor-pointer"
              >
                <option value="all">Tüm Depolar</option>
                {warehouses.map(wh => (
                  <option key={wh.id} value={wh.id}>{wh.name}</option>
                ))}
              </select>
            </div>

            {/* Hedef Depo */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FaWarehouse className="text-green-600" />
                Hedef Depo
              </label>
              <select
                value={filters.toWarehouseId}
                onChange={e => setFilters(prev => ({ ...prev, toWarehouseId: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition cursor-pointer"
              >
                <option value="all">Tüm Depolar</option>
                {warehouses.map(wh => (
                  <option key={wh.id} value={wh.id}>{wh.name}</option>
                ))}
              </select>
            </div>

            {/* Kargo Şirketi */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FaTruck className="text-orange-600" />
                Kargo Şirketi
              </label>
              <input
                type="text"
                placeholder="Kargo ara..."
                value={filters.cargoCompany}
                onChange={e => setFilters(prev => ({ ...prev, cargoCompany: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition"
              />
            </div>

            {/* Durum */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FaBoxes className="text-purple-600" />
                Durum
              </label>
              <select
                value={filters.status}
                onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition cursor-pointer"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="pending">Beklemede</option>
                <option value="completed">Tamamlandı</option>
                <option value="cancelled">İptal Edildi</option>
              </select>
            </div>
          </div>

          {/* Reset Button & Results Count */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-indigo-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Bulunan:</span>
              <span className="px-3 py-1 bg-indigo-600 text-white rounded-full font-bold">
                {data.length}
              </span>
              <span className="text-gray-600 dark:text-gray-400">transfer</span>
            </div>
            
            {(filters.fromWarehouseId !== 'all' || filters.toWarehouseId !== 'all' || filters.cargoCompany || filters.status !== 'all') && (
              <button
                onClick={() => setFilters({ fromWarehouseId: 'all', toWarehouseId: 'all', cargoCompany: '', status: 'all' })}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-medium text-sm flex items-center gap-2"
              >
                <FaTimesCircle />
                Filtreleri Temizle
              </button>
            )}
          </div>
        </div>
      <div className="overflow-x-auto rounded-lg shadow-lg">
        {loading ? (
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">Yükleniyor...</div>
        ) : error ? (
          <div className="py-10 text-center text-red-500">{error}</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900 rounded-lg">
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
                      <div className="text-6xl mb-4">📦</div>
                      <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                        {(filters.fromWarehouseId !== 'all' || filters.toWarehouseId !== 'all' || filters.cargoCompany || filters.status !== 'all')
                          ? 'Filtreleme sonucu bulunamadı'
                          : 'Henüz transfer eklenmemiş'}
                      </p>
                      {!(filters.fromWarehouseId !== 'all' || filters.toWarehouseId !== 'all' || filters.cargoCompany || filters.status !== 'all') && (
                        <Link 
                          to="/stok-transfer/ekle"
                          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          İlk Transferi Ekle
                        </Link>
                      )}
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr
                      key={row.id}
                      className="hover:bg-indigo-50 dark:hover:bg-gray-800/50 transition-all duration-200 group"
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4">
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Önceki
          </button>
          <span className="text-sm">
            Sayfa{' '}
            <strong>
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </strong>
          </span>
          <button
            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Sonraki
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Göster:</span>
          <select
            className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
          >
            {[5, 10, 20, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Render confirm modal */}
      {confirmModal.open && confirmModal.transfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full">
            {confirmModal.type === 'complete' ? (
              <>
                <p className="mb-2">
                  <strong>{confirmModal.transfer.quantity}</strong> adet stok <strong>{confirmModal.transfer.fromWarehouse.name}</strong> deposundan eksilip <strong>{confirmModal.transfer.toWarehouse.name}</strong> deposuna eklenecek.
                </p>
                <p className="mb-4">Bu işlemi onaylıyor musunuz?</p>
              </>
            ) : (
              <>
                <p className="mb-2">
                  <strong>{confirmModal.transfer.quantity}</strong> adet stok <strong>{confirmModal.transfer.fromWarehouse.name}</strong> deposuna geri aktarılacak.
                </p>
                <p className="mb-4">Bu işlemi onaylıyor musunuz?</p>
              </>
            )}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                onClick={() => setConfirmModal({ open: false, transfer: null, type: null })}
              >
                Vazgeç
              </button>
              <button
                className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                onClick={confirmModalAction}
              >
                Onayla
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
} 