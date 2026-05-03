import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-dvh">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0 px-4 sm:px-6 lg:pr-6 lg:pl-2 pb-28 lg:pb-10">
          <Topbar />
          <main className="pt-4 lg:pt-2">{children}</main>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
