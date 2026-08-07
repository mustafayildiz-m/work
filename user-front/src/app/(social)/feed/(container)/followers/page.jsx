'use client';

import { useEffect, useState } from 'react';
import { FaSearch, FaGraduationCap, FaUsers, FaUserFriends } from 'react-icons/fa';
import Link from 'next/link';
import { getUserIdFromToken } from '../../../../../utils/auth';
import { getProfilePath } from '@/utils/profileEncoder';
import { useLanguage } from '../../../../../context/useLanguageContext';
import PeopleCoverCard from '@/components/cards/PeopleCoverCard';
import { getPersonCoverUrl, getPersonAvatarUrl, truncateBio } from '@/utils/peopleCard';

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

  const handleAvatarError = (e) => {
    e.target.src = '/profile/profile.png';
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
        <div className="feed-people-page">
          <div className="feed-people-loading">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">{t('common.loading')}</span>
            </div>
            <p>{t('followers.loadingFollowers')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-lg-9">
      <div className="feed-people-page">
        <div className="feed-people-header">
          <div>
            <h5 className="feed-people-title">
              <FaUserFriends />
              {t('followers.title')}
            </h5>
            <p className="feed-people-subtitle">
              {filteredData.length} {t('followers.peopleFound')}
            </p>
          </div>
          <div className="feed-people-stats">
            <span className="feed-people-stat">
              <FaUsers className="me-1" />
              {stats.followersUsersCount} {t('followers.users')}
            </span>
            <span className="feed-people-stat">
              <FaGraduationCap className="me-1" />
              {stats.followersScholarsCount} {t('followers.scholars')}
            </span>
          </div>
        </div>

        <div className="feed-people-toolbar">
          <div className="feed-people-search">
            <FaSearch />
            <input
              type="text"
              placeholder={t('followers.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="feed-people-filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">{t('followers.filterAll')} ({stats.totalFollowersCount})</option>
            <option value="user">{t('followers.filterUsers')} ({stats.followersUsersCount})</option>
            <option value="scholar">{t('followers.filterScholars')} ({stats.followersScholarsCount})</option>
          </select>
        </div>

        {filteredData.length > 0 ? (
          <div className="feed-scholars-grid">
            {filteredData.map((follower) => {
              const type = getFollowerType(follower);
              const profileHref = follower.id && follower.id !== 'undefined'
                ? getProfilePath(type, follower.id) || null
                : null;
              const displayName = getFollowerDisplayName(follower);
              const bio = truncateBio(follower.bio || follower.biography);

              return (
                <PeopleCoverCard
                  key={`${follower.type}-${follower.id}`}
                  coverUrl={getPersonCoverUrl(follower)}
                  avatarUrl={getPersonAvatarUrl(follower.photoUrl)}
                  name={displayName}
                  meta={follower.username ? `@${follower.username}` : undefined}
                  bio={bio || undefined}
                  profileHref={profileHref}
                  badge={{
                    label: type === 'scholar' ? t('followers.scholar') : t('followers.user'),
                    variant: type === 'scholar' ? 'is-scholar' : 'is-user',
                  }}
                  onAvatarError={handleAvatarError}
                  footer={profileHref ? (
                    <Link href={profileHref} className="feed-scholar-btn">
                      {t('followers.viewProfile')}
                    </Link>
                  ) : null}
                />
              );
            })}
          </div>
        ) : (
          <div className="feed-people-empty">
            <FaUserFriends className="empty-icon" />
            <h6>{t('followers.noFollowersYet')}</h6>
            <p>
              {searchTerm || selectedType !== 'all'
                ? t('followers.noFollowersFound')
                : t('followers.noFollowersDescription')}
            </p>
            {!searchTerm && selectedType === 'all' && (
              <Link href="/feed/who-to-follow" className="feed-people-btn btn-follow">
                {t('followers.seeWhoToFollow')}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
