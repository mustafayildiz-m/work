'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FaSearch, FaUser, FaGraduationCap, FaUsers, FaUserFriends } from 'react-icons/fa';
import { useLanguage } from '@/context/useLanguageContext';

export default function UserFollowingPage() {
  const params = useParams();
  const { t } = useLanguage();
  const [followingData, setFollowingData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [stats, setStats] = useState({
    followingUsersCount: 0,
    followingScholarsCount: 0,
    totalFollowingCount: 0
  });

  useEffect(() => {
    const fetchFollowingData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userId = params?.id;
        if (!token || !userId) {
          setLoading(false);
          return;
        }

        // Fetch following users (both users and scholars) for the target user
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/following?limit=100&type=all`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          let items = [];

          if (Array.isArray(data.items)) {
            // Already unified list from API
            items = data.items.map(it => ({
              ...it,
              type: it.type || (it.fullName ? 'scholar' : 'user')
            }));
          } else {
            // Fallback: separate arrays like { users: [...], scholars: [...] }
            const userItems = Array.isArray(data.users)
              ? data.users.map(u => ({
                id: u.id,
                type: 'user',
                name: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || '',
                username: u.username,
                photoUrl: u.photoUrl
              }))
              : [];

            const scholarItems = Array.isArray(data.scholars)
              ? data.scholars.map(s => ({
                id: s.id,
                type: 'scholar',
                fullName: s.fullName,
                photoUrl: s.photoUrl
              }))
              : [];

            items = [...userItems, ...scholarItems];
          }

          setFollowingData(items);
          setFilteredData(items);

          // Also fetch stats for consistency
          const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/follow-stats`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (statsRes.ok) {
            const statsJson = await statsRes.json();
            setStats({
              followingUsersCount: statsJson.followingUsersCount || 0,
              followingScholarsCount: statsJson.followingScholarsCount || 0,
              totalFollowingCount: (statsJson.followingUsersCount || 0) + (statsJson.followingScholarsCount || 0)
            });
          }
        }
      } catch (error) {
        // console.error('Error fetching user following:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingData();
  }, [params?.id]);

  useEffect(() => {
    let filtered = followingData;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const first = item.firstName || '';
        const last = item.lastName || '';
        const username = item.username || '';
        const name = item.name || item.fullName || `${first} ${last}`.trim();
        return (
          name.toLowerCase().includes(searchLower) ||
          username.toLowerCase().includes(searchLower)
        );
      });
    }
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }
    setFilteredData(filtered);
  }, [searchTerm, selectedType, followingData]);

  const getImageUrl = (photoUrl) => {
    if (!photoUrl) return '/profile/profile.png';
    if (photoUrl.startsWith('/uploads/')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      return `${apiBaseUrl}${photoUrl}`;
    }
    return photoUrl;
  };

  if (loading) {
    return (
      <div className="card following-card">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('common.loading')}</span>
          </div>
          <p className="mt-3">{t('followers.followingLoading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card following-card">
      <div className="card-header following-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">
              <FaUserFriends className="me-2" />
              {t('followers.following')}
            </h5>
            <p className="text-muted mb-0 mt-2">{filteredData.length} {t('followers.peopleFound')}</p>
          </div>
          <div className="stats-badges">
            <span className="badge bg-primary me-2">
              <FaUsers className="me-1" />
              {stats.followingUsersCount} {t('followers.user')}
            </span>
            <span className="badge bg-success">
              <FaGraduationCap className="me-1" />
              {stats.followingScholarsCount} {t('followers.scholar')}
            </span>
          </div>
        </div>
      </div>

      <div className="search-filter-section">
        <div className="row mb-4">
          <div className="col-md-8">
            <div className="input-group search-input-group">
              <span className="input-group-text"><FaSearch /></span>
              <input
                type="text"
                className="form-control"
                placeholder={t('followers.searchByName')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select filter-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">{t('followers.filterAll')} ({stats.totalFollowingCount})</option>
              <option value="user">{t('followers.filterUsers')} ({stats.followingUsersCount})</option>
              <option value="scholar">{t('followers.filterScholars')} ({stats.followingScholarsCount})</option>
            </select>
          </div>
        </div>
      </div>

      <div className="following-grid">
        {filteredData.length > 0 ? (
          <div className="row g-3">
            {filteredData.map((item) => (
              <div key={`${item.type}-${item.id}`} className="col-lg-4 col-md-6">
                <div className="card following-item-card">
                  <div className="card-body d-flex flex-column text-center">
                    <div className="item-avatar">
                      <img
                        src={getImageUrl(item.photoUrl)}
                        alt={item.name || item.fullName}
                        width={80}
                        height={80}
                        className="rounded-circle"
                        onError={(e) => { e.target.src = '/profile/profile.png'; }}
                      />
                      <span className={`badge item-badge ${item.type === 'scholar' ? 'bg-success' : 'bg-primary'}`}>
                        {item.type === 'scholar' ? <FaGraduationCap className="me-1" /> : <FaUser className="me-1" />}
                        {item.type === 'scholar' ? t('followers.scholar') : t('followers.user')}
                      </span>
                    </div>
                    <h6 className="item-name">
                      {item.id ? (
                        <Link href={`/profile/${item.type || 'user'}/${item.id}`} className="text-decoration-none">
                          {item.name || item.fullName}
                        </Link>
                      ) : (
                        <span className="text-decoration-none">
                          {item.name || item.fullName}
                        </span>
                      )}
                    </h6>
                    {item.username && (<p className="item-username">@{item.username}</p>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="empty-state">
              <FaUserFriends className="empty-icon" />
              <h6 className="mt-3">{t('followers.noFollowingFound')}</h6>
              <p className="text-muted">{t('followers.tryDifferentSearch')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


