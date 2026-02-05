'use client';

import { Offcanvas, OffcanvasBody, OffcanvasHeader, OffcanvasTitle } from 'react-bootstrap';
import { useLayoutContext } from '@/context/useLayoutContext';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';

const ConversationPanel = () => {
  const { conversationPanel } = useLayoutContext();

  if (!conversationPanel) {
    return null;
  }

  return (
    <Offcanvas 
      show={conversationPanel.open} 
      onHide={conversationPanel.toggle} 
      placement="start" 
      style={{ width: '500px' }}
    >
      <OffcanvasHeader closeButton>
        <OffcanvasTitle>Konuşma</OffcanvasTitle>
      </OffcanvasHeader>
      <OffcanvasBody className="p-0 d-flex flex-column">
        {/* Mesaj Listesi */}
        <div className="flex-grow-1" style={{ minHeight: 0 }}>
          <MessageList />
        </div>
        
        {/* Mesaj Input */}
        <div style={{ height: '120px', flexShrink: 0 }}>
          <MessageInput />
        </div>
      </OffcanvasBody>
    </Offcanvas>
  );
};

export default ConversationPanel;
