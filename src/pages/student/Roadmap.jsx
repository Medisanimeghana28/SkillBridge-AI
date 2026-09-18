import { useEffect, useMemo, useState } from "react";
import { useStudentData } from "@/hooks/useStudentData";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { analyzeRoleGap } from "@/services/gapService";
import { Map, ArrowRight, Plus, CheckCircle2, Circle, Loader2, AlertCircle, Clock, Flag } from "lucide-react";
import { cn } from "@/utils/cn";
import { Link } from "react-router-dom";
import { Button } from "@/components/common/Button";

function weeksOf(est) {
  const m = /(\d+)/.exec(String(est || ""));
  return m ? parseInt(m[1], 10) : 2;
}

// Generic workplace skills are real requirements, but a roadmap full of
// "Communication, Teamwork, Adaptability" phases feels irrelevant — they are
// grouped into one closing phase instead of crowding out domain skills.
const FOUNDATIONAL = /^(communication|teamwork|collaboration|adaptability|problem solving|leadership|time management|presentation|critical thinking|work ethic|attention to detail|customer focus|interpersonal skills|multitasking|organization|flexibility)$/i;

function buildStages(gaps) {
  const technical = gaps.filter((g) => !FOUNDATIONAL.test(g.skill)).slice(0, 9);
  const foundational = gaps.filter((g) => FOUNDATIONAL.test(g.skill)).slice(0, 4);

  const chunks = [];
  for (let i = 0; i < technical.length; i += 3) chunks.push(technical.slice(i, i + 3));

  const stages = chunks.map((group, idx) => ({
    title: `Phase ${idx + 1}: ${group.map((g) => g.skill).join(", ")}`,
    skills: group.map((g) => g.skill),
    est_weeks: group.reduce((s, g) => s + weeksOf(g.estimatedTime), 0),
    status: idx === 0 ? "in_progress" : "upcoming",
  }));

  if (foundational.length > 0) {
    stages.push({
      title: `Workplace foundations: ${foundational.map((g) => g.skill).join(", ")}`,
      skills: foundational.map((g) => g.skill),
      est_weeks: Math.max(1, Math.ceil(foundational.reduce((s, g) => s + weeksOf(g.estimatedTime), 0) / 2)),
      status: "upcoming",
     kind: "foundations",
    });
  }

  return stages.map((s, i) => ({ ...s, status: i === 0 ? "in_progress" : s.status }));
}

function progressOf(stages) {
  if (!stages.length) return 0;
  const done = stages.filter((s) => s.status === "completed").length;
  return Math.round((done / stages.length) * 100);
}

const NEXT_STATUS = { upcoming: "in_progress", in_progress: "completed", completed: "upcoming" };
const STATUS_LABEL = { upcoming: "Upcoming", in_progress: "In Progress", completed: "Completed" };

export default function Roadmap() {
  const { data, loading: dataLoading } = useStudentData();
  const { user } = useAuth();

  const [roadmaps, setRoadmaps] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [notice, setNotice] = useState({ type: "", message: "" });

  const studentSkills = useMemo(
    () =>
      (data.skills || []).map((row) => ({
        name: row.skills?.name || row.name,
        proficiency: row.proficiency ?? 0,
      })),
    [data.skills]
  );

  useEffect(() => {
    if (user?.profile?.target_role) setTargetRole(user.profile.target_role);
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    async function fetchRoadmaps() {
      if (!user) return;
      setLoading(true);
      try {
        const { data: rows, error } = await supabase
          .from("roadmaps")
          .select("*")
          .eq("student_id", user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (!cancelled) {
          setRoadmaps(rows || []);
          if (rows?.length > 0 && !activeId) setActiveId(rows[0].id);
        }
      } catch (err) {
        if (!cancelled) setNotice({ type: "error", message: err.message || "Failed to load roadmaps." });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchRoadmaps();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const active = roadmaps.find((r) => r.id === activeId) || null;

  const handleGenerate = async () => {
    if (!user || !targetRole.trim()) {
      setNotice({ type: "error", message: "Enter a target role first." });
      return;
    }
    if (studentSkills.length === 0) {
      setNotice({ type: "error", message: "Map your skills first so gaps can be computed." });
      return;
    }
    setGenerating(true);
    setNotice({ type: "", message: "" });
    try {
      const result = await analyzeRoleGap(studentSkills, targetRole.trim());
      if (result.requiredCount === 0) {
        setNotice({ type: "error", message: `No industry postings found for "${targetRole.trim()}".` });
        return;
      }
      if (result.gaps.length === 0) {
        setNotice({ type: "success", message: "No gaps — you already meet the bar. Nothing to plan." });
        return;
      }
      const stages = buildStages(result.gaps);
      const duration = stages.reduce((s, st) => s + st.est_weeks, 0);
      const { data: row, error } = await supabase
        .from("roadmaps")
        .insert([{
          student_id: user.id,
          target_role: targetRole.trim(),
          duration_weeks: duration,
          stages,
          status: "Active",
        }])
        .select()
        .single();
      if (error) throw error;
      setRoadmaps((prev) => [row, ...prev]);
      setActiveId(row.id);
      setNotice({ type: "success", message: `Roadmap created: ${duration} weeks across ${stages.length} phases.` });
    } catch (err) {
      setNotice({ type: "error", message: err.message || "Failed to generate roadmap." });
    } finally {
      setGenerating(false);
    }
  };

  const setStageStatus = async (index, status) => {
    if (!active) return;
    const stages = active.stages.map((s, i) => (i === index ? { ...s, status } : s));
    const allDone = stages.every((s) => s.status === "completed");
    try {
      const { error } = await supabase
        .from("roadmaps")
        .update({ stages, status: allDone ? "Completed" : "Active", updated_at: new Date().toISOString() })
        .eq("id", active.id);
      if (error) throw error;
      setRoadmaps((prev) =>
        prev.map((r) => (r.id === active.id ? { ...r, stages, status: allDone ? "Completed" : "Active" } : r))
      );
    } catch (err) {
      setNotice({ type: "error", message: err.message || "Failed to update progress." });
    }
  };

  if (loading || dataLoading) return <div className="p-8 text-slate-500">Generating roadmap...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">AI Learning Roadmap</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Your personalized path to bridge skill gaps and achieve placement readiness.
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

      {studentSkills.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Map className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Roadmap Available</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2 mb-4">
            We need to understand your current skills before we can map your journey.
          </p>
          <Link to="/student/skills" className="text-primary-600 font-medium hover:underline flex items-center justify-center gap-1">
            Build your Skill DNA <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <>
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Target role (e.g. Data Scientist)"
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-white"
            />
            <Button onClick={handleGenerate} isLoading={generating} className="gap-2">
              <Plus className="h-4 w-4" /> Generate Roadmap
            </Button>
          </div>

          {roadmaps.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {roadmaps.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setActiveId(r.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    r.id === activeId
                      ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                      : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                  }`}
                >
                  {r.target_role} · {r.status}
                </button>
              ))}
            </div>
          )}

          {active ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {active.target_role} — {active.duration_weeks} weeks
                  </h3>
                  <p className="text-sm text-slate-500">
                    {progressOf(active.stages)}% complete · {active.status}
                  </p>
                </div>
              </div>
              <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-6">
                <div className="h-full bg-primary-500 transition-all" style={{ width: `${progressOf(active.stages)}%` }} />
              </div>
              <div className="relative pl-8">
                <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" />
                <div
                  className="absolute left-[13px] top-2 w-0.5 bg-emerald-500 transition-all"
                  style={{ height: `calc(${progressOf(active.stages)}% - 8px)` }}
                />
                <div className="space-y-4">
                  {active.stages.map((stage, i) => {
                    const done = stage.status === "completed";
                    const current = stage.status === "in_progress";
                    return (
                      <div key={i} className="relative">
                        <div className={cn(
                          "absolute -left-8 top-4 h-7 w-7 rounded-full border-2 flex items-center justify-center bg-white dark:bg-slate-900",
                          done ? "border-emerald-500" : current ? "border-primary-500" : "border-slate-300 dark:border-slate-600"
                        )}>
                          {done ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : current ? (
                            <span className="h-2.5 w-2.5 rounded-full bg-primary-500 animate-pulse" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 text-slate-300" />
                          )}
                        </div>
                        <button
                          onClick={() => setStageStatus(i, NEXT_STATUS[stage.status] || "upcoming")}
                          className={cn(
                            "w-full text-left p-4 rounded-xl border transition-colors",
                            done
                              ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-900/10"
                              : current
                                ? "border-primary-300 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-900/10"
                                : "border-slate-200 dark:border-slate-700 hover:border-primary-300"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className={cn(
                              "font-medium",
                              done ? "text-slate-500 line-through dark:text-slate-400" : "text-slate-900 dark:text-white"
                            )}>
                              {stage.title}
                            </span>
                            <span className={cn(
                              "text-[11px] font-semibold px-2 py-0.5 rounded-full",
                              done
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : current
                                  ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            )}>
                              {STATUS_LABEL[stage.status]}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {(stage.skills || []).map((s) => (
                              <span key={s} className="px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs border border-slate-200 dark:border-slate-700">
                                {s}
                              </span>
                            ))}
                          </div>
                          <span className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                            <Clock className="h-3 w-3" /> ~{stage.est_weeks} weeks · click to advance
                          </span>
                        </button>
                      </div>
                    );
                  })}
                  <div className="relative">
                    <div className="absolute -left-8 top-3 h-7 w-7 rounded-full border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 flex items-center justify-center">
                      <Flag className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 pl-1 pt-4">
                      {active.status === "Completed" ? "Roadmap complete — placement ready." : `${active.target_role} ready in ~${active.duration_weeks} weeks`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            roadmaps.length === 0 && (
              <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                <Map className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No roadmap yet</h3>
                <p className="text-slate-500 max-w-md mx-auto mt-2">
                  Enter your target role above and generate a plan built from live industry demand.
                </p>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
