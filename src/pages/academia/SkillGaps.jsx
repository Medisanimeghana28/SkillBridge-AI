import { useAcademiaData } from "@/hooks/useAcademiaData";
import { AlertCircle, Target } from "lucide-react";
import { cn } from "@/utils/cn";

export default function SkillGaps() {
  const { data, loading } = useAcademiaData();

  if (loading) return <div className="p-8 animate-pulse text-slate-500">Loading skill gap data...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Department Skill Heatmap</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Identify exactly where student proficiency is strong and where critical gaps exist across all departments.
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
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          {/* Heatmap implementation would go here once dataset is populated */}
        </div>
      )}
    </div>
  );
}
