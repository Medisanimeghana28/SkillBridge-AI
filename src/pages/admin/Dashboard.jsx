import { useState, useEffect } from 'react';
import { adminAnalyticsService } from '@/services/adminAnalyticsService';
import { 
  Users, CheckCircle2, Building, Briefcase, Target, ShieldCheck, 
  TrendingUp, Activity, Database
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const kpis = await adminAnalyticsService.getGlobalKPIs();
        setData({ kpis });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Loading ecosystem data...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Ecosystem Overview</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            Monitor real-time statistics across the SkillBridge platform.
          </p>
        </div>
        <Link to="/admin/datasets" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2">
          <Database className="h-4 w-4" /> Manage Datasets
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/30 rounded-lg"><Users className="h-6 w-6" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Students</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{data?.kpis?.totalStudents || 0}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 rounded-lg"><Building className="h-6 w-6" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Industry Partners</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{data?.kpis?.industryPartners || 0}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 rounded-lg"><CheckCircle2 className="h-6 w-6" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Verified Skills</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{data?.kpis?.verifiedSkills || 0}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-purple-100 text-purple-600 dark:bg-purple-900/30 rounded-lg"><Target className="h-6 w-6" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Challenges</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{data?.kpis?.activeChallenges || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center">
        <Activity className="h-16 w-16 text-slate-200 dark:text-slate-800 mb-4" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Ecosystem Awaiting Data</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          No advanced analytics available yet. Import a dataset to generate institutional skill gaps, industry demand radars, and readiness distributions.
        </p>
      </div>
    </div>
  );
}
