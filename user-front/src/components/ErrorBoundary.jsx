'use client';

import { Component } from 'react';
import { Alert, Button, Col } from 'react-bootstrap';
import Link from 'next/link';

/**
 * Eski tarayıcılarda oluşan hataları yakalar, kullanıcıya geri dönüş seçeneği sunar
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (typeof console !== 'undefined' && console.error) {
      console.error('ErrorBoundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      const { fallbackUrl = '/feed/books', fallbackLabel = 'Kitaplara Dön' } = this.props;
      return (
        <Col lg={9}>
          <Alert variant="warning" className="mt-4">
            <Alert.Heading>Sayfa yüklenirken bir hata oluştu</Alert.Heading>
            <p className="mb-3">
              Cihazınız veya tarayıcınız bu sayfayı desteklemiyor olabilir. Lütfen daha güncel bir tarayıcı deneyin veya aşağıdaki bağlantıdan devam edin.
            </p>
            <Link href={fallbackUrl}>
              <Button variant="primary">{fallbackLabel}</Button>
            </Link>
          </Alert>
        </Col>
      );
    }
    return this.props.children;
  }
}
