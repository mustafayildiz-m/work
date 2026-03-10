'use client';

import Link from 'next/link';
import { Container, Alert, Button } from 'react-bootstrap';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import styles from '../../auth-advance/auth-pages.module.css';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/context/useLanguageContext';
import ResetPasswordForm from './ResetPasswordForm';

const ResetPassword = () => {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    if (!token) {
        return (
            <div className={styles.authWrapper}>
                <div className={styles.splitLayout}>
                    <div className={styles.leftPanel}>
                        <div className={styles.languageSwitcher}>
                            <LanguageSwitcher variant="auth" />
                        </div>
                        <Container className={styles.leftContainer}>
                            <Alert variant="danger" className="text-center py-4">
                                <h4 className="mb-3">{t('auth.invalidLink')}</h4>
                                <p>{t('auth.invalidLinkDesc')}</p>
                                <Link href="/auth-advance/forgot-pass">
                                    <Button variant="danger" className="mt-2">{t('auth.requestNewLink')}</Button>
                                </Link>
                            </Alert>
                        </Container>
                    </div>
                    <div className={styles.rightPanel}>
                        <div className={styles.backgroundImage}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.authWrapper}>
            <div className={styles.splitLayout}>
                <div className={styles.leftPanel}>
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
                                {t('auth.resetPasswordTitle')}
                            </h1>
                            <p className={styles.welcomeSubtitle}>
                                {t('auth.resetPasswordSubtitle')}
                            </p>

                            <div className={styles.authCard}>
                                <div className="p-4">
                                    <ResetPasswordForm token={token} />
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

export default ResetPassword;
