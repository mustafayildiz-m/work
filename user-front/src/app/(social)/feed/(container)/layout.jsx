'use client';

import { BsChatLeftTextFill, BsPeopleFill } from 'react-icons/bs';
import { Col, Container, Offcanvas, OffcanvasBody, OffcanvasHeader, Row } from 'react-bootstrap';
import { useLayoutContext } from '@/context/useLayoutContext';
import { FaSlidersH } from 'react-icons/fa';
import ProfilePanel from '@/components/layout/ProfilePanel';
import { profilePanelLinksData1 } from '@/assets/data/layout';
import OnlineUsersPanel from '@/components/layout/OnlineUsersPanel';
import ConversationPanel from '@/components/layout/ConversationPanel';

import { useLanguage } from '@/context/useLanguageContext';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import GuestMessagingModal from '@/components/layout/GuestMessagingModal';

const FeedLayout = ({
  children
}) => {
  const { t } = useLanguage();
  const {
    messagingOffcanvas,
    startOffcanvas
  } = useLayoutContext();
  const { status } = useSession();
  const [showGuestModal, setShowGuestModal] = useState(false);

  const handleMessagingClick = () => {
    if (status === 'unauthenticated') {
      setShowGuestModal(true);
    } else {
      messagingOffcanvas.toggle();
    }
  };

  return <>
    <main>
      <Container>
        <Row className="g-4 feed-container-row" style={{ marginTop: '0.5rem' }}>
          <Col lg={3}>
            <div className="d-flex align-items-center d-lg-none profile-toggle-mobile">
              <button
                onClick={startOffcanvas.toggle}
                className="border-0 bg-transparent d-flex align-items-center w-100"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasSideNavbar"
                aria-controls="offcanvasSideNavbar"
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span className="btn btn-primary profile-toggle-icon">
                  <FaSlidersH />
                </span>
                <span className="h6 mb-0 fw-bold d-lg-none ms-2 profile-toggle-text">{t('menu.profile')}</span>
              </button>
            </div>

            <nav className="navbar navbar-expand-lg mx-0">
              {/* Desktop View */}
              <div className="d-none d-lg-block px-2 px-lg-0 w-100">
                <ProfilePanel links={profilePanelLinksData1} />
              </div>

              {/* Mobile View */}
              <div className="d-lg-none">
                <Offcanvas show={startOffcanvas.open} placement="start" onHide={startOffcanvas.toggle} tabIndex={-1} id="offcanvasSideNavbar">
                  <OffcanvasHeader closeButton />

                  <OffcanvasBody className="d-block px-2 px-lg-0">
                    <div>
                      <ProfilePanel links={profilePanelLinksData1} onLinkClick={startOffcanvas.toggle} />
                    </div>
                  </OffcanvasBody>
                </Offcanvas>
              </div>
            </nav>
          </Col>
          {children}
        </Row>
      </Container>
    </main>
    <div className="d-none d-lg-block">
      <a
        onClick={handleMessagingClick}
        className="position-fixed end-0 bottom-0 me-5 mb-5 d-flex align-items-center justify-content-center"
        role="button"
        aria-controls="offcanvasChat"
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          border: 'none',
          position: 'relative',
          zIndex: 1000
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.4)';
        }}
      >
        <BsPeopleFill size={24} color="white" />
        <span
          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success"
          style={{
            fontSize: '0.7rem',
            minWidth: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white',
            animation: 'pulse 2s infinite'
          }}
        >
          <span className="online-dot" style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'white',
            display: 'inline-block'
          }}></span>
        </span>
      </a>
    </div>

    {/* Online Users Panel */}
    <OnlineUsersPanel />

    {/* Conversation Panel */}
    <ConversationPanel />

    {/* Guest Messaging Modal */}
    <GuestMessagingModal show={showGuestModal} onHide={() => setShowGuestModal(false)} />

    <style jsx global>{`
        @media (max-width: 991.98px) {
          .feed-container-row {
            margin-top: 0.25rem !important;
          }
          
          .profile-toggle-mobile {
            padding: 0.5rem 0.75rem;
          }
          
          .profile-toggle-mobile button {
            background-color: rgba(13, 110, 253, 0.05) !important;
          }
          
          .profile-toggle-mobile button:hover {
            background-color: rgba(13, 110, 253, 0.1) !important;
          }
          
          .profile-toggle-icon {
            padding: 0.5rem !important;
            font-size: 0.9rem;
          }
          
          .profile-toggle-text {
            font-size: 0.95rem !important;
          }
        }

        @media (max-width: 575.98px) {
          .feed-container-row {
            margin-top: 0.15rem !important;
          }
          
          .profile-toggle-mobile {
            padding: 0.4rem 0.5rem;
          }
          
          .profile-toggle-icon {
            padding: 0.4rem !important;
            font-size: 0.85rem;
          }
          
          .profile-toggle-text {
            font-size: 0.9rem !important;
          }
        }

        @media (max-width: 374.98px) {
          .profile-toggle-mobile {
            padding: 0.3rem 0.4rem;
          }
          
          .profile-toggle-icon {
            padding: 0.35rem !important;
            font-size: 0.8rem;
          }
          
          .profile-toggle-text {
            font-size: 0.85rem !important;
          }
        }
      `}</style>
  </>;
};
export default FeedLayout;