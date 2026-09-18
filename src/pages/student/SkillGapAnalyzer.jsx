import { useEffect, useMemo, useState } from "react";
import { useStudentData } from "@/hooks/useStudentData";
import { useAuth } from "@/context/AuthContext";
import { analyzeRoleGap } from "@/services/gapService";
import { AlertCircle, Target, TrendingUp, Save, Loader2, Map, Briefcase, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { cn } from "@/utils/cn";

function ScoreRing({ score }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#6366f1";
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" strokeWidth="12" className="stroke-slate-100 dark:stroke-slate-800" />
        <circle
          cx="64" cy="64" r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * score) / 100}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-slate-900 dark:text-white">{score}%</span>
        <span className="text-[11px] font-medium text-slate-500">ready</span>
      </div>
    </div>
  );
}

export default function SkillGapAnalyzer() {
  const { data, loading: dataLoading } = useStudentData();
  const { user, updateProfile } = useAuth();

  const profileTarget = user?.profile?.target_role || user?.targetRole || "";
  const [targetRole, setTargetRole] = useState(profileTarget);
  const [saving, setSaving] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTargetRole(profileTarget);
  }, [profileTarget]);

  const studentSkills = useMemo(
    () =>
      (data.skills || []).map((row) => ({
        name: row.skills?.name || row.name,
        proficiency: row.proficiency ?? 0,
      })),
    [data.skills]
  );

  useEffect(() => {
    if (dataLoading || studentSkills.length === 0 || !targetRole.trim()) {
      setAnalysis(null);
      return;
    }
    let cancelled = false;
    setAnalyzing(true);
    setError("");
    analyzeRoleGap(studentSkills, targetRole.trim())
      .then((result) => {
        if (!cancelled) setAnalysis(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to analyze skill gaps.");
      })
      .finally(() => {
        if (!cancelled) setAnalyzing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dataLoading, targetRole, data.skills]);

  const handleSaveTarget = async () => {
    if (!targetRole.trim()) return;
    setSaving(true);
    try {
      await updateProfile({ target_role: targetRole.trim() });
    } catch (err) {
      setError(err.message || "Failed to save target role.");
    } finally {
      setSaving(false);
    }
  };

  if (dataLoading) return <div className="p-8 text-slate-500">Analyzing skill gaps...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Skill Gap Analyzer</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Compare your current capabilities against live industry requirements.
        </p>
      </div>

      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Target role
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. AI Engineer, Data Scientist"
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-white"
          />
          <Button onClick={handleSaveTarget} isLoading={saving} variant="secondary">
            <Save className="h-4 w-4 mr-2" /> Save
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-start gap-3 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {studentSkills.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Insufficient Data</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2 mb-4">
            You need to map your skills before we can analyze your gaps.
          </p>
          <Link to="/student/skills" className="text-primary-600 font-medium hover:underline">
            Complete your Skill DNA &rarr;
          </Link>
        </div>
      ) : !targetRole.trim() ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Set a target role</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            Enter the role you are aiming for above and we will compare your skills
            against current industry postings.
          </p>
        </div>
      ) : analyzing ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Loader2 className="h-12 w-12 text-primary-500 mx-auto mb-3 animate-spin" />
          <p className="text-slate-500">Crunching {targetRole} postings...</p>
        </div>
      ) : analysis && analysis.requiredCount === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center">
          <TrendingUp className="h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No matching postings</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            We could not find industry postings matching &ldquo;{targetRole}&rdquo;.
            Try a different title, e.g. &ldquo;Data Scientist&rdquo; or &ldquo;Human Resources Manager&rdquo;.
          </p>
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex items-center gap-6 flex-wrap">
              <ScoreRing score={analysis.matchScore} />
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Role readiness for <span className="font-semibold text-slate-800 dark:text-slate-200">{targetRole}</span>
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Based on {analysis.postingsCount} live postings · {analysis.requiredCount} key skills ·
                  {" "}{analysis.gaps.length} gaps to close
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Link to="/student/roadmap">
                    <Button size="sm" className="gap-1.5"><Map className="h-3.5 w-3.5" /> Build Roadmap</Button>
                  </Link>
                  <Link to="/student/internships">
                    <Button size="sm" variant="outline" className="gap-1.5"><Briefcase className="h-3.5 w-3.5" /> Find Internships</Button>
                  </Link>
                </div>
              </div>
              {analysis.gaps.length > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 max-w-xs">
                  <Flame className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 dark:text-red-300">
                    <span className="font-bold">{analysis.gaps[0].skill}</span> is your biggest blocker
                    ({analysis.gaps[0].current}% → {analysis.gaps[0].target}%).
                  </p>
                </div>
              )}
            </div>

            {(analysis.strong.length > 0) && (
              <div className="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50">
                <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                  Your strengths — leverage these ({analysis.strong.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.strong.map((s) => {
                    const have = studentSkills.find((x) => x.name.toLowerCase() === s.toLowerCase());
                    return (
                      <span key={s} className="px-2.5 py-1 bg-white dark:bg-slate-800 text-green-800 dark:text-green-300 rounded-full text-xs font-medium border border-green-200 dark:border-green-900/50">
                        {s}{have ? ` · ${have.proficiency}%` : ""}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {analysis.gaps.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500">
              No gaps — you meet the bar for every key skill. Ready to apply.
            </div>
          ) : (
            <>
              {[
                {
                  key: "missing",
                  title: "Missing entirely — start learning these",
                  desc: "Not in your DNA yet. These unlock the most readiness per week.",
                  names: analysis.missing,
                  bar: "bg-red-400",
                  badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                },
                {
                  key: "improve",
                  title: "Needs improvement — push these over the bar",
                  desc: "You have foundations; targeted practice closes the rest.",
                  names: analysis.improve,
                  bar: "bg-amber-400",
                  badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                },
              ].map((section) => {
                const rows = analysis.gaps.filter((g) => section.names.includes(g.skill));
                if (rows.length === 0) return null;
                return (
                  <div key={section.key} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {section.title} ({rows.length})
                    </h3>
                    <p className="text-xs text-slate-500 mb-5">{section.desc}</p>
                    <div className="space-y-5">
                      {rows.map((g) => (
                        <div key={g.skill}>
                          <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-slate-900 dark:text-white">{g.skill}</span>
                              <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", section.badge)}>
                                {g.priority}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500">
                              {g.current}% → {g.target}% · {g.demand} posting{g.demand === 1 ? "" : "s"} · ~{g.estimatedTime}
                            </span>
                          </div>
                          <div className="relative h-2.5 rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              className={cn("absolute left-0 top-0 h-full rounded-full transition-all", section.bar)}
                              style={{ width: `${Math.min(100, g.current)}%` }}
                            />
                            <div
                              className="absolute top-[-3px] h-[16px] w-[3px] rounded bg-slate-800 dark:bg-white"
                              style={{ left: `calc(${g.target}% - 1px)` }}
                              title={`Target ${g.target}%`}
                            />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {g.current === 0
                              ? `Start from zero: ~${g.estimatedTime} to reach hireable level.`
                              : `Close the last ${g.gap}%: ~${g.estimatedTime} of focused practice.`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
