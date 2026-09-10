import { ACADEMIA_DATA } from "@/data/academiaData";
import { aiService } from "@/services/aiService";
import { AlertCircle, Target } from "lucide-react";
import { cn } from "@/utils/cn";

export default function SkillGaps() {
  const { heatmap } = ACADEMIA_DATA;
  const topGaps = aiService.analyzeInstitutionalSkillGaps(heatmap);

  // Helper to determine intensity color
  const getHeatmapColor = (score) => {
    if (score >= 80) return "bg-emerald-500 text-white dark:bg-emerald-600";
    if (score >= 70) return "bg-emerald-300 text-emerald-900 dark:bg-emerald-400/80 dark:text-emerald-950";
    if (score >= 60) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
    if (score >= 50) return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    if (score >= 40) return "bg-orange-200 text-orange-900 dark:bg-orange-900/60 dark:text-orange-200";
    return "bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-200";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Department Skill Heatmap</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Identify exactly where student proficiency is strong and where critical gaps exist across all departments.
        </p>
      </div>

      <div className="rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4">
          <h3 className="font-bold text-slate-900 dark:text-white">Proficiency Matrix (%)</h3>
          <div className="flex gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-emerald-500"></div> High</span>
            <span className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-amber-100 border border-amber-200"></div> Medium</span>
            <span className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-red-200"></div> Low</span>
          </div>
        </div>
        <div className="overflow-x-auto p-6">
          <table className="w-full text-center text-sm">
            <thead>
              <tr>
                <th className="p-3 text-left font-bold text-slate-700 dark:text-slate-300">Skill</th>
                <th className="p-3 font-bold text-slate-700 dark:text-slate-300">CSE</th>
                <th className="p-3 font-bold text-slate-700 dark:text-slate-300">AI & ML</th>
                <th className="p-3 font-bold text-slate-700 dark:text-slate-300">ECE</th>
                <th className="p-3 font-bold text-slate-700 dark:text-slate-300">IT</th>
                <th className="p-3 font-bold text-slate-700 dark:text-slate-300">EEE</th>
              </tr>
            </thead>
            <tbody>
              {heatmap.map(row => (
                <tr key={row.skill}>
                  <td className="p-3 text-left font-semibold text-slate-900 dark:text-white">{row.skill}</td>
                  <td className="p-1.5"><div className={cn("p-3 rounded-md font-bold transition-all hover:scale-105", getHeatmapColor(row.CSE))}>{row.CSE}</div></td>
                  <td className="p-1.5"><div className={cn("p-3 rounded-md font-bold transition-all hover:scale-105", getHeatmapColor(row.AIML))}>{row.AIML}</div></td>
                  <td className="p-1.5"><div className={cn("p-3 rounded-md font-bold transition-all hover:scale-105", getHeatmapColor(row.ECE))}>{row.ECE}</div></td>
                  <td className="p-1.5"><div className={cn("p-3 rounded-md font-bold transition-all hover:scale-105", getHeatmapColor(row.IT))}>{row.IT}</div></td>
                  <td className="p-1.5"><div className={cn("p-3 rounded-md font-bold transition-all hover:scale-105", getHeatmapColor(row.EEE))}>{row.EEE}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Top Institutional Skill Gaps</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topGaps.map((gap, index) => (
            <div key={gap.skill} className="rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-5 shadow-sm relative overflow-hidden">
              <div className={cn("absolute top-0 right-0 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-bl-lg", 
                gap.priority === 'HIGH' ? "bg-red-500 text-white" : "bg-amber-500 text-white"
              )}>
                {gap.priority} PRIORITY
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-xs">{index + 1}</span>
                <h4 className="font-bold text-lg text-slate-900 dark:text-white">{gap.skill}</h4>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Student Average</span>
                  <span className="font-bold">{gap.current}%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 flex items-center gap-1"><Target className="h-4 w-4"/> Industry Target</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{gap.target}%</span>
                </div>
                
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-red-500" /> Gap Size
                  </span>
                  <span className="font-black text-red-600 text-lg">-{gap.gap}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
