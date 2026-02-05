'use client';

import { useSession } from 'next-auth/react';
import { WebSocketChatProvider } from '@/context/useWebSocketChatContext';

/**
 * Conditional wrapper for WebSocketChatProvider
 * Only renders the provider when user is authenticated
 */
const ConditionalWebSocketProvider = ({ children }) => {
    const { data: session, status } = useSession();

    // Only provide WebSocket context when user is authenticated
    if (status === 'authenticated' && session) {
        return <WebSocketChatProvider>{children}</WebSocketChatProvider>;
    }

    // For unauthenticated users, just render children without the provider
    return <>{children}</>;
};

export default ConditionalWebSocketProvider;
