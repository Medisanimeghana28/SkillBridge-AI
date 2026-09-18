import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Building, AlertCircle } from "lucide-react";

export default function AdminInstitutions() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function fetchInstitutions() {
      setLoading(true);
      try {
        const { data, error: qErr } = await supabase
          .from("academic_records")
          .select("institution, department, employability_score");
        if (qErr) throw qErr;

        const grouped = new Map();
        for (const r of data || []) {
          const name = (r.institution || "Unspecified").trim() || "Unspecified";
          if (!grouped.has(name)) {
            grouped.set(name, { name, students: 0, departments: new Set(), scores: [] });
          }
          const g = grouped.get(name);
          g.students += 1;
          if (r.department) g.departments.add(r.department);
          if (r.employability_score != null) g.scores.push(Number(r.employability_score));
        }

        const list = [...grouped.values()]
          .map((g) => ({
            name: g.name,
            students: g.students,
            departments: g.departments.size,
            avgScore: g.scores.length > 0
              ? (g.scores.reduce((a, b) => a + b, 0) / g.scores.length).toFixed(1)
              : "—",
          }))
          .sort((a, b) => b.students - a.students);

        if (!cancelled) setRows(list);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load institutions.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchInstitutions();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Institutions</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Academic partners aggregated from student records.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-start gap-3 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-slate-500">Loading institutions...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rows.map((inst) => (
            <div key={inst.name} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 rounded-lg">
                  <Building className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{inst.name}</h3>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{inst.students}</p>
                  <p className="text-xs text-slate-500">Students</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{inst.departments}</p>
                  <p className="text-xs text-slate-500">Depts</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{inst.avgScore}</p>
                  <p className="text-xs text-slate-500">Avg score</p>
                </div>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="text-slate-500">No institution data found.</p>
          )}
        </div>
      )}
    </div>
  );
}
