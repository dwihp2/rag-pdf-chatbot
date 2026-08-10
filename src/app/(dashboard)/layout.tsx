import { AuthGuard } from "@/components/auth/auth-guard";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { FloatingChat } from "@/components/chat/floating-chat";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen">
        <AppSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
        <FloatingChat />
      </div>
    </AuthGuard>
  );
}
