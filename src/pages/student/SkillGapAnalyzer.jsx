import { useStudentData } from "@/hooks/useStudentData";
import { AlertCircle, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function SkillGapAnalyzer() {
  const { data, loading } = useStudentData();

  if (loading) return <div className="p-8 text-slate-500">Analyzing skill gaps...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Skill Gap Analyzer</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Compare your current capabilities against real industry requirements.
        </p>
      </div>

      {data.skills.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Insufficient Data</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2 mb-4">
            You need to map your skills before we can analyze your gaps.
          </p>
          <Link to="/student/skill-dna" className="text-primary-600 font-medium hover:underline">
            Complete your Skill DNA &rarr;
          </Link>
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center">
          <TrendingUp className="h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Awaiting Industry Dataset</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            SkillBridge AI calculates gaps dynamically based on the latest industry role requirements. Please wait for the admin to import industry demand datasets.
          </p>
        </div>
      )}
    </div>
  );
}
