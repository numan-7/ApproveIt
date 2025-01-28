"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Home, PlusCircle, CheckCircle } from "lucide-react"
import { PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export function RetractableSidebar() {
  const [isExpanded, setIsExpanded] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-expanded")
    if (savedState !== null) {
      setIsExpanded(savedState === "true")
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !isExpanded
    setIsExpanded(newState)
    localStorage.setItem("sidebar-expanded", newState.toString())
  }

  const menuItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/dashboard/create", icon: PlusCircle, label: "Create Approvals" },
    // { href: "/dashboard/approvals", icon: CheckCircle, label: "Approvals" },
  ]

  return (
    <div
      className={cn(
        "flex flex-col relative z-20 text-card-foreground transition-all duration-300 ease-in-out shadow-xl shadow-emerald-950/50",
        isExpanded ? "w-64" : "w-20"
      )}
      style={{
        backgroundImage: "url('/sidebar_background_2.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >

      <div className="absolute inset-0 bg-black/40 z-10" />

      <div
        className={cn(
          "flex items-center p-4 z-20",
          isExpanded ? "justify-between" : "justify-center"
        )}
      >
        <Link href="/">
          <div
            className={cn(
              "flex h-8 items-center transition-all duration-300",
              !isExpanded && "justify-center"
            )}
          >
            <img
              src="/logo.svg"
              alt="ApproveIt"
              className="h-full w-full object-contain"
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

      {/* Navigation Menu */}
      <nav className="flex-1 z-20">
        <ul className="space-y-2 px-2">
          {menuItems.map((item) => (
            <li key={item.href}>
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
            </li>
          ))}
        </ul>
      </nav>



      {/* Bottom Toggle Button */}
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
    </div>
  )
}
