import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useIndustryData } from "@/hooks/useIndustryData";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Database, X, AlertCircle, CheckCircle2, Pencil } from "lucide-react";
import { Button } from "@/components/common/Button";

const emptyForm = { role_name: "", skills: "" };

export default function Requirements() {
  const { user } = useAuth();
  const { data, loading, refetch } = useIndustryData();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: "", message: "" });

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (req) => {
    setEditing(req);
    setForm({ role_name: req.role_name || "", skills: (req.skills || []).join(", ") });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user || !form.role_name.trim()) return;
    setSaving(true);
    setNotice({ type: "", message: "" });
    try {
      const payload = {
        industry_id: user.id,
        role_name: form.role_name.trim(),
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      };
      if (editing) {
        const { error } = await supabase.from("industry_requirements").update(payload).eq("id", editing.id);
        if (error) throw error;
        setNotice({ type: "success", message: "Requirement updated." });
      } else {
        const { error } = await supabase.from("industry_requirements").insert([payload]);
        if (error) throw error;
        setNotice({ type: "success", message: "Requirement added." });
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      refetch();
    } catch (err) {
      setNotice({ type: "error", message: err.message || "Failed to save requirement." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (req) => {
    if (!window.confirm(`Delete the "${req.role_name}" requirement?`)) return;
    try {
      const { error } = await supabase.from("industry_requirements").delete().eq("id", req.id);
      if (error) throw error;
      refetch();
    } catch (err) {
      setNotice({ type: "error", message: err.message || "Failed to delete." });
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading requirements...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Role Requirements</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Define the exact skills your company needs. This data shapes the academic curriculum.
          </p>
        </div>
        <Button className="gap-2" onClick={openAdd}><Plus className="h-4 w-4" /> Add Requirement</Button>
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
        <form onSubmit={handleSave} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">{editing ? "Edit Requirement" : "New Requirement"}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <input
            required
            placeholder="Role name (e.g. Frontend Engineer)"
            value={form.role_name}
            onChange={(e) => setForm({ ...form, role_name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
          <textarea
            placeholder="Required skills, comma separated (e.g. React, TypeScript, Communication)"
            rows={3}
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
          <Button type="submit" isLoading={saving}>{editing ? "Save Changes" : "Add Requirement"}</Button>
        </form>
      )}

      {data.requirements.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Database className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Requirements Defined</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            Add role requirements to tell the ecosystem exactly what skills you are looking for in graduates.
          </p>
          <Button className="mt-4 gap-2 mx-auto" onClick={openAdd}><Plus className="h-4 w-4" /> Define First Role</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.requirements.map((req) => (
            <div key={req.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">{req.role_name}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {Array.isArray(req.skills) && req.skills.map((skill, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-medium border border-slate-200 dark:border-slate-700">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="mt-auto flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(req)}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(req)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
