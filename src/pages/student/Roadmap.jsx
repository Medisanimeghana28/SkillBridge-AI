import { useStudentData } from "@/hooks/useStudentData";
import { Map, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Roadmap() {
  const { data, loading } = useStudentData();

  if (loading) return <div className="p-8 text-slate-500">Generating roadmap...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">AI Learning Roadmap</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Your personalized path to bridge skill gaps and achieve placement readiness.
        </p>
      </div>

      {data.skills.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Map className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Roadmap Available</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2 mb-4">
            We need to understand your current skills before we can map your journey.
          </p>
          <Link to="/student/skill-dna" className="text-primary-600 font-medium hover:underline flex items-center justify-center gap-1">
            Build your Skill DNA <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Map className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Roadmap Engine Awaiting Data</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            Dynamic roadmaps require industry requirement datasets to identify target benchmarks. Check back once your institution integrates the ecosystem data.
          </p>
        </div>
      )}
    </div>
  );
}
