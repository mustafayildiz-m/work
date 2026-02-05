import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit, 
  Trash2, 
  Eye, 
  UserCheck, 
  UserX, 
  Shield, 
  ShieldAlert,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const UserTable = ({ users, onEdit, onDelete, onViewDetails, onToggleStatus, loading }) => {
  const getImageUrl = (photoUrl) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith('http')) return photoUrl;
    return `${API_URL}${photoUrl}`;
  };
  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { 
        label: 'Yönetici', 
        color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        icon: Shield 
      },
      editor: { 
        label: 'Editör', 
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        icon: ShieldAlert 
      },
      user: { 
        label: 'Kullanıcı', 
        color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        icon: UserCheck 
      },
    };

    const config = roleConfig[role] || roleConfig.user;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
        <UserCheck className="w-3 h-3" />
        Aktif
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
        <UserX className="w-3 h-3" />
        Pasif
      </span>
    );
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="text-gray-400 dark:text-gray-600">
          <UserX className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg font-semibold">Kullanıcı bulunamadı</p>
          <p className="text-sm mt-2">Arama kriterlerinizi değiştirerek tekrar deneyin</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user, index) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {user.photoUrl ? (
                  <img 
                    src={getImageUrl(user.photoUrl)} 
                    alt={user.firstName} 
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold"
                  style={{ display: user.photoUrl ? 'none' : 'flex' }}
                >
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      @{user.username}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.isActive)}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                  {user.email && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  )}
                  {user.phoneNo && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4" />
                      <span>{user.phoneNo}</span>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>

                {/* Biography */}
                {user.biography && (
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {user.biography}
                  </p>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-2 flex-wrap">
                  <button
                    onClick={() => onViewDetails(user)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Detaylar
                  </button>
                  <button
                    onClick={() => onEdit(user)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Düzenle
                  </button>
                  <button
                    onClick={() => onToggleStatus(user)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      user.isActive
                        ? 'text-orange-600 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-300 dark:hover:bg-orange-800'
                        : 'text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'
                    }`}
                  >
                    {user.isActive ? (
                      <>
                        <UserX className="w-4 h-4" />
                        Devre Dışı Bırak
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        Aktifleştir
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => onDelete(user)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Sil
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default UserTable;

