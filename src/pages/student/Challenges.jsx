import { useStudentData } from "@/hooks/useStudentData";
import { Target } from "lucide-react";

export default function Challenges() {
  const { loading } = useStudentData();

  if (loading) return <div className="p-8 text-slate-500">Loading challenges...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Real-World Challenges</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Complete industry-sponsored challenges to build verified skill evidence.
        </p>
      </div>

      <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Challenges Available</h3>
        <p className="text-slate-500 max-w-md mx-auto mt-2">
          There are currently no challenges posted by industry partners that match your profile.
        </p>
      </div>
    </div>
  );
}
