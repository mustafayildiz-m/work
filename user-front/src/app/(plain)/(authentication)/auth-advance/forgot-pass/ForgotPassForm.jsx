'use client';

import TextFormInput from '@/components/form/TextFormInput';
import { currentYear, developedBy, developedByLink } from '@/context/constants';
import { yupResolver } from '@hookform/resolvers/yup';
import Link from 'next/link';
import { useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useLanguage } from '@/context/useLanguageContext';
import styles from '../auth-pages.module.css';

const ForgotPassForm = () => {
  const { t } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const forgotPassSchema = yup.object({
    email: yup
      .string()
      .email('Geçerli bir e-posta adresi girin')
      .required('E-posta adresi gereklidir')
  });

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(forgotPassSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Bir hata oluştu');
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="mt-2">
        <Alert variant="success" className="text-center py-3">
          <h5 className="mb-2">✓ E-posta Gönderildi!</h5>
          <p className="mb-2 small">
            Şifre sıfırlama bağlantısı <strong>e-posta adresinize</strong> gönderildi.
          </p>
          <p className="text-muted small mb-3">
            Spam klasörünüzü de kontrol edin.
          </p>
          <div className="d-grid gap-2">
            <Button
              variant="outline-success"
              size="lg"
              onClick={() => setIsSubmitted(false)}
              style={{
                borderRadius: '12px',
                fontWeight: '600',
                padding: '0.75rem',
                borderColor: '#10b981',
                color: '#10b981'
              }}
            >
              Tekrar Dene
            </Button>
            <Link href="/auth-advance/sign-in">
              <Button
                size="lg"
                className={`w-100 ${styles.submitButton}`}
                style={{
                  borderRadius: '12px',
                  fontWeight: '600',
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  color: 'white'
                }}
              >
                Giriş Sayfasına Dön
              </Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <form className="mt-2" onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <Alert variant="danger" className="py-2 small mb-3">
          {error}
        </Alert>
      )}
      <div className="mb-2">
        <TextFormInput
          name="email"
          control={control}
          size="lg"
          placeholder={t('auth.emailPlaceholder')}
          type="email"
        />
        {errors.email && (
          <div className="text-danger small mt-1">
            {errors.email.message}
          </div>
        )}
      </div>

      <div className="d-grid mt-3">
        <Button
          size="lg"
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
          style={{
            fontWeight: '600',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            minHeight: '54px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: 'none',
            color: 'white',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Gönderiliyor...' : t('auth.sendResetLink')}
        </Button>
      </div>

      <div className="text-center mt-3">
        <Link
          href="/auth-advance/sign-in"
          style={{
            color: '#059669',
            fontWeight: '600',
            textDecoration: 'none',
            fontSize: '0.9rem'
          }}
        >
          {t('auth.backToLogin')}
        </Link>
      </div>

    </form>
  );
};
export default ForgotPassForm;