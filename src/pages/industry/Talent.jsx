import { useState } from "react";
import { ACADEMIA_DATA } from "@/data/academiaData";
import { INDUSTRY_DATA } from "@/data/industryData";
import { aiService } from "@/services/aiService";
import { Button } from "@/components/common/Button";
import { Search, Filter, ShieldCheck, CheckCircle2, ChevronRight, Bookmark } from "lucide-react";
import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";

export default function TalentDiscovery() {
  const [roleFilter, setRoleFilter] = useState("AI Engineer");
  const [searchTerm, setSearchTerm] = useState("");
  const [shortlisted, setShortlisted] = useState(() => {
    return JSON.parse(localStorage.getItem('sb_industry_shortlist') || '[]');
  });
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Get active role requirement
  const activeReq = INDUSTRY_DATA.requirements.find(r => r.role === roleFilter) || INDUSTRY_DATA.requirements[0];

  // Rank and filter candidates
  const rankedCandidates = aiService.rankCandidates(ACADEMIA_DATA.students, activeReq)
    .filter(s => {
      if (searchTerm && !s.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });

  const toggleShortlist = (studentId) => {
    let updated;
    if (shortlisted.includes(studentId)) {
      updated = shortlisted.filter(id => id !== studentId);
    } else {
      updated = [...shortlisted, studentId];
    }
    setShortlisted(updated);
    localStorage.setItem('sb_industry_shortlist', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Discover Talent</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Find the best students matching your specific skill requirements.
          </p>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by student name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-teal-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white"
          />
        </div>
        <div className="w-full sm:w-64">
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-teal-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white"
          >
            {INDUSTRY_DATA.requirements.map(r => (
              <option key={r.id} value={r.role}>Match to: {r.role}</option>
            ))}
          </select>
        </div>
        <Button variant="outline" className="gap-2 sm:w-auto w-full">
          <Filter className="h-4 w-4" /> Filters
        </Button>
      </div>

      {/* Required Skills Badge Summary */}
      <div className="px-4 py-3 bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/30 rounded-lg flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">Matching Against:</span>
        {activeReq.requiredSkills.map(skill => (
          <span key={skill} className="px-2 py-1 bg-white border border-teal-200 text-teal-800 rounded text-xs font-bold dark:bg-slate-800 dark:border-teal-800 dark:text-teal-300">
            {skill}
          </span>
        ))}
      </div>

      {/* Candidate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rankedCandidates.map(student => {
          const isShortlisted = shortlisted.includes(student.id);
          return (
            <div key={student.id} className="rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow">
              
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-700 dark:text-slate-300 shrink-0">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} alt={student.name} className="h-full w-full rounded-full" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{student.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{student.department} • {student.year}</p>
                  </div>
                </div>
                <div className="text-center bg-teal-50 dark:bg-teal-900/20 px-2 py-1.5 rounded-lg border border-teal-100 dark:border-teal-800/50">
                  <p className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 mb-0.5">Match</p>
                  <p className="text-xl font-black text-teal-700 dark:text-teal-300 leading-none">{student.matchScore}%</p>
                </div>
              </div>

              <div className="p-5 flex-1 space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Verified Matches</p>
                  <div className="flex flex-wrap gap-1.5">
                    {student.matchDetails.strong.map(skill => (
                      <span key={skill} className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-bold flex items-center gap-1 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50">
                        <CheckCircle2 className="h-3 w-3" /> {skill}
                      </span>
                    ))}
                    {student.matchDetails.partial.map(skill => (
                      <span key={skill} className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-bold flex items-center gap-1 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50">
                        {skill}
                      </span>
                    ))}
                    {student.matchDetails.missing.length > 0 && (
                      <span className="px-2 py-1 bg-slate-50 text-slate-500 border border-slate-200 rounded text-xs font-bold dark:bg-slate-800 dark:border-slate-700">
                        Missing: {student.matchDetails.missing.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <Button variant={isShortlisted ? "primary" : "outline"} className={cn("flex-1 gap-2", isShortlisted && "bg-teal-600 hover:bg-teal-700 text-white border-0")} onClick={() => toggleShortlist(student.id)}>
                  <Bookmark className={cn("h-4 w-4", isShortlisted && "fill-current")} /> {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                </Button>
                <Button variant="ghost" onClick={() => setSelectedStudent(student)}>Profile</Button>
              </div>

            </div>
          );
        })}
      </div>

      {/* --- PROFILE MODAL --- */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-slate-900/80 backdrop-blur-sm" onClick={() => setSelectedStudent(null)} />
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="inline-block w-full max-w-2xl overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-slate-950 shadow-2xl rounded-2xl max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start bg-slate-50 dark:bg-slate-900/80">
                <div className="flex items-center gap-4">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.name}`} alt={selectedStudent.name} className="h-16 w-16 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700" />
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{selectedStudent.name}</h2>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      {selectedStudent.department} • <ShieldCheck className="h-4 w-4 text-emerald-500" /> {selectedStudent.verifiedSkills || 7} Verified Skills
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(null)}>Close</Button>
              </div>
              
              <div className="p-6 overflow-y-auto bg-white dark:bg-slate-950 space-y-6">
                
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-teal-500" /> Verified Skill Evidence</h3>
                  <div className="space-y-3">
                    {selectedStudent.detailedSkills?.filter(s => s.status === 'Verified' || s.verificationStatus === 'Verified').map(skill => (
                      <div key={skill.name} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">{skill.name} <CheckCircle2 className="h-4 w-4 text-emerald-500" /></h4>
                          <span className="text-sm font-bold">{skill.proficiency}%</span>
                        </div>
                        <p className="text-xs text-slate-500 mb-2">EVIDENCE:</p>
                        <div className="flex flex-wrap gap-2">
                          {skill.evidenceList?.map((e, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-white border border-slate-200 rounded text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                              {e.title}
                            </span>
                          )) || <span className="text-xs px-2 py-1 bg-white border border-slate-200 rounded text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">{skill.evidence}</span>}
                        </div>
                      </div>
                    )) || (
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">Python <CheckCircle2 className="h-4 w-4 text-emerald-500" /></h4>
                        <span className="text-xs px-2 py-1 bg-white border border-slate-200 rounded text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                          HackerRank Advanced Python
                        </span>
                        <span className="text-xs px-2 py-1 bg-white border border-slate-200 rounded text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 ml-2">
                          AI Resume Analyzer Project
                        </span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-right">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => { toggleShortlist(selectedStudent.id); setSelectedStudent(null); }}>
                  {shortlisted.includes(selectedStudent.id) ? "Remove from Shortlist" : "Shortlist Candidate"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
