import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Briefcase, AlertCircle } from "lucide-react";

export default function AdminIndustries() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function fetchIndustries() {
      setLoading(true);
      try {
        const [{ data: partners, error: pErr }, { data: internships }, { data: challenges }, { data: reqs }] =
          await Promise.all([
            supabase.from("profiles").select("id, full_name, company_name, email").eq("role", "industry"),
            supabase.from("internships").select("industry_id"),
            supabase.from("challenges").select("industry_id"),
            supabase.from("industry_requirements").select("industry_id"),
          ]);
        if (pErr) throw pErr;

        const countBy = (arr) => {
          const m = {};
          for (const r of arr || []) {
            if (r.industry_id) m[r.industry_id] = (m[r.industry_id] || 0) + 1;
          }
          return m;
        };
        const ic = countBy(internships);
        const cc = countBy(challenges);
        const rc = countBy(reqs);

        if (!cancelled) {
          setRows((partners || []).map((p) => ({
            ...p,
            internships: ic[p.id] || 0,
            challenges: cc[p.id] || 0,
            requirements: rc[p.id] || 0,
          })));
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load industry partners.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchIndustries();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Industry Partners</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Companies posting internships, challenges, and role requirements.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-start gap-3 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-slate-500">Loading industry partners...</div>
      ) : rows.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No industry partners registered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rows.map((p) => (
            <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 rounded-lg">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{p.company_name || p.full_name}</h3>
                  <p className="text-xs text-slate-500">{p.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{p.internships}</p>
                  <p className="text-xs text-slate-500">Internships</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{p.challenges}</p>
                  <p className="text-xs text-slate-500">Challenges</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{p.requirements}</p>
                  <p className="text-xs text-slate-500">Req. roles</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
