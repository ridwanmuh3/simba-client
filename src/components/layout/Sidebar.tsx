import { Link, useLocation } from "react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Users,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import logoBgn from "@/assets/sppg.webp";
import { AuthContextType } from "@/types/auth";
import LogoutDialog from "../LogoutDialog";
import { useSidebarStore } from "@/stores/use-sidebar-store";

interface SidebarProps {
  authContext: AuthContextType;
}

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    roles: ["Super Admin", "Admin"],
  },
  {
    title: "Kelola Barang",
    icon: Package,
    path: "/items",
    roles: ["Super Admin", "Admin"],
  },
  {
    title: "Kelola Pengguna",
    icon: Users,
    path: "/users",
    roles: ["Super Admin"],
  },
  {
    title: "Kelola Keuangan",
    icon: Wallet,
    path: "/finance",
    roles: ["Super Admin", "Admin"],
  },
];

const Sidebar = ({ authContext }: SidebarProps) => {
  const { collapsed, toggleCollapse } = useSidebarStore();
  const location = useLocation();
  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(authContext.user.role),
  );
  return (
    <motion.aside
      initial={false}
      animate={{
        width: collapsed ? 70 : 280,
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
      className={cn(
        collapsed ? "w-[70px]" : "w-[280px]",
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50",
      )}
    >
      <div
        className={cn(
          "h-16 flex items-center px-4 border-b border-sidebar-border",
          collapsed ? "" : "justify-between",
        )}
      >
        <motion.div
          initial={false}
          animate={{
            opacity: collapsed ? 0 : 1,
            width: collapsed ? 0 : "auto",
          }}
          className="flex items-center gap-3 overflow-hidden"
        >
          <img
            src={logoBgn}
            alt="Logo BGN"
            className="w-10 h-10 rounded-xl object-contain"
          />
          <span className="font-bold text-lg text-foreground whitespace-nowrap">
            SIMBA
          </span>
        </motion.div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className="shrink-0 hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-hidden">
        {filteredMenu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed ? "gap-0" : "gap-3",
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <motion.span
                  initial={false}
                  animate={{
                    opacity: collapsed ? 0 : 1,
                    width: collapsed ? 0 : "auto",
                  }}
                  className="font-medium whitespace-nowrap overflow-hidden"
                >
                  {item.title}
                </motion.span>
              </Link>
            </div>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <Settings className="w-5 h-5 shrink-0" />
          <motion.span
            initial={false}
            animate={{
              opacity: collapsed ? 0 : 1,
              width: collapsed ? 0 : "auto",
            }}
            className="font-medium whitespace-nowrap overflow-hidden"
          >
            Pengaturan
          </motion.span>
        </Link>
        <LogoutDialog
          collapsedSidebar={collapsed}
          logoutHandler={authContext.logout}
        />
      </div>
    </motion.aside>
  );
};

export default Sidebar;
