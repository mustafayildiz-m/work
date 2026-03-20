'use client';

import Link from 'next/link';
import { Card, Col, Row, Container } from 'react-bootstrap';
import ForgotPassForm from './ForgotPassForm';
import Image from 'next/image';
import styles from '../auth-pages.module.css';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/context/useLanguageContext';

const ForgotPassword = () => {
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
                    <h2 className={`h2 ${styles.cardTitle}`}>{t('auth.forgotPasswordTitle')}</h2>
                    <p className={styles.cardSubtitle}>
                      {t('auth.forgotPasswordDesc')}{' '}
                      <Link href="/auth-advance/sign-in" className={styles.cardLink}>
                        {t('auth.signIn')}
                      </Link>
                    </p>
                  </div>
                  <ForgotPassForm />
                </div>
              </div>
            </div>
          </Container>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.imageWrapper}>
            <div className={styles.backgroundImage}></div>
          </div>
          <div className={styles.textContentWrapper}>
            <h2 className={styles.textTitle}>
              <span className={styles.textTitleBismillahArabic}>
                {t('auth.bismillahArabic')}
              </span>
              {(() => {
                const secondary = t('auth.pathToLightBismillahSecondary');
                const isValid = secondary && secondary.trim() !== '' && !secondary.startsWith('auth.');
                return isValid ? (
                  <span className={styles.textTitleBismillahSecondary}>{secondary}</span>
                ) : null;
              })()}
              <span className={styles.textTitleMain}>{t('auth.pathToLightSubtitle')}</span>
            </h2>
            <div className={styles.authQuoteBlock}>
              <p className={styles.authQuoteText}>"{t('auth.authQuote')}"</p>
              <span className={styles.authQuoteSource}>— {t('auth.authQuoteSource')}</span>
            </div>
            <div className={styles.textBody}>
              <p>{t('auth.pathToLightP1')}</p>
              <p>{t('auth.pathToLightP2')}</p>
              <p>{t('auth.pathToLightP3')}</p>
              <p className={styles.textBodyHighlight}>{t('auth.pathToLightP4')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;