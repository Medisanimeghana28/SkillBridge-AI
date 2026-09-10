import { adminAnalyticsService } from '@/services/adminAnalyticsService';
import { storageService } from '@/services/storageService';
import { 
  Users, CheckCircle2, Building, Briefcase, Target, ShieldCheck, 
  TrendingUp, AlertTriangle, ArrowRight, Activity, Zap, Server, 
  Database, LineChart, Globe, Lock
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend 
} from 'recharts';
import { cn } from '@/utils/cn';

import { useState } from 'react';

export default function AdminDashboard() {
  const [resetting, setResetting] = useState(false);

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all prototype data? This will clear all simulated applications, challenges, and created internships.")) {
      setResetting(true);
      storageService.resetDemoData();
    }
  };

  const kpis = adminAnalyticsService.getGlobalKPIs();
  const readinessData = adminAnalyticsService.getStudentReadinessDistribution();
  const topGaps = adminAnalyticsService.getTopEcosystemSkillGaps();
  const radarData = adminAnalyticsService.getIndustryDemandRadar();
  const activity = adminAnalyticsService.getRecentActivity();
  const priorities = adminAnalyticsService.getEcosystemPriorities();
  const insights = adminAnalyticsService.getAdminInsights();
  const institutions = adminAnalyticsService.getInstitutionPerformance();

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12" fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Ecosystem Overview</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            Monitor student readiness, institutional skill gaps, and industry demand across the entire SkillBridge platform.
          </p>
          <span className="inline-block mt-3 px-2.5 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-[10px] uppercase font-black tracking-wider rounded-md">
            Prototype Demo Data
          </span>
        </div>
        
        <button 
          onClick={handleReset}
          disabled={resetting}
          className="flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50 rounded-lg text-sm font-bold transition-colors"
        >
          <Database className="h-4 w-4" /> {resetting ? 'Resetting...' : 'Reset Demo Data'}
        </button>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: kpis.totalStudents, icon: Users, color: 'text-blue-500' },
          { label: 'Profiles Completed', value: kpis.profilesCompleted, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Industry Partners', value: kpis.industryPartners, icon: Building, color: 'text-slate-500' },
          { label: 'Active Internships', value: kpis.activeInternships, icon: Briefcase, color: 'text-indigo-500' },
          { label: 'Active Challenges', value: kpis.activeChallenges, icon: Target, color: 'text-rose-500' },
          { label: 'Avg Readiness', value: `${kpis.avgIndustryReadiness}%`, icon: TrendingUp, color: 'text-amber-500' },
          { label: 'Verified Skills', value: kpis.verifiedSkills, icon: ShieldCheck, color: 'text-teal-500' },
          { label: 'Placement Ready', value: kpis.placementReady, icon: Zap, color: 'text-violet-500' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{kpi.label}</p>
              <kpi.icon className={cn("h-4 w-4", kpi.color)} />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Ecosystem Flow Visual */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-xl p-6 md:p-8 text-white relative overflow-hidden border border-indigo-800 shadow-lg">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light pointer-events-none"></div>
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-indigo-300">
          <Activity className="h-5 w-5" /> The SkillBridge Flow
        </h3>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          {[
            { label: 'Students', metric: kpis.totalStudents },
            { label: 'Skill DNA', metric: kpis.profilesCompleted },
            { label: 'Skill Gaps', metric: 'Identified' },
            { label: 'Challenges', metric: kpis.activeChallenges },
            { label: 'Internships', metric: kpis.activeInternships },
            { label: 'Verified Skills', metric: kpis.verifiedSkills },
            { label: 'Placement', metric: kpis.placementReady },
          ].map((step, idx, arr) => (
            <div key={idx} className="flex flex-col items-center w-full md:w-auto relative group">
              <div className="h-12 w-12 rounded-full bg-indigo-800/50 border border-indigo-500 flex items-center justify-center font-bold text-sm mb-2 group-hover:bg-indigo-600 group-hover:scale-110 transition-all cursor-default relative z-10">
                {idx + 1}
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-200 text-center">{step.label}</p>
              <p className="text-[10px] text-indigo-400 mt-1 font-mono">{step.metric}</p>
              
              {/* Connector line - hidden on mobile, visible on desktop */}
              {idx < arr.length - 1 && (
                <div className="hidden md:block absolute top-6 left-[60%] w-[100%] h-0.5 bg-indigo-800 -z-0"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Student Readiness Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6">Student Industry Readiness</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={readinessData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {readinessData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Students']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-lg">
            <p className="text-sm text-indigo-800 dark:text-indigo-300">
              <span className="font-bold">AI Insight:</span> Most students are currently in the Developing stage. Cloud, system design and practical project experience are the largest readiness blockers.
            </p>
          </div>
        </div>

        {/* Industry Demand Radar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white">Industry Demand vs Supply</h3>
            <span className="text-[10px] text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded">Simulated</span>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#475569" strokeDasharray="3 3" opacity={0.3} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Student Supply" dataKey="supply" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} />
                <Radar name="Industry Demand" dataKey="demand" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-xs text-center text-slate-500">
            Demand (Indigo) significantly outpaces Supply (Teal) in Cloud and AI/ML sectors.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top Skill Gaps */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6">Top Ecosystem Skill Gaps</h3>
          <div className="space-y-6">
            {topGaps.map((gap, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{gap.skill}</span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded font-bold uppercase", 
                      gap.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      gap.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    )}>
                      {gap.priority}
                    </span>
                  </div>
                  <span className="text-slate-500 text-xs font-medium">{gap.affected} students affected</span>
                </div>
                
                <div className="relative h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  {/* Target line indicator */}
                  <div className="absolute top-0 bottom-0 w-0.5 bg-indigo-500 z-10" style={{ left: `${gap.industryTarget}%` }}></div>
                  
                  {/* Student Level */}
                  <div className="h-full bg-teal-500 transition-all duration-1000" style={{ width: `${gap.studentLevel}%` }}></div>
                  
                  {/* Gap visualization */}
                  <div className="h-full bg-rose-200 dark:bg-rose-900/40 relative overflow-hidden" style={{ width: `${gap.gap}%` }}>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiIG9wYWNpdHk9IjAuMiI+PHBhdGggZD0iTTAgNDBsNDAtNDAiLz48L2c+PC9zdmc+')]"></div>
                  </div>
                </div>
                
                <div className="flex justify-between text-[10px] mt-1 text-slate-500 font-medium">
                  <span>Student Level: {gap.studentLevel}%</span>
                  <span>Target: {gap.industryTarget}% (Gap: {gap.gap}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Priorities */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Ecosystem Priorities
              </h3>
            </div>
            <div className="p-4 flex-1 space-y-4 overflow-y-auto">
              {priorities.map((p, i) => (
                <div key={i} className="flex gap-3 items-start border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                  <div className={cn("mt-1 w-2 h-2 rounded-full shrink-0", 
                    p.level === 'Critical' ? 'bg-red-500' : p.level === 'High' ? 'bg-orange-500' : 'bg-amber-500'
                  )}></div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500">{p.level}</span>
                    <p className="text-sm font-medium text-slate-900 dark:text-white my-1">{p.issue}</p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10 p-2 rounded">
                      Action: {p.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Institution Performance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm overflow-x-auto">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6">Institution Skill Readiness</h3>
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium">Institution</th>
                <th className="px-4 py-3 font-medium text-right">Students</th>
                <th className="px-4 py-3 font-medium text-right">Readiness</th>
                <th className="px-4 py-3 font-medium">Critical Gaps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {institutions.map(inst => (
                <tr key={inst.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{inst.name}</td>
                  <td className="px-4 py-3 text-right">{inst.students}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn("px-2 py-1 rounded text-xs font-bold", 
                      inst.readiness >= 80 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                      inst.readiness >= 70 ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" :
                      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    )}>
                      {inst.readiness}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {inst.criticalGaps.map(gap => (
                        <span key={gap} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded dark:bg-slate-800 dark:text-slate-300">{gap}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col h-full">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6">Ecosystem Activity</h3>
          <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-6 flex-1">
            {activity.map((act, i) => (
              <div key={i} className="pl-6 relative">
                <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1.5 border-2 border-white dark:border-slate-900"></div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{act}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Just now</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
