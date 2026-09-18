import { useMemo, useState } from "react";
import { useStudentData } from "@/hooks/useStudentData";
import { useAuth } from "@/context/AuthContext";
import { skillService } from "@/services/skillService";
import {
  ResponsiveContainer, Radar, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Tooltip,
} from "recharts";
import { Dna, Plus, CheckCircle2, Pencil, Trash2, X, AlertCircle, Search, Award, BarChart3, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";
import AssessmentModal from "@/components/student/AssessmentModal";
import { verificationForScore } from "@/services/assessmentService";

const VERIF_STYLE = {
  Verified: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Partially Verified": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Claimed: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  Unverified: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

export default function SkillDNA() {
  const { data, loading, refetch } = useStudentData();
  const { user } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [assessing, setAssessing] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState(50);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const skills = data.skills || [];

  const stats = useMemo(() => {
    if (skills.length === 0) return { total: 0, avg: 0, verified: 0, partial: 0 };
    const total = skills.reduce((s, r) => s + (r.proficiency || 0), 0);
    return {
      total: skills.length,
      avg: Math.round(total / skills.length),
      verified: skills.filter((r) => r.verification_status === "Verified").length,
      partial: skills.filter((r) => r.verification_status === "Partially Verified").length,
    };
  }, [skills]);

  const radarData = useMemo(
    () =>
      [...skills]
        .sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0))
        .slice(0, 8)
        .map((r) => ({
          subject: (r.skills?.name || "?").length > 12
            ? `${(r.skills?.name || "?").slice(0, 11)}…`
            : r.skills?.name || "?",
          A: r.proficiency || 0,
          fullMark: 100,
        })),
    [skills]
  );

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? skills.filter((r) => (r.skills?.name || "").toLowerCase().includes(q))
      : skills;
    const map = new Map();
    for (const r of filtered) {
      const cat = r.skills?.category || "Uncategorized";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(r);
    }
    return [...map.entries()]
      .map(([cat, rows]) => ({
        cat,
        rows: rows.sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0)),
        avg: Math.round(rows.reduce((s, r) => s + (r.proficiency || 0), 0) / rows.length),
      }))
      .sort((a, b) => b.rows.length - a.rows.length);
  }, [skills, search]);

  // Adding a skill requires passing an assessment — the score becomes the
  // proficiency, so unverifiable claims can't enter Skill DNA as fact.
  const handleStartAssessment = (e) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setError("");
    setAssessing(name.trim());
  };

  const handleAssessmentComplete = async (score) => {
    const skillName = assessing;
    setAssessing(null);
    if (!user || !skillName) return;
    setSaving(true);
    setError("");
    try {
      await skillService.addStudentSkill(
        user.id,
        skillName,
        score,
        "Assessment",
        verificationForScore(score)
      );
      setName("");
      setShowForm(false);
      refetch();
    } catch (err) {
      setError(err.message || "Failed to save skill.");
    } finally {
      setSaving(false);
    }
  };

  // Explicitly self-reported (always Unverified) — for skills with no
  // assessment coverage and no AI key configured.
  const handleSelfReport = async (e) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setSaving(true);
    setError("");
    try {
      await skillService.addStudentSkill(user.id, name.trim(), 30, "Manual", "Unverified");
      setName("");
      setShowForm(false);
      refetch();
    } catch (err) {
      setError(err.message || "Failed to add skill.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async (skill) => {
    setBusyId(skill.id);
    setError("");
    try {
      await skillService.updateProficiency(skill.id, editValue);
      setEditingId(null);
      refetch();
    } catch (err) {
      setError(err.message || "Failed to update skill.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (skill) => {
    if (!window.confirm(`Remove "${skill.skills?.name}" from your Skill DNA?`)) return;
    setBusyId(skill.id);
    setError("");
    try {
      await skillService.removeStudentSkill(skill.id);
      refetch();
    } catch (err) {
      setError(err.message || "Failed to remove skill.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading Skill DNA...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Skill DNA</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Map, track, and verify your skills to unlock better career matches.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Close" : "Add Skill"}
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-start gap-3 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleStartAssessment} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white">Add a skill</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Skill name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. React, Python, Communication"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-white"
            />
          </div>
          <p className="text-xs text-slate-500">
            You will take a short assessment on this skill — your score becomes the proficiency,
            so only proven skills enter your DNA. Names are matched against the shared dictionary
            (e.g. “ReactJS” → “React”).
          </p>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" isLoading={saving} className="gap-2">
              <ClipboardCheck className="h-4 w-4" /> Take Assessment
            </Button>
            <Button type="button" variant="outline" disabled={saving || !name.trim()} onClick={handleSelfReport}>
              Save as self-reported instead
            </Button>
          </div>
          <p className="text-[11px] text-slate-400">Self-reported skills are always marked Unverified.</p>
        </form>
      )}

      {assessing && (
        <AssessmentModal
          skillName={assessing}
          onComplete={handleAssessmentComplete}
          onClose={() => setAssessing(null)}
        />
      )}

      {skills.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Dna className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Your DNA is Empty</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2 mb-4">
            Upload your resume or manually add skills to build your Skill DNA profile.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/student/resume-analyzer">
              <Button variant="outline">Upload Resume</Button>
            </Link>
            <Button className="gap-2" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" /> Add Skills Manually
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Skills mapped", value: stats.total, icon: Dna, tint: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
              { label: "Avg proficiency", value: `${stats.avg}%`, icon: BarChart3, tint: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
              { label: "Verified", value: stats.verified, icon: CheckCircle2, tint: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
              { label: "Partially verified", value: stats.partial, icon: Award, tint: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
            ].map((c) => (
              <div key={c.label} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                <div className={cn("p-2.5 rounded-lg", c.tint)}><c.icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs font-medium text-slate-500">{c.label}</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">Top skills radar</h3>
              <p className="text-xs text-slate-500 mb-4">Your 8 strongest proficiencies</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                      formatter={(value) => [`${value}%`, "Proficiency"]}
                    />
                    <Radar name="Proficiency" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-3 mt-2">
                <Link to="/student/skill-gap" className="text-sm font-medium text-primary-600 hover:underline">
                  Analyze gaps →
                </Link>
                <Link to="/student/roadmap" className="text-sm font-medium text-primary-600 hover:underline">
                  Build roadmap →
                </Link>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-4">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter your skills..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              {grouped.map((g) => (
                <div key={g.cat} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-900 dark:text-white">{g.cat}</h3>
                    <span className="text-xs text-slate-500">{g.rows.length} skills · {g.avg}% avg</span>
                  </div>
                  <div className="space-y-3">
                    {g.rows.map((skill) => (
                      <div key={skill.id}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">
                              {skill.skills?.name}
                            </span>
                            <span className={cn(
                              "shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full",
                              VERIF_STYLE[skill.verification_status] || VERIF_STYLE.Claimed
                            )}>
                              {skill.verification_status || "Claimed"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs text-slate-500 w-10 text-right">{skill.proficiency}%</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => {
                                setEditingId(editingId === skill.id ? null : skill.id);
                                setEditValue(skill.proficiency ?? 50);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                              disabled={busyId === skill.id}
                              onClick={() => handleDelete(skill)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="h-1.5 mt-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              skill.verification_status === "Verified" ? "bg-emerald-500" : "bg-primary-500"
                            )}
                            style={{ width: `${skill.proficiency || 0}%` }}
                          />
                        </div>
                        {editingId === skill.id && (
                          <div className="mt-2 flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={editValue}
                              onChange={(e) => setEditValue(Number(e.target.value))}
                              className="flex-1 accent-primary-600"
                            />
                            <span className="text-xs text-slate-600 dark:text-slate-300 w-10 text-right">{editValue}%</span>
                            <Button size="sm" disabled={busyId === skill.id} isLoading={busyId === skill.id} onClick={() => handleEditSave(skill)}>
                              Save
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {grouped.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-8">No skills match “{search}”.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
