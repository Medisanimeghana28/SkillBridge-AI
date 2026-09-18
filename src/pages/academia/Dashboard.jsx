import { Users, GraduationCap, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAcademiaData } from '@/hooks/useAcademiaData';
import { Link } from 'react-router-dom';

export default function AcademiaDashboard() {
  const { user } = useAuth();
  const { data, loading } = useAcademiaData();

  const cards = [
    { icon: Users, label: 'Total Students', value: loading ? '—' : data.studentCount },
    { icon: GraduationCap, label: 'Verified Skills', value: loading ? '—' : data.readiness.verified },
    { icon: TrendingUp, label: 'Avg Readiness', value: loading ? '—' : `${data.readiness.avg}%` },
    {
      icon: AlertTriangle,
      label: 'Critical Gaps',
      value: loading ? '—' : data.skillGaps.filter((g) => g.gap > 30).length,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          Welcome back, {user?.profile?.institution_name || 'Academia'}
        </h1>
        <p className="mt-1 text-slate-500">Overview of student performance and industry alignment.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 text-slate-500 mb-2"><c.icon className="h-5 w-5" /> {c.label}</div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{c.value}</p>
          </div>
        ))}
      </div>

      {!loading && data.skillGaps.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white">Top curriculum gaps</h3>
            <Link to="/academia/skill-gaps" className="text-sm font-medium text-primary-600 hover:underline">
              Full heatmap →
            </Link>
          </div>
          <div className="space-y-2">
            {data.skillGaps.slice(0, 5).map((g) => (
              <div key={g.skill} className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">{g.skill}</span>
                <span className="text-slate-500">{g.current}% avg · gap {g.gap}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        !loading && (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center">
            <h3 className="text-xl font-bold mb-2 text-slate-700 dark:text-slate-200">No Student Records Found</h3>
            <p className="text-slate-500">Import student datasets to generate the skill gap heatmap and industry alignment analytics.</p>
          </div>
        )
      )}
    </div>
  );
}
