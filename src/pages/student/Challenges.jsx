import { useState } from 'react';
import { storageService } from '@/services/storageService';
import { Button } from '@/components/common/Button';
import { Target, Clock, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentChallenges() {
  const allChallenges = storageService.getChallenges();
  const completedChallenges = storageService.getCompletedChallenges();
  const completedIds = completedChallenges.map(c => c.challengeId);

  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const activeChallenges = allChallenges.filter(c => !completedIds.includes(c.id) && c.status !== 'Draft');
  const pastChallenges = allChallenges.filter(c => completedIds.includes(c.id));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      storageService.completeChallenge(selectedChallenge.id, {
        projectTitle: 'My Submitted Solution',
        technologies: selectedChallenge.requiredSkills
      });
      setSubmitting(false);
      setSelectedChallenge(null);
      setToast('Challenge completed successfully! Skills have been verified.');
      setTimeout(() => setToast(''), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Industry Challenges</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Solve real-world problems published by industry partners to verify your skills and improve your passport.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Challenges</h2>
          {activeChallenges.map(chal => (
            <div key={chal.id} className="rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6 shadow-sm hover:border-teal-300 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-1 rounded mb-2 inline-block">
                    {chal.domain}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xl leading-tight">{chal.title}</h3>
                </div>
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold dark:bg-slate-800 dark:text-slate-300">
                  {chal.difficulty}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4"/> {chal.duration}</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4"/> {chal.participants} solving</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-6 border border-slate-100 dark:border-slate-800">
                <p className="text-xs uppercase font-bold text-slate-500 mb-2">Verifies the following skills</p>
                <div className="flex flex-wrap gap-2">
                  {chal.requiredSkills.map(s => (
                    <span key={s} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="gap-2 bg-teal-600 hover:bg-teal-700 text-white" onClick={() => setSelectedChallenge(chal)}>
                  Take Challenge <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {activeChallenges.length === 0 && (
            <p className="text-slate-500 italic p-6 text-center border rounded-xl border-dashed">No active challenges available right now.</p>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Completed
            </h2>
            <div className="space-y-4">
              {pastChallenges.map(chal => (
                <div key={chal.id} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{chal.title}</h4>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">✓ Skills Verified</p>
                </div>
              ))}
              {pastChallenges.length === 0 && (
                <p className="text-sm text-slate-500 italic">You haven't completed any challenges yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TAKE CHALLENGE MODAL */}
      <AnimatePresence>
        {selectedChallenge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-slate-900/80 backdrop-blur-sm" onClick={() => setSelectedChallenge(null)} />
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="inline-block w-full max-w-xl overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-slate-950 shadow-2xl rounded-2xl"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{selectedChallenge.title}</h2>
                  <p className="text-sm text-slate-500">Prototype Demo Submission</p>
                </div>
              </div>
              
              <div className="p-6 bg-white dark:bg-slate-950 space-y-4">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-lg">
                  <p className="text-sm text-indigo-800 dark:text-indigo-300">
                    <span className="font-bold">Instructions:</span> Normally, you would download the starting repository, complete the requirements locally, and submit your GitHub URL. For this prototype, simply click submit to simulate completion.
                  </p>
                </div>
                
                <form id="challengeForm" onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GitHub Repository URL</label>
                    <input type="url" defaultValue="https://github.com/aarav/demo-solution" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white" readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Live Demo URL (Optional)</label>
                    <input type="url" defaultValue="https://demo-solution.vercel.app" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white" readOnly />
                  </div>
                </form>
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-right flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setSelectedChallenge(null)} disabled={submitting}>Cancel</Button>
                <Button type="submit" form="challengeForm" className="bg-teal-600 hover:bg-teal-700 text-white" isLoading={submitting}>
                  Submit Solution
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 dark:bg-slate-100 dark:text-slate-900 font-medium text-sm"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
