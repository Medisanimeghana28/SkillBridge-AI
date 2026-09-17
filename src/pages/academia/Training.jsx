import { useState } from "react";
import { useAcademiaData } from "@/hooks/useAcademiaData";
import { AlertCircle, Target, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/common/Button";

export default function Training() {
  const { data, loading } = useAcademiaData();
  const [recommendations, setRecommendations] = useState([]);

  if (loading) return <div className="p-8 text-slate-500">Loading training recommendations...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">AI Training Recommendations</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Curriculum adjustments and training programs suggested by SkillBridge AI based on the industry demand gap.
        </p>
      </div>

      {data.industryDemand.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Recommendations Available</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            SkillBridge AI needs sufficient student profiles and industry requirements to generate curriculum recommendations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Render real recommendations when data is present */}
        </div>
      )}
    </div>
  );
}
