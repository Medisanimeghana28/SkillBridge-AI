import { useState } from "react";
import { useIndustryData } from "@/hooks/useIndustryData";
import { Settings2, Plus, Database } from "lucide-react";
import { Button } from "@/components/common/Button";

export default function Requirements() {
  const { data, loading } = useIndustryData();

  if (loading) return <div className="p-8 text-slate-500">Loading requirements...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Role Requirements</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Define the exact skills your company needs. This data shapes the academic curriculum.
          </p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add Requirement</Button>
      </div>

      {data.requirements.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Database className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Requirements Defined</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            Add role requirements to tell the ecosystem exactly what skills you are looking for in graduates.
          </p>
          <Button className="mt-4 gap-2 mx-auto"><Plus className="h-4 w-4" /> Define First Role</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.requirements.map(req => (
            <div key={req.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">{req.role_name}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {Array.isArray(req.skills) && req.skills.map((skill, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-medium border border-slate-200 dark:border-slate-700">
                    {skill}
                  </span>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full">Edit Role Config</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
