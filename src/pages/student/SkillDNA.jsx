import { useStudentData } from "@/hooks/useStudentData";
import { Dna, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Link } from "react-router-dom";

export default function SkillDNA() {
  const { data, loading } = useStudentData();

  if (loading) return <div className="p-8 text-slate-500">Loading Skill DNA...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Skill DNA</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Map, track, and verify your skills to unlock better career matches.
          </p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add Skill</Button>
      </div>

      {data.skills.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Dna className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Your DNA is Empty</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2 mb-4">
            Upload your resume or manually add skills to build your Skill DNA profile.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/student/resume-analyzer">
              <Button variant="outline">Upload Resume</Button>
            </Link>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Skills Manually</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.skills.map(skill => (
            <div key={skill.id} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{skill.skills?.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{skill.proficiency}% Proficiency</span>
                  {skill.verification_status === 'Verified' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                </div>
              </div>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
