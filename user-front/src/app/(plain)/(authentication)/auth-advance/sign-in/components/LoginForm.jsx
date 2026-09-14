'use client';

import { useState } from 'react';
import { Controller } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, FormCheck } from 'react-bootstrap';
import useSignIn from './useSignIn';
import TextFormInput from '@/components/form/TextFormInput';
import PasswordFormInput from '@/components/form/PasswordFormInput';
import { useLanguage } from '@/context/useLanguageContext';
import { useNotificationContext } from '@/context/useNotificationContext';
import styles from '../../auth-pages.module.css';
import { signIn } from 'next-auth/react';
import useQueryParams from '@/hooks/useQueryParams';
import { THEME_RESET_SESSION_FLAG } from '@/utils/themeLogin';
import { FcGoogle } from 'react-icons/fc';
import { BsPerson } from 'react-icons/bs';

const LoginForm = () => {
  const { t } = useLanguage();
  const { showNotification } = useNotificationContext();
  const router = useRouter();
  const queryParams = useQueryParams();
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [ageConfirmError, setAgeConfirmError] = useState(false);
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
            <Controller
              name="rememberMe"
              control={control}
              render={({ field }) => (
                <FormCheck
                  type="checkbox"
                  label={t('auth.rememberMe')}
                  id="rememberCheck"
                  style={{ fontSize: '0.95rem' }}
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <Link
            href="/auth-advance/forgot-pass"
            className={styles.cardLink}
            style={{ fontSize: '0.9rem' }}
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

        <div className={`mb-3 ${styles.ageConfirmWrapper} ${ageConfirmError ? styles.ageConfirmError : ''}`}>
          <FormCheck
            type="checkbox"
            id="ageConfirmCheck"
            label={<span style={{ fontSize: '0.85rem', color: ageConfirmError ? '#fca5a5' : 'rgba(242, 251, 247, 0.68)' }}>{t('auth.ageConfirm')}</span>}
            checked={ageConfirmed}
            onChange={(e) => {
              setAgeConfirmed(e.target.checked);
              if (e.target.checked) setAgeConfirmError(false);
            }}
            className="custom-green-check"
          />
        </div>

        <div className="d-grid mt-2">
          <Button
            size="lg"
            type="button"
            variant="light"
            disabled={loading || showSuccess}
            onClick={() => {
              if (!ageConfirmed) {
                setAgeConfirmError(true);
                showNotification({
                  variant: 'warning',
                  message: t('auth.ageRequiredError'),
                  title: t('common.warning')
                });
                return;
              }
              try {
                sessionStorage.setItem(THEME_RESET_SESSION_FLAG, '1');
              } catch {
                /* yoksay */
              }
              signIn('google', {
                callbackUrl: queryParams['redirectTo'] ?? '/feed/home',
              });
            }}
            className={styles.providerButton}
            aria-label={t('auth.signInWithGoogle')}
          >
            <span className={styles.providerIcon} aria-hidden="true">
              <FcGoogle size={20} />
            </span>
            <span>{t('auth.signInWithGoogle')}</span>
          </Button>
        </div>

        <div className="d-grid mt-3">
          <Button
            size="lg"
            type="button"
            variant="light"
            disabled={loading || showSuccess}
            onClick={() => window.location.href = '/'}
            className={styles.guestButton}
          >
            <BsPerson size={22} />
            <span>{t('auth.visitAsGuest')}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;