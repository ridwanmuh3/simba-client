import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Package,
  Users,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ChefHat,
  ChevronsUpDown,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import logoBgn from "@/assets/sppg.webp";
import { AuthContextType } from "@/features/auth/types";
import type { AuthUser } from "@/features/auth/types";
import LogoutDialog from "../shared/LogoutDialog";
import { useSidebarStore } from "./use-sidebar-store";
import { UserRole } from "@/features/users/types";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useGetDapurs, useSelectDapurMutation } from "@/features/dapur/api";
import { queryClient } from "@/core/query/client";
import { queryKeys } from "@/core/query/keys";
import { toast } from "@/hooks/use-toast";
import { isAxiosError } from "axios";

interface SidebarProps {
  authContext: AuthContextType;
  /** When true: renders as a plain div (for mobile Sheet), shows full labels, no collapse toggle */
  isMobileDrawer?: boolean;
  onNavClick?: () => void;
}

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    title: "Kelola Bahan",
    icon: Package,
    path: "/items",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    title: "Kelola Pengguna",
    icon: Users,
    path: "/users",
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    title: "Kelola Dapur",
    icon: ChefHat,
    path: "/dapurs",
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    title: "Kelola Keuangan",
    icon: Wallet,
    path: "/finance",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
];

const Sidebar = ({ authContext, isMobileDrawer = false, onNavClick }: SidebarProps) => {
  const { collapsed, toggleCollapse } = useSidebarStore();
  const isExpanded = isMobileDrawer || !collapsed;
  const location = useLocation();
  const navigate = useNavigate();
  const { data: dapurs } = useGetDapurs();
  const selectMutation = useSelectDapurMutation();
  const [dapurOpen, setDapurOpen] = useState(false);
  const [switching, setSwitching] = useState<number | null>(null);

  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(authContext.user.role),
  );

  const activeDapurs = dapurs?.filter((d) => d.isActive) ?? [];
  const currentDapur = activeDapurs.find(
    (d) => d.id === authContext.user?.currentDapurId,
  );

  const handleSwitchDapur = async (dapurId: number) => {
    if (dapurId === authContext.user?.currentDapurId) {
      setDapurOpen(false);
      return;
    }
    setSwitching(dapurId);
    try {
      await selectMutation.mutateAsync({ dapur_id: dapurId });
      // Invalidate all dapur-scoped cache so previous dapur's data doesn't bleed through
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0] as string;
          return key !== "authUser" && key !== "dapurs";
        },
      });
      queryClient.setQueryData<AuthUser>(queryKeys.auth.current, (old) =>
        old ? { ...old, currentDapurId: dapurId } : old,
      );
      setDapurOpen(false);
      navigate("/dashboard");
    } catch (e) {
      let msg = "Gagal mengganti dapur.";
      if (isAxiosError(e) && e.response?.status === 403)
        msg = "Dapur tidak aktif.";
      toast({ title: "Gagal", description: msg, variant: "destructive" });
    } finally {
      setSwitching(null);
    }
  };

  const dapurTriggerCollapsed = (
    <PopoverTrigger asChild>
      <button
        title={currentDapur?.name ?? "Pilih Dapur"}
        className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
      >
        <ChefHat className="w-4 h-4 text-primary" />
      </button>
    </PopoverTrigger>
  );

  const dapurTriggerExpanded = (
    <PopoverTrigger asChild>
      <button className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-sidebar-accent transition-colors text-left">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <ChefHat className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground leading-none mb-0.5">
            Dapur Aktif
          </p>
          <p className="text-sm font-medium text-foreground truncate leading-tight">
            {currentDapur?.name ?? "—"}
          </p>
        </div>
        <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
      </button>
    </PopoverTrigger>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border justify-between">
        <div className={cn("flex items-center gap-3 overflow-hidden", !isExpanded && "invisible w-0")}>
          <img src={logoBgn} alt="Logo BGN" width={40} height={40} className="w-10 h-10 rounded-xl object-contain" />
          <span className="font-bold text-lg text-foreground whitespace-nowrap">SIMBA</span>
        </div>
        {!isMobileDrawer && (
          <Button variant="ghost" size="icon" onClick={toggleCollapse} className="shrink-0 hover:bg-sidebar-accent">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {/* Dapur switcher */}
      <div className={cn("px-3 py-2 border-b border-sidebar-border", !isExpanded && "flex justify-center")}>
        <Popover open={dapurOpen} onOpenChange={setDapurOpen}>
          {isExpanded ? dapurTriggerExpanded : dapurTriggerCollapsed}
          <PopoverContent className="w-52 p-1" side="right" align="start" sideOffset={8}>
            {activeDapurs.length === 0 ? (
              <p className="text-xs text-muted-foreground px-3 py-2">Tidak ada dapur aktif</p>
            ) : (
              activeDapurs.map((d) => {
                const isCurrent = d.id === authContext.user?.currentDapurId;
                const isLoading = switching === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => handleSwitchDapur(d.id)}
                    disabled={switching !== null}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
                      isCurrent ? "bg-primary/10 text-primary font-medium" : "hover:bg-accent text-foreground",
                    )}
                  >
                    <span className="w-4 flex-shrink-0 flex items-center justify-center">
                      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isCurrent ? <Check className="w-3.5 h-3.5" /> : null}
                    </span>
                    <span className="truncate">{d.name}</span>
                  </button>
                );
              })
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filteredMenu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavClick}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isExpanded ? "gap-3" : "gap-0 justify-center",
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {isExpanded && (
                <span className="font-medium whitespace-nowrap">{item.title}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border">
        <div className={cn("p-3 flex items-center", isExpanded ? "gap-3" : "justify-center")}>
          <Avatar className="w-9 h-9 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
              {authContext.user.fullname.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          {isExpanded && (
            <div className="overflow-hidden min-w-0">
              <p className="font-semibold text-sm text-foreground whitespace-nowrap truncate leading-tight">
                {authContext.user.fullname}
              </p>
              <p className="text-xs text-muted-foreground whitespace-nowrap truncate leading-tight">
                {authContext.user.role}
              </p>
            </div>
          )}
        </div>
        <div className="px-3 pb-3">
          <LogoutDialog collapsedSidebar={!isExpanded} logoutHandler={authContext.logout} />
        </div>
      </div>
    </div>
  );

  if (isMobileDrawer) return sidebarContent;

  return (
    <aside
      className={cn(
        collapsed ? "w-[70px]" : "w-[280px]",
        "fixed left-0 top-0 h-screen border-r border-sidebar-border z-50 transition-[width] duration-300 ease-in-out",
      )}
    >
      {sidebarContent}
    </aside>
  );
};

export default Sidebar;
