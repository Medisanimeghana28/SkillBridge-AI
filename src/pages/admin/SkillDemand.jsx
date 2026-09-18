import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Activity, AlertCircle } from "lucide-react";

const TOP_N = 30;

export default function AdminSkillDemand() {
  const [rows, setRows] = useState([]);
  const [postings, setPostings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function fetchDemand() {
      setLoading(true);
      try {
        const { data, error: qErr } = await supabase.from("industry_requirements").select("skills");
        if (qErr) throw qErr;

        const freq = new Map();
        for (const row of data || []) {
          const seen = new Set();
          for (const raw of Array.isArray(row.skills) ? row.skills : []) {
            const norm = String(raw || "").trim().toLowerCase();
            if (!norm || seen.has(norm)) continue;
            seen.add(norm);
            if (!freq.has(norm)) freq.set(norm, { display: String(raw).trim(), count: 0 });
            freq.get(norm).count += 1;
          }
        }

        const top = [...freq.values()].sort((a, b) => b.count - a.count).slice(0, TOP_N);
        if (!cancelled) {
          setRows(top);
          setPostings((data || []).length);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load skill demand.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchDemand();
    return () => {
      cancelled = true;
    };
  }, []);

  const max = rows.length > 0 ? rows[0].count : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Ecosystem Skill Demand</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Most requested skills across {postings} industry postings.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-start gap-3 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-slate-500">Loading demand data...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="h-5 w-5 text-primary-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">Top {TOP_N} demanded skills</h3>
          </div>
          <div className="space-y-3">
            {rows.map((r) => (
              <div key={r.display} className="flex items-center gap-3">
                <span className="w-48 shrink-0 truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                  {r.display}
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-primary-500" style={{ width: `${Math.round((r.count / max) * 100)}%` }} />
                </div>
                <span className="w-20 text-right text-sm text-slate-500">{r.count} postings</span>
              </div>
            ))}
            {rows.length === 0 && <p className="text-slate-500">No requirement data available.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
