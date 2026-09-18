import { useEffect, useState } from 'react';
import { Briefcase, Target, Users, FileSignature } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Link } from 'react-router-dom';

export default function IndustryDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ internships: 0, challenges: 0, applications: 0, requirements: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchStats() {
      if (!user) return;
      try {
        const [internships, challenges, reqs] = await Promise.all([
          supabase.from('internships').select('id', { count: 'exact', head: true }).eq('industry_id', user.id).eq('status', 'Open'),
          supabase.from('challenges').select('id', { count: 'exact', head: true }).eq('industry_id', user.id),
          supabase.from('industry_requirements').select('id', { count: 'exact', head: true }).eq('industry_id', user.id),
        ]);
        const { data: myInternships } = await supabase
          .from('internships')
          .select('id')
          .eq('industry_id', user.id);
        let appCount = 0;
        if (myInternships?.length > 0) {
          const { count } = await supabase
            .from('applications')
            .select('id', { count: 'exact', head: true })
            .in('internship_id', myInternships.map((i) => i.id));
          appCount = count || 0;
        }
        if (!cancelled) {
          setStats({
            internships: internships.count || 0,
            challenges: challenges.count || 0,
            applications: appCount,
            requirements: reqs.count || 0,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchStats();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const cards = [
    { icon: Briefcase, label: 'Open Internships', value: stats.internships, link: '/industry/jobs' },
    { icon: Target, label: 'Active Challenges', value: stats.challenges, link: '/industry/challenges' },
    { icon: Users, label: 'Applications', value: stats.applications, link: '/industry/jobs' },
    { icon: FileSignature, label: 'Role Requirements', value: stats.requirements, link: '/industry/requirements' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          {user?.profile?.company_name || 'Industry Partner'} Dashboard
        </h1>
        <p className="mt-1 text-slate-500">Track your talent pipeline, internships, and skill challenges.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.link} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary-300 transition-colors">
            <div className="flex items-center gap-3 text-slate-500 mb-2"><c.icon className="h-5 w-5" /> {c.label}</div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{loading ? '—' : c.value}</p>
          </Link>
        ))}
      </div>

      {!loading && stats.internships === 0 && stats.challenges === 0 && (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center">
          <h3 className="text-xl font-bold mb-2 text-slate-700 dark:text-slate-200">No Pipeline Data</h3>
          <p className="text-slate-500 mb-4">You haven't posted any internships or challenges yet.</p>
          <div className="flex gap-4">
            <Link to="/industry/jobs" className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm">Post Internship</Link>
            <Link to="/industry/challenges" className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm">Create Challenge</Link>
          </div>
        </div>
      )}
    </div>
  );
}
