'use client';

import { Card, Col, Row, Container } from 'react-bootstrap';
import SignUpForm from './components/SignUpForm';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../auth-pages.module.css';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/context/useLanguageContext';

const SignUp = () => {
  const { t } = useLanguage();

  return (
    <div className={styles.authWrapper}>
      {/* Language Switcher - Positioned top-right for both mobile and desktop */}
      <div className={styles.splitLayout}>
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
                  <div className="text-center mb-3">
                    <h2 className={`h2 ${styles.cardTitle}`}>{t('auth.signUp')}</h2>
                    <p className={styles.cardSubtitle}>
                      {t('auth.alreadyHaveAccount')}{' '}
                      <Link href="/auth-advance/sign-in" className={styles.cardLink}>
                        {t('auth.signIn')}
                      </Link>
                    </p>
                  </div>
                  <SignUpForm />
                </div>
              </div>
            </div>
          </Container>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.backgroundImage}></div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;