import { ReactNode, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSidebarStore } from "./use-sidebar-store";
import { useAuth } from "@/features/auth/context";
import { useIsMobile } from "@/hooks/use-mobile";

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
        <header className="sticky top-0 z-40 h-16 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="h-full px-6 flex items-center justify-end">
            {/* <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari..."
                  className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
                />
              </div>
            </div> */}
            <div className="flex items-center gap-3">
              {/* <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
              </Button> */}
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {auth.user.fullname
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium hidden sm:inline">
                  {auth.user.fullname}
                </span>
              </Button>
            </div>
          </div>
        </header>
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
