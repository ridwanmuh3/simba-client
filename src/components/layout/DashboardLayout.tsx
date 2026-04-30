import { ReactNode, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { useSidebarStore } from "./use-sidebar-store";
import { useIsMobile } from "@/hooks/use-mobile.tsx";
import { useAuth } from "@/features/auth/context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import logoBgn from "@/assets/sppg.webp";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const DashboardLayout = ({ children, title, subtitle }: DashboardLayoutProps) => {
  const { collapsed, setCollapsed } = useSidebarStore();
  const isMobile = useIsMobile();
  const auth = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setCollapsed(false);
      setMobileOpen(false);
    }
  }, [isMobile, setCollapsed]);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      {!isMobile && <Sidebar authContext={auth} />}

      {/* Mobile top bar */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 h-14 border-b bg-background flex items-center px-3 gap-3 z-40">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <img src={logoBgn} alt="Logo BGN" className="w-7 h-7 rounded-lg object-contain" />
          <span className="font-bold text-base text-foreground">SIMBA</span>
        </header>
      )}

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[280px]">
          <Sidebar authContext={auth} isMobileDrawer onNavClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Content area */}
      <div className={isMobile ? "pt-14" : collapsed ? "pl-[70px]" : "pl-[280px]"}>
        <main className="p-3 sm:p-6">
          <div key={auth.user?.currentDapurId}>
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h1>
              {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
