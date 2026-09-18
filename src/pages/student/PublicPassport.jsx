import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { CheckCircle2, Award, AlertCircle, Briefcase, GraduationCap } from "lucide-react";

export default function PublicPassport() {
  const { token } = useParams();
  const [state, setState] = useState({ loading: true, error: "", profile: null, skills: [], projects: [], certs: [], academic: null });

  useEffect(() => {
    let cancelled = false;
    async function fetchShared() {
      try {
        const { data: tok, error: tErr } = await supabase
          .from("profile_share_tokens")
          .select("student_id")
          .eq("token", token)
          .maybeSingle();
        if (tErr) throw tErr;
        if (!tok) {
          if (!cancelled) setState((s) => ({ ...s, loading: false, error: "This share link is invalid or has been revoked." }));
          return;
        }

        const sid = tok.student_id;
        const [profile, skills, projects, certs, academic] = await Promise.all([
          supabase.from("profiles").select("full_name, target_role").eq("id", sid).maybeSingle(),
          supabase.from("student_skills").select("proficiency, verification_status, skills(name)").eq("student_id", sid),
          supabase.from("projects").select("title, description, technologies").eq("student_id", sid),
          supabase.from("certifications").select("name, issuer").eq("student_id", sid),
          supabase.from("academic_records").select("institution, degree, graduation_year").eq("student_id", sid).limit(1).maybeSingle(),
        ]);
        for (const r of [profile, skills, projects, certs, academic]) {
          if (r.error) throw r.error;
        }

        if (!cancelled) {
          setState({
            loading: false,
            error: "",
            profile: profile.data,
            skills: skills.data || [],
            projects: projects.data || [],
            certs: certs.data || [],
            academic: academic.data || null,
          });
        }
      } catch (err) {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: err.message || "Failed to load passport." }));
      }
    }
    fetchShared();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state.loading) return <div className="p-8 text-slate-500 text-center">Loading shared passport...</div>;

  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="max-w-md text-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Link unavailable</h2>
          <p className="text-slate-500">{state.error}</p>
        </div>
      </div>
    );
  }

  const verified = state.skills.filter((s) => s.verification_status === "Verified");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 shadow-lg">
        <div className="text-center mb-10 pb-10 border-b border-slate-200 dark:border-slate-800">
          <div className="h-24 w-24 bg-primary-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
            {(state.profile?.full_name || "SP").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {state.profile?.full_name || "Skill Passport"}
          </h1>
          <p className="text-slate-500">
            {[state.profile?.target_role, state.academic?.degree, state.academic?.institution].filter(Boolean).join(" · ") ||
              "Verified by the SkillBridge AI ecosystem"}
          </p>
        </div>

        <div className="mb-10">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-500" /> Verified Skills ({verified.length})
          </h3>
          {verified.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {verified.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium text-sm rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="h-4 w-4" /> {s.skills?.name} · {s.proficiency}%
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">No verified skills yet.</p>
          )}
        </div>

        {state.projects.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary-500" /> Projects ({state.projects.length})
            </h3>
            <div className="space-y-3">
              {state.projects.map((p, i) => (
                <div key={i} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="font-semibold text-slate-900 dark:text-white">{p.title}</p>
                  {p.description && <p className="text-sm text-slate-500 mt-1">{p.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {state.certs.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary-500" /> Certifications ({state.certs.length})
            </h3>
            <div className="space-y-2">
              {state.certs.map((c, i) => (
                <p key={i} className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">{c.name}</span>
                  {c.issuer && <span className="text-slate-500"> · {c.issuer}</span>}
                </p>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-10 pt-6 border-t border-slate-200 dark:border-slate-800">
          Shared via SkillBridge AI
        </p>
      </div>
    </div>
  );
}
