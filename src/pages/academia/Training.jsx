import { useState } from "react";
import { ACADEMIA_DATA } from "@/data/academiaData";
import { aiService } from "@/services/aiService";
import { storageService } from "@/services/storageService";
import { Button } from "@/components/common/Button";
import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, BrainCircuit, Users, Clock, Target, Plus, X, ShieldCheck, TrendingUp
} from "lucide-react";

export default function TrainingRecommendations() {
  const [trainings, setTrainings] = useState(() => {
    const saved = localStorage.getItem('sb_training_programs');
    return saved ? JSON.parse(saved) : ACADEMIA_DATA.defaultTraining;
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const topGaps = aiService.analyzeInstitutionalSkillGaps(ACADEMIA_DATA.heatmap);
  const aiRecommendation = aiService.recommendAcademicTraining(topGaps);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const newTraining = {
      id: `tr_${Date.now()}`,
      name: formData.get('name'),
      skills: formData.get('skills').split(',').map(s => s.trim()),
      departments: formData.get('departments').split(',').map(d => d.trim()),
      duration: formData.get('duration'),
      participants: 0,
      status: 'Planned'
    };

    const updated = [newTraining, ...trainings];
    setTrainings(updated);
    localStorage.setItem('sb_training_programs', JSON.stringify(updated));
    setShowCreateModal(false);
    
    // Simulate Toast
    setToastMessage("Training program created successfully.");
    setTimeout(() => setToastMessage(""), 3000);
  };

  const updateStatus = (id, newStatus) => {
    const updated = trainings.map(t => t.id === id ? { ...t, status: newStatus } : t);
    setTrainings(updated);
    localStorage.setItem('sb_training_programs', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Academic Training Recommendations</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Convert skill gaps into targeted training actions to improve placement outcomes.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4" /> Create Training
        </Button>
      </div>

      {/* AI Recommendation */}
      <div className="rounded-xl bg-gradient-to-br from-indigo-900 to-indigo-950 p-6 md:p-8 text-white relative overflow-hidden shadow-lg border border-indigo-800">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <BrainCircuit className="h-32 w-32" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-12">
          <div className="flex-1">
            <p className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <BrainCircuit className="h-4 w-4" /> AI Recommended Action
            </p>
            <h2 className="text-2xl font-black text-white mb-2">{aiRecommendation.title}</h2>
            <div className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black uppercase rounded w-fit mb-4">
              High Priority
            </div>
            <p className="text-indigo-200 text-sm leading-relaxed mb-6 max-w-lg">
              {aiRecommendation.reason}
            </p>
            <div className="flex gap-3">
              <Button onClick={() => setShowCreateModal(true)} className="bg-white text-indigo-900 hover:bg-indigo-50 border-0">Implement Program</Button>
            </div>
          </div>
          
          <div className="flex-1 space-y-4 pt-4 md:pt-0 md:border-l border-indigo-800 md:pl-12">
            <div>
              <p className="text-indigo-400 text-xs font-semibold mb-1">Target Skills</p>
              <div className="flex flex-wrap gap-2">
                {aiRecommendation.targetSkills.map(s => <span key={s} className="px-2 py-1 bg-indigo-800/50 rounded text-xs font-bold text-indigo-200">{s}</span>)}
              </div>
            </div>
            <div>
              <p className="text-indigo-400 text-xs font-semibold mb-1">Duration & Expected Outcome</p>
              <p className="text-sm font-medium text-white mb-1"><Clock className="inline h-3 w-3 mr-1" /> {aiRecommendation.duration}</p>
              <p className="text-sm text-emerald-400 flex items-center gap-1.5"><TrendingUp className="h-4 w-4"/> {aiRecommendation.expectedOutcome}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Training Programs List */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Active & Planned Programs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainings.map(t => (
            <div key={t.id} className="rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-5 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-lg pr-2 leading-tight">{t.name}</h4>
                <select 
                  value={t.status}
                  onChange={(e) => updateStatus(t.id, e.target.value)}
                  className={cn("text-xs font-bold uppercase rounded px-2 py-1 border-0 ring-1 ring-inset outline-none cursor-pointer appearance-none",
                    t.status === 'Active' ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-800" :
                    t.status === 'Planned' ? "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-800" :
                    "bg-slate-50 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700"
                  )}
                >
                  <option value="Planned">Planned</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              
              <div className="mb-4">
                <div className="flex flex-wrap gap-1.5">
                  {t.skills.map(s => <span key={s} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded dark:bg-slate-800 dark:text-slate-400">{s}</span>)}
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><Users className="h-4 w-4"/> Target Depts</span> <span className="font-semibold text-slate-900 dark:text-slate-300">{t.departments.join(", ")}</span></div>
                <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><Clock className="h-4 w-4"/> Duration</span> <span className="font-semibold text-slate-900 dark:text-slate-300">{t.duration}</span></div>
                <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4"/> Participants</span> <span className="font-semibold text-slate-900 dark:text-slate-300">{t.participants} enrolled</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- CREATE MODAL --- */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="inline-block w-full max-w-md overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-slate-950 shadow-2xl rounded-2xl"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><BookOpen className="h-5 w-5 text-indigo-500" /> Create Training</h2>
                <button type="button" onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Program Name</label>
                  <input name="name" type="text" defaultValue={aiRecommendation.title} required className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Skills Covered (comma separated)</label>
                  <input name="skills" type="text" defaultValue={aiRecommendation.targetSkills.join(", ")} required className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Departments (comma separated)</label>
                  <input name="departments" type="text" defaultValue="CSE, AI & ML, IT" required className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duration</label>
                  <input name="duration" type="text" defaultValue={aiRecommendation.duration} required className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Instructor / Partner (Optional)</label>
                  <input name="instructor" type="text" placeholder="e.g. Internal Faculty or Industry Partner" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <Button variant="ghost" type="button" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Create Program</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 dark:bg-slate-100 dark:text-slate-900 font-medium text-sm"
          >
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
