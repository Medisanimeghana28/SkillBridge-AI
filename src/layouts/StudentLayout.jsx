import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/common/Sidebar";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Menu, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function StudentLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950 sm:px-6 lg:px-8">
          <button 
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md dark:hover:bg-slate-800"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex flex-1 items-center justify-end gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full dark:hover:bg-slate-800 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <ThemeToggle />
            <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300 dark:border-slate-700">
              <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=student`} alt="Avatar" className="h-full w-full object-cover" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
