"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Home, PlusCircle, CheckCircle, ChevronDown, PanelLeft, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export function RetractableSidebar() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isApprovalsExpanded, setIsApprovalsExpanded] = useState(true)
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

  const handleApprovalsClick = () => {
    if (!isExpanded) {
      setIsExpanded(true)
      localStorage.setItem("sidebar-expanded", "true")
      setIsApprovalsExpanded(true)
    } else {
      setIsApprovalsExpanded(!isApprovalsExpanded)
    }
  }

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
  ]

  return (
    <div
      className={cn(
        "flex flex-col relative z-20 text-card-foreground transition-all duration-300 ease-in-out shadow-xl shadow-emerald-950/50",
        isExpanded ? "w-64" : "w-20",
      )}
      style={{
        backgroundImage:
          'url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sidebar_background_2.jpg-sN6DJdrmhxfBgom7UawWbmI8R4Nqdq.jpeg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/40 z-10" />

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
                          className={cn("h-4 w-4 transition-transform", isApprovalsExpanded && "transform rotate-180")}
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

      {!isExpanded && (
        <div className="flex justify-center p-4 mt-auto z-20">
          <Button variant="ghost" size="icon" className="hover:bg-forest/10" onClick={toggleSidebar}>
            <PanelLeft className="h-4 w-4 text-white" />
          </Button>
        </div>
      )}
    </div>
  )
}
