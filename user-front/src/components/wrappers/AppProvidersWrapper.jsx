'use client';

import { SessionProvider } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NotificationProvider } from '@/context/useNotificationContext';
import { ChatProvider } from '@/context/useChatContext';
import { AuthProvider } from '@/context/useAuthContext';
import ConditionalWebSocketProvider from '@/components/wrappers/ConditionalWebSocketProvider';
import { SearchProvider } from '@/context/useSearchContext';
import { LanguageProvider } from '@/context/useLanguageContext';
import TabTitleUpdater from '@/components/TabTitleUpdater';

const LayoutProvider = dynamic(() => import('@/context/useLayoutContext').then(mod => mod.LayoutProvider), {
  ssr: false
});

const AppProvidersWrapper = ({
  children
}) => {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const splashElement = document.querySelector('#splash-screen');
      const nextSplashElement = document.querySelector('#__next_splash');

      // İlk kontrol - eğer zaten içerik varsa splash'i kaldır
      if (nextSplashElement?.hasChildNodes()) {
        splashElement?.classList.add('remove');
      }

      // Modern MutationObserver kullan
      if (nextSplashElement && window.MutationObserver) {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
              splashElement?.classList.add('remove');
              observer.disconnect(); // Bir kez çalıştıktan sonra observer'ı kapat
            }
          });
        });

        observer.observe(nextSplashElement, {
          childList: true,
          subtree: true
        });

        return () => {
          observer.disconnect();
        };
      }
    }
  }, []);

  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <LanguageProvider>
        <AuthProvider>
          <SearchProvider>
            <NotificationProvider>
              <ChatProvider>
                <ConditionalWebSocketProvider>
                  <TabTitleUpdater />
                  <LayoutProvider>
                    {children}
                    <ToastContainer
                      position="top-right"
                      autoClose={3000}
                      hideProgressBar={false}
                      newestOnTop={true}
                      closeOnClick
                      rtl={false}
                      pauseOnFocusLoss
                      draggable
                      pauseOnHover
                      theme="light"
                      style={{ zIndex: 9999 }}
                    />

                    {/* Toastify Image Fix */}
                    <style jsx global>{`
                      .Toastify img {
                        display: none !important;
                      }
                      .Toastify__toast-container {
                        max-width: 400px;
                      }
                      .Toastify__toast {
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                      }
                    `}</style>
                  </LayoutProvider>
                </ConditionalWebSocketProvider>
              </ChatProvider>
            </NotificationProvider>
          </SearchProvider>
        </AuthProvider>
      </LanguageProvider>
    </SessionProvider>
  );
};

export default AppProvidersWrapper;