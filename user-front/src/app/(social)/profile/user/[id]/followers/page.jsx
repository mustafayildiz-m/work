'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FaSearch, FaUser, FaUserFriends } from 'react-icons/fa';
import { useLanguage } from '@/context/useLanguageContext';

export default function UserFollowersPage() {
  const params = useParams();
  const { t } = useLanguage();
  const [followersData, setFollowersData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    followersCount: 0
  });

  useEffect(() => {
    const fetchFollowersData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userId = params?.id;
        if (!token || !userId) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/followers?limit=100`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          let items = [];

          if (Array.isArray(data.items)) {
            items = data.items.map(it => ({
              ...it,
              type: 'user'
            }));
          } else if (Array.isArray(data.users)) {
            items = data.users.map(u => ({
              id: u.id,
              type: 'user',
              name: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || '',
              username: u.username,
              photoUrl: u.photoUrl
            }));
          }

          setFollowersData(items);
          setFilteredData(items);

          // Fetch stats
          const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/follow-stats`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (statsRes.ok) {
            const statsJson = await statsRes.json();
            setStats({ followersCount: statsJson.followersCount || 0 });
          }
        }
      } catch (error) {
        // console.error('Error fetching user followers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowersData();
  }, [params?.id]);

  useEffect(() => {
    let filtered = followersData;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const first = item.firstName || '';
        const last = item.lastName || '';
        const username = item.username || '';
        const name = item.name || `${first} ${last}`.trim();
        return (
          name.toLowerCase().includes(searchLower) ||
          username.toLowerCase().includes(searchLower)
        );
      });
    }
    setFilteredData(filtered);
  }, [searchTerm, followersData]);

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
          <p className="mt-3">{t('followers.followersLoading')}</p>
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
              {t('followers.title')}
            </h5>
            <p className="text-muted mb-0 mt-2">{filteredData.length} {t('followers.peopleFound')}</p>
          </div>
          <div className="stats-badges">
            <span className="badge bg-primary">
              <FaUser className="me-1" />
              {stats.followersCount} {t('followers.followers')}
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
        </div>
      </div>

      <div className="following-grid">
        {filteredData.length > 0 ? (
          <div className="row g-3">
            {filteredData.map((item) => (
              <div key={`user-${item.id}`} className="col-lg-4 col-md-6">
                <div className="card following-item-card">
                  <div className="card-body d-flex flex-column text-center">
                    <div className="item-avatar">
                      <img
                        src={getImageUrl(item.photoUrl)}
                        alt={item.name || item.username}
                        width={80}
                        height={80}
                        className="rounded-circle"
                        onError={(e) => { e.target.src = '/profile/profile.png'; }}
                      />
                      <span className="badge item-badge bg-primary">
                        <FaUser className="me-1" /> {t('followers.user')}
                      </span>
                    </div>
                    <h6 className="item-name">
                      {item.id ? (
                        <Link href={`/profile/${item.type || 'user'}/${item.id}`} className="text-decoration-none">
                          {item.name || item.username}
                        </Link>
                      ) : (
                        <span className="text-decoration-none">
                          {item.name || item.username}
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
              <h6 className="mt-3">{t('followers.noFollowersFound')}</h6>
              <p className="text-muted">{t('followers.tryDifferentSearch')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


