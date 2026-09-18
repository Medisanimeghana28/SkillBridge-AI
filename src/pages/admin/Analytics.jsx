import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Users, Briefcase, Send, Target, Map, AlertCircle } from "lucide-react";

function groupBy(rows, key) {
  const m = {};
  for (const r of rows || []) {
    const k = r[key] || "Unknown";
    m[k] = (m[k] || 0) + 1;
  }
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function fetchStats() {
      setLoading(true);
      try {
        const [roles, apps, subs, roadmaps, challenges] = await Promise.all([
          supabase.from("profiles").select("role"),
          supabase.from("applications").select("status"),
          supabase.from("challenge_submissions").select("id", { count: "exact", head: true }),
          supabase.from("roadmaps").select("id", { count: "exact", head: true }),
          supabase.from("challenges").select("id", { count: "exact", head: true }),
        ]);
        if (roles.error) throw roles.error;
        if (apps.error) throw apps.error;

        const byRole = {};
        for (const r of roles.data || []) {
          byRole[r.role] = (byRole[r.role] || 0) + 1;
        }

        if (!cancelled) {
          setStats({
            byRole,
            totalProfiles: (roles.data || []).length,
            appStatuses: groupBy(apps.data, "status"),
            totalApps: (apps.data || []).length,
            submissions: subs.count || 0,
            roadmaps: roadmaps.count || 0,
            challenges: challenges.count || 0,
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load analytics.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Ecosystem Analytics</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Platform-wide activity at a glance.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-start gap-3 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, label: "Total Profiles", value: stats.totalProfiles, tint: "bg-blue-100 text-blue-600 dark:bg-blue-900/30" },
              { icon: Send, label: "Applications", value: stats.totalApps, tint: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" },
              { icon: Target, label: "Challenge Submissions", value: stats.submissions, tint: "bg-purple-100 text-purple-600 dark:bg-purple-900/30" },
              { icon: Map, label: "Learning Roadmaps", value: stats.roadmaps, tint: "bg-amber-100 text-amber-600 dark:bg-amber-900/30" },
            ].map((c) => (
              <div key={c.label} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                <div className={`p-3 rounded-lg ${c.tint}`}><c.icon className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{c.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary-500" /> Profiles by role
              </h3>
              <div className="space-y-2">
                {Object.entries(stats.byRole).map(([role, n]) => (
                  <div key={role} className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium text-slate-700 dark:text-slate-300">{role}</span>
                    <span className="text-slate-500">{n}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary-500" /> Applications by status
              </h3>
              <div className="space-y-2">
                {stats.appStatuses.map(([status, n]) => (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{status}</span>
                    <span className="text-slate-500">{n}</span>
                  </div>
                ))}
                {stats.appStatuses.length === 0 && (
                  <p className="text-sm text-slate-500">No applications yet.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
