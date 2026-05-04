import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-dvh overflow-x-clip w-full">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0 pb-28 lg:pb-10">
          <Topbar />
          <main className="px-4 sm:px-6 lg:pr-6 lg:pl-2 pt-4 lg:pt-2">{children}</main>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
