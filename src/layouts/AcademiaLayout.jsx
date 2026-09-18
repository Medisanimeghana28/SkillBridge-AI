import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import ThemeToggle from '@/components/common/ThemeToggle';
import { 
  LayoutDashboard, Users, Activity, TrendingUp, BookOpen, 
  FileBarChart, Settings, LogOut, Menu, School
} from 'lucide-react';
import NotificationBell from '@/components/common/NotificationBell';
import { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/academia/dashboard', icon: LayoutDashboard },
  { name: 'Students', path: '/academia/students', icon: Users },
  { name: 'Skill Gaps', path: '/academia/skill-gaps', icon: Activity },
  { name: 'Industry Demand', path: '/academia/demand', icon: TrendingUp },
  { name: 'Training', path: '/academia/training', icon: BookOpen },
  { name: 'Reports', path: '/academia/reports', icon: FileBarChart },
];

export default function AcademiaLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-200">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <School className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold text-lg text-slate-900 dark:text-white">Academia<span className="text-indigo-600 dark:text-indigo-400">Hub</span></span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:sticky top-0 h-screen w-64 bg-indigo-950 dark:bg-slate-900 border-r border-indigo-900 dark:border-slate-800 flex flex-col z-40 transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 hidden md:flex items-center gap-2">
          <School className="h-8 w-8 text-indigo-400" />
          <span className="font-bold text-xl text-white">SkillBridge <span className="text-indigo-400 font-normal">Academia</span></span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname === '/academia' && item.path === '/academia/dashboard');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-indigo-600 text-white shadow-md dark:bg-indigo-600/30 dark:text-indigo-300" 
                    : "text-indigo-200 hover:bg-indigo-900 hover:text-white dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-white dark:text-indigo-400" : "text-indigo-400 dark:text-slate-500")} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-indigo-900 dark:border-slate-800 space-y-2">
          <Link to="/academia/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-200 hover:bg-indigo-900 hover:text-white transition-colors dark:text-slate-400 dark:hover:bg-slate-800">
            <Settings className="h-5 w-5 text-indigo-400 dark:text-slate-500" /> Settings
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-300 hover:bg-rose-900/50 hover:text-rose-200 transition-colors dark:text-rose-400 dark:hover:bg-rose-950/30">
            <LogOut className="h-5 w-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Desktop Navbar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">CMR Institute of Technology</span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <ThemeToggle />
            <div className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 dark:bg-indigo-900 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm">
              CM
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-8 flex-1 w-full max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
