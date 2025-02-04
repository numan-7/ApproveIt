'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import Hero from '@/components/hero';
import { useState, useEffect } from 'react';
import { pendingDataApprovals } from '@/data/pending-approvals';
import { SpinnerLoader } from '@/components/ui/spinner-loader';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      const pendingKey = `pendingApprovals_${user.email}`;
      const myKey = `myApprovals_${user.email}`;
      if (localStorage.getItem(pendingKey) === null) {
        localStorage.setItem(pendingKey, JSON.stringify(pendingDataApprovals));
      }
      if (localStorage.getItem(myKey) === null) {
        localStorage.setItem(myKey, JSON.stringify([]));
      }
    }
  }, [authLoading, user]);

  if(authLoading) return <SpinnerLoader />

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

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
