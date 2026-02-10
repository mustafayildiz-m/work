'use client';

import { Card, Col, Row, Container } from 'react-bootstrap';
import LoginForm from './components/LoginForm';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../auth-pages.module.css';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/context/useLanguageContext';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SignIn = () => {
  const { t } = useLanguage();
  const { status } = useSession();
  const router = useRouter();

  // Eğer zaten giriş yapılmışsa ana sayfaya yönlendir
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/feed/home');
    }
  }, [status, router]);

  // Loading durumunda boş ekran göstermek yerine formu gösterelim (NextAuth bazen takılabiliyor)
  // if (status === 'loading') return null;
  // if (status === 'authenticated') return null;

  return (
    <div className={styles.authWrapper}>
      {/* Language Switcher - Positioned top-right for both mobile and desktop */}
      <div className={styles.splitLayout}>
        {/* Left Side - Login Form */}
        <div className={styles.leftPanel}>
          {/* Language Switcher - Now inside left panel to stay on the GIF area on desktop */}
          <div className={styles.languageSwitcher}>
            <LanguageSwitcher variant="auth" />
          </div>

          <Container className={styles.leftContainer}>
            <div className={styles.logoContainer}>
              <Image
                src="/logo/logo.png"
                alt="Site Logo"
                width={80}
                height={80}
                className={styles.logoImage}
                priority
              />
            </div>

            <div className={styles.formContainer}>
              <h1 className={styles.welcomeTitle}>
                {t('auth.bismillah')}
              </h1>
              <p className={styles.welcomeSubtitle}>
                {t('auth.platformWelcome')}
              </p>

              <div className={styles.authCard}>
                <div className="p-4">
                  <div className="mb-3">
                    <h2 className={`h2 ${styles.cardTitle}`}>{t('auth.signIn')}</h2>
                  </div>
                  <LoginForm />
                  <div className="text-center mt-3">
                    <p className={styles.cardSubtitle}>
                      {t('auth.dontHaveAccount')}{' '}
                      <Link href="/auth-advance/sign-up" className={styles.cardLink}>
                        {t('auth.createAccount')}
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </div>

        {/* Right Side - Background Image */}
        <div className={styles.rightPanel}>
          <div className={styles.backgroundImage}></div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;