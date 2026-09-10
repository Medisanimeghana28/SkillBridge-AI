import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DEMO_STUDENT } from "@/data/demoData";
import { aiService } from "@/services/aiService";
import { Button } from "@/components/common/Button";
import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BadgeCheck, ShieldCheck, AlertCircle, CircleDashed, FileText, 
  ExternalLink, Share2, Download, Check, Award, Copy, Briefcase, 
  ChevronRight, BrainCircuit
} from "lucide-react";

export default function Passport() {
  const [completedChallenges, setCompletedChallenges] = useState(() => {
    return JSON.parse(localStorage.getItem('sb_completed_challenges') || '[]');
  });

  const [skillsWithStatus, setSkillsWithStatus] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Process skills to calculate verification status dynamically
    const processed = DEMO_STUDENT.detailedSkills.map(skill => {
      const evidence = aiService.getSkillEvidence(skill.name, DEMO_STUDENT, completedChallenges);
      const vStatus = aiService.calculateSkillVerification(evidence);
      return { ...skill, evidenceList: evidence, verificationStatus: vStatus };
    }).sort((a, b) => b.proficiency - a.proficiency);
    
    setSkillsWithStatus(processed);
  }, [completedChallenges]);

  const verifiedCount = skillsWithStatus.filter(s => s.verificationStatus === 'Verified').length;
  const insights = aiService.getVerificationInsights(skillsWithStatus);

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://skillbridge.ai/p/aarav-sharma");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIcon = (status) => {
    if (status === 'Verified') return <BadgeCheck className="h-5 w-5 text-emerald-500" />;
    if (status === 'Partially Verified') return <AlertCircle className="h-5 w-5 text-amber-500" />;
    return <CircleDashed className="h-5 w-5 text-slate-400" />;
  };

  const getStatusStyle = (status) => {
    if (status === 'Verified') return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800";
    if (status === 'Partially Verified') return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800";
    return "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
  };

  return (
    <div className="space-y-6 pb-8 max-w-5xl mx-auto relative">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            Verified Skill Passport
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Showcase your skills, evidence and industry-readiness in one trusted profile.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowShareModal(true)}>
            <Share2 className="h-4 w-4" /> Share Passport
          </Button>
          <Link to="/student/passport/preview" target="_blank">
            <Button className="gap-2">
              <ExternalLink className="h-4 w-4" /> Public Preview
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-r from-primary-600 to-indigo-700 w-full relative">
          <div className="absolute -bottom-12 left-8">
            <div className="h-24 w-24 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 overflow-hidden shadow-md">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav" alt="Aarav" className="h-full w-full object-cover bg-indigo-50" />
            </div>
          </div>
        </div>
        <div className="pt-14 px-8 pb-8 flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{DEMO_STUDENT.name}</h2>
            <p className="text-slate-500 font-medium dark:text-slate-400 mb-1">{DEMO_STUDENT.college} • {DEMO_STUDENT.degree}</p>
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-2">Target Role: AI Engineer</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-8">
            <div>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">82%</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Industry Readiness</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{verifiedCount}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Verified Skills</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-700 dark:text-slate-300">4</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Projects</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-700 dark:text-slate-300">3</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Certifications</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Skill Matrix */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Skill Verification Matrix</h3>
              <span className="text-sm font-medium text-slate-500">{verifiedCount} / {skillsWithStatus.length} Skills Verified</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Skill</th>
                    <th className="px-6 py-4 font-medium">Proficiency</th>
                    <th className="px-6 py-4 font-medium">Evidence</th>
                    <th className="px-6 py-4 font-medium">Verification</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {skillsWithStatus.map((skill) => (
                    <tr key={skill.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{skill.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700 dark:text-slate-300 w-8">{skill.proficiency}%</span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full dark:bg-slate-800"><div className="h-full bg-primary-500 rounded-full" style={{ width: `${skill.proficiency}%`}}/></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          {skill.evidenceList.length > 0 ? `${skill.evidenceList.length} items` : 'No evidence'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit border", getStatusStyle(skill.verificationStatus))}>
                          {getStatusIcon(skill.verificationStatus)}
                          {skill.verificationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedSkill(skill)}>View Detail</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: AI Insights */}
        <div className="space-y-6">
          <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-primary-50 border border-primary-100 p-6 dark:from-slate-900 dark:to-indigo-950/20 dark:border-indigo-900/50">
            <h3 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 mb-4">
              <BrainCircuit className="h-5 w-5" /> AI Verification Insights
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-indigo-700/70 dark:text-indigo-400/70 uppercase tracking-wider mb-2">Strongest Verified</p>
                <div className="flex flex-wrap gap-2">
                  {insights.strongest.map(s => <span key={s} className="px-2 py-1 bg-white/60 dark:bg-slate-800 text-indigo-800 dark:text-indigo-200 text-xs font-bold rounded shadow-sm">{s}</span>)}
                </div>
              </div>
              
              {insights.needsEvidence.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-amber-700/70 dark:text-amber-400/70 uppercase tracking-wider mb-2">Needs Evidence</p>
                  <div className="flex flex-wrap gap-2">
                    {insights.needsEvidence.map(s => <span key={s} className="px-2 py-1 bg-amber-100/50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-bold rounded shadow-sm">{s}</span>)}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-indigo-200/50 dark:border-indigo-800/50">
                <p className="text-sm text-indigo-800 dark:text-indigo-200 font-medium leading-relaxed">
                  {insights.recommendation}
                </p>
              </div>
              
              <Link to="/student/challenges" className="block mt-4">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">Find Industry Challenges</Button>
              </Link>
            </div>
          </div>
          
          <div className="rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">How verification works</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              SkillBridge AI calculates verification by analyzing multiple data points to prove your capabilities to employers.
            </p>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5"/> <strong>Assessment:</strong> Tests baseline knowledge.</li>
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5"/> <strong>Project:</strong> Shows practical implementation.</li>
              <li className="flex items-start gap-2"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5"/> <strong>Challenge:</strong> Proves industry-standard readiness.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* --- SKILL DETAIL MODAL --- */}
      <AnimatePresence>
        {selectedSkill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-slate-900/70 backdrop-blur-sm" onClick={() => setSelectedSkill(null)} />
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="inline-block w-full max-w-2xl overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-slate-950 shadow-2xl rounded-2xl max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start bg-slate-50 dark:bg-slate-900/50">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{selectedSkill.name}</h2>
                  <div className="flex flex-wrap gap-3 items-center">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Proficiency: {selectedSkill.proficiency}%</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit border", getStatusStyle(selectedSkill.verificationStatus))}>
                      {getStatusIcon(selectedSkill.verificationStatus)}
                      {selectedSkill.verificationStatus}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedSkill(null)}>Close</Button>
              </div>
              
              <div className="p-6 overflow-y-auto bg-white dark:bg-slate-950">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Evidence Timeline</h3>
                
                {selectedSkill.evidenceList.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600 dark:text-slate-400 font-medium">No evidence found</p>
                    <p className="text-sm text-slate-500 mt-1">Complete projects or challenges to verify this skill.</p>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 space-y-6 pb-4">
                    {selectedSkill.evidenceList.map((ev, i) => (
                      <div key={i} className="relative pl-6">
                        <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-white border-2 border-primary-500 dark:bg-slate-950 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-primary-500" />
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">{ev.type}</span>
                            <span className="text-xs text-slate-500">{ev.date}</span>
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2">{ev.title}</h4>
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Evidence Validated</span>
                            <Button variant="link" className="ml-auto text-xs h-auto p-0">View Evidence <ChevronRight className="h-3 w-3 ml-1" /></Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Final Status Node */}
                    <div className="relative pl-6 pt-4">
                      <div className={cn("absolute -left-[15px] top-4 h-7 w-7 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center border-2", selectedSkill.verificationStatus === 'Verified' ? "border-emerald-500" : "border-slate-300 dark:border-slate-700")}>
                        {getStatusIcon(selectedSkill.verificationStatus)}
                      </div>
                      <p className={cn("font-bold", selectedSkill.verificationStatus === 'Verified' ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500")}>
                        Current Status: {selectedSkill.verificationStatus}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- SHARE MODAL --- */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowShareModal(false)} />
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="inline-block w-full max-w-md overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-slate-950 shadow-2xl rounded-2xl"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Share Passport</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowShareModal(false)}>Close</Button>
              </div>
              <div className="p-6 space-y-6">
                <div className="p-4 bg-primary-50 rounded-lg border border-primary-100 dark:bg-primary-900/10 dark:border-primary-900/30 text-center">
                  <ShieldCheck className="h-10 w-10 text-primary-500 mx-auto mb-2" />
                  <p className="text-sm text-primary-900 dark:text-primary-300 font-medium">Your Skill Passport is ready to share with recruiters.</p>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Public Link</label>
                  <div className="flex gap-2">
                    <input type="text" readOnly value="https://skillbridge.ai/p/aarav-sharma" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-400 outline-none" />
                    <Button onClick={handleCopyLink} className="shrink-0 w-24">
                      {copied ? <span className="flex items-center gap-1"><Check className="h-4 w-4"/> Copied</span> : <span className="flex items-center gap-1"><Copy className="h-4 w-4"/> Copy</span>}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button variant="outline" className="w-full justify-center gap-2 h-12">
                    <Download className="h-4 w-4" /> Export PDF
                  </Button>
                  <Link to="/student/passport/preview" target="_blank" className="w-full">
                    <Button variant="outline" className="w-full justify-center gap-2 h-12">
                      <ExternalLink className="h-4 w-4" /> Preview
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
