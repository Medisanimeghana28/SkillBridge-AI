import { useAuth } from "@/context/AuthContext";
import { DEMO_STUDENT } from "@/data/demoData";
import { Link } from "react-router-dom";
import { 
  ResponsiveContainer, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Tooltip 
} from "recharts";
import { motion } from "framer-motion";
import { 
  Target, Dna, Briefcase, TrendingDown, 
  ArrowRight, CheckCircle2, Circle, Clock, ChevronRight,
  FileText, BadgeCheck, Map
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
  const firstName = user?.name?.split(' ')[0] || DEMO_STUDENT.name.split(' ')[0];

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
          value={`${DEMO_STUDENT.readinessScore}%`}
          icon={Target}
          colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
        />
        <StatCard 
          title="Skills Verified" 
          value={`${DEMO_STUDENT.skillsVerified}/${DEMO_STUDENT.totalSkills}`}
          icon={Dna}
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
        />
        <StatCard 
          title="Internship Matches" 
          value={DEMO_STUDENT.internshipMatchesCount}
          icon={Briefcase}
          colorClass="bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
        />
        <StatCard 
          title="Skill Gaps" 
          value={DEMO_STUDENT.skillGapsCount}
          icon={TrendingDown}
          colorClass="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Visualization: Skill DNA */}
        <div className="lg:col-span-2 rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Your Skill DNA</h3>
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

        {/* Skill Gap Card */}
        <div className="rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Your biggest skill gaps</h3>
          <div className="flex-1 space-y-4">
            {DEMO_STUDENT.skillGaps.map(gap => (
              <div key={gap.id} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-200">{gap.skill}</span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    gap.priority === 'High' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  )}>
                    {gap.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800 flex">
                    <div className="h-full bg-primary-500" style={{ width: `${gap.current}%` }} />
                    <div className="h-full bg-primary-200 dark:bg-primary-900/50" style={{ width: `${gap.target - gap.current}%` }} />
                  </div>
                  <span className="text-xs text-slate-500 w-8 text-right">{gap.current}%</span>
                </div>
              </div>
            ))}
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
          <div className="flex-1 space-y-4 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent dark:before:via-slate-700">
            {DEMO_STUDENT.roadmap.map((step, idx) => (
              <div key={step.id} className="relative flex items-center gap-4">
                <div className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-900 z-10",
                  step.status === 'completed' ? "border-primary-600 text-primary-600" : 
                  step.status === 'current' ? "border-amber-500 text-amber-500" : 
                  "border-slate-300 text-slate-300 dark:border-slate-600 dark:text-slate-600"
                )}>
                  {step.status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : 
                   step.status === 'current' ? <Circle className="h-4 w-4 fill-current" /> : 
                   <Circle className="h-4 w-4" />}
                </div>
                <p className={cn(
                  "text-sm font-medium",
                  step.status === 'completed' ? "text-slate-700 dark:text-slate-300" :
                  step.status === 'current' ? "text-primary-700 dark:text-primary-400" :
                  "text-slate-400 dark:text-slate-500"
                )}>
                  {step.step}
                </p>
              </div>
            ))}
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
          <div className="space-y-4">
            {DEMO_STUDENT.internships.map(match => (
              <div key={match.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-slate-100 hover:border-primary-100 hover:bg-primary-50/50 dark:border-slate-800/50 dark:hover:border-primary-900/50 dark:hover:bg-primary-900/10 transition-colors gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white">{match.role}</h4>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {match.matchPercent}% Match
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    {match.company} • {match.location}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1">
                    <span className="font-medium text-slate-600 dark:text-slate-300">Why matched:</span> {match.reason}
                  </p>
                </div>
                <div className="shrink-0">
                  <Link to="/student/internships">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Activity */}
        <div className="rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {DEMO_STUDENT.recentActivity.map(activity => (
              <div key={activity.id} className="flex gap-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {activity.type === 'assessment' && <FileText className="h-4 w-4" />}
                  {activity.type === 'project' && <Briefcase className="h-4 w-4" />}
                  {activity.type === 'application' && <ArrowRight className="h-4 w-4" />}
                  {activity.type === 'verification' && <BadgeCheck className="h-4 w-4 text-emerald-500" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{activity.text}</p>
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <Clock className="mr-1 h-3 w-3" /> {activity.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to="/student/skill-gap" className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-primary-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-primary-800 dark:hover:bg-slate-800/50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-md dark:bg-amber-900/30 dark:text-amber-400"><TrendingDown className="h-4 w-4" /></div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Analyze Skill Gap</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary-500" />
            </Link>
            
            <Link to="/student/internships" className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-primary-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-primary-800 dark:hover:bg-slate-800/50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-md dark:bg-purple-900/30 dark:text-purple-400"><Briefcase className="h-4 w-4" /></div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Explore Internships</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary-500" />
            </Link>
            
            <Link to="/student/roadmap" className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-primary-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-primary-800 dark:hover:bg-slate-800/50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-md dark:bg-blue-900/30 dark:text-blue-400"><Map className="h-4 w-4" /></div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">View Roadmap</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary-500" />
            </Link>
            
            <Link to="/student/skills" className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-primary-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-primary-800 dark:hover:bg-slate-800/50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-md dark:bg-emerald-900/30 dark:text-emerald-400"><Dna className="h-4 w-4" /></div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Update Skill Profile</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary-500" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
