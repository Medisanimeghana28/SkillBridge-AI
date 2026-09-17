import { useAuth } from "@/context/AuthContext";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { Link } from "react-router-dom";
import { 
  ResponsiveContainer, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Tooltip 
} from "recharts";
import { motion } from "framer-motion";
import { 
  Target, Dna, Briefcase, TrendingDown, 
  ArrowRight, CheckCircle2, Circle, Clock, ChevronRight,
  FileText, BadgeCheck, Map, UploadCloud
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { cn } from "@/utils/cn";

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800"
  >
    <div className="flex items-center gap-4">
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", colorClass)}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
      </div>
    </div>
  </motion.div>
);

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data, loading, error } = useStudentDashboard();
  
  const firstName = user?.profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "Student";

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        <h3 className="font-bold">Error loading dashboard</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          Good morning, {firstName} 👋
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Here's your current career readiness overview.
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Industry Readiness" 
          value={`${data.readinessScore}%`}
          icon={Target}
          colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
        />
        <StatCard 
          title="Skills Verified" 
          value={`${data.verifiedSkills}/${data.totalSkills}`}
          icon={Dna}
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
        />
        <StatCard 
          title="Internship Matches" 
          value={data.internshipMatchesCount}
          icon={Briefcase}
          colorClass="bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
        />
        <StatCard 
          title="Skill Gaps" 
          value={data.skillGapsCount}
          icon={TrendingDown}
          colorClass="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Visualization: Skill DNA */}
        <div className="lg:col-span-2 rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Your Skill DNA</h3>
          
          {data.skillDNA.length > 0 ? (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.skillDNA}>
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
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
              <Dna className="h-12 w-12 text-slate-300 mb-3" />
              <h4 className="text-slate-700 dark:text-slate-300 font-medium">No skills mapped yet</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">Complete your profile or upload a resume to generate your Skill DNA.</p>
              <Link to="/student/resume-analyzer">
                <Button className="mt-4 gap-2"><UploadCloud className="h-4 w-4"/> Resume Analyzer</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Skill Gap Card */}
        <div className="rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Your biggest skill gaps</h3>
          <div className="flex-1 space-y-4">
            {data.totalSkills === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center h-full text-center py-8">
                 <p className="text-sm text-slate-500">Add a target role and skills to see gap analysis.</p>
               </div>
            ) : (
               <div className="text-center py-8 text-sm text-slate-500">
                 No critical gaps identified right now based on your target role.
               </div>
            )}
          </div>
          <div className="pt-4 mt-auto">
            <Link to="/student/skill-gap">
              <Button variant="outline" className="w-full">View Skill Gap Detail</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Career Roadmap */}
        <div className="rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6 lg:col-span-1 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Career Roadmap</h3>
          <div className="flex-1 flex items-center justify-center py-8">
            <p className="text-sm text-slate-500 text-center">Your roadmap will generate automatically as you map your skills.</p>
          </div>
          <div className="pt-4 mt-auto">
            <Link to="/student/roadmap">
              <Button variant="ghost" className="w-full text-primary-600 dark:text-primary-400">View Full Roadmap</Button>
            </Link>
          </div>
        </div>

        {/* Internship Matches */}
        <div className="rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Top Internship Matches</h3>
            <Link to="/student/internships" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">View all</Link>
          </div>
          <div className="space-y-4 py-8 text-center text-slate-500">
            <p className="text-sm">No internship matches available yet. Complete your profile to get matches.</p>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link to="/student/skill-gap" className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-primary-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-primary-800 dark:hover:bg-slate-800/50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-md dark:bg-amber-900/30 dark:text-amber-400"><TrendingDown className="h-4 w-4" /></div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Skill Gap</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary-500" />
          </Link>
          
          <Link to="/student/internships" className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-primary-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-primary-800 dark:hover:bg-slate-800/50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-md dark:bg-purple-900/30 dark:text-purple-400"><Briefcase className="h-4 w-4" /></div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Internships</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary-500" />
          </Link>
          
          <Link to="/student/roadmap" className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-primary-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-primary-800 dark:hover:bg-slate-800/50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-md dark:bg-blue-900/30 dark:text-blue-400"><Map className="h-4 w-4" /></div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Roadmap</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary-500" />
          </Link>

          <Link to="/student/resume-analyzer" className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-primary-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-primary-800 dark:hover:bg-slate-800/50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-md dark:bg-emerald-900/30 dark:text-emerald-400"><UploadCloud className="h-4 w-4" /></div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Resume Analyzer</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary-500" />
          </Link>
        </div>
      </div>
    </div>
  );
}
