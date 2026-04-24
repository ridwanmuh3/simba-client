import { ReactNode, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useSidebarStore } from "./use-sidebar-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/features/auth/context";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const DashboardLayout = ({
  children,
  title,
  subtitle,
}: DashboardLayoutProps) => {
  const { collapsed, setCollapsed } = useSidebarStore();
  const isMobile = useIsMobile();
  const auth = useAuth();

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  }, [isMobile, setCollapsed]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar authContext={auth} />
      <div className={collapsed ? "pl-[70px]" : "pl-[280px]"}>
        <main className="p-6">
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
