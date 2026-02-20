import { FormattedMessage } from "react-intl";
import { useState, useEffect } from 'react';
import { Search, RefreshCw, Users as UsersIcon, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import UserTable from './UserTable';
import UserDetailModal from './UserDetailModal';
import UserEditModal from './UserEditModal';
import { Card } from '@/components/ui/card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const UserManagement = ({ role, title, description }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0 });
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, hasMore: false });

  const fetchUsers = async (resetPagination = false) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams({
        role,
        limit: pagination.limit.toString(),
        offset: resetPagination ? '0' : pagination.offset.toString(),
      });

      if (search) params.append('search', search);
      if (isActiveFilter !== 'all') params.append('isActive', isActiveFilter);

      const response = await fetch(`${API_URL}/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseText = await response.text();
      
      if (responseText.trim().startsWith('<!') || responseText.trim().startsWith('<html')) {
        console.error('❌ HTML response alındı - API endpoint bulunamadı:', `${API_URL}/admin/users?${params}`);
        toast.error('API endpoint bulunamadı. Lütfen backend\'in çalıştığından emin olun.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        let errorMessage = `Hata: ${response.status} ${response.statusText}`;
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = responseText.substring(0, 200) || errorMessage;
        }
        toast.error(`Kullanıcılar yüklenirken hata: ${errorMessage}`);
        console.error('❌ API hatası:', errorMessage);
        setLoading(false);
        return;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON parse hatası:', parseError);
        toast.error('API\'den geçersiz yanıt alındı');
        setLoading(false);
        return;
      }

      setUsers(data.users || []);
      setStats({ total: data.total || 0 });
      setPagination({ ...pagination, hasMore: data.hasMore || false, offset: resetPagination ? 0 : pagination.offset });
    } catch (error) {
      console.error('❌ Kullanıcılar yüklenirken hata:', error);
      toast.error('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(true);
  }, [role, isActiveFilter]);

  const handleSearch = () => {
    fetchUsers(true);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleToggleStatus = async (user) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      const responseText = await response.text();
      
      if (responseText.trim().startsWith('<!') || responseText.trim().startsWith('<html')) {
        toast.error('API endpoint bulunamadı. Lütfen backend\'in çalıştığından emin olun.');
        return;
      }

      if (!response.ok) {
        let errorMessage = `Hata: ${response.status} ${response.statusText}`;
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = responseText.substring(0, 200) || errorMessage;
        }
        toast.error(errorMessage);
        return;
      }

      toast.success(user.isActive ? 'Kullanıcı devre dışı bırakıldı' : 'Kullanıcı aktifleştirildi');
      fetchUsers();
    } catch (error) {
      console.error('❌ Kullanıcı durumu değiştirilirken hata:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`${user.firstName} ${user.lastName} kullanıcısını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseText = await response.text();
      
      if (responseText.trim().startsWith('<!') || responseText.trim().startsWith('<html')) {
        toast.error('API endpoint bulunamadı. Lütfen backend\'in çalıştığından emin olun.');
        return;
      }

      if (!response.ok) {
        let errorMessage = `Hata: ${response.status} ${response.statusText}`;
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = responseText.substring(0, 200) || errorMessage;
        }
        toast.error(errorMessage);
        return;
      }

      toast.success('Kullanıcı silindi');
      fetchUsers();
    } catch (error) {
      console.error('❌ Kullanıcı silinirken hata:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const handleLoadMore = () => {
    setPagination({ ...pagination, offset: pagination.offset + pagination.limit });
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">{description}</p>
      </div>
      {/* Stats */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <UsersIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400"><FormattedMessage id="UI.TOPLAM_KULLANICI" /></p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
        </div>
      </Card>
      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="İsim, email veya kullanıcı adı ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={isActiveFilter}
              onChange={(e) => setIsActiveFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="all"><FormattedMessage id="UI.TUMU" /></option>
              <option value="true"><FormattedMessage id="UI.AKTIF" /></option>
              <option value="false"><FormattedMessage id="UI.PASIF" /></option>
            </select>
            <button
              onClick={() => handleSearch()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              <FormattedMessage id="UI.ARA" />
            </button>
            <button
              onClick={() => {
                setSearch('');
                setIsActiveFilter('all');
                fetchUsers(true);
              }}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Filtreleri Temizle"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => fetchUsers(true)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Yenile"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>
      {/* User Table */}
      <UserTable
        users={users}
        loading={loading}
        onViewDetails={handleViewDetails}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
      />
      {/* Load More */}
      {pagination.hasMore && !loading && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
            className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            <FormattedMessage id="UI.DAHA_FAZLA_YUKLE" />
          </button>
        </div>
      )}
      {/* Modals */}
      <UserDetailModal
        user={selectedUser}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedUser(null);
        }}
      />
      <UserEditModal
        user={selectedUser}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={() => fetchUsers()}
      />
    </div>
  );
};

export default UserManagement;

