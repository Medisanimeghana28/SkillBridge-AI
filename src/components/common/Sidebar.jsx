import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  Dna, 
  TrendingDown, 
  Map, 
  Briefcase, 
  Trophy, 
  FileText, 
  BadgeCheck, 
  User, 
  Settings,
  LogOut,
  BrainCircuit,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { path: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/student/skills", label: "Skill DNA", icon: Dna },
  { path: "/student/skill-gap", label: "Skill Gap", icon: TrendingDown },
  { path: "/student/roadmap", label: "Career Roadmap", icon: Map },
  { path: "/student/internships", label: "Internships", icon: Briefcase },
  { path: "/student/challenges", label: "Industry Challenges", icon: Trophy },
  { path: "/student/applications", label: "Applications", icon: FileText },
  { path: "/student/passport", label: "Verified Passport", icon: BadgeCheck },
  { path: "/student/profile", label: "Profile", icon: User },
  { path: "/student/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-950 lg:static lg:translate-x-0 flex flex-col",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <BrainCircuit className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              SkillBridge
            </span>
          </div>
          <button 
            className="lg:hidden text-slate-500 hover:text-slate-900 dark:hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
