'use client';

import Link from 'next/link';
import { Card, Col, Row, Container, Alert, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
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
                        <Container className={styles.leftContainer}>
                            <Alert variant="danger" className="text-center py-4">
                                <h4 className="mb-3">Geçersiz Bağlantı</h4>
                                <p>Şifre sıfırlama token'ı bulunamadı. Lütfen mailinizdeki linke tıkladığınızdan emin olun.</p>
                                <Link href="/auth-advance/forgot-pass">
                                    <Button variant="danger" className="mt-2">Yeni Link İste</Button>
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
                                Yeni Şifre Belirleyin
                            </h1>
                            <p className={styles.welcomeSubtitle}>
                                Güvenliğiniz için lütfen güçlü bir şifre seçin.
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
