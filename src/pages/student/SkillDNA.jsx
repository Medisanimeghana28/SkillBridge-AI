import { DEMO_STUDENT } from "@/data/demoData";
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from "recharts";
import { BadgeCheck, Clock, Award, FolderGit2, AlertTriangle, ShieldCheck } from "lucide-react";
import { cn } from "@/utils/cn";

export default function SkillDNA() {
  const getVerificationIcon = (status) => {
    switch (status) {
      case 'Verified': return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
      case 'Project Verified': return <FolderGit2 className="h-4 w-4 text-blue-500" />;
      case 'In Progress': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'Needs Improvement': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getVerificationClass = (status) => {
    switch (status) {
      case 'Verified': return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800";
      case 'Project Verified': return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
      case 'In Progress': return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800";
      case 'Needs Improvement': return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      default: return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800";
    }
  };

  const categorizedSkills = DEMO_STUDENT.detailedSkills.reduce((acc, skill) => {
    acc[skill.category] = acc[skill.category] || [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Your Skill DNA</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400 max-w-3xl">
          Your Skill DNA maps your current capabilities, evidence and proficiency against industry requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radar Visual */}
        <div className="rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Skill Signature</h3>
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">Overall Score</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{DEMO_STUDENT.readinessScore}%</p>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={DEMO_STUDENT.skillDNA}>
                <PolarGrid stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Radar name="Proficiency" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories / Skill Bars */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(categorizedSkills).map(([category, skills]) => (
            <div key={category} className="rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
              <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-6 py-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{category}</h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {skills.map((skill, idx) => (
                  <div key={idx} className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900 dark:text-white">{skill.name}</h4>
                          <span className="text-lg font-bold text-slate-700 dark:text-slate-300">{skill.proficiency}%</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          Evidence: <span className="font-medium text-slate-700 dark:text-slate-300">{skill.evidence}</span>
                          <span className="mx-1">•</span>
                          Updated {skill.lastUpdated}
                        </p>
                      </div>
                      <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold whitespace-nowrap w-fit", getVerificationClass(skill.status))}>
                        {getVerificationIcon(skill.status)}
                        {skill.status}
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                      <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${skill.proficiency}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Certifications Section */}
          <div className="rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
            <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Certifications</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {DEMO_STUDENT.certifications.map((cert, idx) => (
                <div key={idx} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">{cert.name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{cert.date}</p>
                  </div>
                  <div className={cn("px-3 py-1 rounded-full text-xs font-semibold w-fit", 
                    cert.status === 'Earned' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                    cert.status === 'In Progress' ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  )}>
                    {cert.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects Section */}
          <div className="rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
            <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Projects</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {DEMO_STUDENT.projects.map((proj, idx) => (
                <div key={idx} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">{proj.name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tech: <span className="font-medium text-slate-700 dark:text-slate-300">{proj.tech}</span></p>
                  </div>
                  <div className="px-3 py-1 rounded-full border border-primary-200 bg-primary-50 text-primary-700 text-xs font-semibold w-fit dark:border-primary-800 dark:bg-primary-900/20 dark:text-primary-400">
                    {proj.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
