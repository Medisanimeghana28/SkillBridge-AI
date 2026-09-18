import { useAcademiaData } from "@/hooks/useAcademiaData";
import { AlertCircle } from "lucide-react";

export default function SkillGaps() {
  const { data, loading } = useAcademiaData();

  if (loading) return <div className="p-8 animate-pulse text-slate-500">Loading skill gap data...</div>;

  const max = Math.max(1, ...data.skillGaps.map((g) => g.gap));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Department Skill Heatmap</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Average student proficiency vs the 80% industry bar, for the most demanded skills.
        </p>
      </div>

      {data.skillGaps.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Insufficient Data for Heatmap</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            Import student skill datasets and industry requirements to automatically generate the institutional skill gap heatmap.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="space-y-4">
            {data.skillGaps.map((g) => (
              <div key={g.skill}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {g.skill}
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      {g.current}% avg · {g.demand} postings · {g.students} students
                    </span>
                  </span>
                  <span className={`font-semibold ${g.gap > 30 ? "text-red-600 dark:text-red-400" : g.gap > 15 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {g.gap > 0 ? `-${g.gap}` : "met"}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                  <div className="h-full bg-emerald-500" style={{ width: `${g.current}%` }} />
                  <div className="h-full bg-red-400/70" style={{ width: `${Math.round((g.gap / max) * (100 - g.current))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
