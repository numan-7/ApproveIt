"use client";

import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignIn from "@/components/sign-in";
import Link from "next/link";

interface HeaderProps {
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const containerVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function Header({
  isSidebarOpen,
  openSidebar,
  closeSidebar,
}: HeaderProps) {
  return (
    <motion.header
      className="absolute top-0 left-0 right-0 z-50 backdrop-blur-[2px]"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="mx-6 h-16 flex items-center justify-between">
        <Link href="/">
          <img src="/logo.svg" alt="ApproveIt" className="h-8" />
        </Link>
        <span className="text-2xl text-white tracking-tighter">APPROVEIT</span>

        <Button
          variant="ghost"
          size="icon"
          className="text-white"
          onClick={openSidebar}
        >
          <Menu className="h-8 w-8" />
          <span className="sr-only">Open menu</span>
        </Button>

        <Sheet open={isSidebarOpen} onOpenChange={(isOpen) => (isOpen ? openSidebar() : closeSidebar())}>
          <SheetContent className="ring-0 border-0 focus-visible:ring-offset-0 focus-visible:ring-0 w-full sm:w-[540px] p-0 backdrop-blur-md bg-white">
            <SheetDescription className="sr-only">This sidebar allows you to sign in to ApproveIt and manage approvals effortlessly.</SheetDescription>
            <SheetTitle className="sr-only">Sign In</SheetTitle>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-50 rounded-lg text-gray-200 hover:bg-gray-900 hover:text-gray-200"
              onClick={closeSidebar}
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Close menu</span>
            </Button>

            <SignIn />
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
}