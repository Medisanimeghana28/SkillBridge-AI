import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { challengeService } from "@/services/challengeService";
import { Target, Plus, Users, Clock, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/common/Button";

const emptyForm = {
  title: "",
  description: "",
  domain: "",
  difficulty: "Intermediate",
  duration: "",
  required_skills: "",
};

export default function Challenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [notice, setNotice] = useState({ type: "", message: "" });

  const fetchChallenges = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const rows = await challengeService.getIndustryChallenges(user.id);
      setChallenges(rows || []);
      if (rows?.length > 0) {
        const ids = rows.map((c) => c.id);
        const { data, error } = await supabase
          .from("challenge_submissions")
          .select("challenge_id")
          .in("challenge_id", ids);
        if (error) throw error;
        const grouped = {};
        for (const s of data || []) {
          grouped[s.challenge_id] = (grouped[s.challenge_id] || 0) + 1;
        }
        setCounts(grouped);
      }
    } catch (err) {
      setNotice({ type: "error", message: err.message || "Failed to load challenges." });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const openSubmissions = async (challenge) => {
    setSelected(challenge);
    setSubsLoading(true);
    try {
      const { data, error } = await supabase
        .from("challenge_submissions")
        .select("*, profiles(full_name, email)")
        .eq("challenge_id", challenge.id)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      setNotice({ type: "error", message: err.message || "Failed to load submissions." });
    } finally {
      setSubsLoading(false);
    }
  };

  const verifySkills = async (submission, challenge) => {
    // Accepting a submission verifies the student's matching skills.
    const required = (Array.isArray(challenge.required_skills) ? challenge.required_skills : [])
      .map((s) => String(s || "").trim().toLowerCase())
      .filter(Boolean);
    if (required.length === 0) return;

    const { data: rows } = await supabase
      .from("student_skills")
      .select("id, skills(name)")
      .eq("student_id", submission.student_id);
    for (const row of rows || []) {
      if (required.includes(String(row.skills?.name || "").trim().toLowerCase())) {
        await supabase
          .from("student_skills")
          .update({ verification_status: "Verified" })
          .eq("id", row.id);
      }
    }
  };

  const handleDecision = async (submission, accepted) => {
    try {
      const { error } = await supabase
        .from("challenge_submissions")
        .update({ status: accepted ? "Accepted" : "Rejected" })
        .eq("id", submission.id);
      if (error) throw error;
      if (accepted) await verifySkills(submission, selected);
      setSubmissions((prev) =>
        prev.map((s) => (s.id === submission.id ? { ...s, status: accepted ? "Accepted" : "Rejected" } : s))
      );
      if (accepted) {
        setNotice({ type: "success", message: "Submission accepted. Matching skills marked Verified." });
      }
    } catch (err) {
      setNotice({ type: "error", message: err.message || "Failed to update submission." });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setNotice({ type: "", message: "" });
    try {
      await challengeService.createChallenge({
        industry_id: user.id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        domain: form.domain.trim() || "General",
        difficulty: form.difficulty,
        duration: form.duration.trim() || null,
        required_skills: form.required_skills.split(",").map((s) => s.trim()).filter(Boolean),
        status: "Active",
      });
      setForm(emptyForm);
      setShowForm(false);
      setNotice({ type: "success", message: "Challenge published." });
      fetchChallenges();
    } catch (err) {
      setNotice({ type: "error", message: err.message || "Failed to create challenge." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading challenges...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Real-World Challenges</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Post technical challenges to evaluate students on actual industry problems.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> Create Challenge
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
            <h3 className="font-bold text-slate-900 dark:text-white">New Challenge</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <input required placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
            <input placeholder="Domain (e.g. Web Dev, Data Science)" value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
            <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
            <input placeholder="Duration (e.g. 2 weeks)" value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
          </div>
          <textarea placeholder="Description" rows={3} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
          <input placeholder="Required skills, comma separated" value={form.required_skills}
            onChange={(e) => setForm({ ...form, required_skills: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
          <Button type="submit" isLoading={saving}>Publish Challenge</Button>
        </form>
      )}

      {challenges.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Challenges Active</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            You haven't published any challenges yet. Create a challenge to test student skills in the real world.
          </p>
          <Button className="mt-4 gap-2 mx-auto" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Create First Challenge
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col shadow-sm">
              <div className="mb-4">
                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-2.5 py-1 rounded-full mb-3 inline-block">
                  {challenge.domain || "General"}
                </span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{challenge.title}</h3>
                <div className="flex flex-wrap gap-3 text-sm text-slate-500 mt-3">
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {challenge.duration || "Flexible"}</span>
                  <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {counts[challenge.id] || 0} Submissions</span>
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md text-xs font-medium">
                  {challenge.status || "Active"}
                </span>
                <Button variant="outline" size="sm" onClick={() => openSubmissions(challenge)}>View Submissions</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">Submissions — {selected.title}</h3>
            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          {subsLoading ? (
            <p className="p-6 text-slate-500">Loading submissions...</p>
          ) : submissions.length === 0 ? (
            <p className="p-6 text-slate-500">No submissions yet.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {submissions.map((s) => (
                <div key={s.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">{s.project_title}</p>
                    <p className="text-sm text-slate-500">by {s.profiles?.full_name || s.profiles?.email || "Unknown"}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm">
                      {s.github_url && <a href={s.github_url} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">GitHub</a>}
                      {s.demo_url && <a href={s.demo_url} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">Demo</a>}
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {s.status}
                  </span>
                  {s.status === "Submitted" && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleDecision(s, true)}>Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => handleDecision(s, false)}>Reject</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
