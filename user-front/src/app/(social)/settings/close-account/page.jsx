'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap';
import { useLanguage } from '@/context/useLanguageContext';
import { toast } from 'react-toastify';

const AccountClose = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get userId from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.sub || payload.id);
      } catch (e) {
        console.error('Error decoding token', e);
      }
    }
  }, []);

  const handleDeleteAccount = () => {
    if (!isChecked) {
      toast.error(t('settings.closeAccount.confirmCheckboxError'));
      return;
    }

    // Logic for account deletion would go here
    toast.info('Account deletion logic not implemented yet');
  };

  const handleKeepAccount = () => {
    if (userId) {
      router.push(`/profile/user/${userId}/feed`);
    } else {
      router.push('/profile/feed');
    }
  };

  return (
    <Card>
      <CardHeader className="border-0 pb-0">
        <CardTitle className="h5">{t('settings.closeAccount.title')}</CardTitle>
        <p className="mb-0 text-muted">
          {t('settings.closeAccount.subtitle')}
        </p>
      </CardHeader>
      <CardBody>
        <h6 className="mt-2">{t('settings.closeAccount.beforeYouGo')}</h6>
        <ul className="text-muted">
          <li>
            {t('settings.closeAccount.backupData')}{' '}
            <Link href="#" className="text-primary fw-medium">
              {t('settings.closeAccount.here')}
            </Link>
          </li>
          <li>{t('settings.closeAccount.lossDataWarning')}</li>
        </ul>
        <div className="form-check form-check-md my-4">
          <input
            className="form-check-input"
            type="checkbox"
            id="deleteaccountCheck"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
          />
          <label className="form-check-label ms-2" htmlFor="deleteaccountCheck" style={{ cursor: 'pointer' }}>
            {t('settings.closeAccount.confirmDelete')}
          </label>
        </div>
        <div className="d-flex gap-2 hstack">
          <Button
            variant="success"
            size="sm"
            className="mb-0"
            onClick={handleKeepAccount}
          >
            {t('settings.closeAccount.keepAccount')}
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="mb-0"
            onClick={handleDeleteAccount}
          >
            {t('settings.closeAccount.deleteAccount')}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default AccountClose;