import { INDUSTRY_DATA } from "@/data/industryData";
import { Button } from "@/components/common/Button";
import { Plus, FileSignature, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cn";

export default function IndustryRequirements() {
  const requirements = INDUSTRY_DATA.requirements;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Skill Requirements</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Define the capabilities required for roles. This signals demand to the Academia portal.
          </p>
        </div>
        <Button className="gap-2 bg-teal-600 hover:bg-teal-700 text-white" onClick={() => alert('Prototype: Create Requirement')}>
          <Plus className="h-4 w-4" /> Add Role Requirement
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {requirements.map(req => (
          <div key={req.id} className="rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <FileSignature className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white leading-tight">{req.role}</h3>
                  <p className="text-sm text-slate-500">{req.department}</p>
                </div>
              </div>
              <span className={cn("px-2 py-1 text-[10px] uppercase font-black tracking-wider rounded", 
                req.priority === 'High' ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              )}>
                {req.priority} Priority
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-6 flex-1">
              <div className="flex-1">
                <p className="text-xs uppercase font-bold text-slate-400 mb-3 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500"/> Required Skills</p>
                <div className="space-y-2">
                  {req.requiredSkills.map(s => (
                    <div key={s} className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between items-center">
                      {s} <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-500">Core</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase font-bold text-slate-400 mb-3 flex items-center gap-1"><Plus className="h-3.5 w-3.5 text-indigo-400"/> Preferred Skills</p>
                <div className="flex flex-wrap gap-2">
                  {req.preferredSkills.map(s => (
                    <span key={s} className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold text-slate-600 dark:text-slate-400">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
