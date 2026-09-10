import { useState } from "react";
import { ACADEMIA_DATA } from "@/data/academiaData";
import { aiService } from "@/services/aiService";
import { TrendingUp, AlertTriangle, Briefcase, Activity } from "lucide-react";
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts";
import { cn } from "@/utils/cn";

export default function IndustryDemand() {
  const { industryDemand, demandTrends } = ACADEMIA_DATA;
  const criticalSkills = aiService.analyzeIndustryDemand(industryDemand);
  const [selectedTrend, setSelectedTrend] = useState("Cloud");

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Industry Demand Analysis</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Compare student proficiency against current market demand.
        </p>
      </div>

      <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-md text-xs font-bold inline-flex w-fit dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400">
        PROTOTYPE SIMULATED INDUSTRY-DEMAND DATA
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Radar Chart */}
        <div className="rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Industry Demand Radar</h3>
          <p className="text-sm text-slate-500 mb-6">What industry wants vs what students currently have.</p>
          
          <div className="h-80 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={industryDemand}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Student Proficiency" dataKey="studentProficiency" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                <Radar name="Industry Demand" dataKey="industryDemand" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Industry Skill Demand Trend</h3>
              <p className="text-sm text-slate-500">Quarterly shift in requested skills.</p>
            </div>
            <select 
              value={selectedTrend}
              onChange={(e) => setSelectedTrend(e.target.value)}
              className="rounded-lg border-slate-300 py-1.5 pl-3 pr-8 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white font-medium"
            >
              <option value="Cloud">Cloud</option>
              <option value="AI">AI/ML</option>
              <option value="Cyber">Cybersecurity</option>
            </select>
          </div>
          
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={demandTrends} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey={selectedTrend} stroke="#4f46e5" strokeWidth={3} dot={{ r: 5, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Critical Gap Alert */}
      {criticalSkills.length > 0 && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-5 flex items-start gap-4 dark:bg-rose-900/10 dark:border-rose-900/30">
          <AlertTriangle className="h-6 w-6 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-900 dark:text-rose-400">Critical Demand Gaps Identified</h4>
            <p className="text-sm text-rose-700 dark:text-rose-300 mt-1">
              Industry demand heavily outweighs student proficiency in: <span className="font-bold">{criticalSkills.join(", ")}</span>. 
              Immediate training intervention is highly recommended.
            </p>
          </div>
        </div>
      )}

      {/* Role Requirements Cards */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Role-Based Industry Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5 text-indigo-500" />
              <h4 className="font-bold text-lg text-slate-900 dark:text-white">Cloud Engineer</h4>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase font-bold text-slate-400 mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium dark:bg-slate-800 dark:text-slate-300">AWS</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium dark:bg-slate-800 dark:text-slate-300">Docker</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium dark:bg-slate-800 dark:text-slate-300">Linux</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium dark:bg-slate-800 dark:text-slate-300">Networking</span>
                </div>
              </div>
              <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-800 pt-3">
                <div>
                  <p className="text-xs text-slate-500">Student Readiness</p>
                  <p className="text-lg font-black text-rose-600">48%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 text-right">Skill Gap</p>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">High</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5 text-indigo-500" />
              <h4 className="font-bold text-lg text-slate-900 dark:text-white">AI Engineer</h4>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase font-bold text-slate-400 mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium dark:bg-slate-800 dark:text-slate-300">Python</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium dark:bg-slate-800 dark:text-slate-300">Machine Learning</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium dark:bg-slate-800 dark:text-slate-300">Deep Learning</span>
                </div>
              </div>
              <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-800 pt-3">
                <div>
                  <p className="text-xs text-slate-500">Student Readiness</p>
                  <p className="text-lg font-black text-amber-600">65%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 text-right">Skill Gap</p>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Medium</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5 text-indigo-500" />
              <h4 className="font-bold text-lg text-slate-900 dark:text-white">Full Stack Dev</h4>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase font-bold text-slate-400 mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium dark:bg-slate-800 dark:text-slate-300">React</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium dark:bg-slate-800 dark:text-slate-300">Node.js</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium dark:bg-slate-800 dark:text-slate-300">SQL</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium dark:bg-slate-800 dark:text-slate-300">Git</span>
                </div>
              </div>
              <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-800 pt-3">
                <div>
                  <p className="text-xs text-slate-500">Student Readiness</p>
                  <p className="text-lg font-black text-emerald-600">76%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 text-right">Skill Gap</p>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Low</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
