import { useEffect, useMemo, useState } from "react";
import { useStudentData } from "@/hooks/useStudentData";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { applicationService } from "@/services/internshipService";
import { analyzeGap } from "@/services/gapService";
import { Briefcase, MapPin, Building, Search, CheckCircle2, AlertCircle, ChevronDown, SlidersHorizontal, GraduationCap } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

const PAGE_SIZE = 9;

function requiredList(internship) {
  const raw = Array.isArray(internship.required_skills) ? internship.required_skills : [];
  return raw
    .map((s) => String(s || "").trim())
    .filter(Boolean)
    .map((name) => ({ name, key: name.toLowerCase(), demand: 1 }));
}

function JobCard({ job, match, applied, applying, expanded, onToggle, onApply }) {
  const toLearn = [...match.missing, ...match.improve].slice(0, 3);
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col shadow-sm">
      <div className="mb-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">{job.title}</h3>
          <span className={cn(
            "shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full",
            match.matchScore >= 70
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : match.matchScore >= 40
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          )}>
            {match.matchScore}% match
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
          <Building className="h-4 w-4" /> {job.profiles?.company_name || "Industry Partner"}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
          <MapPin className="h-4 w-4" /> {job.location || "Remote"} ({job.work_mode || "Flexible"})
        </div>
        {job.description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{job.description}</p>
        )}
      </div>

      {toLearn.length > 0 && !applied && (
        <div className="mb-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-1">
            <GraduationCap className="h-3.5 w-3.5" /> Learn before applying
          </p>
          <p className="text-xs text-amber-800 dark:text-amber-300">
            {toLearn.join(", ")}
          </p>
          <Link to="/student/roadmap" className="text-xs font-medium text-primary-600 hover:underline">
            Build a learning plan →
          </Link>
        </div>
      )}

      {(match.strong.length > 0 || toLearn.length > 0) && (
        <button
          onClick={onToggle}
          className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
        >
          Why this match
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
        </button>
      )}
      {expanded && (
        <div className="mt-2 space-y-2 text-xs">
          {match.strong.length > 0 && (
            <p className="text-emerald-700 dark:text-emerald-400">
              <span className="font-semibold">You have: </span>
              {match.strong.slice(0, 6).join(", ")}
            </p>
          )}
          {toLearn.length > 0 && (
            <p className="text-amber-700 dark:text-amber-400">
              <span className="font-semibold">To strengthen: </span>
              {[...match.missing, ...match.improve].slice(0, 6).join(", ")}
            </p>
          )}
        </div>
      )}
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button
          className="w-full"
          variant={applied ? "outline" : "primary"}
          disabled={applied || applying}
          isLoading={applying}
          onClick={onApply}
        >
          {applied ? (
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Applied</span>
          ) : (
            "Apply Now"
          )}
        </Button>
      </div>
    </div>
  );
}

export default function Internships() {
  const { data, loading: dataLoading } = useStudentData();
  const { user } = useAuth();

  const [internships, setInternships] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [applyingId, setApplyingId] = useState(null);
  const [notice, setNotice] = useState({ type: "", message: "" });
  const [workMode, setWorkMode] = useState("All");
  const [minMatch, setMinMatch] = useState(30);
  const [sortBy, setSortBy] = useState("match");
  const [expandedId, setExpandedId] = useState(null);

  const studentSkills = useMemo(
    () =>
      (data.skills || []).map((row) => ({
        name: row.skills?.name || row.name,
        proficiency: row.proficiency ?? 0,
      })),
    [data.skills]
  );

  useEffect(() => {
    setPage(0);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    async function fetchInternships() {
      setLoading(true);
      try {
        let req = supabase
          .from("internships")
          .select("*, profiles(company_name)", { count: "exact" })
          .eq("status", "Open")
          .order("created_at", { ascending: false })
          .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

        if (query.trim()) {
          const q = `%${query.trim()}%`;
          req = req.or(`title.ilike.${q},description.ilike.${q},location.ilike.${q}`);
        }

        const { data: rows, count, error } = await req;
        if (error) throw error;
        if (!cancelled) {
          setInternships(rows || []);
          setTotal(count || 0);
        }
      } catch (err) {
        if (!cancelled) setNotice({ type: "error", message: err.message || "Failed to load internships." });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchInternships();
    return () => {
      cancelled = true;
    };
  }, [page, query]);

  useEffect(() => {
    async function fetchApplied() {
      if (!user) return;
      try {
        const apps = await applicationService.getStudentApplications(user.id);
        setAppliedIds(new Set((apps || []).map((a) => a.internship_id)));
      } catch {
        // Non-fatal: apply buttons remain enabled; duplicates are handled on insert.
      }
    }
    fetchApplied();
  }, [user]);

  const handleApply = async (internship, matchScore) => {
    if (!user) return;
    setApplyingId(internship.id);
    setNotice({ type: "", message: "" });
    try {
      await applicationService.apply(user.id, internship.id, matchScore);
      setAppliedIds((prev) => new Set(prev).add(internship.id));
      setNotice({ type: "success", message: `Applied to "${internship.title}".` });
    } catch (err) {
      if (err.code === "23505") {
        setAppliedIds((prev) => new Set(prev).add(internship.id));
        setNotice({ type: "success", message: "You already applied to this internship." });
      } else {
        setNotice({ type: "error", message: err.message || "Failed to submit application." });
      }
    } finally {
      setApplyingId(null);
    }
  };

  const visible = useMemo(() => {
    const withScores = internships.map((job) => ({
      job,
      match: analyzeGap(studentSkills, requiredList(job)),
    }));
    const filtered = withScores.filter(
      ({ job, match }) =>
        (workMode === "All" || (job.work_mode || "Flexible") === workMode) &&
        match.matchScore >= minMatch
    );
    filtered.sort((a, b) =>
      sortBy === "match"
        ? b.match.matchScore - a.match.matchScore
        : new Date(b.job.created_at || 0) - new Date(a.job.created_at || 0)
    );
    return filtered;
  }, [internships, studentSkills, workMode, minMatch, sortBy]);

  const recommended = visible.filter(({ match }) => match.matchScore >= 60);
  const stretch = visible.filter(({ match }) => match.matchScore < 60);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const showLoading = loading || dataLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Matched Internships</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Opportunities matched to your verified skills and ecosystem readiness.
        </p>
      </div>

      <form
        className="flex flex-col lg:flex-row gap-3 lg:items-center"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(search);
        }}
      >
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, keyword, or location..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap text-sm">
          <span className="flex items-center gap-1.5 text-slate-500">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </span>
          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            {["All", "Remote", "On-site", "Hybrid", "Flexible"].map((m) => (
              <option key={m} value={m}>{m === "All" ? "All modes" : m}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            Min match
            <input
              type="range"
              min={0}
              max={90}
              step={10}
              value={minMatch}
              onChange={(e) => setMinMatch(Number(e.target.value))}
              className="w-24 accent-primary-600"
            />
            <span className="w-10 text-right font-medium">{minMatch}%</span>
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            <option value="match">Sort: best match</option>
            <option value="newest">Sort: newest</option>
          </select>
        </div>
      </form>

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

      {showLoading ? (
        <div className="p-8 text-slate-500">Loading internships...</div>
      ) : internships.length === 0 ? (
        <div className="grid grid-cols-1 gap-6">
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Internships Available</h3>
            <p className="text-slate-500 max-w-md mx-auto mt-2">
              {query ? "No postings match your search." : "There are currently no open internship postings."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total} open postings
          </p>
          {visible.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
              No postings on this page match the current filters. Try lowering the minimum match.
            </div>
          )}
          {recommended.length > 0 && (
            <>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Recommended for you ({recommended.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommended.map(({ job, match }) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    match={match}
                    applied={appliedIds.has(job.id)}
                    applying={applyingId === job.id}
                    expanded={expandedId === job.id}
                    onToggle={() => setExpandedId(expandedId === job.id ? null : job.id)}
                    onApply={() => handleApply(job, match.matchScore)}
                  />
                ))}
              </div>
            </>
          )}
          {stretch.length > 0 && (
            <>
              <h3 className="font-bold text-slate-900 dark:text-white mt-2">
                Worth a stretch ({stretch.length})
                <span className="block text-xs font-normal text-slate-500 mt-0.5">
                  Below 60% match — learn the listed skills first, then apply.
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stretch.map(({ job, match }) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    match={match}
                    applied={appliedIds.has(job.id)}
                    applying={applyingId === job.id}
                    expanded={expandedId === job.id}
                    onToggle={() => setExpandedId(expandedId === job.id ? null : job.id)}
                    onApply={() => handleApply(job, match.matchScore)}
                  />
                ))}
              </div>
            </>
          )}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
