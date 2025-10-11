"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Wallet,
  CreditCard,
  Receipt,
  ChevronRight,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearUser } from "@/lib/auth";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearUser();
    router.push("/signin");
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/cards", label: "Cards", icon: CreditCard },
    { href: "/transactions", label: "Transactions", icon: Receipt },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {!isCollapsed && isMobile && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 z-40 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-72",
          isMobile && isCollapsed && "-translate-x-full",
          className
        )}
      >
        <div className="flex flex-col h-full">
          <div
            className={cn(
              "p-6 border-b border-gray-100 dark:border-gray-900",
              isCollapsed && "px-4"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              {!isCollapsed && <div className="min-w-0 flex-1"></div>}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={cn(
                  "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors",
                  isCollapsed && "mx-auto"
                )}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                  NuxWallet
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Digital Banking
                </p>
              </div>
            )}
          </div>

          <nav className="flex-1 px-3 pt-4 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => isMobile && setIsCollapsed(true)}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group relative",
                      active
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="text-sm truncate">{item.label}</span>
                    )}
                    {isCollapsed && active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full bg-gray-900 dark:bg-white"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="p-3 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full",
                "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200",
                isCollapsed && "justify-center"
              )}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {isMobile && isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white dark:bg-gray-900 shadow-lg border-2 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
