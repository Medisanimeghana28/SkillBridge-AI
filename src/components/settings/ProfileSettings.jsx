import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/common/Button";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function ProfileSettings({ title = "Profile Settings" }) {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ full_name: "", company_name: "", institution_name: "", target_role: "" });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: "", message: "" });

  useEffect(() => {
    if (user?.profile) {
      setForm({
        full_name: user.profile.full_name || "",
        company_name: user.profile.company_name || "",
        institution_name: user.profile.institution_name || "",
        target_role: user.profile.target_role || "",
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice({ type: "", message: "" });
    try {
      const payload = { full_name: form.full_name.trim() || null };
      if (user?.role === "industry") payload.company_name = form.company_name.trim() || null;
      if (user?.role === "academia") payload.institution_name = form.institution_name.trim() || null;
      if (user?.role === "student") payload.target_role = form.target_role.trim() || null;
      await updateProfile(payload);
      setNotice({ type: "success", message: "Profile updated." });
    } catch (err) {
      setNotice({ type: "error", message: err.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-white";

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          {user?.email} · {user?.role}
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

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full name</label>
          <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className={inputCls} placeholder="Your name" />
        </div>
        {user?.role === "industry" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Company name</label>
            <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              className={inputCls} placeholder="Company" />
          </div>
        )}
        {user?.role === "academia" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Institution name</label>
            <input value={form.institution_name} onChange={(e) => setForm({ ...form, institution_name: e.target.value })}
              className={inputCls} placeholder="Institution" />
          </div>
        )}
        {user?.role === "student" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Target role</label>
            <input value={form.target_role} onChange={(e) => setForm({ ...form, target_role: e.target.value })}
              className={inputCls} placeholder="e.g. Data Scientist" />
          </div>
        )}
        <Button type="submit" isLoading={saving}>Save Changes</Button>
      </form>
    </div>
  );
}
