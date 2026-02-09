'use client';

import { useSession } from 'next-auth/react';
import { WebSocketChatProvider } from '@/context/useWebSocketChatContext';

/**
 * Conditional wrapper for WebSocketChatProvider
 * Only renders the provider when user is authenticated
 */
const ConditionalWebSocketProvider = ({ children }) => {
    // ALWAYS provide the context. The provider handles internal connection logic.
    return <WebSocketChatProvider>{children}</WebSocketChatProvider>;
};

export default ConditionalWebSocketProvider;
