'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, Button, Spinner, Container, Row, Col } from 'react-bootstrap';
import Link from 'next/link';
import { useOptionalNotificationContext } from '@/context/useNotificationContext';

// Icons using span + text as fallback to avoid any react-icons issues during crash
const SuccessIcon = () => <div style={{ fontSize: '4rem', color: '#198754' }}>✓</div>;
const ErrorIcon = () => <div style={{ fontSize: '4rem', color: '#dc3545' }}>✕</div>;

async function callVerifyApi(token) {
    const backendBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${backendBase}/auth/verify?token=${token}`);
    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.error('JSON parse error:', text);
        throw new Error('Geçersiz sunucu yanıtı');
    }
    return { ok: response.ok, data };
}

const VerifyEmailContent = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('E-posta adresiniz doğrulanıyor...');
    const isverifying = useRef(false);

    const notificationContext = useOptionalNotificationContext();

    useEffect(() => {
        if (!token || isverifying.current) return;
        isverifying.current = true;

        console.log('Verifying with:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/verify?token=${token}`);

        callVerifyApi(token)
            .then(({ ok, data }) => {
                if (ok) {
                    setStatus('success');
                    setMessage('Tebrikler! Hesabınız başarıyla doğrulandı.');
                    notificationContext?.showNotification?.({
                        message: 'Hesabınız doğrulandı. Şimdi giriş yapabilirsiniz.',
                        variant: 'success',
                    });
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Doğrulama işlemi başarısız oldu.');
                }
            })
            .catch(error => {
                console.error('Verification error:', error);
                setStatus('error');
                setMessage('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
            });
    }, [token]);


    return (
        <Card className="card-body text-center p-4 p-sm-5 shadow-lg border-0" style={{ borderRadius: '15px' }}>
            <div className="mb-4">
                {status === 'loading' && (
                    <Spinner animation="border" variant="success" style={{ width: '3.5rem', height: '3.5rem' }} />
                )}
                {status === 'success' && <SuccessIcon />}
                {status === 'error' && <ErrorIcon />}
            </div>

            <h2 className="mb-3 fw-bold" style={{ color: '#1b5e20' }}>
                {status === 'loading' && 'Doğrulanıyor...'}
                {status === 'success' && 'Doğrulama Başarılı!'}
                {status === 'error' && 'Doğrulama Başarısız'}
            </h2>

            <p className="mb-4 text-muted fs-5">{message}</p>

            <div className="d-grid gap-2">
                {status === 'success' && (
                    <Button as={Link} href="/auth-advance/sign-in" variant="success" size="lg" className="py-3 fw-bold shadow-sm">
                        Giriş Yap
                    </Button>
                )}
                {status === 'error' && (
                    <Button as={Link} href="/auth/sign-up" variant="primary" size="lg" className="py-3 fw-bold shadow-sm">
                        Tekrar Kaydol
                    </Button>
                )}
                {(status === 'error' || status === 'loading') && (
                    <Button as={Link} href="/" variant="link" className="text-secondary text-decoration-none">
                        Ana Sayfa'ya Dön
                    </Button>
                )}
            </div>
        </Card>
    );
};

const VerifyEmailPage = () => {
    return (
        <main style={{ backgroundColor: '#f0f4f0', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
            <Container>
                <Row className="justify-content-center">
                    <Col sm={10} md={8} lg={6} xl={5}>
                        <Suspense fallback={
                            <Card className="card-body text-center p-5 shadow-sm border-0">
                                <Spinner animation="border" variant="success" />
                                <p className="mt-3 text-muted">Sayfa yükleniyor...</p>
                            </Card>
                        }>
                            <VerifyEmailContent />
                        </Suspense>
                    </Col>
                </Row>
            </Container>
        </main>
    );
};

export default VerifyEmailPage;
