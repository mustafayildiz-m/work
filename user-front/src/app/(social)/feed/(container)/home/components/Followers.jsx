'use client';

import { getWhoToFollow } from '@/helpers/data';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap';
import { BsPersonCheckFill } from 'react-icons/bs';
import { FaPlus } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import { getUserIdFromToken } from '../../../../../../utils/auth';
import { useLanguage } from '@/context/useLanguageContext';
import { useSession } from 'next-auth/react';

const Followers = () => {
  const { t } = useLanguage();
  const { status } = useSession();
  const [whoToFollowData, setWhoToFollowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState({});

  // Helper function to create unique key for each follower
  const getFollowerKey = (follower) => {
    return `${follower.type}-${follower.id}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getWhoToFollow('scholars', 15);
        setWhoToFollowData(data);
      } catch (error) {
        console.error('Error fetching who to follow data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (status !== 'authenticated') {
    return null;
  }

  // Helper function to get proper image URL
  const getImageUrl = (photoUrl) => {
    if (!photoUrl) return '/profile/profile.png';
    if (photoUrl.startsWith('/uploads/')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      return `${apiBaseUrl}${photoUrl}`;
    }
    return photoUrl;
  };

  // Follow function
  const handleFollow = async (followerId, followerType) => {
    const followerKey = `${followerType}-${followerId}`;
    try {
      setFollowLoading(prev => ({ ...prev, [followerKey]: true }));
      const token = localStorage.getItem('token');
      const userId = getUserIdFromToken();

      if (!userId) {
        console.error('User ID not found');
        return;
      }

      let endpoint, requestBody;

      if (followerType === 'scholar') {
        // Scholar follow
        endpoint = '/user-scholar-follow/follow';
        requestBody = {
          user_id: parseInt(userId),
          scholar_id: parseInt(followerId)
        };
      } else {
        // User follow
        endpoint = '/user-follow/follow';
        requestBody = {
          follower_id: parseInt(userId),
          following_id: parseInt(followerId)
        };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        // Update the local state to reflect the follow status
        setWhoToFollowData(prev =>
          prev.map(item =>
            item.id === followerId && item.type === followerType
              ? { ...item, isFollowing: true }
              : item
          )
        );
      } else {
        console.error('Follow failed');
      }
    } catch (error) {
      console.error('Error following:', error);
    } finally {
      setFollowLoading(prev => ({ ...prev, [followerKey]: false }));
    }
  };

  // Unfollow function
  const handleUnfollow = async (followerId, followerType) => {
    const followerKey = `${followerType}-${followerId}`;
    try {
      setFollowLoading(prev => ({ ...prev, [followerKey]: true }));
      const token = localStorage.getItem('token');
      const userId = getUserIdFromToken();

      if (!userId) {
        console.error('User ID not found');
        return;
      }

      let endpoint, requestBody;

      if (followerType === 'scholar') {
        // Scholar unfollow
        endpoint = '/user-scholar-follow/unfollow';
        requestBody = {
          user_id: parseInt(userId),
          scholar_id: parseInt(followerId)
        };
      } else {
        // User unfollow
        endpoint = '/user-follow/unfollow';
        requestBody = {
          follower_id: parseInt(userId),
          following_id: parseInt(followerId)
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
        // Update the local state to reflect the follow status
        setWhoToFollowData(prev =>
          prev.map(item =>
            item.id === followerId && item.type === followerType
              ? { ...item, isFollowing: false }
              : item
          )
        );
      } else {
        console.error('Unfollow failed');
      }
    } catch (error) {
      console.error('Error unfollowing:', error);
    } finally {
      setFollowLoading(prev => ({ ...prev, [followerKey]: false }));
    }
  };
  return <Card>
    <CardHeader className="pb-0 border-0">
      <CardTitle className="mb-0">{t('feed.whoToFollow')}</CardTitle>
    </CardHeader>

    <CardBody>
      {loading ? (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">{t('common.loading')}</span>
          </div>
          <p className="text-muted mb-0 mt-2">{t('common.loading')}niyor...</p>
        </div>
      ) : whoToFollowData && whoToFollowData.length > 0 ? (
        whoToFollowData.map((follower, idx) => <div className="hstack gap-2 mb-3" key={`${follower.type}-${follower.id}` || idx}>
          <span role="button">
            <Image
              className="avatar-img rounded-circle"
              src={getImageUrl(follower.photoUrl)}
              alt={follower.name || follower.fullName}
              width={40}
              height={40}
              loading="eager"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciPgogICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjMzMzIiBvZmZzZXQ9IjIwJSIgLz4KICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzIyMiIgb2Zmc2V0PSI1MCUiIC8+CiAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiMzMzMiIG9mZnNldD0iNzAlIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzMzIiAvPgogIDxyZWN0IGlkPSJyIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9InVybCgjZykiIC8+CiAgPGFuaW1hdGUgeGxpbms6aHJlZj0iI3IiIGF0dHJpYnV0ZU5hbWU9IngiIGZyb209Ii00MCIgdG89IjQwIiBkdXI9IjFzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgIC8+Cjwvc3ZnPg=="
              unoptimized={true}
              style={{ objectFit: 'cover', transition: 'opacity 0.3s ease-in-out' }}
              onError={(e) => {
                e.target.src = '/profile/profile.png';
              }}
            />
          </span>

          <div className="overflow-hidden">
            {follower.id && follower.id !== 'undefined' ? (
              <Link
                className="h6 mb-0"
                href={`/profile/${follower.type || 'scholar'}/${follower.id}`}
              >
                {follower.name || follower.fullName}{' '}
              </Link>
            ) : (
              <span className="h6 mb-0">
                {follower.name || follower.fullName}{' '}
              </span>
            )}
            <p className="mb-0 small text-truncate">
              {t('feed.scholar')}
            </p>
          </div>

          {follower.isFollowing ? (
            <Button
              variant="outline-danger"
              size="sm"
              className="ms-auto px-2 py-1"
              style={{
                fontSize: '0.75rem',
                minWidth: 'auto',
                whiteSpace: 'nowrap',
                lineHeight: '1'
              }}
              onClick={() => handleUnfollow(follower.id, follower.type)}
              disabled={followLoading[getFollowerKey(follower)]}
            >
              {followLoading[getFollowerKey(follower)] ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                t('feed.unfollow')
              )}
            </Button>
          ) : (
            <Button
              variant="primary-soft"
              size="sm"
              className="ms-auto px-2 py-1"
              style={{
                fontSize: '0.75rem',
                minWidth: 'auto',
                whiteSpace: 'nowrap',
                lineHeight: '1'
              }}
              onClick={() => handleFollow(follower.id, follower.type)}
              disabled={followLoading[getFollowerKey(follower)]}
            >
              {followLoading[getFollowerKey(follower)] ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                t('feed.follow')
              )}
            </Button>
          )}
        </div>)
      ) : (
        <div className="text-center py-3">
          <p className="text-muted mb-0">{t('feed.noSuggestionsYet')}</p>
        </div>
      )}

      <div className="d-grid mt-3">
        <Link href="/feed/who-to-follow">
          <Button variant="primary-soft" size="sm" className="w-100">
            {t('feed.viewAll')}
          </Button>
        </Link>
      </div>
    </CardBody>
  </Card>;
};
export default Followers;