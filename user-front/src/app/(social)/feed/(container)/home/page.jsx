'use client';

import { useEffect, useState } from 'react';
import { Col } from 'react-bootstrap';
import Feeds from './components/Feeds';
import Followers from './components/Followers';
import CreatePostCard from '@/components/cards/CreatePostCard';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/context/useLanguageContext';

const Home = () => {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const [isChecking, setIsChecking] = useState(true);

  const currentUserId = session?.user?.id || null;

  useEffect(() => {
    setIsChecking(false);
  }, []);

  if (status === 'loading' || isChecking) {
    return (
      <Col md={8} lg={6} className="feed-home-main">
        <div className="feed-loading-inline">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">{t('common.loading')}</span>
          </div>
          <p>{t('common.loading')}</p>
        </div>
      </Col>
    );
  }

  return (
    <>
      <Col md={8} lg={5} className="feed-home-main vstack gap-2">
        <CreatePostCard />
        <Feeds userId={currentUserId} />
      </Col>

      <Col
        lg={4}
        className="d-none d-lg-block sticky-right-panel feed-right-sidebar"
        style={{
          position: 'sticky',
          alignSelf: 'flex-start',
        }}
      >
        <Followers />
      </Col>
    </>
  );
};

export default Home;
