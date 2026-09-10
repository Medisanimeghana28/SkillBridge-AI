import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { storageService } from "@/services/storageService";
import { INTERNSHIP_DATA } from "@/data/internshipData";
import { DEMO_STUDENT } from "@/data/demoData";
import { aiService } from "@/services/aiService";
import { Button } from "@/components/common/Button";
import { 
  Briefcase, Search, MapPin, Clock, Building2, ChevronDown, Filter,
  CheckCircle2, AlertTriangle, XCircle, Heart, Check, Sparkles, Plus, X
} from "lucide-react";
import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";

export default function InternshipPortal() {
  const navigate = useNavigate();
  
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    role: "All", location: "All", workMode: "All", duration: "All", matchScore: "All"
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const [savedInternships, setSavedInternships] = useState(() => JSON.parse(localStorage.getItem('sb_saved_internships') || '[]'));
  const [appliedInternships, setAppliedInternships] = useState(() => storageService.getApplications());

  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  
  const [selectedInternship, setSelectedInternship] = useState(null); // For Details Modal
  const [applyingInternship, setApplyingInternship] = useState(null); // For Apply Modal

  // Persist saves
  useEffect(() => { localStorage.setItem('sb_saved_internships', JSON.stringify(savedInternships)); }, [savedInternships]);

  // Compute matches for all internships
  const internshipsWithMatch = useMemo(() => {
    return storageService.getInternships().map(internship => {
      const matchData = aiService.calculateInternshipMatch(DEMO_STUDENT.detailedSkills, internship.requiredSkills);
      const gaps = aiService.identifyInternshipSkillGaps(DEMO_STUDENT.detailedSkills, internship.requiredSkills);
      const explanation = aiService.generateInternshipMatchExplanation(matchData);
      return { ...internship, matchData, gaps, explanation };
    }).sort((a, b) => b.matchData.matchScore - a.matchData.matchScore);
  }, []);

  // Filter logic
  const filteredInternships = useMemo(() => {
    return internshipsWithMatch.filter(int => {
      // Search
      const searchMatch = int.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          int.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          int.requiredSkills.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!searchMatch) return false;

      // Filters
      if (filters.role !== "All" && !int.role.includes(filters.role)) return false;
      if (filters.location !== "All" && int.location !== filters.location) return false;
      if (filters.workMode !== "All" && int.workMode !== filters.workMode) return false;
      if (filters.duration !== "All" && int.duration !== filters.duration) return false;
      if (filters.matchScore !== "All") {
        const score = int.matchData.matchScore;
        if (filters.matchScore === "90%+" && score < 90) return false;
        if (filters.matchScore === "80%+" && score < 80) return false;
        if (filters.matchScore === "70%+" && score < 70) return false;
      }
      return true;
    });
  }, [internshipsWithMatch, searchTerm, filters]);

  const bestMatchScore = internshipsWithMatch.length > 0 ? internshipsWithMatch[0].matchData.matchScore : 0;
  const skillsToImprove = [...new Set(internshipsWithMatch.slice(0, 3).flatMap(i => i.gaps.map(g => g.skill)))].length;

  const toggleSave = (id) => {
    if (savedInternships.includes(id)) {
      setSavedInternships(savedInternships.filter(i => i !== id));
    } else {
      setSavedInternships([...savedInternships, id]);
    }
  };

  const toggleCompare = (id) => {
    if (compareList.includes(id)) {
      setCompareList(compareList.filter(i => i !== id));
    } else {
      if (compareList.length < 2) setCompareList([...compareList, id]);
    }
  };

  // --- Handlers for Modals ---
  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!applyingInternship) return;
    
    const newApplication = {
      id: `app_${Date.now()}`,
      studentId: DEMO_STUDENT.id,
      studentName: DEMO_STUDENT.name,
      internshipId: applyingInternship.id,
      company: applyingInternship.company,
      role: applyingInternship.role,
      matchScore: applyingInternship.matchData.matchScore,
      appliedAt: new Date().toISOString(),
      status: 'Applied'
    };
    
    storageService.saveApplication(newApplication);
    setAppliedInternships(storageService.getApplications());
    
    setApplyingInternship(null);
    setSelectedInternship(null);
  };

  return (
    <div className="space-y-6 pb-8 max-w-6xl mx-auto relative">
      
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            Smart Internship Matching
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Discover internships based on your skills, interests and career goals.
          </p>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center dark:bg-emerald-900/30 dark:text-emerald-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Best Match</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{bestMatchScore}%</p>
          </div>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center dark:bg-amber-900/30 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Skills to Improve</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{skillsToImprove}</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search internships, skills or companies..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2 sm:w-auto w-full">
            <Filter className="h-4 w-4" /> Filters
          </Button>
          {compareList.length > 0 && (
            <Button onClick={() => setShowCompare(true)} className="gap-2 sm:w-auto w-full">
              Compare ({compareList.length})
            </Button>
          )}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <select value={filters.role} onChange={(e) => setFilters({...filters, role: e.target.value})} className="rounded-lg border-slate-300 py-2 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm">
                  <option value="All">All Roles</option>
                  <option value="AI">AI/ML</option>
                  <option value="Data">Data Science</option>
                  <option value="Backend">Backend</option>
                  <option value="Full Stack">Full Stack</option>
                </select>
                <select value={filters.location} onChange={(e) => setFilters({...filters, location: e.target.value})} className="rounded-lg border-slate-300 py-2 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm">
                  <option value="All">All Locations</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Pune">Pune</option>
                  <option value="Remote">Remote</option>
                </select>
                <select value={filters.workMode} onChange={(e) => setFilters({...filters, workMode: e.target.value})} className="rounded-lg border-slate-300 py-2 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm">
                  <option value="All">All Modes</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
                <select value={filters.duration} onChange={(e) => setFilters({...filters, duration: e.target.value})} className="rounded-lg border-slate-300 py-2 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm">
                  <option value="All">All Durations</option>
                  <option value="1 month">1 month</option>
                  <option value="2 months">2 months</option>
                  <option value="3 months">3 months</option>
                  <option value="6 months">6 months</option>
                </select>
                <select value={filters.matchScore} onChange={(e) => setFilters({...filters, matchScore: e.target.value})} className="rounded-lg border-slate-300 py-2 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm">
                  <option value="All">Any Match Score</option>
                  <option value="90%+">90%+</option>
                  <option value="80%+">80%+</option>
                  <option value="70%+">70%+</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Internship List */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Showing {filteredInternships.length} internships
        </p>
        
        {filteredInternships.map((internship, index) => {
          const isSaved = savedInternships.includes(internship.id);
          const isCompared = compareList.includes(internship.id);
          const hasApplied = appliedInternships.some(a => a.internshipId === internship.id);

          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              key={internship.id} 
              className="rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-5 hover:border-primary-200 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Logo & Match Score */}
                <div className="flex md:flex-col items-center gap-4 shrink-0 w-full md:w-32">
                  <img src={internship.logo} alt={internship.company} className="h-16 w-16 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50" />
                  <div className="flex-1 md:w-full text-center">
                    <div className="inline-flex flex-col items-center justify-center p-2 rounded-lg bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 border border-primary-100 dark:border-primary-800/50 w-full">
                      <span className="text-xl font-bold">{internship.matchData.matchScore}%</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider">AI Match</span>
                    </div>
                  </div>
                </div>

                {/* Main Info */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{internship.role}</h3>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">{internship.company}</p>
                    </div>
                    {index === 0 && filters.matchScore === "All" && searchTerm === "" && (
                      <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold items-center gap-1 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <Sparkles className="h-3 w-3" /> Recommended for you
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {internship.location} • {internship.workMode}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {internship.duration}</span>
                    <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" /> {internship.experienceLevel}</span>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Skill Match</p>
                    <div className="flex flex-wrap gap-1.5">
                      {internship.requiredSkills.map(req => {
                        const isStrong = internship.matchData.strong.includes(req.name);
                        const isMissing = internship.matchData.missing.includes(req.name);
                        return (
                          <span key={req.name} className={cn(
                            "px-2 py-1 rounded text-xs font-medium flex items-center gap-1 border",
                            isStrong ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800" :
                            isMissing ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800" :
                            "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                          )}>
                            {isStrong ? <CheckCircle2 className="h-3 w-3" /> : isMissing ? <XCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                            {req.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 md:w-32 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-4">
                  {hasApplied ? (
                    <Button variant="outline" className="w-full bg-slate-50 text-emerald-600 border-emerald-200 cursor-default hover:bg-slate-50 dark:bg-slate-800 dark:border-emerald-900/50">
                      <Check className="h-4 w-4 mr-1.5" /> Applied
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => setApplyingInternship(internship)}>Apply</Button>
                  )}
                  <Button variant="outline" className="w-full" onClick={() => setSelectedInternship(internship)}>View Details</Button>
                  
                  <div className="flex w-full gap-2 mt-auto">
                    <button onClick={() => toggleSave(internship.id)} className={cn(
                      "flex-1 flex justify-center items-center py-2 rounded border transition-colors",
                      isSaved ? "bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-900/20 dark:border-rose-900/50" : "border-slate-200 text-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    )}>
                      <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
                    </button>
                    <button onClick={() => toggleCompare(internship.id)} className={cn(
                      "flex-1 flex justify-center items-center py-2 rounded border transition-colors text-xs font-bold",
                      isCompared ? "bg-primary-50 border-primary-200 text-primary-600 dark:bg-primary-900/20 dark:border-primary-900/50" : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    )}>
                      VS
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
        {filteredInternships.length === 0 && (
          <div className="text-center py-12 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <p className="text-slate-500 dark:text-slate-400">No internships match your current filters.</p>
            <Button variant="link" onClick={() => setFilters({role: "All", location: "All", workMode: "All", duration: "All", matchScore: "All"})}>Clear Filters</Button>
          </div>
        )}
      </div>

      {/* --- DETAILS MODAL --- */}
      <AnimatePresence>
        {selectedInternship && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-slate-900/70 backdrop-blur-sm" onClick={() => setSelectedInternship(null)} />
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="inline-block w-full max-w-3xl overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-slate-950 shadow-2xl rounded-2xl max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-start p-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex gap-4 items-center">
                  <img src={selectedInternship.logo} alt="" className="h-12 w-12 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50" />
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedInternship.role}</h2>
                    <p className="text-slate-500 dark:text-slate-400">{selectedInternship.company} • {selectedInternship.location}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedInternship(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full dark:hover:bg-slate-800"><X className="h-5 w-5" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* AI Explanation Section */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-primary-50 to-indigo-50 border border-primary-100 dark:from-primary-900/20 dark:to-indigo-900/20 dark:border-primary-800/50">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary-600" /> Why this internship matches you
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-5 leading-relaxed">
                    {selectedInternship.explanation}
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                    {Object.entries(selectedInternship.matchData.breakdown).map(([key, val]) => (
                      <div key={key} className="bg-white/60 dark:bg-slate-900/60 p-3 rounded-lg border border-white dark:border-slate-700 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{key}</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{val}%</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    {selectedInternship.matchData.strong.length > 0 && (
                      <div className="flex-1 min-w-[150px]"><p className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mb-2"><CheckCircle2 className="h-4 w-4"/> Strong Matches</p><div className="flex flex-wrap gap-1">{selectedInternship.matchData.strong.map(s => <span key={s} className="px-2 py-0.5 bg-emerald-100/50 text-emerald-800 rounded dark:text-emerald-300 text-xs">{s}</span>)}</div></div>
                    )}
                    {selectedInternship.matchData.improve.length > 0 && (
                      <div className="flex-1 min-w-[150px]"><p className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 mb-2"><AlertTriangle className="h-4 w-4"/> Improve</p><div className="flex flex-wrap gap-1">{selectedInternship.matchData.improve.map(s => <span key={s} className="px-2 py-0.5 bg-amber-100/50 text-amber-800 rounded dark:text-amber-300 text-xs">{s}</span>)}</div></div>
                    )}
                    {selectedInternship.matchData.missing.length > 0 && (
                      <div className="flex-1 min-w-[150px]"><p className="font-bold text-red-700 dark:text-red-400 flex items-center gap-1 mb-2"><XCircle className="h-4 w-4"/> Missing</p><div className="flex flex-wrap gap-1">{selectedInternship.matchData.missing.map(s => <span key={s} className="px-2 py-0.5 bg-red-100/50 text-red-800 rounded dark:text-red-300 text-xs">{s}</span>)}</div></div>
                    )}
                  </div>
                </div>

                {/* Skill Gaps Specific to Internship */}
                {selectedInternship.gaps.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Skills to improve before applying</h3>
                    <div className="space-y-3">
                      {selectedInternship.gaps.map((gap, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm font-medium mb-1">
                              <span className="text-slate-900 dark:text-white">{gap.skill}</span>
                              <span className="text-slate-500">Gap: {gap.gap}%</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span>Current: {gap.current}%</span> • <span>Required: {gap.target}%</span>
                            </div>
                          </div>
                          <span className={cn("px-2 py-1 rounded text-xs font-bold", gap.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400')}>{gap.priority}</span>
                        </div>
                      ))}
                    </div>
                    {/* AI Recommendation Card */}
                    <div className="mt-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border-l-4 border-primary-500">
                      <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">AI Recommendation</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {selectedInternship.matchData.missing.length > 0 ? `Spend the next 1-2 weeks strengthening ${selectedInternship.matchData.missing[0]} to improve your profile before applying.` : "You're ready to apply! Your profile strongly aligns with the core requirements."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Standard Details */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">About the Role</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">{selectedInternship.description}</p>
                  
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">Responsibilities</h4>
                  <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-1 mb-4">
                    {selectedInternship.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">Eligibility</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{selectedInternship.eligibility}</p>
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedInternship(null)}>Close</Button>
                {appliedInternships.some(a => a.internshipId === selectedInternship.id) ? (
                   <Button disabled>Already Applied</Button>
                ) : (
                  <Button onClick={() => setApplyingInternship(selectedInternship)}>Apply Now</Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- APPLY MODAL --- */}
      <AnimatePresence>
        {applyingInternship && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-slate-900/70 backdrop-blur-sm" onClick={() => setApplyingInternship(null)} />
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="inline-block w-full max-w-md overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-slate-950 shadow-2xl rounded-2xl"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Apply for Internship</h2>
                <button onClick={() => setApplyingInternship(null)} className="p-1 text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleApplySubmit} className="p-6 space-y-4">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30 rounded-lg mb-4">
                  <p className="text-sm font-semibold text-primary-900 dark:text-primary-300">{applyingInternship.role}</p>
                  <p className="text-xs text-primary-700 dark:text-primary-400">{applyingInternship.company}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input type="text" defaultValue={DEMO_STUDENT.name} required className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">College</label>
                  <input type="text" defaultValue="IIT Bombay" required className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Resume</label>
                  <div className="flex items-center justify-center w-full px-3 py-4 border-2 border-dashed border-slate-300 rounded-lg dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                    <span className="text-sm text-slate-500">Aarav_Resume.pdf (Auto-attached from Profile)</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Why are you interested?</label>
                  <textarea rows="3" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="Briefly explain your interest..." required></textarea>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <Button variant="ghost" type="button" onClick={() => setApplyingInternship(null)}>Cancel</Button>
                  <Button type="submit">Submit Application</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- COMPARE MODAL --- */}
      <AnimatePresence>
        {showCompare && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowCompare(false)} />
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="inline-block w-full max-w-4xl overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-slate-950 shadow-2xl rounded-2xl max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Compare Internships</h2>
                <button onClick={() => setShowCompare(false)} className="p-1 text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-2 gap-6">
                  {compareList.map(id => {
                    const int = internshipsWithMatch.find(i => i.id === id);
                    if (!int) return null;
                    return (
                      <div key={int.id} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <img src={int.logo} alt="" className="h-10 w-10 rounded border" />
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">{int.role}</h3>
                            <p className="text-sm text-slate-500">{int.company}</p>
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-primary-50 border border-primary-100 dark:bg-primary-900/20 dark:border-primary-800 text-center">
                          <p className="text-sm text-primary-700 dark:text-primary-300 uppercase tracking-wider mb-1">AI Match Score</p>
                          <p className="text-3xl font-bold text-primary-700 dark:text-primary-400">{int.matchData.matchScore}%</p>
                        </div>

                        <div className="space-y-2 text-sm border-t border-slate-100 dark:border-slate-800 pt-4">
                          <div className="flex justify-between py-1"><span className="text-slate-500">Location</span><span className="font-medium dark:text-white">{int.location}</span></div>
                          <div className="flex justify-between py-1"><span className="text-slate-500">Mode</span><span className="font-medium dark:text-white">{int.workMode}</span></div>
                          <div className="flex justify-between py-1"><span className="text-slate-500">Duration</span><span className="font-medium dark:text-white">{int.duration}</span></div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                          <p className="text-xs font-bold uppercase text-slate-500 mb-2">Skill Overview</p>
                          <div className="flex flex-wrap gap-1">
                            {int.matchData.strong.map(s => <span key={s} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs">{s}</span>)}
                            {int.matchData.improve.map(s => <span key={s} className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs">{s}</span>)}
                            {int.matchData.missing.map(s => <span key={s} className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs">{s}</span>)}
                          </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                          <p className="text-xs font-bold uppercase text-slate-500 mb-2">Skill Gaps</p>
                          {int.gaps.length === 0 ? <p className="text-sm text-slate-500">None!</p> : int.gaps.map((g,i) => (
                            <div key={i} className="flex justify-between text-sm mb-1">
                              <span className="dark:text-white">{g.skill}</span>
                              <span className="text-red-500">-{g.gap}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
