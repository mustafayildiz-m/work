'use client';

import { useEffect, useState } from 'react';
import { FaSearch, FaUser, FaGraduationCap, FaUsers, FaUserFriends } from 'react-icons/fa';
import Link from 'next/link';
import { getUserIdFromToken } from '../../../../../utils/auth';
import { useLanguage } from '../../../../../context/useLanguageContext';
import './followers.css';

export default function FollowersPage() {
  const { t } = useLanguage();
  const [followersData, setFollowersData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [stats, setStats] = useState({
    followersUsersCount: 0,
    followersScholarsCount: 0,
    totalFollowersCount: 0
  });

  // Helper function to create unique key for each follower
  const getFollowerKey = (follower) => {
    return `${follower.type}-${follower.id}`;
  };

  useEffect(() => {
    const fetchFollowersData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          setLoading(false);
          return;
        }

        // Fetch followers data

        // Önce mevcut endpoint'i dene
        let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-follow/followers?limit=100`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Eğer başarısız olursa alternatif endpoint'leri dene
        if (!response.ok) {

          // Alternatif 1: /user-follow/followers
          response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-follow/followers`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {

            // Alternatif 2: /following/followers
            response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/following/followers`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
          }
        }

        if (response.ok) {
          const data = await response.json();

          // API'den gelen veriyi işle
          const followers = data.users || data.followers || data || [];

          setFollowersData(followers);
          setFilteredData(followers);

          // Update stats if available
          if (data.stats) {
            setStats(data.stats);
          } else {
            // Calculate stats from data
            const usersCount = followers.filter(f => getFollowerType(f) === 'user').length;
            const scholarsCount = followers.filter(f => getFollowerType(f) === 'scholar').length;
            const calculatedStats = {
              followersUsersCount: usersCount,
              followersScholarsCount: scholarsCount,
              totalFollowersCount: followers.length
            };
            setStats(calculatedStats);
          }
        }
      } catch (error) {
        console.error('Error fetching followers data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowersData();
  }, []);

  useEffect(() => {
    let filtered = followersData;

    // Filter by search term - specifically for firstName and lastName
    if (searchTerm) {
      filtered = filtered.filter(follower => {
        const searchLower = searchTerm.toLowerCase();

        // Search in firstName
        if (follower.firstName && follower.firstName.toLowerCase().includes(searchLower)) {
          return true;
        }

        // Search in lastName
        if (follower.lastName && follower.lastName.toLowerCase().includes(searchLower)) {
          return true;
        }

        // Search in combined firstName + lastName
        if (follower.firstName && follower.lastName) {
          const fullName = `${follower.firstName} ${follower.lastName}`.toLowerCase();
          if (fullName.includes(searchLower)) {
            return true;
          }
        }

        // Search in name field (fallback)
        if (follower.name && follower.name.toLowerCase().includes(searchLower)) {
          return true;
        }

        // Search in fullName field (fallback)
        if (follower.fullName && follower.fullName.toLowerCase().includes(searchLower)) {
          return true;
        }

        return false;
      });
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(follower => getFollowerType(follower) === selectedType);
    }

    setFilteredData(filtered);
  }, [searchTerm, selectedType, followersData]);

  const getImageUrl = (photoUrl) => {
    if (!photoUrl) return '/profile/profile.png';
    if (photoUrl.startsWith('/uploads/')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      return `${apiBaseUrl}${photoUrl}`;
    }
    return photoUrl;
  };

  // Helper function to determine follower type
  const getFollowerType = (follower) => {
    if (follower.type === 'scholar' || follower.role === 'scholar') {
      return 'scholar';
    }
    return 'user';
  };

  // Helper function to get follower display name
  const getFollowerDisplayName = (follower) => {
    if (follower.name) return follower.name;
    if (follower.fullName) return follower.fullName;
    if (follower.firstName && follower.lastName) {
      return `${follower.firstName} ${follower.lastName}`;
    }
    return follower.username || t('followers.user');
  };

  if (loading) {
    return (
      <div className="col-lg-9">
        <div className="card followers-card">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">{t('common.loading')}</span>
            </div>
            <p className="mt-3">{t('followers.loadingFollowers')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-lg-9">
      <div className="card followers-card">
        <div className="card-header followers-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">
                <FaUserFriends className="me-2" />
                {t('followers.title')}
              </h5>
              <p className="text-muted mb-0 mt-2">
                {filteredData.length} {t('followers.peopleFound')}
              </p>
            </div>
            <div className="stats-badges">
              <span className="badge bg-primary me-2">
                <FaUsers className="me-1" />
                {stats.followersUsersCount} {t('followers.users')}
              </span>
              <span className="badge bg-success">
                <FaGraduationCap className="me-1" />
                {stats.followersScholarsCount} {t('followers.scholars')}
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
                  placeholder={t('followers.searchPlaceholder')}
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
                <option value="all">{t('followers.filterAll')} ({stats.totalFollowersCount})</option>
                <option value="user">{t('followers.filterUsers')} ({stats.followersUsersCount})</option>
                <option value="scholar">{t('followers.filterScholars')} ({stats.followersScholarsCount})</option>
              </select>
            </div>
          </div>
        </div>

        <div className="followers-grid">
          {filteredData.length > 0 ? (
            <div className="row g-3">
              {filteredData.map((follower) => (
                <div key={`${follower.type}-${follower.id}`} className="col-lg-4 col-md-6">
                  <div className="card follower-item-card">
                    <div className="card-body d-flex flex-column text-center">
                      <div className="item-avatar">
                        <img
                          src={getImageUrl(follower.photoUrl)}
                          alt={follower.name || follower.fullName}
                          width={80}
                          height={80}
                          className="rounded-circle"
                          onError={(e) => {
                            e.target.src = '/profile/profile.png';
                          }}
                        />
                        <span className={`badge item-badge ${getFollowerType(follower) === 'scholar' ? 'bg-success' : 'bg-primary'}`}>
                          {getFollowerType(follower) === 'scholar' ? (
                            <FaGraduationCap className="me-1" />
                          ) : (
                            <FaUser className="me-1" />
                          )}
                          {getFollowerType(follower) === 'scholar' ? t('followers.scholar') : t('followers.user')}
                        </span>
                      </div>

                      <h6 className="item-name">
                        {follower.id && follower.id !== 'undefined' ? (
                          <Link href={`/profile/${getFollowerType(follower)}/${follower.id}`} className="text-decoration-none">
                            {getFollowerDisplayName(follower)}
                          </Link>
                        ) : (
                          <span className="text-decoration-none">{getFollowerDisplayName(follower)}</span>
                        )}
                      </h6>

                      {follower.username && (
                        <p className="item-username">@{follower.username}</p>
                      )}

                      {follower.bio && (
                        <p className="item-biography">
                          {follower.bio.replace(/<[^>]*>/g, '').substring(0, 100)}
                          {follower.bio.length > 100 && '...'}
                        </p>
                      )}



                      <div className="mt-auto">
                        {follower.id && follower.id !== 'undefined' && (
                          <Link
                            href={`/profile/${getFollowerType(follower)}/${follower.id}`}
                            className="btn btn-outline-primary w-100 me-2"
                          >
                            {t('followers.viewProfile')}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="empty-state">
                <FaUserFriends className="empty-icon" />
                <h6 className="mt-3">{t('followers.noFollowersYet')}</h6>
                <p className="text-muted">
                  {searchTerm || selectedType !== 'all'
                    ? t('followers.noFollowersFound')
                    : t('followers.noFollowersDescription')}
                </p>
                {!searchTerm && selectedType === 'all' && (
                  <a href="/feed/who-to-follow" className="btn btn-primary">
                    {t('followers.seeWhoToFollow')}
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
