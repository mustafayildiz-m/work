import { getAllNotifications } from '@/helpers/data';
import { timeSince } from '@/utils/date';
import clsx from 'clsx';
import Link from 'next/link';
import { Card, CardBody, CardFooter, CardHeader, Button } from 'react-bootstrap';
import { BsBellFill } from 'react-icons/bs';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useWebSocketChatContext } from '@/context/useWebSocketChatContext';
import { getImageUrl } from '@/utils/image';

const NotificationDropdown = () => {
  const { notifications: realTimeNotifications, setNotifications } = useWebSocketChatContext();
  const [staticNotifications, setStaticNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const allNotifications = useMemo(() => {
    const combined = [...realTimeNotifications, ...staticNotifications];
    // Sort by time (most recent first) and filter out follow requests
    return combined
      .filter(n => n.type !== 'follow_request')
      .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));
  }, [realTimeNotifications, staticNotifications]);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const notifs = await getAllNotifications();
        setStaticNotifications(notifs || []);
      } catch (e) { }
    };
    fetchNotifs();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const unreadCount = allNotifications.filter(n => !n.isRead).length;

  return (
    <li className="nav-item ms-2" ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="nav-link bg-light icon-md btn btn-light p-0 position-relative"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Bildirimler"
      >
        {unreadCount > 0 && (
          <span className="badge badge-center rounded-pill bg-danger position-absolute top-0 start-100 translate-middle" style={{ width: '18px', height: '18px', fontSize: '0.65rem' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <BsBellFill size={15} />
      </button>

      <div
        role="menu"
        className="p-0 shadow-lg border-0 bg-white rounded"
        style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          right: 0,
          width: '360px',
          zIndex: 1050,
          display: isOpen ? 'block' : 'none'
        }}
      >
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <h6 className="m-0">Bildirimler {unreadCount > 0 && <span className="badge bg-danger ms-1">{unreadCount}</span>}</h6>
            <Link className="small" href="" onClick={(e) => { e.preventDefault(); setNotifications([]); setStaticNotifications([]); }}>
              Hepsini Temizle
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {allNotifications.length > 0 ? (
              <ul className="list-group list-group-flush list-unstyled p-2 mb-0" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {allNotifications.slice(0, 10).map((notification, idx) => (
                  <li key={idx}>
                    <div className={clsx('rounded d-sm-flex border-0 mb-1 p-2 position-relative align-items-center hover-bg-light transition-all', {
                      'bg-light': !notification.isRead
                    })}>
                      <div className="avatar text-center me-2" style={{ width: '40px', height: '40px' }}>
                        {notification.avatar ? (
                          <img
                            className="avatar-img rounded-circle"
                            src={getImageUrl(notification.avatar)}
                            alt=""
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = '/profile/profile.png'; }}
                          />
                        ) : (
                          <div className={`avatar-img rounded-circle bg-${notification.textAvatar?.variant || 'primary'}`} style={{ width: '40px', height: '40px', position: 'relative' }}>
                            <span className="text-white position-absolute top-50 start-50 translate-middle fw-bold" style={{ fontSize: '0.8rem' }}>
                              {notification.textAvatar?.text || '?'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mx-sm-2 flex-grow-1">
                        <p className={clsx('mb-0 small', !notification.isRead ? 'fw-bold' : '')}>{notification.title}</p>
                        {notification.description && <p className="text-muted mb-0 small text-truncate" style={{ fontSize: '0.75rem', maxWidth: '220px' }}>{notification.description}</p>}
                        <p className="text-muted mb-0" style={{ fontSize: '0.70rem' }}>{timeSince(notification.time)}</p>
                      </div>
                      {!notification.isRead && <span className="p-1 bg-primary rounded-circle ms-2" style={{ width: '6px', height: '6px' }}></span>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-muted">
                <BsBellFill size={24} className="mb-2 opacity-50" />
                <p className="mb-0 small">Henüz bildiriminiz bulunmuyor.</p>
              </div>
            )}
          </CardBody>
          <CardFooter className="text-center p-2">
            <Button variant="primary-soft" size="sm" className="w-100 fw-bold" style={{ fontSize: '0.8rem' }}>
              Tüm Bildirimleri Gör
            </Button>
          </CardFooter>
        </Card>
      </div>
    </li>
  );
};

export default NotificationDropdown;
