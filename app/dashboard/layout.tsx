import { RetractableSidebar } from "@/components/dashboard/retractable-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen  font-poppins">
      <RetractableSidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}

