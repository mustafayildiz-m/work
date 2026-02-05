'use client';

import Link from 'next/link';
import { Button, FormCheck } from 'react-bootstrap';
import useSignIn from './useSignIn';
import TextFormInput from '@/components/form/TextFormInput';
import PasswordFormInput from '@/components/form/PasswordFormInput';
import { useLanguage } from '@/context/useLanguageContext';
import styles from '../../auth-pages.module.css';
import { signIn } from 'next-auth/react';
import useQueryParams from '@/hooks/useQueryParams';
import { FcGoogle } from 'react-icons/fc';

const LoginForm = () => {
  const { t } = useLanguage();
  const queryParams = useQueryParams();
  const {
    loading,
    showSuccess,
    login,
    control
  } = useSignIn();

  const renderSuccessText = (text) => {
    let globalIndex = 0;
    return text.split(' ').map((word, wordIndex) => (
      <span key={wordIndex} style={{ display: 'inline-block', whiteSpace: 'nowrap', marginRight: '0.4rem' }}>
        {word.split('').map((char) => {
          const delay = 1.4 + (globalIndex * 0.05);
          globalIndex++;
          return (
            <span key={globalIndex} style={{ animationDelay: `${delay}s`, display: 'inline-block' }}>
              {char}
            </span>
          );
        })}
      </span>
    ));
  };

  return (
    <div style={{ position: 'relative' }}>
      {showSuccess && (
        <div className={styles.successOverlay}>
          <div className={styles.successContent}>
            <div className={styles.checkmarkWrapper}>
              <div className={styles.liquidFill}></div>
              <div className={styles.checkmark}></div>
            </div>
            <h2 className={styles.successText}>
              {renderSuccessText(t('auth.loginSuccess'))}
            </h2>
            <p className={styles.successSubtext}>
              {t('auth.welcomeBack')}
            </p>
          </div>
        </div>
      )}

      <form className="mt-2" onSubmit={login}>
        <div className="mb-2">
          <TextFormInput
            name="email"
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            control={control}
            containerClassName="input-group-lg"
          />
        </div>
        <div className="mb-2">
          {/* @ts-ignore */}
          <PasswordFormInput
            name="password"
            placeholder={t('auth.passwordPlaceholder')}
            control={control}
            size="lg"
            containerClassName="w-100"
          />
        </div>
        <div className="mb-2 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
          <div>
            <FormCheck
              type="checkbox"
              label={t('auth.rememberMe')}
              id="rememberCheck"
              style={{ fontSize: '0.95rem' }}
            />
          </div>
          <Link
            href="/auth-advance/forgot-pass"
            style={{
              color: '#059669',
              fontWeight: '600',
              textDecoration: 'none',
              fontSize: '0.95rem',
              transition: 'color 0.2s ease, text-decoration 0.2s ease',
              padding: '0.5rem 0',
              display: 'inline-block'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#047857';
              e.target.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#059669';
              e.target.style.textDecoration = 'none';
            }}
          >
            {t('auth.forgotPassword')}?
          </Link>
        </div>
        <div className="d-grid mt-2">
          <Button
            size="lg"
            type="submit"
            disabled={loading || showSuccess}
            className={`w-100 ${styles.submitButton}`}
            style={{
              borderRadius: '24px',
              minHeight: '52px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              color: 'white'
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {t('auth.loggingIn')}
              </>
            ) : (
              t('auth.signIn')
            )}
          </Button>
        </div>

        <div className={styles.divider}>
          <div className={styles.dividerLine} />
          <div className={styles.dividerText}>{t('common.or')}</div>
          <div className={styles.dividerLine} />
        </div>

        <div className="d-grid">
          <Button
            size="lg"
            type="button"
            variant="light"
            disabled={loading || showSuccess}
            onClick={() =>
              signIn('google', {
                callbackUrl: queryParams['redirectTo'] ?? '/feed/home',
              })
            }
            className={styles.providerButton}
            aria-label={t('auth.signInWithGoogle')}
          >
            <span className={styles.providerIcon} aria-hidden="true">
              <FcGoogle size={20} />
            </span>
            <span>{t('auth.signInWithGoogle')}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;