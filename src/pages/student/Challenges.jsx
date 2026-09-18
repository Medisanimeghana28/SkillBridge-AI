import { useEffect, useState } from "react";
import { useStudentData } from "@/hooks/useStudentData";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { challengeService } from "@/services/challengeService";
import { Target, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/common/Button";

export default function Challenges() {
  const { data, loading: dataLoading } = useStudentData();
  const { user } = useAuth();

  const [challenges, setChallenges] = useState([]);
  const [submittedIds, setSubmittedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [form, setForm] = useState({ project_title: "", github_url: "", demo_url: "", technologies: "" });
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ type: "", message: "" });

  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      setLoading(true);
      try {
        const [all, mine] = await Promise.all([
          challengeService.getAllChallenges(),
          user ? challengeService.getStudentSubmissions(user.id) : Promise.resolve([]),
        ]);
        if (!cancelled) {
          setChallenges((all || []).filter((c) => (c.status || "Active") === "Active"));
          setSubmittedIds(new Set((mine || []).map((s) => s.challenge_id)));
        }
      } catch (err) {
        if (!cancelled) setNotice({ type: "error", message: err.message || "Failed to load challenges." });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const bumpVerification = async (challenge) => {
    // Completing a challenge is evidence: lift matching skills to Partially Verified.
    const required = (Array.isArray(challenge.required_skills) ? challenge.required_skills : [])
      .map((s) => String(s || "").trim().toLowerCase())
      .filter(Boolean);
    if (required.length === 0 || !user) return;

    const matches = (data.skills || []).filter((row) =>
      required.includes(String(row.skills?.name || row.name || "").trim().toLowerCase())
    );
    for (const m of matches) {
      if (m.verification_status === "Verified") continue;
      await supabase
        .from("student_skills")
        .update({ verification_status: "Partially Verified" })
        .eq("id", m.id);
    }
  };

  const handleSubmit = async (challenge) => {
    if (!user) return;
    if (!form.project_title.trim()) {
      setNotice({ type: "error", message: "Project title is required." });
      return;
    }
    setSubmitting(true);
    setNotice({ type: "", message: "" });
    try {
      await challengeService.submitChallenge({
        challenge_id: challenge.id,
        student_id: user.id,
        project_title: form.project_title.trim(),
        github_url: form.github_url.trim() || null,
        demo_url: form.demo_url.trim() || null,
        technologies: form.technologies.split(",").map((t) => t.trim()).filter(Boolean),
        status: "Submitted",
      });
      await bumpVerification(challenge);
      setSubmittedIds((prev) => new Set(prev).add(challenge.id));
      setOpenId(null);
      setForm({ project_title: "", github_url: "", demo_url: "", technologies: "" });
      setNotice({ type: "success", message: "Submission received. Matching skills marked Partially Verified." });
    } catch (err) {
      if (err.code === "23505") {
        setSubmittedIds((prev) => new Set(prev).add(challenge.id));
        setNotice({ type: "success", message: "You already submitted to this challenge." });
      } else {
        setNotice({ type: "error", message: err.message || "Failed to submit." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || dataLoading) return <div className="p-8 text-slate-500">Loading challenges...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Real-World Challenges</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Complete industry-sponsored challenges to build verified skill evidence.
        </p>
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

      {challenges.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Challenges Available</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            There are currently no challenges posted by industry partners.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((c) => {
            const submitted = submittedIds.has(c.id);
            const open = openId === c.id;
            return (
              <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col shadow-sm">
                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-2.5 py-1 rounded-full mb-3 self-start">
                  {c.domain || "General"}
                </span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{c.title}</h3>
                {c.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">{c.description}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                  <Clock className="h-4 w-4" /> {c.duration || "Flexible"} · {c.difficulty || "Open"}
                </div>
                {Array.isArray(c.required_skills) && c.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {c.required_skills.slice(0, 6).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {submitted ? (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" /> Submitted
                    </span>
                  ) : open ? (
                    <div className="space-y-2">
                      <input placeholder="Project title *" value={form.project_title}
                        onChange={(e) => setForm({ ...form, project_title: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm" />
                      <input placeholder="GitHub URL" value={form.github_url}
                        onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm" />
                      <input placeholder="Demo URL" value={form.demo_url}
                        onChange={(e) => setForm({ ...form, demo_url: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm" />
                      <input placeholder="Technologies, comma separated" value={form.technologies}
                        onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm" />
                      <div className="flex gap-2">
                        <Button size="sm" isLoading={submitting} onClick={() => handleSubmit(c)}>Submit</Button>
                        <Button size="sm" variant="ghost" onClick={() => setOpenId(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => setOpenId(c.id)}>Start Challenge</Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
