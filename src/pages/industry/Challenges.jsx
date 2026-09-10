import { useState } from "react";
import { INDUSTRY_DATA } from "@/data/industryData";
import { Button } from "@/components/common/Button";
import { Plus, Target, Clock, ShieldCheck } from "lucide-react";

export default function IndustryChallenges() {
  const [challenges, setChallenges] = useState(() => {
    const saved = localStorage.getItem('sb_industry_challenges');
    if (saved) return JSON.parse(saved);
    return INDUSTRY_DATA.defaultChallenges;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Industry Challenges</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Publish real-world problems for students to solve. Completed challenges verify their skills.
          </p>
        </div>
        <Button className="gap-2 bg-teal-600 hover:bg-teal-700 text-white" onClick={() => alert('Prototype: Open Create Challenge Modal')}>
          <Plus className="h-4 w-4" /> Create Challenge
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map(chal => (
          <div key={chal.id} className="rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-5 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-1 rounded mb-2 inline-block">
                  {chal.domain}
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{chal.title}</h4>
              </div>
            </div>
            
            <div className="my-4">
              <p className="text-xs uppercase font-bold text-slate-400 mb-2">Verifies Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {chal.requiredSkills.map(s => <span key={s} className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded dark:bg-slate-800 dark:text-slate-300">{s}</span>)}
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><Target className="h-4 w-4"/> Difficulty</span> <span className="font-semibold text-slate-900 dark:text-slate-300">{chal.difficulty}</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><Clock className="h-4 w-4"/> Duration</span> <span className="font-semibold text-slate-900 dark:text-slate-300">{chal.duration}</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4"/> Participants</span> <span className="font-semibold text-slate-900 dark:text-slate-300">{chal.participants} solving</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
