import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useStudentData } from "@/hooks/useStudentData";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/common/Button";
import {
  Mail, MapPin, GraduationCap, Target, Github, Linkedin, Globe,
  Pencil, CheckCircle2, AlertCircle, Briefcase, Award,
} from "lucide-react";

export default function StudentProfile() {
  const { user, updateProfile } = useAuth();
  const { data } = useStudentData();

  const [academic, setAcademic] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", target_role: "", github_url: "", linkedin_url: "", portfolio_url: "" });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: "", message: "" });

  useEffect(() => {
    let cancelled = false;
    async function fetchAcademic() {
      if (!user) return;
      const { data: row } = await supabase
        .from("academic_records")
        .select("institution, department, degree, graduation_year, gpa")
        .eq("student_id", user.id)
        .limit(1)
        .maybeSingle();
      if (!cancelled && row) setAcademic(row);
    }
    fetchAcademic();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (user?.profile) {
      setForm({
        full_name: user.profile.full_name || "",
        target_role: user.profile.target_role || "",
        github_url: user.profile.github_url || "",
        linkedin_url: user.profile.linkedin_url || "",
        portfolio_url: user.profile.portfolio_url || "",
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice({ type: "", message: "" });
    try {
      await updateProfile({
        full_name: form.full_name.trim() || null,
        target_role: form.target_role.trim() || null,
        github_url: form.github_url.trim() || null,
        linkedin_url: form.linkedin_url.trim() || null,
        portfolio_url: form.portfolio_url.trim() || null,
      });
      setEditing(false);
      setNotice({ type: "success", message: "Profile updated." });
    } catch (err) {
      setNotice({ type: "error", message: err.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  const profile = user?.profile;
  const name = profile?.full_name || user?.email?.split("@")[0] || "Student";
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const verifiedCount = (data.skills || []).filter((s) => s.verification_status === "Verified").length;

  const inputCls =
    "w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-white";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Profile</h1>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setEditing((v) => !v)}>
          <Pencil className="h-4 w-4" /> {editing ? "Cancel" : "Edit Profile"}
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

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="h-24 w-24 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-3xl font-bold dark:bg-primary-900/50 dark:text-primary-400 shrink-0">
          {initials}
        </div>
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{name}</h2>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 justify-center sm:justify-start">
            {(academic?.degree || academic?.department) && (
              <span className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                {[academic.degree, academic.department].filter(Boolean).join(" · ")}
              </span>
            )}
            {academic?.institution && <span>{academic.institution}</span>}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 justify-center sm:justify-start">
            <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {profile?.email || user?.email}</span>
            {academic?.graduation_year && (
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Class of {academic.graduation_year}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-sm justify-center sm:justify-start pt-1">
            {profile?.github_url && (
              <a href={profile.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary-600 hover:underline">
                <Github className="h-4 w-4" /> GitHub
              </a>
            )}
            {profile?.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary-600 hover:underline">
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
            )}
            {profile?.portfolio_url && (
              <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary-600 hover:underline">
                <Globe className="h-4 w-4" /> Portfolio
              </a>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full name</label>
              <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Target role</label>
              <input value={form.target_role} onChange={(e) => setForm({ ...form, target_role: e.target.value })}
                className={inputCls} placeholder="e.g. Data Scientist" />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">GitHub URL</label>
              <input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">LinkedIn URL</label>
              <input value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Portfolio URL</label>
              <input value={form.portfolio_url} onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })} className={inputCls} />
            </div>
          </div>
          <Button type="submit" isLoading={saving}>Save Changes</Button>
        </form>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary-500" />
          Target Role: <span className="text-primary-600">{profile?.target_role || "Not set yet"}</span>
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
            <Briefcase className="h-5 w-5 mx-auto mb-1 text-slate-400" />
            <p className="text-xl font-bold text-slate-900 dark:text-white">{(data.skills || []).length}</p>
            <p className="text-xs text-slate-500">Skills mapped</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
            <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
            <p className="text-xl font-bold text-slate-900 dark:text-white">{verifiedCount}</p>
            <p className="text-xs text-slate-500">Verified</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
            <Award className="h-5 w-5 mx-auto mb-1 text-slate-400" />
            <p className="text-xl font-bold text-slate-900 dark:text-white">{(data.applications || []).length}</p>
            <p className="text-xs text-slate-500">Applications</p>
          </div>
        </div>
      </div>
    </div>
  );
}
