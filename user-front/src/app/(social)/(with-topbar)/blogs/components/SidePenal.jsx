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
import { getProfilePath } from '@/utils/profileEncoder';
import { useState, useEffect } from 'react';
import Followers from '../../../feed/(container)/home/components/Followers';

const getAuthorDisplayName = (author) => {
  if (!author) return null;
  if (author.fullName) return author.fullName;
  if (author.firstName || author.lastName) return [author.firstName, author.lastName].filter(Boolean).join(' ');
  if (author.name) return author.name;
  return author.username;
};

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
                    href={getProfilePath(post.type === 'scholar_post' ? 'scholar' : 'user', post.author.id) || '#'} 
                    className="text-decoration-none"
                  >
                    <Image 
                      src={post.author.photoUrl.startsWith('http') ? post.author.photoUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${post.author.photoUrl}`}
                      alt={getAuthorDisplayName(post.author) || t('recentPosts.unknown_user')}
                      width={24}
                      height={24}
                      className="rounded-circle"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        const img = e.target;
                        if (img) img.style.display = 'none';
                        const link = img?.closest?.('a');
                        const fallback = link?.nextSibling ?? img?.nextSibling ?? img?.parentElement?.nextSibling;
                        if (fallback?.style) fallback.style.display = 'inline';
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
                  href={getProfilePath(post.type === 'scholar_post' ? 'scholar' : 'user', post.author.id) || '#'} 
                  className="text-decoration-none"
                >
                  <small className="text-muted">
                    {getAuthorDisplayName(post.author) || t('recentPosts.unknown_user')}
                  </small>
                </Link>
              </div>
              <h6 className="mb-0">
                <Link 
                  href={getProfilePath(post.type === 'scholar_post' ? 'scholar' : 'user', post.author.id, 'feed') || '#'} 
                  className="text-decoration-none"
                >
                  {(() => {
                    // Öncelik: content (ana metin), sonra title. Boş/gereksiz içerikleri atla
                    const rawContent = post.content || post.title || post.description || post.text || post.body || post.message || post.caption;
                    const cleanContent = rawContent ? String(rawContent).replace(/<[^>]*>/g, '').trim() : '';

                    if (cleanContent && cleanContent.length > 1) {
                      return cleanContent.substring(0, 60) + (cleanContent.length > 60 ? '...' : '');
                    }

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
