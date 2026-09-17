import { useStudentData } from "@/hooks/useStudentData";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PassportPreview() {
  const { data, loading } = useStudentData();

  if (loading) return <div className="p-8 text-slate-500">Generating preview...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/student/passport" className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Passport
      </Link>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 shadow-lg">
        <div className="text-center mb-10 pb-10 border-b border-slate-200 dark:border-slate-800">
          <div className="h-24 w-24 bg-primary-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
            {data.academic?.student_id?.substring(0,2) || 'SP'}
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Verified Skill Passport</h1>
          <p className="text-slate-500 max-w-lg mx-auto">This public profile is generated and verified by the SkillBridge AI ecosystem, representing cryptographically secure skill evidence.</p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Ecosystem Verified Skills</h3>
          {data.skills.filter(s => s.verification_status === 'Verified').length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.skills.filter(s => s.verification_status === 'Verified').map((s) => (
                <span key={s.id} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium text-sm rounded-lg border border-emerald-200 dark:border-emerald-800">
                  {s.skills?.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">No skills have been fully verified yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
