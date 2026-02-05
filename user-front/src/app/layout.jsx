import dynamic from 'next/dynamic';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import NextTopLoader from 'nextjs-toploader';
import { DEFAULT_PAGE_TITLE } from '@/context/constants';
import logo from '@/assets/images/logo.svg';
import '@/assets/scss/style.scss';
import 'leaflet/dist/leaflet.css';
const AppProvidersWrapper = dynamic(() => import('@/components/wrappers/AppProvidersWrapper'));
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap'
});
export const metadata = {
  title: {
    template: '%s | Social Nextjs - Network, Community and Event Theme',
    default: DEFAULT_PAGE_TITLE
  },
  description: 'Bootstrap 5 based Social Media Network and Community Theme',
  icons: {
    icon: '/favicon.ico',
  }
};
const splashScreenStyles = `
#splash-screen {
  position: fixed;
  top: 50%;
  left: 50%;
  background: white;
  display: flex;
  height: 100%;
  width: 100%;
  transform: translate(-50%, -50%);
  align-items: center;
  justify-content: center;
  z-index: 9999;
  opacity: 1;
  transition: opacity 0.5s linear;
  overflow: hidden;
}

#splash-screen.remove {
  animation: fadeout 0.5s forwards;
  z-index: 0;
  pointer-events: none;
}

@keyframes fadeout {
  to {
    opacity: 0;
    visibility: hidden;
  }
}
`;
const RootLayout = ({
  children
}) => {
  return <html lang="en">
    <head>
      <style>{splashScreenStyles}</style>
      <script
        dangerouslySetInnerHTML={{
          __html: `
              if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
                window.global = window;
              }
            `,
        }}
      />
    </head>
    <body className={inter.className}>
      <div id="splash-screen">
        <Image alt="Logo" width={200} height={50} src={logo} style={{
          height: 'auto',
          width: '200px',
          maxWidth: '80%'
        }} priority />
      </div>
      <NextTopLoader color="#1c84ee" showSpinner={false} />
      <div id="__next_splash">
        <AppProvidersWrapper>{children}</AppProvidersWrapper>
      </div>
    </body>
  </html>;
};
export default RootLayout;