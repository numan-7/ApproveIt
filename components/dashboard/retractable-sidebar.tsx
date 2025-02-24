'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Home,
  PlusCircle,
  CheckCircle,
  ChevronDown,
  PanelLeft,
  FileText,
  LogOut,
  ChevronsUpDown,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function RetractableSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isApprovalsExpanded, setIsApprovalsExpanded] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  const router = useRouter();

  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
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
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    {
      icon: FileText,
      label: 'Approvals',
      subItems: [
        {
          href: '/dashboard/approvals/create',
          icon: PlusCircle,
          label: 'Create Approval',
        },
        {
          href: '/dashboard/approvals/incoming',
          icon: CheckCircle,
          label: 'Incoming Approvals',
        },
        {
          href: '/dashboard/approvals/outgoing',
          icon: FileText,
          label: 'Outgoing Approvals',
        },
      ],
    },
  ];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        isExpanded &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isExpanded]);

  return (
    <div
      ref={sidebarRef}
      className={cn(
        'fixed font-dm top-0 left-0 h-screen flex flex-col z-20 text-card-foreground transition-all duration-300 ease-in-out shadow-xl shadow-emerald-950/50',
        isExpanded ? 'w-64' : 'w-16'
      )}
      style={{
        backgroundImage: 'url("/sidebar_background_2.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* Sidebar Header */}
      <div
        className={cn(
          'flex items-center p-4 z-20',
          isExpanded ? 'justify-between' : 'justify-center'
        )}
      >
        <Link href="/">
          <div
            className={cn(
              'flex h-8 items-center transition-all duration-300',
              !isExpanded && 'justify-center'
            )}
          >
            <Image
              src="/logo.svg"
              alt="ApproveIt"
              width={24}
              height={24}
              objectFit="contain"
            />
          </div>
        </Link>
        {isExpanded && (
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-forest/10 z-20"
            onClick={toggleSidebar}
          >
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
                    'flex items-center p-2 rounded-md text-sm tracking-wider text-white uppercase transition-colors hover:bg-forest/10',
                    pathname === item.href && 'bg-forest/20 text-white',
                    !isExpanded && 'justify-center'
                  )}
                >
                  <item.icon className={cn('h-5 w-5', isExpanded && 'mr-2')} />
                  {isExpanded && item.label}
                </Link>
              ) : (
                <>
                  <button
                    onClick={handleApprovalsClick}
                    className={cn(
                      'flex items-center w-full p-2 rounded-md text-sm tracking-wider text-white uppercase transition-colors hover:bg-forest/10',
                      !isExpanded && 'justify-center'
                    )}
                  >
                    <item.icon
                      className={cn('h-5 w-5', isExpanded && 'mr-2')}
                    />
                    {isExpanded && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 transition-transform',
                            isApprovalsExpanded && 'rotate-180'
                          )}
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
                              'flex uppercase items-center p-2 rounded-md text-sm tracking-wider text-white transition-colors hover:bg-forest/10',
                              pathname === subItem.href &&
                                'bg-forest/20 text-white'
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
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-forest/10"
            onClick={toggleSidebar}
          >
            <PanelLeft className="h-4 w-4 text-white" />
          </Button>
        </div>
      )}

      {/* User Menu */}
      {user ? (
        <div className="relative mt-auto z-20 border-t-2 border-white/50 font-dm tracking-wider">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={cn(
              'flex items-center w-full rounded-md text-white bg-black/20 hover:bg-black/30 p-2 transition-colors',
              !isExpanded && 'justify-center'
            )}
          >
            <Image
              src={user?.user_metadata?.picture || '/sidebar_background.webp'}
              alt="User Avatar"
              width={32}
              height={32}
              className={cn('h-8 w-8 rounded-sm mr-2', !isExpanded && 'mr-0')}
            />
            {isExpanded && (
              <>
                <span className="text-sm truncate font-normal">
                  {user?.email}
                </span>
                <ChevronsUpDown className="h-5 w-5 ml-auto" />
              </>
            )}
          </button>
          {/* Floating Sign Out Menu */}
          {isUserMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 1.01 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.1, ease: 'easeIn' }}
              className={cn(
                'absolute bg-black/30 rounded-lg shadow-lg transition-all',
                isExpanded
                  ? 'bottom-[5px] left-[260px] w-64'
                  : 'bottom-[5px] left-[70px] w-64'
              )}
            >
              <ul className="flex flex-col">
                <li>
                  <Button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      router.push('/dashboard/settings');
                    }}
                    variant="ghost"
                    className="flex items-center w-full p-2 text-white hover:bg-black/40 rounded-md transition"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 17a4 4 0 100-8 4 4 0 000 8zm-7-4a7 7 0 1114 0 7 7 0 01-14 0z"
                      />
                    </svg>
                    Settings
                  </Button>
                </li>
                <li>
                  <Button
                    onClick={() => {
                      setIsSigningOut(true);
                      signOut();
                    }}
                    disabled={isSigningOut}
                    variant="ghost"
                    className="flex items-center w-full p-2 text-white hover:bg-black/40 rounded-md transition"
                  >
                    {isSigningOut ? (
                      <Loader2 className="animate-spin text-white" size={20} />
                    ) : (
                      <svg
                        className="h-5 w-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7"
                        />
                      </svg>
                    )}
                    Sign Out
                  </Button>
                </li>
              </ul>
            </motion.div>
          )}
        </div>
      ) : (
        // Skeleton Loader
        <div className="flex flex-col items-center w-full mt-auto p-2 border-t-2 z-20">
          <div className="h-8 w-8 bg-white/70 rounded-sm animate-pulse" />
        </div>
      )}
    </div>
  );
}
