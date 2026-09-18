import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Search, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/common/Button";

const PAGE_SIZE = 15;

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setPage(0);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    async function fetchStudents() {
      setLoading(true);
      setError("");
      try {
        let req = supabase
          .from("profiles")
          .select("id, full_name, email, academic_records(degree)", { count: "exact" })
          .eq("role", "student")
          .order("full_name", { ascending: true })
          .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

        if (query.trim()) {
          const q = `%${query.trim()}%`;
          req = req.or(`full_name.ilike.${q},email.ilike.${q}`);
        }

        const { data, count, error: sErr } = await req;
        if (sErr) throw sErr;

        let verified = {};
        if (data?.length > 0) {
          const { data: rows } = await supabase
            .from("student_skills")
            .select("student_id")
            .in("student_id", data.map((s) => s.id))
            .eq("verification_status", "Verified");
          for (const r of rows || []) {
            verified[r.student_id] = (verified[r.student_id] || 0) + 1;
          }
        }

        if (!cancelled) {
          setStudents((data || []).map((s) => ({ ...s, verifiedCount: verified[s.id] || 0 })));
          setTotal(count || 0);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load students.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchStudents();
    return () => {
      cancelled = true;
    };
  }, [page, query]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Students Directory</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Every student profile in the ecosystem, with verified-skill counts.
        </p>
      </div>

      <form
        className="relative max-w-md w-full"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(search);
        }}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
        />
      </form>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-start gap-3 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No students found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">Name</th>
                    <th className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">Email</th>
                    <th className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">Degree</th>
                    <th className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{s.full_name || "Unknown"}</td>
                      <td className="px-6 py-4 text-slate-500">
                        <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {s.email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {s.academic_records?.[0]?.degree || "Unspecified"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {s.verifiedCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-500">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
