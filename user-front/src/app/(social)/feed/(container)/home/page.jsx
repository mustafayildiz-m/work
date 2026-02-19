'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import Stories from './components/Stories';
import Feeds from './components/Feeds';
import Followers from './components/Followers';
import CreatePostCard from '@/components/cards/CreatePostCard';
import Link from 'next/link';
import LoadContentButton from '@/components/LoadContentButton';
import { useLanguage } from '@/context/useLanguageContext';

const Home = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isChecking, setIsChecking] = useState(true);

  // Get the authenticated user's ID from session
  const currentUserId = session?.user?.id || null;

  // Check auth but don't redirect
  useEffect(() => {
    setIsChecking(false);
  }, []);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
        <p className="mt-3">Yükleniyor...</p>
      </div>
    );
  }

  return <>
    <Col md={8} lg={6} className="vstack gap-4">
      {/* <Stories /> */}
      <CreatePostCard />
      <Feeds userId={currentUserId} />
    </Col>

    <Col lg={3} className="d-none d-lg-block">
      <Row className="g-4">
        <Col sm={6} lg={12}>
          <Followers />
        </Col>


      </Row>
    </Col>
  </>;
};

export default Home;