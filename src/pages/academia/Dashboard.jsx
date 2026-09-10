import { ACADEMIA_DATA } from "@/data/academiaData";
import { 
  School, Users, Activity, ShieldCheck, CheckCircle2, TrendingUp 
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from "recharts";

export default function AcademiaDashboard() {
  const { stats, departments, heatmap } = ACADEMIA_DATA;

  // Transform heatmap to average proficiency per skill for the overview chart
  const skillAverages = heatmap.map(item => {
    const total = item.CSE + item.AIML + item.ECE + item.IT + item.EEE;
    return {
      skill: item.skill,
      average: Math.round(total / 5)
    };
  }).sort((a, b) => b.average - a.average);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Academia Dashboard</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Monitor student skills, identify gaps and align academic training with industry demand.
        </p>
      </div>

      <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-md text-xs font-bold inline-flex w-fit dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400">
        PROTOTYPE DEMO DATA
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Users className="h-3 w-3"/> Total</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalStudents}</p>
        </div>
        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><ShieldCheck className="h-3 w-3"/> Profiled</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{stats.profiledStudents}</p>
        </div>
        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Activity className="h-3 w-3"/> Readiness</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.averageReadiness}%</p>
        </div>
        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><TrendingUp className="h-3 w-3"/> Aligned</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.industryAligned}%</p>
        </div>
        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1 text-red-500">Gaps</p>
          <p className="text-2xl font-black text-red-600 dark:text-red-400">{stats.criticalGaps}</p>
        </div>
        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Interns</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.internshipParticipation}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart */}
        <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">Overall Skill Proficiency (Institution Average)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillAverages} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="skill" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="average" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback Loop Visual */}
        <div className="rounded-xl bg-gradient-to-b from-slate-900 to-indigo-950 p-6 text-white shadow-sm flex flex-col">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-indigo-300">
            <School className="h-5 w-5" /> SkillBridge Feedback Loop
          </h3>
          <div className="flex-1 flex flex-col justify-between py-2 relative">
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-indigo-800/50" />
            
            {["Industry Requirements", "Skill Gap Analysis", "Academic Training", "Student Development", "Internships & Verification", "Placement Outcomes"].map((step, i) => (
              <div key={i} className="flex items-center gap-4 relative z-10">
                <div className="h-6 w-6 rounded-full bg-indigo-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">{i+1}</div>
                <span className="text-sm font-medium text-slate-300">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Departments */}
      <div>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Department Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {departments.map(dept => (
            <div key={dept.id} className="rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-5 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-black text-xl text-slate-900 dark:text-white">{dept.name}</h4>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{dept.studentCount} sts</span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 flex justify-between">Avg Skill Score <span className="font-bold text-slate-900 dark:text-white">{dept.avgSkillScore}%</span></p>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full mt-1 dark:bg-slate-800"><div className="h-full bg-indigo-500 rounded-full" style={{width: `${dept.avgSkillScore}%`}}/></div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 flex justify-between">Industry Readiness <span className="font-bold text-slate-900 dark:text-white">{dept.readiness}%</span></p>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full mt-1 dark:bg-slate-800"><div className="h-full bg-emerald-500 rounded-full" style={{width: `${dept.readiness}%`}}/></div>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Top Skill</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{dept.topSkill}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Biggest Gap</p>
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400 truncate">{dept.biggestGap}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
