import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Package, Users, Wallet, LogOut, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import logoBgn from "@/assets/logo-bgn.webp";
interface SidebarProps {
  userRole: "super_admin" | "admin";
}
const menuItems = [{
  title: "Dashboard",
  icon: LayoutDashboard,
  path: "/dashboard",
  roles: ["super_admin", "admin"]
}, {
  title: "Kelola Barang",
  icon: Package,
  path: "/items",
  roles: ["super_admin", "admin"]
}, {
  title: "Kelola Pengguna",
  icon: Users,
  path: "/users",
  roles: ["super_admin"]
}, {
  title: "Kelola Keuangan",
  icon: Wallet,
  path: "/finance",
  roles: ["super_admin", "admin"]
}];
export function Sidebar({
  userRole
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const filteredMenu = menuItems.filter(item => item.roles.includes(userRole));
  return <motion.aside initial={false} animate={{
    width: collapsed ? 80 : 280
  }} transition={{
    duration: 0.3,
    ease: "easeInOut"
  }} className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <motion.div initial={false} animate={{
        opacity: collapsed ? 0 : 1,
        width: collapsed ? 0 : "auto"
      }} className="flex items-center gap-3 overflow-hidden">
          <img src={logoBgn} alt="Logo BGN" className="w-10 h-10 rounded-xl object-contain" />
          <span className="font-bold text-lg text-foreground whitespace-nowrap">SIMBA</span>
        </motion.div>
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="shrink-0 hover:bg-sidebar-accent">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-hidden">
        {filteredMenu.map((item, index) => {
        const isActive = location.pathname === item.path;
        return <motion.div key={item.path} initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: index * 0.05
        }}>
              <Link to={item.path} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200", isActive ? "bg-primary text-primary-foreground shadow-glow" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}>
                <item.icon className="w-5 h-5 shrink-0" />
                <motion.span initial={false} animate={{
              opacity: collapsed ? 0 : 1,
              width: collapsed ? 0 : "auto"
            }} className="font-medium whitespace-nowrap overflow-hidden">
                  {item.title}
                </motion.span>
              </Link>
            </motion.div>;
      })}
      </nav>

      {/* User & Logout */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <Settings className="w-5 h-5 shrink-0" />
          <motion.span initial={false} animate={{
          opacity: collapsed ? 0 : 1,
          width: collapsed ? 0 : "auto"
        }} className="font-medium whitespace-nowrap overflow-hidden">
            Pengaturan
          </motion.span>
        </Link>
        <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut className="w-5 h-5 shrink-0" />
          <motion.span initial={false} animate={{
          opacity: collapsed ? 0 : 1,
          width: collapsed ? 0 : "auto"
        }} className="font-medium whitespace-nowrap overflow-hidden">
            Keluar
          </motion.span>
        </Link>
      </div>
    </motion.aside>;
}