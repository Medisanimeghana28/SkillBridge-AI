import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FileText, AlertCircle } from "lucide-react";

export default function AcademiaReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function fetchReport() {
      setLoading(true);
      try {
        const [{ data: records, error: rErr }, { data: reqs, error: qErr }, { data: verif, error: vErr }] =
          await Promise.all([
            supabase.from("academic_records").select("department, employability_score"),
            supabase.from("industry_requirements").select("skills"),
            supabase.from("student_skills").select("verification_status"),
          ]);
        if (rErr) throw rErr;
        if (qErr) throw qErr;
        if (vErr) throw vErr;

        const depts = new Map();
        const scores = [];
        for (const r of records || []) {
          const d = (r.department || "Unspecified").trim() || "Unspecified";
          depts.set(d, (depts.get(d) || 0) + 1);
          if (r.employability_score != null) scores.push(Number(r.employability_score));
        }

        const freq = new Map();
        for (const row of reqs || []) {
          const seen = new Set();
          for (const raw of Array.isArray(row.skills) ? row.skills : []) {
            const norm = String(raw || "").trim().toLowerCase();
            if (!norm || seen.has(norm)) continue;
            seen.add(norm);
            if (!freq.has(norm)) freq.set(norm, { display: String(raw).trim(), count: 0 });
            freq.get(norm).count += 1;
          }
        }

        const verifCounts = {};
        for (const v of verif || []) {
          const k = v.verification_status || "Unknown";
          verifCounts[k] = (verifCounts[k] || 0) + 1;
        }

        if (!cancelled) {
          setReport({
            students: (records || []).length,
            departments: [...depts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10),
            avgScore: scores.length > 0
              ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
              : "—",
            topDemanded: [...freq.values()].sort((a, b) => b.count - a.count).slice(0, 8),
            verification: Object.entries(verifCounts).sort((a, b) => b[1] - a[1]),
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to build report.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchReport();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Generating institutional report...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Institutional Reports</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Curriculum-relevant snapshot of students, demand, and verification.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-start gap-3 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Students tracked</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{report.students}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Avg employability score</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{report.avgScore}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Departments</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{report.departments.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Students by department</h3>
              <div className="space-y-2">
                {report.departments.map(([dept, n]) => (
                  <div key={dept} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate mr-4">{dept}</span>
                    <span className="text-slate-500 shrink-0">{n}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Top industry-demanded skills</h3>
              <div className="space-y-2">
                {report.topDemanded.map((s) => (
                  <div key={s.display} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate mr-4">{s.display}</span>
                    <span className="text-slate-500 shrink-0">{s.count} postings</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Skill verification distribution</h3>
            <div className="flex flex-wrap gap-2">
              {report.verification.map(([status, n]) => (
                <span key={status} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium">
                  {status}: {n}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
