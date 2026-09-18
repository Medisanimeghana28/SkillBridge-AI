import { useEffect, useState } from "react";
import { useStudentData } from "@/hooks/useStudentData";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { CheckCircle2, Award, Briefcase, ChevronRight, Share2, Printer, Link2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/common/Button";

export default function Passport() {
  const { data, loading } = useStudentData();
  const { user } = useAuth();
  const [shareToken, setShareToken] = useState(null);
  const [shareBusy, setShareBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function fetchToken() {
      if (!user) return;
      const { data: row } = await supabase
        .from("profile_share_tokens")
        .select("token")
        .eq("student_id", user.id)
        .maybeSingle();
      if (!cancelled && row) setShareToken(row.token);
    }
    fetchToken();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const enableSharing = async () => {
    if (!user) return;
    setShareBusy(true);
    setShareError("");
    try {
      const token = crypto.randomUUID().replace(/-/g, "");
      const { error } = await supabase
        .from("profile_share_tokens")
        .upsert({ student_id: user.id, token }, { onConflict: "student_id" });
      if (error) throw error;
      setShareToken(token);
    } catch (err) {
      setShareError(err.message || "Failed to enable sharing.");
    } finally {
      setShareBusy(false);
    }
  };

  const disableSharing = async () => {
    if (!user) return;
    setShareBusy(true);
    setShareError("");
    try {
      const { error } = await supabase
        .from("profile_share_tokens")
        .delete()
        .eq("student_id", user.id);
      if (error) throw error;
      setShareToken(null);
    } catch (err) {
      setShareError(err.message || "Failed to disable sharing.");
    } finally {
      setShareBusy(false);
    }
  };

  const copyLink = async () => {
    if (!shareToken) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/passport/${shareToken}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setShareError("Could not copy to clipboard.");
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading Skill Passport...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">My Skill Passport</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Your verified, portable record of skills, experiences, and ecosystem readiness.
          </p>
        </div>
        <Link to="/student/passport-preview">
          <Button variant="outline">Preview Public Passport</Button>
        </Link>
      </div>

      {data.skills.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Award className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Passport Incomplete</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2 mb-4">
            You need to build your Skill DNA to unlock your verified Skill Passport.
          </p>
          <Link to="/student/skills" className="text-primary-600 font-medium hover:underline flex items-center justify-center gap-1">
            Build your Skill DNA <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
            <div className="h-20 w-20 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-2xl font-bold">
              {data.academic?.student_id?.substring(0,2) || 'SP'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Skill Passport Active</h2>
              <p className="text-slate-500">Verified by SkillBridge AI Ecosystem</p>
            </div>
          </div>

          <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-200">Verified Skills</h3>
          <div className="flex flex-wrap gap-2 mb-8">
            {data.skills.filter(s => s.verification_status === 'Verified').map(skill => (
              <span key={skill.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {skill.skills?.name}
              </span>
            ))}
            {data.skills.filter(s => s.verification_status === 'Verified').length === 0 && (
              <p className="text-slate-500 text-sm">No skills verified yet.</p>
            )}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary-500" /> Share & Export
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Enable a public link to share your verified passport with recruiters, or download it as PDF.
        </p>
        {shareError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 border border-red-100 text-sm font-medium dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {shareError}
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" /> Download PDF
          </Button>
          {shareToken ? (
            <>
              <Button variant="outline" onClick={copyLink} className="gap-2">
                <Link2 className="h-4 w-4" /> {copied ? "Copied!" : "Copy Share Link"}
              </Button>
              <Button variant="ghost" onClick={disableSharing} isLoading={shareBusy}>
                Disable sharing
              </Button>
            </>
          ) : (
            <Button onClick={enableSharing} isLoading={shareBusy}>
              Enable Share Link
            </Button>
          )}
        </div>
        {shareToken && (
          <p className="mt-3 text-xs text-slate-500 break-all">
            {`${typeof window !== "undefined" ? window.location.origin : ""}/passport/${shareToken}`}
          </p>
        )}
      </div>
    </div>
  );
}
