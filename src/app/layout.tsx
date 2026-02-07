import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import { TopicProvider } from '@/lib/topicContext';
import { InstallPrompt } from '@/components/InstallPrompt';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import './globals.css';

export const metadata: Metadata = {
  title: 'MindVault',
  description: 'עוזר אישי לניהול תהליך טיפולי בין פגישות',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MindVault',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#7C3AED',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        <TopicProvider>
          {children}
          <InstallPrompt />
          <ServiceWorkerRegistration />
        </TopicProvider>
        <Toaster 
          position="top-center" 
          richColors 
          dir="rtl"
          toastOptions={{
            style: {
              fontFamily: 'Heebo, system-ui, sans-serif',
            },
          }}
        />
      </body>
    </html>
  );
}
