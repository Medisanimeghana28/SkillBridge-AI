import { useEffect, useMemo, useState } from "react";
import { useIndustryData } from "@/hooks/useIndustryData";
import { supabase } from "@/lib/supabaseClient";
import { aiService } from "@/services/aiService";
import { Search, Filter, Dna, CheckCircle2, UserCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/common/Button";
import { cn } from "@/utils/cn";

const PAGE_SIZE = 12;

export default function Talent() {
  const { data: industryData, loading: industryLoading } = useIndustryData();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const requiredSkills = useMemo(() => {
    const names = new Set();
    for (const req of industryData.requirements || []) {
      for (const s of Array.isArray(req.skills) ? req.skills : []) {
        if (s) names.add(String(s).trim());
      }
    }
    return [...names];
  }, [industryData.requirements]);

  useEffect(() => {
    setPage(0);
  }, [query, skillFilter, activeTab]);

  useEffect(() => {
    let cancelled = false;
    async function fetchCandidates() {
      setLoading(true);
      setError("");
      try {
        let req = supabase
          .from("profiles")
          .select("id, full_name, email", { count: "exact" })
          .eq("role", "student")
          .order("full_name", { ascending: true })
          .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

        if (query.trim()) {
          const q = `%${query.trim()}%`;
          req = req.or(`full_name.ilike.${q},email.ilike.${q}`);
        }

        const { data: students, count, error: sErr } = await req;
        if (sErr) throw sErr;

        let list = students || [];
        let totalCount = count || 0;

        if (list.length > 0) {
          const ids = list.map((s) => s.id);
          let skillReq = supabase
            .from("student_skills")
            .select("student_id, proficiency, verification_status, skills(name)")
            .in("student_id", ids);
          if (skillFilter.trim()) {
            skillReq = skillReq.ilike("skills.name", `%${skillFilter.trim()}%`);
          }
          const { data: rows, error: skErr } = await skillReq;
          if (skErr) throw skErr;

          const byStudent = new Map();
          for (const r of rows || []) {
            if (!byStudent.has(r.student_id)) byStudent.set(r.student_id, []);
            byStudent.get(r.student_id).push({
              name: r.skills?.name || "Unknown",
              proficiency: r.proficiency ?? 0,
              verificationStatus: r.verification_status,
            });
          }

          // If filtering by skill, drop students with no matching skill rows.
          if (skillFilter.trim()) {
            list = list.filter((s) => (byStudent.get(s.id) || []).length > 0);
          }

          list = list.map((s) => {
            const detailSkills = byStudent.get(s.id) || [];
            const match = aiService.calculateTalentMatch(detailSkills, {
              requiredSkills,
              preferredSkills: [],
            });
            return { ...s, detailSkills, matchScore: match.matchPercentage, match };
          });

          if (activeTab === "matched") {
            list = list.filter((c) => c.matchScore >= 60).sort((a, b) => b.matchScore - a.matchScore);
          }
        }

        if (!cancelled) {
          setCandidates(list);
          setTotal(skillFilter.trim() || activeTab === "matched" ? list.length : totalCount);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load candidates.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (!industryLoading) fetchCandidates();
    return () => {
      cancelled = true;
    };
  }, [page, query, skillFilter, activeTab, industryLoading, requiredSkills]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const showLoading = loading || industryLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Talent Discovery</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Discover and filter candidates based on verified skills and ecosystem performance.
        </p>
      </div>

      <form
        className="flex flex-col sm:flex-row gap-4 justify-between"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setQuery(fd.get("q") || "");
          setSkillFilter(fd.get("skill") || "");
        }}
      >
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              name="q"
              type="text"
              defaultValue={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidates by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>
          <div className="relative max-w-md w-full">
            <Dna className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              name="skill"
              type="text"
              placeholder="Filter by skill (e.g. Python)..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>
        </div>
        <Button variant="outline" className="gap-2" type="submit"><Filter className="h-4 w-4" /> Search</Button>
      </form>

      {requiredSkills.length === 0 && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Tip: define role requirements to enable match scoring — currently showing unranked candidates.
        </p>
      )}

      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        {["all", "matched"].map((tab) => (
          <button
            key={tab}
            className={cn("pb-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "all" ? "All Candidates" : "Top Matches (60%+)"}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-start gap-3 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {showLoading ? (
        <div className="p-8 text-slate-500">Loading talent pool...</div>
      ) : candidates.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <UserCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Candidates Found</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            Try a different search, or import a student dataset to populate the pool.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {activeTab === "matched" || skillFilter.trim()
              ? `${candidates.length} candidates on this page`
              : `Showing ${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, total)} of ${total} candidates`}
          </p>
          <div className="space-y-4">
            {candidates.map((c) => (
              <div key={c.id} className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 dark:text-white">{c.full_name || "Unknown"}</h3>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      c.matchScore >= 60
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}>
                      {c.matchScore}% match
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{c.email}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {c.detailSkills.slice(0, 6).map((s, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs">
                        {s.name} · {s.proficiency}%
                        {s.verificationStatus === "Verified" && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                      </span>
                    ))}
                    {c.detailSkills.length > 6 && (
                      <span className="text-xs text-slate-400">+{c.detailSkills.length - 6} more</span>
                    )}
                    {c.detailSkills.length === 0 && (
                      <span className="text-xs text-slate-400 italic">No mapped skills yet</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {activeTab === "all" && !skillFilter.trim() && (
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
