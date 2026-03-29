"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  Drama,
  ScanLine,
  Calendar,
  ClipboardList,
  Users,
  Home,
  Ticket,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserPlus,
  Menu,
  X,
  Settings,
  Disc3,
  Store,
  MessageSquareHeart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/lib/types";

interface SidebarProps {
  role: UserRole;
  userName: string;
}

interface MenuItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const menuItems: Partial<Record<UserRole, MenuItem[]>> = {
  admin: [
    { label: "Overview", path: "/dashboard/admin", icon: BarChart3 },
    {
      label: "Tracking",
      path: "/dashboard/admin/tracking",
      icon: TrendingUp,
    },
    { label: "Payments", path: "/dashboard/admin/payments", icon: CreditCard },
    {
      label: "Performances",
      path: "/dashboard/admin/performances",
      icon: Drama,
    },
    { label: "QR Scanner", path: "/dashboard/admin/scanner", icon: ScanLine },
    { label: "Agenda", path: "/dashboard/admin/agenda", icon: Calendar },
    { label: "Survey", path: "/dashboard/admin/survey", icon: FileText },
    {
      label: "Feedback",
      path: "/dashboard/admin/feedback",
      icon: MessageSquareHeart,
    },
    { label: "Stalls", path: "/dashboard/admin/stalls", icon: Store },
    { label: "DJ Poll", path: "/dashboard/admin/poll", icon: Disc3 },
    { label: "Students", path: "/dashboard/admin/students", icon: Users },
    {
      label: "Willingness",
      path: "/dashboard/admin/willingness",
      icon: ClipboardList,
    },
    {
      label: "Coordinators",
      path: "/dashboard/admin/coordinators",
      icon: UserPlus,
    },
  ],
  staff_coordinator: [
    { label: "Overview", path: "/dashboard/coordinator", icon: BarChart3 },
    { label: "Students", path: "/dashboard/coordinator/students", icon: Users },
    {
      label: "Payments",
      path: "/dashboard/coordinator/payments",
      icon: CreditCard,
    },
    {
      label: "QR Scanner",
      path: "/dashboard/coordinator/scanner",
      icon: ScanLine,
    },
    { label: "Stats", path: "/dashboard/coordinator/stats", icon: BarChart3 },
  ],
  overall_student_coordinator: [
    { label: "Overview", path: "/dashboard/coordinator", icon: BarChart3 },
    { label: "Students", path: "/dashboard/coordinator/students", icon: Users },
    {
      label: "Payments",
      path: "/dashboard/coordinator/payments",
      icon: CreditCard,
    },
    {
      label: "QR Scanner",
      path: "/dashboard/coordinator/scanner",
      icon: ScanLine,
    },
    { label: "Stats", path: "/dashboard/coordinator/stats", icon: BarChart3 },
  ],
  class_coordinator: [
    { label: "Overview", path: "/dashboard/coordinator", icon: BarChart3 },
    { label: "Students", path: "/dashboard/coordinator/students", icon: Users },
    {
      label: "Payments",
      path: "/dashboard/coordinator/payments",
      icon: CreditCard,
    },
    // {
    //   label: "QR Scanner",
    //   path: "/dashboard/coordinator/scanner",
    //   icon: ScanLine,
    // },
    { label: "Stats", path: "/dashboard/coordinator/stats", icon: BarChart3 },
  ],
  faculty_coordinator: [
    { label: "Overview", path: "/dashboard/coordinator", icon: BarChart3 },
    { label: "Students", path: "/dashboard/coordinator/students", icon: Users },
    {
      label: "QR Scanner",
      path: "/dashboard/coordinator/scanner",
      icon: ScanLine,
    },
    { label: "Stats", path: "/dashboard/coordinator/stats", icon: BarChart3 },
  ],
  event_head: [
    { label: "Overview", path: "/dashboard/coordinator", icon: BarChart3 },
    { label: "Students", path: "/dashboard/coordinator/students", icon: Users },
    { label: "Stats", path: "/dashboard/coordinator/stats", icon: BarChart3 },
  ],
  technical_coordinator: [
    { label: "Overview", path: "/dashboard/coordinator", icon: BarChart3 },
    {
      label: "QR Scanner",
      path: "/dashboard/coordinator/scanner",
      icon: ScanLine,
    },
    { label: "Stats", path: "/dashboard/coordinator/stats", icon: BarChart3 },
  ],
  discipline_coordinator: [
    { label: "Overview", path: "/dashboard/coordinator", icon: BarChart3 },
    {
      label: "QR Scanner",
      path: "/dashboard/coordinator/scanner",
      icon: ScanLine,
    },
  ],
  student: [
    { label: "Dashboard", path: "/dashboard/student", icon: Home },
    {
      label: "Willingness Form",
      path: "/dashboard/student/willingness",
      icon: ClipboardList,
    },
    { label: "Payment", path: "/dashboard/student/payment", icon: CreditCard },
    {
      label: "Performance",
      path: "/dashboard/student/performance",
      icon: Drama,
    },
    { label: "QR Ticket", path: "/dashboard/student/qr", icon: Ticket },
    { label: "Survey", path: "/dashboard/student/survey", icon: FileText },
    { label: "Settings", path: "/dashboard/student/settings", icon: Settings },
  ],
};

export default function Sidebar({ role, userName }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = menuItems[role] || [];

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setMobileOpen(false);
  };

  const sidebarContent = (isMobile: boolean) => (
    <>
      <div className="p-4 border-b border-border flex items-center justify-between">
        {(isMobile || !collapsed) && (
          <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
            MASS 2K26
          </h2>
        )}
        {isMobile ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="h-8 w-8 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 text-muted-foreground"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <nav className="flex-1 py-2 space-y-1 overflow-y-auto px-2">
        {items.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Button
              key={item.path}
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 ${
                isActive
                  ? "bg-primary/10 text-primary border-r-2 border-primary rounded-r-none"
                  : "text-muted-foreground hover:text-foreground"
              } ${!isMobile && collapsed ? "px-3 justify-center" : ""}`}
              onClick={() => handleNavigate(item.path)}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {(isMobile || !collapsed) && <span>{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      <Separator />
      <div className="p-3">
        {(isMobile || !collapsed) && (
          <p className="text-xs text-muted-foreground mb-2 truncate px-2">
            {userName}
          </p>
        )}
        <Button
          variant="ghost"
          className={`w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 ${
            !isMobile && collapsed ? "px-3 justify-center" : ""
          }`}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {(isMobile || !collapsed) && <span>Logout</span>}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-40 flex items-center px-4 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="h-9 w-9 text-muted-foreground"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="ml-3 text-lg font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
          MASS 2K26
        </h2>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-card border-r border-border z-50 flex flex-col transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent(true)}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-50 flex-col hidden md:flex ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {sidebarContent(false)}
      </aside>
    </>
  );
}
