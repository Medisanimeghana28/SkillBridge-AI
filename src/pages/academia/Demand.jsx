import { useAcademiaData } from "@/hooks/useAcademiaData";
import { AlertCircle, TrendingUp, Briefcase, Dna } from "lucide-react";

export default function Demand() {
  const { data, loading } = useAcademiaData();

  if (loading) return <div className="p-8 text-slate-500">Loading industry demand...</div>;

  const { topRoles, topSkills } = data.industryDemand;
  const empty = topRoles.length === 0 && topSkills.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Industry Demand Alignment</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Live hiring demand to keep curriculum relevant.
        </p>
      </div>

      {empty ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center">
          <TrendingUp className="h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Industry Data Available</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            Import industry requirement datasets to map your curriculum alignment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary-500" /> Top hiring roles
            </h3>
            <div className="space-y-2">
              {topRoles.map((r) => (
                <div key={r.role} className="flex items-center justify-between text-sm gap-4">
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{r.role}</span>
                  <span className="text-slate-500 shrink-0">{r.postings} postings</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Dna className="h-5 w-5 text-primary-500" /> Most demanded skills
            </h3>
            <div className="space-y-2">
              {topSkills.map((s) => (
                <div key={s.display} className="flex items-center justify-between text-sm gap-4">
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{s.display}</span>
                  <span className="text-slate-500 shrink-0">{s.count} postings</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {data.skillGaps.length > 0 && (
        <div className="p-4 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/50 dark:text-amber-400 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">
            Largest curriculum gap: {data.skillGaps[0].skill} ({data.skillGaps[0].current}% avg vs 80% bar).
            See Training for a recommended program.
          </p>
        </div>
      )}
    </div>
  );
}
