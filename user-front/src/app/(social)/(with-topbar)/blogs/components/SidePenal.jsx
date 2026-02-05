'use client';

import LoadContentButton from '@/components/LoadContentButton';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Spinner } from 'react-bootstrap';
import { BsPersonCheckFill, BsPersonCircle } from 'react-icons/bs';
import { FaPlus } from 'react-icons/fa';
import { useRecentPosts } from '@/hooks/useRecentPosts';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/useLanguageContext';
import { useState, useEffect } from 'react';
import Followers from '../../../feed/(container)/home/components/Followers';

const RecentPost = () => {
  const { getToken, isAuthenticated } = useAuth();
  const token = getToken();
  const { recentPosts, loading, error } = useRecentPosts(token);
  const { t } = useLanguage();

  // If user is not authenticated, show a message
  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader className="pb-0 border-0">
          <CardTitle className="mb-0">{t('recentPosts.recent_posts')}</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-muted small">{t('recentPosts.login_to_see_recent_posts')}</p>
          <Link href="/auth-advance/sign-in">
            <Button variant="primary" size="sm">{t('recentPosts.login')}</Button>
          </Link>
        </CardBody>
      </Card>
    );
  }

  // Show token status for debugging
  if (!token) {
    return (
      <Card>
        <CardHeader className="pb-0 border-0">
          <CardTitle className="mb-0">{t('recentPosts.recent_posts')}</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-muted small">{t('recentPosts.token_not_found_please_login')}</p>
          <Link href="/auth-advance/sign-in">
            <Button variant="primary" size="sm">{t('recentPosts.login')}</Button>
          </Link>
        </CardBody>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-0 border-0">
          <CardTitle className="mb-0">{t('recentPosts.recent_posts')}</CardTitle>
        </CardHeader>
        <CardBody className="text-center">
          <Spinner animation="border" size="sm" />
          <p className="mt-2 mb-0 small text-muted">{t('common.loading')}</p>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-0 border-0">
          <CardTitle className="mb-0">{t('recentPosts.recent_posts')}</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-muted small">{t('blogs.errorLoading')}</p>
          <Button variant="outline-primary" size="sm" onClick={() => window.location.reload()}>
            {t('blogs.retry')}
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-0 border-0">
        <CardTitle className="mb-0">{t('recentPosts.recent_posts')}</CardTitle>
      </CardHeader>
      <CardBody>

        {recentPosts.length > 0 ? (
          recentPosts.map((post, idx) => (
            <div key={post.id || idx} className="mb-3">
              <div className="d-flex align-items-center gap-2 mb-1">
                {post.author?.photoUrl ? (
                  <Link 
                    href={post.type === 'scholar_post' ? `/profile/scholar/${post.author.id}` : `/profile/user/${post.author.id}`} 
                    className="text-decoration-none"
                  >
                    <Image 
                      src={post.author.photoUrl.startsWith('http') ? post.author.photoUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${post.author.photoUrl}`}
                      alt={post.author.fullName}
                      width={24}
                      height={24}
                      className="rounded-circle"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'inline';
                      }}
                    />
                  </Link>
                ) : null}
                <BsPersonCircle 
                  size={24} 
                  className="text-muted" 
                  style={{ display: post.author?.photoUrl ? 'none' : 'inline' }}
                />
                <Link 
                  href={post.type === 'scholar_post' ? `/profile/scholar/${post.author.id}` : `/profile/user/${post.author.id}`} 
                  className="text-decoration-none"
                >
                  <small className="text-muted">
                    {post.author?.fullName || post.author?.name || post.author?.username || t('recentPosts.unknown_user')}
                  </small>
                </Link>
              </div>
              <h6 className="mb-0">
                <Link 
                  href={post.type === 'scholar_post' ? `/profile/scholar/${post.author.id}/feed` : `/profile/user/${post.author.id}/feed`} 
                  className="text-decoration-none"
                >
                  {(() => {
                    // İçerik alanlarını kontrol et
                    const content = post.content || post.title || post.description || post.text || post.body || post.message || post.caption;
                    
                    if (content && content.trim()) {
                      // HTML tag'lerini temizle ve kısalt
                      const cleanContent = content.replace(/<[^>]*>/g, '').trim();
                      return cleanContent.substring(0, 60) + (cleanContent.length > 60 ? '...' : '');
                    }
                    
                    // Eğer hiçbir içerik yoksa, gönderi tipine göre varsayılan mesaj
                    return post.type === 'user_post' ? t('recentPosts.user_post') : t('recentPosts.scholar_post');
                  })()}
                </Link>
              </h6>
              <small className="text-muted">
                {post.type === 'scholar_post' ? t('recentPosts.scholar_post_type') : 
                 post.type === 'user_post' ? t('recentPosts.user_post_type') : 
                 t('recentPosts.post')}
              </small>
            </div>
          ))
        ) : (
          <p className="text-muted small">{t('recentPosts.no_posts_yet')}</p>
        )}
        <LoadContentButton name={t('recentPosts.view_all_recent_posts')} href="/feed/home" />
      </CardBody>
    </Card>
  );
};


const SidePenal = () => {
  return (
    <>
      <Col sm={6} lg={12}>
        <RecentPost />
      </Col>
      <Col sm={6} lg={12}>
        <Followers />
      </Col>
    </>
  );
};

export default SidePenal;
