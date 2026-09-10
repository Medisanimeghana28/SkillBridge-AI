import { INDUSTRY_DATA } from "@/data/industryData";
import { ACADEMIA_DATA } from "@/data/academiaData";
import { aiService } from "@/services/aiService";
import { 
  Building2, Users, Briefcase, ShieldCheck, Target, Search, FileSignature, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/common/Button";

export default function IndustryDashboard() {
  const { stats, company } = INDUSTRY_DATA;
  const insights = aiService.generateIndustryInsights();
  
  // Rank students for a specific requirement (AI Engineer) to show in Top Talent
  const topMatches = aiService.rankCandidates(ACADEMIA_DATA.students, INDUSTRY_DATA.requirements[0]).slice(0, 4);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl flex items-center gap-3">
          <Building2 className="h-8 w-8 text-teal-500" />
          Industry Dashboard
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Find skilled talent, define requirements and build stronger academia-industry connections.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Briefcase className="h-3 w-3"/> Open Internships</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.openInternships}</p>
        </div>
        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Target className="h-3 w-3"/> Active Challenges</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.activeChallenges}</p>
        </div>
        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Search className="h-3 w-3"/> Talent Matches</p>
          <p className="text-2xl font-black text-teal-600 dark:text-teal-400">{stats.talentMatches}</p>
        </div>
        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Users className="h-3 w-3"/> Applications</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{stats.applications}</p>
        </div>
        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><ShieldCheck className="h-3 w-3"/> Verified</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.verifiedCandidates}</p>
        </div>
        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><FileSignature className="h-3 w-3"/> Requirements</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.skillRequirements}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Feedback Loop & Insights */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl bg-gradient-to-br from-teal-900 to-slate-900 p-6 text-white shadow-sm flex flex-col h-fit relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck className="h-24 w-24" /></div>
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-teal-300">
              <Building2 className="h-5 w-5" /> Academia-Industry Loop
            </h3>
            <div className="flex flex-col justify-between py-2 relative text-sm">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-teal-800/50" />
              {["Your Requirements", "Student Skill Matching", "Talent Discovery", "Internships / Challenges", "Verified Skills", "Feedback to Academia"].map((step, i) => (
                <div key={i} className="flex items-center gap-4 relative z-10 py-3">
                  <div className="h-6 w-6 rounded-full bg-teal-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">{i+1}</div>
                  <span className="font-medium text-slate-300">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">AI Insights</h3>
            </div>
            <div className="p-4 space-y-4">
              {insights.map((insight, idx) => (
                <div key={idx} className="p-3 bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/30 rounded-lg">
                  <p className="text-xs font-bold text-teal-700 dark:text-teal-400 mb-1">{insight.type}</p>
                  <p className="text-sm text-teal-900 dark:text-teal-300">{insight.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Top Talent */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Top Talent Matches</h3>
            <Link to="/industry/talent" className="text-sm font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400 flex items-center">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {topMatches.map(student => (
              <div key={student.id} className="rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-5 shadow-sm hover:border-teal-300 transition-colors flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-600 dark:text-slate-300">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">{student.name}</h4>
                    <p className="text-sm text-slate-500">{student.department} • Target: AI Engineer</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {student.matchDetails.strong.slice(0, 3).map(skill => (
                        <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold dark:bg-slate-800 dark:text-slate-400">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-2 w-full sm:w-auto border-t sm:border-0 border-slate-100 dark:border-slate-800 pt-4 sm:pt-0">
                  <div className="text-center sm:text-right flex-1 sm:flex-none">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Match</p>
                    <p className="text-2xl font-black text-teal-600 dark:text-teal-400">{student.matchScore}%</p>
                  </div>
                  <div className="text-center sm:text-right flex-1 sm:flex-none hidden sm:block">
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                      <ShieldCheck className="h-3.5 w-3.5" /> 7 Verified
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">View Profile</Button>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
