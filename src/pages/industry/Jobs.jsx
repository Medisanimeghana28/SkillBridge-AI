import { useState, useEffect } from "react";
import { INDUSTRY_DATA } from "@/data/industryData";
import { storageService } from "@/services/storageService";
import { Button } from "@/components/common/Button";
import { Plus, X, Briefcase, MapPin, Users, CheckCircle2, FileText, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

export default function IndustryJobs() {
  const [internships, setInternships] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  
  useEffect(() => {
    // Read from storageService
    const stored = storageService.getInternships();
    setInternships(stored.filter(i => i.company === "TechNova Labs"));
    setAllApplications(storageService.getApplications());
  }, []);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null); // For managing applications
  const [toast, setToast] = useState("");

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const newInternship = {
      id: `job_${Date.now()}`,
      title: formData.get('title'),
      role: formData.get('title'), // For consistency with matching logic
      company: INDUSTRY_DATA.company.name,
      location: formData.get('location'),
      type: formData.get('mode'),
      workMode: formData.get('mode'),
      duration: formData.get('duration'),
      requiredSkills: formData.get('required').split(',').map(s => ({ name: s.trim() })),
      status: "Active",
      createdAt: new Date().toISOString().split('T')[0]
    };

    storageService.saveInternship(newInternship);
    
    // Refresh local state
    const stored = storageService.getInternships();
    setInternships(stored.filter(i => i.company === "TechNova Labs"));
    setShowCreateModal(false);
    
    setToast("Internship published successfully.");
    setTimeout(() => setToast(""), 3000);
  };

  const updateAppStatus = (appId, newStatus) => {
    storageService.updateApplicationStatus(appId, newStatus);
    setAllApplications(storageService.getApplications());
    setToast(`Status updated to ${newStatus}`);
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Internship Opportunities</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Create and manage internship opportunities based on verified skill requirements.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2 bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="h-4 w-4" /> Create Internship
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Role Title</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Required Skills</th>
                <th className="px-6 py-4 font-medium">Applications</th>
                <th className="px-6 py-4 font-medium">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {internships.map(job => {
                const jobApps = allApplications.filter(a => a.internshipId === job.id);
                return (
                <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white text-base">{job.title || job.role}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                      <MapPin className="h-3 w-3" /> {job.location} • {job.type || job.workMode}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2 py-1 rounded text-xs font-bold uppercase", 
                      job.status === 'Active' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-600"
                    )}>
                      {job.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {job.requiredSkills.slice(0, 3).map(s => (
                        <span key={s.name || s} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300">{s.name || s}</span>
                      ))}
                      {job.requiredSkills.length > 3 && <span className="text-xs text-slate-400">+{job.requiredSkills.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                      <Users className="h-4 w-4" /> {jobApps.length}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{job.createdAt || '2026-08-15'}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedJob(job)}>Manage</Button>
                  </td>
                </tr>
              )})}
              {internships.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">No internships created yet.</td>
                </tr>
              )}
            </tbody>
          </table>
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
              className="inline-block w-full max-w-lg overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-slate-950 shadow-2xl rounded-2xl"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><Briefcase className="h-5 w-5 text-teal-500" /> Create Internship</h2>
                <button type="button" onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role Title</label>
                  <input name="title" type="text" placeholder="e.g. AI/ML Intern" required className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-teal-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
                    <input name="location" type="text" placeholder="e.g. Bangalore" required className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Work Mode</label>
                    <select name="mode" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-teal-500">
                      <option value="Hybrid">Hybrid</option>
                      <option value="Remote">Remote</option>
                      <option value="On-site">On-site</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duration</label>
                    <input name="duration" type="text" placeholder="e.g. 6 Months" required className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-teal-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Required Skills (comma separated)</label>
                  <input name="required" type="text" placeholder="Python, Machine Learning, SQL" required className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-teal-500" />
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-4">
                  <Button variant="ghost" type="button" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">Publish Internship</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MANAGE APPLICATIONS MODAL --- */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-slate-900/70 backdrop-blur-sm" onClick={() => setSelectedJob(null)} />
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="inline-block w-full max-w-3xl overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-slate-950 shadow-2xl rounded-2xl max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Manage Candidates</h2>
                  <p className="text-sm text-slate-500 mt-1">{selectedJob.title || selectedJob.role}</p>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-1 text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {allApplications.filter(a => a.internshipId === selectedJob.id).length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No applications yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allApplications.filter(a => a.internshipId === selectedJob.id).map(app => (
                      <div key={app.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-900 dark:text-white">{app.studentName || 'Student Applicant'}</h3>
                            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 text-xs font-bold rounded">Match: {app.matchScore}%</span>
                          </div>
                          <p className="text-xs text-slate-500">Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : app.appliedDate || 'Recent'}</p>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <select 
                            value={app.status}
                            onChange={(e) => updateAppStatus(app.id, e.target.value)}
                            className={cn(
                              "text-sm font-semibold rounded-lg px-3 py-1.5 border-0 focus:ring-2",
                              app.status === 'Applied' ? "bg-blue-100 text-blue-700" :
                              app.status === 'Under Review' ? "bg-amber-100 text-amber-700" :
                              app.status === 'Shortlisted' ? "bg-green-100 text-green-700" :
                              app.status === 'Selected' ? "bg-emerald-100 text-emerald-700" :
                              app.status === 'Rejected' ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
                            )}
                          >
                            <option value="Applied">Applied</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Interview">Interview</option>
                            <option value="Selected">Selected</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          <Button variant="outline" size="sm">Profile <ChevronRight className="h-3 w-3 ml-1" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
