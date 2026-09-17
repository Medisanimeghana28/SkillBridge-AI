import { Users, GraduationCap, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AcademiaDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          Welcome back, {user?.profile?.institution_name || 'Academia'}
        </h1>
        <p className="mt-1 text-slate-500">Overview of student performance and industry alignment.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2"><Users className="h-5 w-5" /> Total Students</div>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2"><GraduationCap className="h-5 w-5" /> Verified Skills</div>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2"><TrendingUp className="h-5 w-5" /> Avg Readiness</div>
          <p className="text-2xl font-bold">0%</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2"><AlertTriangle className="h-5 w-5" /> Critical Gaps</div>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center">
        <h3 className="text-xl font-bold mb-2 text-slate-700 dark:text-slate-200">No Student Records Found</h3>
        <p className="text-slate-500">Import student datasets to generate the skill gap heatmap and industry alignment analytics.</p>
      </div>
    </div>
  );
}
