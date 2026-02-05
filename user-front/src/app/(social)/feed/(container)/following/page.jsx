'use client';

import { useEffect, useState } from 'react';
import { FaSearch, FaUser, FaGraduationCap, FaUsers, FaUserFriends } from 'react-icons/fa';
import Link from 'next/link';
import { getUserIdFromToken } from '../../../../../utils/auth';
import './following.css';

export default function FollowingPage() {
  const [followingData, setFollowingData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [unfollowLoading, setUnfollowLoading] = useState({});
  const [stats, setStats] = useState({
    followingUsersCount: 0,
    followingScholarsCount: 0,
    totalFollowingCount: 0
  });

  // Helper function to create unique key for each followed item
  const getFollowedKey = (item) => {
    return `${item.type}-${item.id}`;
  };

  useEffect(() => {
    const fetchFollowingData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          setLoading(false);
          return;
        }

        // Fetch following data
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/following?limit=100&type=all`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setFollowingData(data.items || []);
          setFilteredData(data.items || []);

          // Update stats if available
          if (data.stats) {
            setStats(data.stats);
          }
        } else {
          console.error('Failed to fetch following data');
        }
      } catch (error) {
        console.error('Error fetching following data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingData();
  }, []);

  useEffect(() => {
    let filtered = followingData;

    // Filter by search term - specifically for firstName and lastName
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const searchLower = searchTerm.toLowerCase();

        // Search in firstName
        if (item.firstName && item.firstName.toLowerCase().includes(searchLower)) {
          return true;
        }

        // Search in lastName
        if (item.lastName && item.lastName.toLowerCase().includes(searchLower)) {
          return true;
        }

        // Search in combined firstName + lastName
        if (item.firstName && item.lastName) {
          const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
          if (fullName.includes(searchLower)) {
            return true;
          }
        }

        // Search in name field (fallback)
        if (item.name && item.name.toLowerCase().includes(searchLower)) {
          return true;
        }

        // Search in fullName field (fallback)
        if (item.fullName && item.fullName.toLowerCase().includes(searchLower)) {
          return true;
        }

        return false;
      });
    }

    // Filter by type
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

  // Unfollow function
  const handleUnfollow = async (itemId, itemType) => {
    const itemKey = `${itemType}-${itemId}`;
    try {
      setUnfollowLoading(prev => ({ ...prev, [itemKey]: true }));
      const token = localStorage.getItem('token');
      const userId = getUserIdFromToken();

      if (!userId) {
        console.error('User ID not found');
        return;
      }

      let endpoint, requestBody;

      if (itemType === 'scholar') {
        // Scholar unfollow
        endpoint = '/user-scholar-follow/unfollow';
        requestBody = {
          user_id: parseInt(userId),
          scholar_id: parseInt(itemId)
        };
      } else {
        // User unfollow
        endpoint = '/user-follow/unfollow';
        requestBody = {
          follower_id: parseInt(userId),
          following_id: parseInt(itemId)
        };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        // Remove the item from the list
        setFollowingData(prev => prev.filter(item =>
          !(item.id === itemId && item.type === itemType)
        ));

        // Update stats
        if (itemType === 'scholar') {
          setStats(prev => ({
            ...prev,
            followingScholarsCount: Math.max(0, prev.followingScholarsCount - 1),
            totalFollowingCount: Math.max(0, prev.totalFollowingCount - 1)
          }));
        } else {
          setStats(prev => ({
            ...prev,
            followingUsersCount: Math.max(0, prev.followingUsersCount - 1),
            totalFollowingCount: Math.max(0, prev.totalFollowingCount - 1)
          }));
        }
      } else {
        console.error('Unfollow failed');
      }
    } catch (error) {
      console.error('Error unfollowing:', error);
    } finally {
      setUnfollowLoading(prev => ({ ...prev, [itemKey]: false }));
    }
  };

  if (loading) {
    return (
      <div className="col-lg-9">
        <div className="card following-card">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Takip edilenler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-lg-9">
      <div className="card following-card">
        <div className="card-header following-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">
                <FaUserFriends className="me-2" />
                Takip Edilenler
              </h5>
              <p className="text-muted mb-0 mt-2">
                {filteredData.length} kişi bulundu
              </p>
            </div>
            <div className="stats-badges">
              <span className="badge bg-primary me-2">
                <FaUsers className="me-1" />
                {stats.followingUsersCount} Kullanıcı
              </span>
              <span className="badge bg-success">
                <FaGraduationCap className="me-1" />
                {stats.followingScholarsCount} Alim
              </span>
            </div>
          </div>
        </div>

        <div className="search-filter-section">
          <div className="row mb-4">
            <div className="col-md-8">
              <div className="input-group search-input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ad veya soyad ile ara..."
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
                <option value="all">Tümü ({stats.totalFollowingCount})</option>
                <option value="user">Kullanıcılar ({stats.followingUsersCount})</option>
                <option value="scholar">Alimler ({stats.followingScholarsCount})</option>
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
                          onError={(e) => {
                            e.target.src = '/profile/profile.png';
                          }}
                        />
                        <span className={`badge item-badge ${item.type === 'scholar' ? 'bg-success' : 'bg-primary'}`}>
                          {item.type === 'scholar' ? (
                            <FaGraduationCap className="me-1" />
                          ) : (
                            <FaUser className="me-1" />
                          )}
                          {item.type === 'scholar' ? 'Alim' : 'Kullanıcı'}
                        </span>
                      </div>

                      <h6 className="item-name">
                        {item.id && item.id !== 'undefined' ? (
                          <Link href={`/profile/${item.type || 'user'}/${item.id}`} className="text-decoration-none">
                            {item.name || item.fullName}
                          </Link>
                        ) : (
                          <span className="text-decoration-none">{item.name || item.fullName}</span>
                        )}
                      </h6>

                      {item.username && (
                        <p className="item-username">@{item.username}</p>
                      )}

                      {item.biography && (
                        <p className="item-biography">
                          {item.biography.replace(/<[^>]*>/g, '').substring(0, 100)}
                          {item.biography.length > 100 && '...'}
                        </p>
                      )}

                      {item.followedDate && (
                        <p className="item-followed-date text-muted small">
                          {new Date(item.followedDate * 1000).toLocaleDateString('tr-TR')} tarihinden beri takip ediliyor
                        </p>
                      )}

                      <button
                        className="btn btn-outline-danger w-100 mt-auto"
                        onClick={() => handleUnfollow(item.id, item.type)}
                        disabled={unfollowLoading[getFollowedKey(item)]}
                      >
                        {unfollowLoading[getFollowedKey(item)] ? (
                          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        ) : (
                          'Takipten Çık'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="empty-state">
                <FaUserFriends className="empty-icon" />
                <h6 className="mt-3">Henüz kimseyi takip etmiyorsunuz</h6>
                <p className="text-muted">
                  {searchTerm || selectedType !== 'all'
                    ? 'Arama kriterlerinize uygun takip edilen bulunamadı.'
                    : 'Takip etmek istediğiniz kullanıcıları ve alimleri bulabilirsiniz.'}
                </p>
                {!searchTerm && selectedType === 'all' && (
                  <a href="/feed/who-to-follow" className="btn btn-primary">
                    Takip Edilecek Kişileri Gör
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
