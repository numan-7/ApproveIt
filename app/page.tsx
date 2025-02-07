'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import Hero from '@/components/hero';
import { useState, useEffect } from 'react';
import { DataApprovals } from '@/data/pending-approvals';
import { SpinnerLoader } from '@/components/ui/spinner-loader';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      const key = `approvals_${user.email}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(DataApprovals));
      }
    }
  }, [authLoading, user]);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  if (authLoading) return <SpinnerLoader isHome={true} />;

  return (
    <div className="flex flex-col min-h-screen font-sans">
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
