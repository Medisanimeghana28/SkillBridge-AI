import { useState, useEffect } from "react";
import { DEMO_STUDENT } from "@/data/demoData";
import { aiService } from "@/services/aiService";
import { ShieldCheck, BadgeCheck, MapPin, Building2, ExternalLink } from "lucide-react";
import { cn } from "@/utils/cn";

export default function PassportPreview() {
  const [skillsWithStatus, setSkillsWithStatus] = useState([]);

  useEffect(() => {
    // Read local challenges just like the main passport
    const completedChallenges = JSON.parse(localStorage.getItem('sb_completed_challenges') || '[]');
    
    const processed = DEMO_STUDENT.detailedSkills.map(skill => {
      const evidence = aiService.getSkillEvidence(skill.name, DEMO_STUDENT, completedChallenges);
      const vStatus = aiService.calculateSkillVerification(evidence);
      return { ...skill, evidenceList: evidence, verificationStatus: vStatus };
    }).sort((a, b) => b.proficiency - a.proficiency);
    
    setSkillsWithStatus(processed);
  }, []);

  const verifiedSkills = skillsWithStatus.filter(s => s.verificationStatus === 'Verified');
  const partialSkills = skillsWithStatus.filter(s => s.verificationStatus === 'Partially Verified');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Recruiter Top Bar */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center bg-indigo-600 text-white p-4 rounded-xl shadow-md">
        <div className="flex items-center gap-2 font-bold text-lg">
          <ShieldCheck className="h-6 w-6" />
          SkillBridge AI • Recruiter View
        </div>
        <div className="text-xs uppercase tracking-wider font-bold bg-white/20 px-3 py-1 rounded-full">
          Prototype Preview
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Profile Header */}
        <div className="p-8 md:p-12 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center md:items-start gap-8">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav" alt="Aarav" className="h-32 w-32 rounded-full border-4 border-slate-100 dark:border-slate-800 bg-slate-100 shadow-md" />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">{DEMO_STUDENT.name}</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-medium flex flex-wrap justify-center md:justify-start items-center gap-3">
              <span className="flex items-center gap-1"><Building2 className="h-4 w-4" /> {DEMO_STUDENT.college}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> B.Tech {DEMO_STUDENT.degree}</span>
            </p>
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
              <div className="px-4 py-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                <p className="text-xs font-bold uppercase tracking-wider mb-1">Industry Readiness</p>
                <p className="text-2xl font-black">82%</p>
              </div>
              <div className="px-4 py-2 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 rounded-lg border border-primary-200 dark:border-primary-800/50">
                <p className="text-xs font-bold uppercase tracking-wider mb-1">Verified Skills</p>
                <p className="text-2xl font-black">{verifiedSkills.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="p-8 md:p-12 space-y-12">
          
          {/* Verified Skills */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <BadgeCheck className="h-6 w-6 text-emerald-500" /> Fully Verified Core Skills
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {verifiedSkills.map(skill => (
                <div key={skill.name} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{skill.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{skill.evidenceList.length} Evidence Items Evaluated</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-800 dark:text-slate-200">{skill.proficiency}%</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Partially Verified */}
          {partialSkills.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                Developing Skills
              </h2>
              <div className="flex flex-wrap gap-3">
                {partialSkills.map(skill => (
                  <div key={skill.name} className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm flex items-center gap-2">
                    {skill.name} <span className="text-slate-400">({skill.proficiency}%)</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects Summary */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">
              Demonstrated Projects
            </h2>
            <div className="space-y-4">
              {DEMO_STUDENT.projects.map((proj, i) => (
                <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-slate-100 dark:border-slate-800 rounded-lg">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{proj.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{proj.tech}</p>
                  </div>
                  <span className="mt-2 sm:mt-0 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-full">
                    {proj.type}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
        
        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
            Powered by <ShieldCheck className="h-4 w-4" /> <strong>SkillBridge AI</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
