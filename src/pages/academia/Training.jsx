import { useAcademiaData } from "@/hooks/useAcademiaData";
import { BookOpen, Clock, Target } from "lucide-react";

export default function Training() {
  const { data, loading } = useAcademiaData();

  if (loading) return <div className="p-8 text-slate-500">Loading training recommendations...</div>;

  const programs = data.skillGaps.slice(0, 4).map((g, i) => ({
    title: `${g.skill} Bootcamp`,
    reason: `${g.skill} averages ${g.current}% against the 80% industry bar across ${g.students} students, with demand in ${g.demand} postings.`,
    weeks: Math.max(2, Math.ceil(g.gap / 10)),
    level: g.gap > 30 ? "Foundations → Applied" : "Applied → Advanced",
    rank: i + 1,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">AI Training Recommendations</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Programs generated from the gap between student proficiency and live industry demand.
        </p>
      </div>

      {programs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Recommendations Available</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            SkillBridge AI needs sufficient student profiles and industry requirements to generate curriculum recommendations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map((p) => (
            <div key={p.title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400 px-2.5 py-1 rounded-full">
                  Priority #{p.rank}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="h-3.5 w-3.5" /> ~{p.weeks} weeks
                </span>
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{p.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{p.reason}</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Target className="h-4 w-4 text-primary-500" /> {p.level}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
