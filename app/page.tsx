"use client";

import Header from "@/components/header";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import { useState } from "react";
import { createClientForServer } from "@/utils/supabase/server";

export default function Home() {
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
