import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { internshipService, applicationService } from "@/services/internshipService";
import { Briefcase, MapPin, Users, Plus, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/common/Button";

const STATUSES = ["Applied", "Under Review", "Shortlisted", "Interview", "Selected", "Rejected"];

const emptyForm = {
  title: "",
  description: "",
  location: "",
  work_mode: "Remote",
  duration: "",
  required_skills: "",
};

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [notice, setNotice] = useState({ type: "", message: "" });

  const fetchJobs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const rows = await internshipService.getIndustryInternships(user.id);
      setJobs(rows || []);

      if (rows?.length > 0) {
        const ids = rows.map((j) => j.id);
        const { data: apps, error } = await supabase
          .from("applications")
          .select("internship_id")
          .in("internship_id", ids);
        if (error) throw error;
        const grouped = {};
        for (const a of apps || []) {
          grouped[a.internship_id] = (grouped[a.internship_id] || 0) + 1;
        }
        setCounts(grouped);
      }
    } catch (err) {
      setNotice({ type: "error", message: err.message || "Failed to load internships." });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const openApplicants = async (job) => {
    setSelectedJob(job);
    setApplicantsLoading(true);
    try {
      const rows = await applicationService.getInternshipApplications(job.id);
      setApplicants(rows || []);
    } catch (err) {
      setNotice({ type: "error", message: err.message || "Failed to load applicants." });
    } finally {
      setApplicantsLoading(false);
    }
  };

  const handleStatusChange = async (appId, status) => {
    try {
      await applicationService.updateStatus(appId, status);
      setApplicants((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)));
    } catch (err) {
      setNotice({ type: "error", message: err.message || "Failed to update status." });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setNotice({ type: "", message: "" });
    try {
      await internshipService.createInternship({
        industry_id: user.id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        location: form.location.trim() || "Remote",
        work_mode: form.work_mode,
        duration: form.duration.trim() || null,
        required_skills: form.required_skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        status: "Open",
      });
      setForm(emptyForm);
      setShowForm(false);
      setNotice({ type: "success", message: "Internship posted." });
      fetchJobs();
    } catch (err) {
      setNotice({ type: "error", message: err.message || "Failed to post internship." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading internships...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Internships</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Post opportunities to find verified talent from the student ecosystem.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> Post Internship
        </Button>
      </div>

      {notice.message && (
        <div className={`p-4 rounded-lg border flex items-start gap-3 ${
          notice.type === "error"
            ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400"
            : "bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-400"
        }`}>
          {notice.type === "error"
            ? <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            : <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />}
          <p className="text-sm font-medium">{notice.message}</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">New Internship</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <input required placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
            <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
            <select value={form.work_mode} onChange={(e) => setForm({ ...form, work_mode: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              <option>Remote</option>
              <option>On-site</option>
              <option>Hybrid</option>
            </select>
            <input placeholder="Duration (e.g. 3 months)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
          </div>
          <textarea placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
          <input placeholder="Required skills, comma separated (e.g. Python, SQL, Communication)" value={form.required_skills}
            onChange={(e) => setForm({ ...form, required_skills: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
          <Button type="submit" isLoading={saving}>Publish Internship</Button>
        </form>
      )}

      {jobs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Internships Posted</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            You haven't created any internship opportunities yet. Post an internship to start receiving applications.
          </p>
          <Button className="mt-4 gap-2 mx-auto" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Create First Internship
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col shadow-sm">
              <div className="mb-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{job.title}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                  <MapPin className="h-4 w-4" /> {job.location} ({job.work_mode})
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-slate-400" /> {counts[job.id] || 0} Applications
                </span>
                <Button variant="outline" size="sm" onClick={() => openApplicants(job)}>Manage</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedJob && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Applicants — {selectedJob.title}
            </h3>
            <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          {applicantsLoading ? (
            <p className="p-6 text-slate-500">Loading applicants...</p>
          ) : applicants.length === 0 ? (
            <p className="p-6 text-slate-500">No applications yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-3 font-medium">Candidate</th>
                    <th className="px-4 py-3 font-medium">Match</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <td className="px-6 py-3">
                        <p className="font-medium text-slate-900 dark:text-white">{a.profiles?.full_name || "Unknown"}</p>
                        <p className="text-xs text-slate-500">{a.profiles?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{a.match_score ?? 0}%</td>
                      <td className="px-4 py-3">
                        <select
                          value={a.status}
                          onChange={(e) => handleStatusChange(a.id, e.target.value)}
                          className="px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
