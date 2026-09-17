import { useState } from "react";
import { useIndustryData } from "@/hooks/useIndustryData";
import { Target, Plus, Users, Clock } from "lucide-react";
import { Button } from "@/components/common/Button";

export default function Challenges() {
  const { data, loading } = useIndustryData();

  if (loading) return <div className="p-8 text-slate-500">Loading challenges...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Real-World Challenges</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Post technical challenges to evaluate students on actual industry problems.
          </p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Create Challenge</Button>
      </div>

      {data.challenges.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Challenges Active</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            You haven't published any challenges yet. Create a challenge to test student skills in the real world.
          </p>
          <Button className="mt-4 gap-2 mx-auto"><Plus className="h-4 w-4" /> Create First Challenge</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.challenges.map(challenge => (
            <div key={challenge.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col shadow-sm">
              <div className="mb-4">
                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-2.5 py-1 rounded-full mb-3 inline-block">
                  {challenge.domain || 'General'}
                </span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{challenge.title}</h3>
                <div className="flex flex-wrap gap-3 text-sm text-slate-500 mt-3">
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {challenge.duration || 'Flexible'}</span>
                  <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> 0 Submissions</span>
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md text-xs font-medium">Active</span>
                <Button variant="outline" size="sm">View Submissions</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
