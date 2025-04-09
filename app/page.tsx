'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import Hero from '@/components/hero';
import { useState } from 'react';
import { SpinnerLoader } from '@/components/ui/spinner-loader';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { loading: authLoading } = useAuth();

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  if (authLoading) return <SpinnerLoader isHome={true} />;

  return (
    <div className="flex flex-col min-h-svh font-sans">
      <Header
        isSidebarOpen={isSidebarOpen}
        openSidebar={openSidebar}
        closeSidebar={closeSidebar}
      />
      <main className="flex-grow">
        <Hero openSidebar={openSidebar} />
      </main>
      <Footer />
    </div>
  );
}
