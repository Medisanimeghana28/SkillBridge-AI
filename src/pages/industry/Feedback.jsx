import { useState, useEffect } from "react";
import { storageService } from "@/services/storageService";
import { Button } from "@/components/common/Button";
import { MessageSquare, Star, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function IndustryFeedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setFeedbackList(storageService.getFeedback());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const newFeedback = {
      id: `fb_${Date.now()}`,
      skill: formData.get('skill'),
      importance: formData.get('importance'),
      rating: parseInt(formData.get('rating')),
      comment: formData.get('comment'),
      company: 'TechNova Labs',
      submittedAt: new Date().toISOString()
    };

    storageService.saveFeedback(newFeedback);
    setFeedbackList(storageService.getFeedback());
    e.target.reset();
    
    setToast("Prototype feedback submitted successfully.");
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="space-y-6 relative max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-teal-600 dark:text-teal-500" />
          Industry Feedback
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Provide direct feedback on student skill gaps to help Academia adjust their training programs. (Prototype Demo Data)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="md:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 h-fit shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Submit Feedback</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Skill</label>
              <select name="skill" required className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-teal-500">
                <option value="Cloud Computing">Cloud Computing</option>
                <option value="Docker / Kubernetes">Docker / Kubernetes</option>
                <option value="System Design">System Design</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="React">React</option>
                <option value="Communication">Communication</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Importance for TechNova Labs</label>
              <select name="importance" required className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-teal-500">
                <option value="High">High (Critical)</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Student Rating (1-5)</label>
              <select name="rating" required className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-teal-500">
                <option value="">Select a rating</option>
                <option value="1">1 - Very Poor</option>
                <option value="2">2 - Needs Improvement</option>
                <option value="3">3 - Average</option>
                <option value="4">4 - Good</option>
                <option value="5">5 - Excellent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Detailed Comment</label>
              <textarea name="comment" required rows="3" placeholder="e.g. Students need more practical deployment experience..." className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-teal-500"></textarea>
            </div>

            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2">
              Send Feedback <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* History Column */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Recent Submissions</span>
            <span className="text-xs font-normal text-slate-500 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">Prototype Data</span>
          </h2>
          
          <div className="space-y-3">
            {feedbackList.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-slate-500">No feedback submitted yet.</p>
              </div>
            ) : (
              feedbackList.map(item => (
                <div key={item.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white">{item.skill}</h3>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${item.importance === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                          {item.importance} Priority
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{new Date(item.submittedAt).toLocaleString()}</p>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < item.rating ? 'fill-current' : 'text-slate-200 dark:text-slate-700'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 italic border-l-2 border-slate-200 dark:border-slate-700 pl-3">"{item.comment}"</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

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
