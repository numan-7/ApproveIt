import { RetractableSidebar } from '@/components/dashboard/retractable-sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen  font-dm relative ">
      <RetractableSidebar />
      <main className="ml-16 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
