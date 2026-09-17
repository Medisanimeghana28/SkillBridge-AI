import { useState } from "react";
import { useIndustryData } from "@/hooks/useIndustryData";
import { Briefcase, MapPin, Users, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/common/Button";

export default function Jobs() {
  const { data, loading } = useIndustryData();

  if (loading) return <div className="p-8 text-slate-500">Loading internships...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Internships</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Post opportunities to find verified talent from the student ecosystem.
          </p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Post Internship</Button>
      </div>

      {data.internships.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Internships Posted</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            You haven't created any internship opportunities yet. Post an internship to start receiving applications.
          </p>
          <Button className="mt-4 gap-2 mx-auto"><Plus className="h-4 w-4" /> Create First Internship</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.internships.map(job => (
            <div key={job.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col shadow-sm">
              <div className="mb-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{job.title}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                  <MapPin className="h-4 w-4" /> {job.location} ({job.work_mode})
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-slate-400" /> 0 Applications
                </span>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
