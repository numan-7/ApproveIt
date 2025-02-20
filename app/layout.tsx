import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ZoomProvider } from '@/context/ZoomContext';
import { ToastContainer } from 'react-toastify';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
});

const dm_sans = DM_Sans({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-dm',
});

export const metadata: Metadata = {
  title: 'approve it',
  description:
    'Transform your workflow with intelligent approval management. Get instant visibility and control.',
  icons: { icon: '/logo.svg' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dm_sans.variable}`}>
      <body className={`${playfair.className} antialiased`}>
        <AuthProvider>
          <ZoomProvider>{children}</ZoomProvider>
        </AuthProvider>
        <ToastContainer
          className="font-dm"
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          pauseOnHover
        />
      </body>
    </html>
  );
}
