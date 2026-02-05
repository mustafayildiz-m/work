'use client';

import { Offcanvas, OffcanvasBody, OffcanvasHeader, OffcanvasTitle } from 'react-bootstrap';
import { useLayoutContext } from '@/context/useLayoutContext';
import OnlineUsers from '@/components/chat/OnlineUsers';

const OnlineUsersPanel = () => {
  const { messagingOffcanvas } = useLayoutContext();

  if (!messagingOffcanvas) {
    return null;
  }

  return (
    <Offcanvas 
      show={messagingOffcanvas.open} 
      onHide={messagingOffcanvas.toggle} 
      placement="end" 
      style={{ width: '350px' }}
    >
      <OffcanvasHeader closeButton>
        <OffcanvasTitle>Çevrimiçi Kullanıcılar</OffcanvasTitle>
      </OffcanvasHeader>
      <OffcanvasBody className="p-0">
        <OnlineUsers />
      </OffcanvasBody>
    </Offcanvas>
  );
};

export default OnlineUsersPanel;
