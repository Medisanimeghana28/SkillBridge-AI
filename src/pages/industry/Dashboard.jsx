import { Briefcase, Target, Users, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

export default function IndustryDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          {user?.profile?.company_name || 'Industry Partner'} Dashboard
        </h1>
        <p className="mt-1 text-slate-500">Track your talent pipeline, internships, and skill challenges.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2"><Briefcase className="h-5 w-5" /> Open Internships</div>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2"><Target className="h-5 w-5" /> Active Challenges</div>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2"><Users className="h-5 w-5" /> Applications</div>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2"><Search className="h-5 w-5" /> Matched Candidates</div>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center">
        <h3 className="text-xl font-bold mb-2 text-slate-700 dark:text-slate-200">No Pipeline Data</h3>
        <p className="text-slate-500 mb-4">You haven't posted any internships or challenges yet.</p>
        <div className="flex gap-4">
          <Link to="/industry/jobs" className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm">Post Internship</Link>
          <Link to="/industry/challenges" className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm">Create Challenge</Link>
        </div>
      </div>
    </div>
  );
}
