import { useStudentData } from "@/hooks/useStudentData";
import { Send, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function Applications() {
  const { data, loading } = useStudentData();

  if (loading) return <div className="p-8 text-slate-500">Loading applications...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">My Applications</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Track the status of your internship applications.
        </p>
      </div>

      {data.applications.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Send className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Applications Found</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            You haven't applied to any internships yet. Explore matched internships to apply.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.applications.map(app => (
            <div key={app.id} className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{app.internships?.title || 'Unknown Role'}</h3>
                <p className="text-sm text-slate-500">{app.internships?.profiles?.company_name || 'Unknown Company'}</p>
              </div>
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
