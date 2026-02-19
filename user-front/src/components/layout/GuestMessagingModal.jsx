'use client';

import { Modal, Button } from 'react-bootstrap';
import { useLanguage } from '@/context/useLanguageContext';
import { useRouter } from 'next/navigation';
import { BsChatLeftTextFill } from 'react-icons/bs';

const GuestMessagingModal = ({ show, onHide }) => {
    const { t } = useLanguage();
    const router = useRouter();

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            animation={true}
            dialogClassName="guest-modal-dialog"
            backdropClassName="guest-modal-backdrop"
            style={{ zIndex: 1060 }}
        >
            <div className="p-4 text-center">
                <div className="mb-4 d-inline-flex align-items-center justify-content-center" style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    color: '#764ba2',
                    marginBottom: '1.5rem',
                    animation: 'bounce 2s infinite'
                }}>
                    <BsChatLeftTextFill size={32} />
                </div>

                <h4 className="fw-bold mb-3" style={{ color: '#1e293b' }}>{t('guest.messagingTitle')}</h4>
                <p className="text-muted mb-4 px-3" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                    {t('guest.messagingDesc')}
                </p>

                <div className="d-grid gap-3">
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={() => router.push('/auth-advance/sign-in')}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            fontWeight: '600',
                            padding: '12px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(118, 75, 162, 0.3)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        {t('guest.login')}
                    </Button>

                    <Button
                        variant="outline-secondary"
                        size="lg"
                        onClick={onHide}
                        style={{
                            border: '2px solid #e2e8f0',
                            color: '#64748b',
                            background: 'transparent',
                            fontWeight: '600',
                            padding: '12px',
                            borderRadius: '12px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f8f9fa';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                    >
                        {t('guest.continue')}
                    </Button>
                </div>
            </div>

            <style jsx global>{`
        .guest-modal-dialog .modal-content {
          border: none;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          background: #fff;
        }
        
        .guest-modal-backdrop.show {
          opacity: 1 !important;
          background-color: rgba(15, 23, 42, 0.6) !important;
          backdrop-filter: blur(8px);
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
        </Modal>
    );
};

export default GuestMessagingModal;
