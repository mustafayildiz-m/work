'use client';

import useToggle from '@/hooks/useToggle';
import clsx from 'clsx';
import { Button } from 'react-bootstrap';
import { useLanguage } from '@/context/useLanguageContext';

const LoadMoreButton = () => {
  const { t } = useLanguage();
  const {
    isTrue: isLoadButton,
    toggle
  } = useToggle();
  return <Button onClick={toggle} variant="primary-soft" role="button" className={clsx('btn-loader', {
    active: isLoadButton
  })} data-bs-toggle="button" aria-pressed="true">
    <span className="load-text"> {t('notifications.loadMore')}</span>
    <div className="load-icon">
      <div className="spinner-grow spinner-grow-sm" role="status">
        <span className="visually-hidden">{t('notifications.loading')}</span>
      </div>
    </div>
  </Button>;
};
export default LoadMoreButton;