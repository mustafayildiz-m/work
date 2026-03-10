'use client';

import PasswordFormInput from '@/components/form/PasswordFormInput';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import Link from 'next/link';
import styles from '../../auth-advance/auth-pages.module.css';
import { useLanguage } from '@/context/useLanguageContext';

const ResetPasswordForm = ({ token }) => {
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);

    const resetPasswordSchema = yup.object({
        password: yup
            .string()
            .min(8, t('auth.passwordMinLength'))
            .required(t('auth.passwordRequired')),
        confirmPassword: yup
            .string()
            .oneOf([yup.ref('password'), null], t('auth.passwordsMismatch'))
            .required(t('auth.confirmPasswordRequired'))
    });

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(resetPasswordSchema)
    });

    const getErrorMessage = (message) => {
        if (!message) return t('auth.resetPasswordError');
        const code = message.trim();
        const translated = t(`auth.resetPasswordErrors.${code}`);
        if (translated !== `auth.resetPasswordErrors.${code}`) return translated;
        return message;
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    password: data.password
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const raw = errorData?.message ?? errorData?.code;
                const msg = Array.isArray(raw) ? raw[0] : (raw || t('auth.resetPasswordError'));
                throw new Error(msg);
            }

            setIsSuccess(true);
        } catch (err) {
            setError(getErrorMessage(err.message));
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center">
                <div className="mb-4">
                    <div style={{ fontSize: '60px', color: '#10b981' }}>✓</div>
                    <h3 className="h4 font-weight-bold">{t('auth.passwordChanged')}</h3>
                    <p className="text-muted">{t('auth.passwordChangedDesc')}</p>
                </div>
                <Link href="/auth-advance/sign-in">
                    <Button
                        size="lg"
                        className={styles.submitButton}
                        style={{
                            borderRadius: '12px',
                            padding: '0.75rem 2rem',
                            fontWeight: '600',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            color: 'white'
                        }}
                    >
                        {t('auth.signIn')}
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {error && (
                <Alert variant="danger" className="py-2 small mb-3">
                    {error}
                </Alert>
            )}

            <div className="mb-3">
                <label className="form-label small font-weight-bold">{t('auth.newPassword')}</label>
                <PasswordFormInput
                    name="password"
                    control={control}
                    size="lg"
                    placeholder="••••••••"
                />
                {errors.password && (
                    <div className="text-danger small mt-1">{errors.password.message}</div>
                )}
            </div>

            <div className="mb-4">
                <label className="form-label small font-weight-bold">{t('auth.confirmPasswordLabel')}</label>
                <PasswordFormInput
                    name="confirmPassword"
                    control={control}
                    size="lg"
                    placeholder="••••••••"
                />
                {errors.confirmPassword && (
                    <div className="text-danger small mt-1">{errors.confirmPassword.message}</div>
                )}
            </div>

            <div className="d-grid">
                <Button
                    size="lg"
                    type="submit"
                    disabled={isLoading}
                    className={styles.submitButton}
                    style={{
                        fontWeight: '600',
                        padding: '1rem',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        color: 'white',
                        opacity: isLoading ? 0.7 : 1
                    }}
                >
                    {isLoading ? t('auth.updating') : t('auth.updatePassword')}
                </Button>
            </div>
        </form>
    );
};

export default ResetPasswordForm;
