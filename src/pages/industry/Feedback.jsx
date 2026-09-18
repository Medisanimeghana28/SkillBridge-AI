import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { MessageSquare, Plus, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/common/Button";

export default function Feedback() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ institution: "", subject: "", message: "" });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: "", message: "" });

  const fetchFeedback = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .eq("industry_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      setNotice({ type: "error", message: err.message || "Failed to load feedback." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !form.subject.trim() || !form.message.trim()) return;
    setSaving(true);
    setNotice({ type: "", message: "" });
    try {
      const { error } = await supabase.from("feedback").insert([{
        industry_id: user.id,
        institution: form.institution.trim() || null,
        subject: form.subject.trim(),
        message: form.message.trim(),
      }]);
      if (error) throw error;
      setForm({ institution: "", subject: "", message: "" });
      setShowForm(false);
      setNotice({ type: "success", message: "Feedback submitted." });
      fetchFeedback();
    } catch (err) {
      setNotice({ type: "error", message: err.message || "Failed to submit feedback." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading feedback...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Curriculum Feedback</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Provide direct feedback to academic institutions regarding skill readiness.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Close" : "Submit Feedback"}
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
        <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              placeholder="Target institution (optional)"
              value={form.institution}
              onChange={(e) => setForm({ ...form, institution: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
            <input
              required
              placeholder="Subject *"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>
          <textarea
            required
            rows={4}
            placeholder="What should institutions teach differently? *"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
          <Button type="submit" isLoading={saving}>Send Feedback</Button>
        </form>
      )}

      {items.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Feedback Submitted</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            You haven't submitted any curriculum feedback yet. Your feedback helps institutions align their training with your needs.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((f) => (
            <div key={f.id} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{f.subject}</h3>
                  {f.institution && <p className="text-xs text-slate-500 mt-0.5">To: {f.institution}</p>}
                </div>
                <span className="text-xs text-slate-400 shrink-0">
                  {new Date(f.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{f.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
