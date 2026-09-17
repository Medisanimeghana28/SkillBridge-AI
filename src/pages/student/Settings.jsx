import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/common/Button";
import { Moon, Sun, Monitor } from "lucide-react";

export default function StudentSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
      
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Appearance</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Customize the UI theme for your workspace.</p>
          
          <div className="flex gap-4">
            <Button 
              variant={theme === 'light' ? 'primary' : 'outline'} 
              onClick={() => setTheme('light')}
              className="gap-2"
            >
              <Sun className="h-4 w-4" /> Light
            </Button>
            <Button 
              variant={theme === 'dark' ? 'primary' : 'outline'} 
              onClick={() => setTheme('dark')}
              className="gap-2"
            >
              <Moon className="h-4 w-4" /> Dark
            </Button>
            <Button 
              variant={theme === 'system' ? 'primary' : 'outline'} 
              onClick={() => setTheme('system')}
              className="gap-2"
            >
              <Monitor className="h-4 w-4" /> System
            </Button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Prototype Data Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Settings specific to this prototype environment. Note: Global reset is available in the Admin dashboard.
          </p>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20" onClick={() => {
            if(window.confirm('Clear all your local progress?')) {
              localStorage.removeItem('sb_completed_challenges');
              localStorage.removeItem('sb_applications');
              window.location.reload();
            }
          }}>
            Clear Student Progress
          </Button>
        </div>
      </div>
    </div>
  );
}
