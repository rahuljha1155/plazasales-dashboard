"use client";

import { useState, useEffect } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import LoadingScreen from "./dashboard/loading";
import Sidebar from "./dashboard/sidebar";
import Navbar from "./dashboard/navbar";
import { useUserStore } from "@/store/userStore";
import api from "@/services/api";

export default function Layout() {
  const location = useLocation();
  const pathname = location.pathname;
  const router = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLogingOut, setIsLogingOut] = useState<boolean>(false);
  const [unreadCount] = useState(0);
  const [access, setAccess] = useState(false);
  const { isAuthenticated, logout } = useUserStore()


  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const handleLogout = async () => {
    setIsLogingOut(true);
    localStorage.removeItem("accessToken");
    logout()
    toast.success("You have been signed out successfully.");
    await api.delete('/auth/logout')
    router("/");
    setIsLogingOut(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      setAccess(true);
    } else {
      setAccess(false);
      router("/");
    }
  }, [router]);

  useEffect(() => {
    // Sidebar collapsed state changed
  }, [sidebarCollapsed])


  if (!access) {
    return <LoadingScreen />;
  }


  return (
    <div className="min-h-screen w-full flex overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} pathname={pathname} />

      <div
        className={cn(
          " gap-0 transition-all duration-300 ease-in-out",
        )}
        style={{
          marginLeft: sidebarCollapsed ? "4rem" : "15rem",
          width: sidebarCollapsed ? "calc(100% - 4rem)" : "calc(100% - 15rem)",
        }}
      >
        <Navbar
          onToggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
          unreadCount={unreadCount}
          isLogingOut={isLogingOut}
          handleLogout={handleLogout}
          pathname={pathname}
        />
        <main className="p-6 overflow-auto hide-scrollbar">
          <Outlet key={sidebarCollapsed ? 'collapsed' : 'expanded'} />
        </main>
      </div>
    </div>
  );
}
