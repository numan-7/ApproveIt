"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  PlusCircle,
  CheckCircle,
  ChevronDown,
  PanelLeft,
  FileText,
  LogOut,
  ChevronsUpDown,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

export function RetractableSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isApprovalsExpanded, setIsApprovalsExpanded] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const toggleSidebar = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
  };

  const handleApprovalsClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      setIsApprovalsExpanded(true);
    } else {
      setIsApprovalsExpanded(!isApprovalsExpanded);
    }
  };

  const menuItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    {
      icon: FileText,
      label: "Approvals",
      subItems: [
        { href: "/dashboard/approvals/create", icon: PlusCircle, label: "Submit New Request" },
        { href: "/dashboard/approvals/pending", icon: CheckCircle, label: "Review Pending" },
        { href: "/dashboard/approvals/my-requests", icon: FileText, label: "My Requests" },
      ],
    },
  ];

  return (
    <div
      className={cn(
        "fixed top-0 left-0 h-screen flex flex-col z-20 text-card-foreground transition-all duration-300 ease-in-out shadow-xl shadow-emerald-950/50",
        isExpanded ? "w-64" : "w-16",
      )}
      style={{
        backgroundImage:
          'url("/sidebar_background_2.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* Sidebar Header */}
      <div className={cn("flex items-center p-4 z-20", isExpanded ? "justify-between" : "justify-center")}>
        <Link href="/">
          <div className={cn("flex h-8 items-center transition-all duration-300", !isExpanded && "justify-center")}>
            <img src="/logo.svg" alt="ApproveIt" className="h-8 w-8 object-contain" />
          </div>
        </Link>
        {isExpanded && (
          <Button variant="ghost" size="icon" className="hover:bg-forest/10 z-20" onClick={toggleSidebar}>
            <PanelLeft className="h-4 w-4 text-white" />
          </Button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 z-20">
        <ul className="space-y-2 px-2">
          {menuItems.map((item) => (
            
            <li key={item.label}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center p-2 rounded-md text-sm font-medium tracking-wider text-white uppercase transition-colors hover:bg-forest/10",
                    pathname === item.href && "bg-forest/20 text-white",
                    !isExpanded && "justify-center",
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isExpanded && "mr-2")} />
                  {isExpanded && item.label}
                </Link>
              ) : (
                <>
                  <button
                    onClick={handleApprovalsClick}
                    className={cn(
                      "flex items-center w-full p-2 rounded-md text-sm font-medium tracking-wider text-white uppercase transition-colors hover:bg-forest/10",
                      !isExpanded && "justify-center",
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isExpanded && "mr-2")} />
                    {isExpanded && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          className={cn("h-4 w-4 transition-transform", isApprovalsExpanded && "rotate-180")}
                        />
                      </>
                    )}
                  </button>
                  {isExpanded && isApprovalsExpanded && item.subItems && (
                    <ul className="ml-6 mt-2 space-y-1">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.href}>
                          <Link
                            href={subItem.href}
                            className={cn(
                              "flex uppercase items-center p-2 rounded-md text-sm tracking-wider text-white transition-colors hover:bg-forest/10",
                              pathname === subItem.href && "bg-forest/20 text-white",
                            )}
                          >
                            <subItem.icon className="h-4 w-4 mr-2" />
                            <span>{subItem.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Toggle Sidebar Button */}
      {!isExpanded && (
        <div className="flex justify-center p-4 mt-auto z-20">
          <Button variant="ghost" size="icon" className="hover:bg-forest/10" onClick={toggleSidebar}>
            <PanelLeft className="h-4 w-4 text-white" />
          </Button>
        </div>
      )}

      {/* User Menu */}
      {user && (
        <div className="relative mt-auto z-20 border-t-2 border-white/50 font-dm tracking-wider">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={cn(
              "flex items-center w-full rounded-md text-white bg-black/20 hover:bg-black/30 p-2 transition-colors",
              !isExpanded && "justify-center"
            )}
          >
            <img
              src={user?.user_metadata?.avatar_url || "/sidebar_background.webp"}
              alt="User Avatar"
              className={cn("h-8 w-8 rounded-sm mr-2", !isExpanded && "mr-0")}
            />
            {isExpanded && (
              <>
                <span className="text-sm truncate">{user?.email}</span>
                <ChevronsUpDown className="h-5 w-5 ml-auto" />
              </>
            )}
          </button>

          {/* Floating Sign Out Menu */}
          {isUserMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 1.01 }} 
              animate={{ opacity: 1, scale: 1 }}   
              transition={{ duration: 0.1, ease: "easeIn" }} 
              className={cn(
                "absolute bg-black/30 rounded-lg shadow-lg transition-all",
                isExpanded ? "bottom-[5px] left-[260px] w-64" : "bottom-[5px] left-[70px] w-64"
              )}
            >
              <Button
                onClick={() => {
                  setIsSigningOut(true)
                  signOut()
                }}
                disabled={isSigningOut}
                variant="ghost"
                className={cn(
                  "flex items-center w-full p-2 text-white font-dm uppercase tracking-wider hover:bg-black/40 hover:text-white rounded-md transition",
                  isSigningOut ? "cursor-not-allowed" : "cursor-pointer"
                )}
              >
                {isSigningOut ? (
                  <Loader2 className="animate-spin text-white" size={20} />
                ) : (
                  <LogOut className="h-5 w-5 mr-2" />
                )}
                <span>Sign Out</span>
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
