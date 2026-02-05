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
import { FaTruck, FaClock, FaBoxes, FaWarehouse, FaMoneyBillWave, FaExchangeAlt, FaBook, FaGlobe, FaEdit, FaTrash, FaFilter, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function StockList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transferPopup, setTransferPopup] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    bookName: '',
    languageId: 'all',
    warehouseId: 'all',
    lowStock: false,
  });
  
  // Options for dropdowns
  const [languages, setLanguages] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  
  // All data for statistics
  const [allData, setAllData] = useState([]);

const columns = useMemo(() => [
  {
    accessorKey: 'book.title',
    header: 'Kitap Adı',
    cell: info => {
      const book = info.row.original.book;
      const title = book?.translations?.[0]?.title || book?.title || '-';
      return (
        <div className="flex items-center gap-2">
          <FaBook className="text-blue-500 flex-shrink-0" />
          <span className="font-medium text-gray-900 dark:text-gray-100">{title}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'language.name',
    header: 'Dil',
    cell: info => {
      const langName = info.row.original.language?.name || '-';
      return (
        <div className="flex items-center gap-2">
          <FaGlobe className="text-green-500 flex-shrink-0" />
          <span className="text-gray-700 dark:text-gray-300">{langName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'warehouse.name',
    header: 'Depo',
    cell: info => {
      const warehouseName = info.row.original.warehouse?.name || '-';
      return (
        <div className="flex items-center gap-2">
          <FaWarehouse className="text-purple-500 flex-shrink-0" />
          <span className="text-gray-700 dark:text-gray-300">{warehouseName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'quantity',
    header: 'Stok Miktarı',
    cell: info => {
      const qty = info.getValue();
      const isLow = qty < 10;
      return (
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full font-bold text-sm ${
            isLow 
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          }`}>
            {qty} adet
          </span>
          {isLow && <span className="text-xs text-red-500">⚠️ Düşük</span>}
        </div>
      );
    },
  },
  {
    accessorKey: 'unitPrice',
    header: 'Birim Fiyat',
    cell: info => {
      const price = info.getValue();
      return price ? (
        <span className="font-semibold text-green-600 dark:text-green-400">
          {Number(price).toFixed(2)} ₺
        </span>
      ) : '-';
    },
  },
  {
    accessorKey: 'pendingTransfers',
    header: 'Transfer Durumu',
    cell: info => {
      const pendingTransfers = info.getValue();
      if (!pendingTransfers || pendingTransfers.length === 0) {
        return <span className="text-gray-400 text-xs">-</span>;
      }
      
      return (
        <div className="flex flex-col gap-1">
          {pendingTransfers.map((transfer, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg text-xs hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-all cursor-pointer shadow-sm hover:shadow-md border border-yellow-200 dark:border-yellow-800"
              onClick={(e) => {
                e.stopPropagation();
                setTransferPopup({ transfer });
              }}
              title="Detaylar için tıklayın"
            >
              <FaTruck className="text-yellow-600 dark:text-yellow-400 animate-pulse" />
              <div className="flex flex-col">
                <span className="font-semibold text-yellow-700 dark:text-yellow-300">
                  → {transfer.toWarehouse?.name}
                </span>
                <span className="text-yellow-600 dark:text-yellow-400">
                  {transfer.quantity} adet yolda
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    header: 'İşlemler',
    cell: ({ row }) => (
      <div className="flex gap-2 items-center justify-end">
        <Link
          to={`/stoklar/duzenle/${row.original.id}`}
          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 flex items-center gap-1.5"
          title="Düzenle"
        >
          <FaEdit size={16} />
          <span className="text-xs font-medium hidden lg:inline">Düzenle</span>
        </Link>
        <button 
          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={(e) => {
            e.stopPropagation();
            
            // Transfer halinde olan stokları kontrol et
            const hasPendingTransfers = row.original.pendingTransfers && row.original.pendingTransfers.length > 0;
            
            if (hasPendingTransfers) {
              toast.error('Transfer işlemi devam eden stoklar silinemez!', {
                description: `Bu stok için ${row.original.pendingTransfers.length} adet bekleyen transfer var. Önce transferleri tamamlayın veya iptal edin.`,
                duration: 5000,
              });
              return;
            }
            
            const book = row.original.book;
            const bookTitle = book?.translations?.[0]?.title || book?.title || 'Bu stok';
            setDeleteModal({
              id: row.original.id,
              name: `${bookTitle} (${row.original.language?.name} - ${row.original.warehouse?.name})`
            });
          }}
          title={row.original.pendingTransfers?.length > 0 ? "Transfer devam ediyor, silinemez" : "Sil"}
          disabled={row.original.pendingTransfers?.length > 0}
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
  
  // İstatistikler - tüm veriden hesapla
  const stats = React.useMemo(() => {
    if (!allData || allData.length === 0) return { totalItems: 0, totalValue: 0, lowStock: 0, inTransit: 0 };
    
    const totalItems = allData.reduce((sum, stock) => sum + (Number(stock.quantity) || 0), 0);
    const totalValue = allData.reduce((sum, stock) => sum + ((Number(stock.quantity) || 0) * (Number(stock.unitPrice) || 0)), 0);
    const lowStock = allData.filter(s => s.quantity < 10).length;
    const inTransit = allData.reduce((sum, stock) => {
      const pending = stock.pendingTransfers?.reduce((pSum, t) => pSum + (Number(t.quantity) || 0), 0) || 0;
      return sum + pending;
    }, 0);
    
    return { totalItems, totalValue, lowStock, inTransit };
  }, [allData]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}/stocks/${deleteModal.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) throw new Error('Stok silinemedi');
      
      // Listeden kaldır (hem filtered hem all data)
      setData(prevData => prevData.filter(s => s.id !== deleteModal.id));
      setAllData(prevData => prevData.filter(s => s.id !== deleteModal.id));
      toast.success('Stok başarıyla silindi!');
      setDeleteModal(null);
    } catch (err) {
      toast.error(err.message || 'Silme işlemi başarısız');
    }
  };

  // Fetch languages, warehouses and all data for stats on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    Promise.all([
      fetch(`${API_URL}/languages`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_URL}/warehouses`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_URL}/stocks`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([langs, wars, stocks]) => {
      setLanguages(Array.isArray(langs) ? langs : []);
      setWarehouses(Array.isArray(wars) ? wars : []);
      setAllData(Array.isArray(stocks) ? stocks : []);
    }).catch(() => {
      // Silent fail for initial options
    });
  }, []);

  // Fetch filtered stocks
  const fetchStocks = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      
      if (filters.bookName) params.append('bookName', filters.bookName);
      if (filters.languageId !== 'all') params.append('languageId', filters.languageId);
      if (filters.warehouseId !== 'all') params.append('warehouseId', filters.warehouseId);
      if (filters.lowStock) params.append('lowStock', 'true');
      
      const url = `${API_URL}/stocks${params.toString() ? '?' + params.toString() : ''}`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error('Stoklar alınamadı');
      const result = await res.json();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err.message);
      toast.error('Stoklar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStocks();
    }, 300); // Debounce

    return () => clearTimeout(timer);
  }, [fetchStocks]);

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
        <title>Stok Listesi - Islamic Windows Admin</title>
      </Helmet>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Stok Yönetimi</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tüm kitap stoklarınızı ve transfer durumlarını yönetin</p>
          </div>
          <Link
            to="/stoklar/ekle"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <span className="text-lg">+</span> Stok Ekle
          </Link>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Toplam Stok</p>
                <p className="text-3xl font-bold mt-1">{stats.totalItems.toLocaleString()}</p>
                <p className="text-blue-100 text-xs mt-1">Kitap adedi</p>
              </div>
              <FaBoxes className="text-5xl text-blue-200 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Toplam Değer</p>
                <p className="text-3xl font-bold mt-1">{stats.totalValue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺</p>
                <p className="text-green-100 text-xs mt-1">Stok değeri</p>
              </div>
              <FaMoneyBillWave className="text-5xl text-green-200 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Düşük Stok</p>
                <p className="text-3xl font-bold mt-1">{stats.lowStock}</p>
                <p className="text-red-100 text-xs mt-1">Kritik stoklar</p>
              </div>
              <FaExclamationTriangle className="text-5xl text-red-200 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Transfer Halinde</p>
                <p className="text-3xl font-bold mt-1">{stats.inTransit.toLocaleString()}</p>
                <p className="text-orange-100 text-xs mt-1">Yoldaki kitaplar</p>
              </div>
              <FaExchangeAlt className="text-5xl text-orange-200 opacity-30" />
            </div>
          </div>
        </div>

        {/* Filtreleme Alanı */}
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 border border-purple-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-600 rounded-lg">
              <FaFilter className="text-white text-lg" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filtrele & Ara</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Kitap Adı */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FaBook className="text-blue-600" />
                Kitap Adı
              </label>
              <input
                type="text"
                placeholder="Kitap ara..."
                value={filters.bookName}
                onChange={e => setFilters(prev => ({ ...prev, bookName: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition"
              />
            </div>

            {/* Dil */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FaGlobe className="text-green-600" />
                Dil
              </label>
              <select
                value={filters.languageId}
                onChange={e => setFilters(prev => ({ ...prev, languageId: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition cursor-pointer"
              >
                <option value="all">Tüm Diller</option>
                {languages.map(lang => (
                  <option key={lang.id} value={lang.id}>{lang.name}</option>
                ))}
              </select>
            </div>

            {/* Depo */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FaWarehouse className="text-purple-600" />
                Depo
              </label>
              <select
                value={filters.warehouseId}
                onChange={e => setFilters(prev => ({ ...prev, warehouseId: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition cursor-pointer"
              >
                <option value="all">Tüm Depolar</option>
                {warehouses.map(wh => (
                  <option key={wh.id} value={wh.id}>{wh.name}</option>
                ))}
              </select>
            </div>

            {/* Düşük Stok */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <FaExclamationTriangle className="text-red-600" />
                Stok Durumu
              </label>
              <label className="flex items-center h-[42px] px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <input
                  type="checkbox"
                  checked={filters.lowStock}
                  onChange={e => setFilters(prev => ({ ...prev, lowStock: e.target.checked }))}
                  className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500 mr-3"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Sadece Düşük Stoklar</span>
              </label>
            </div>
          </div>

          {/* Reset Button & Results Count */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-purple-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Bulunan:</span>
              <span className="px-3 py-1 bg-purple-600 text-white rounded-full font-bold">
                {data.length}
              </span>
              <span className="text-gray-600 dark:text-gray-400">stok kaydı</span>
            </div>
            
            {(filters.bookName || filters.languageId !== 'all' || filters.warehouseId !== 'all' || filters.lowStock) && (
              <button
                onClick={() => setFilters({ bookName: '', languageId: 'all', warehouseId: 'all', lowStock: false })}
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
            <p className="text-gray-500 dark:text-gray-400">Stoklar yükleniyor...</p>
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
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                      {(filters.bookName || filters.languageId !== 'all' || filters.warehouseId !== 'all' || filters.lowStock) 
                        ? 'Filtreleme sonucu bulunamadı' 
                        : 'Henüz stok eklenmemiş'}
                    </p>
                    {!(filters.bookName || filters.languageId !== 'all' || filters.warehouseId !== 'all' || filters.lowStock) && (
                      <Link 
                        to="/stoklar/ekle"
                        className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        İlk Stoğu Ekle
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

      {/* Transfer Detay Popup */}
      {transferPopup && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 z-40 animate-fade-in flex items-center justify-center"
            onClick={() => setTransferPopup(null)}
          >
            {/* Popup */}
            <div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-yellow-400 dark:border-yellow-600 p-5 animate-scale-in"
              style={{
                maxWidth: '450px',
                width: '90vw'
              }}
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <FaTruck className="text-yellow-600 dark:text-yellow-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">Transfer Detayları</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">ID: #{transferPopup.transfer.id}</p>
                </div>
              </div>
              <button
                onClick={() => setTransferPopup(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none transition"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Hedef Depo</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {transferPopup.transfer.toWarehouse?.name}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Miktar</span>
                <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                  {transferPopup.transfer.quantity} adet
                </span>
              </div>

              {transferPopup.transfer.cargoCompany && (
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Kargo Şirketi</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {transferPopup.transfer.cargoCompany}
                  </span>
                </div>
              )}

              {transferPopup.transfer.trackingNumber && (
                <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Takip No</span>
                  <span className="font-mono text-sm bg-gray-800 dark:bg-gray-700 text-white px-3 py-1 rounded">
                    {transferPopup.transfer.trackingNumber}
                  </span>
                </div>
              )}

              {transferPopup.transfer.estimatedDeliveryDate && (
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tahmini Teslimat</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {new Date(transferPopup.transfer.estimatedDeliveryDate).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              )}

              {transferPopup.transfer.cargoFee && (
                <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Kargo Ücreti</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {Number(transferPopup.transfer.cargoFee).toFixed(2)} ₺
                  </span>
                </div>
              )}

              {transferPopup.transfer.notes && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notlar:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {transferPopup.transfer.notes}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to={`/stok-transfer/detay/${transferPopup.transfer.id}`}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  onClick={() => setTransferPopup(null)}
                >
                  Detaylı Görüntüle
                </Link>
              </div>
            </div>
          </div>
          </div>
        </>
      )}

      {/* Silme Onay Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-600 dark:text-red-400 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Stoğu Silmek İstediğinize Emin misiniz?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span className="font-semibold">{deleteModal.name}</span> kalıcı olarak silinecek.
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                ⚠️ Bu işlem geri alınamaz!
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-lg hover:shadow-xl"
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