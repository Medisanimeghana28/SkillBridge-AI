import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { FileText, Clock, CheckCircle2, XCircle, Search, Filter } from "lucide-react";
import { cn } from "@/utils/cn";

export default function Applications() {
  const [applications, setApplications] = useState(() => JSON.parse(localStorage.getItem('sb_applied_internships') || '[]'));
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredApps = statusFilter === "All" ? applications : applications.filter(a => a.status === statusFilter);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Applied': return <FileText className="h-4 w-4" />;
      case 'Under Review': return <Clock className="h-4 w-4" />;
      case 'Shortlisted': return <CheckCircle2 className="h-4 w-4" />;
      case 'Rejected': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Applied': return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case 'Under Review': return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case 'Shortlisted': return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case 'Rejected': return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "";
    }
  };

  return (
    <div className="space-y-6 pb-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            Application Tracker
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Track your applied internships, interview status, and next steps.
          </p>
        </div>
        <Link to="/student/internships">
          <Button variant="outline">Browse More Internships</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-center">
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{applications.length}</p>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Total Applied</p>
        </div>
        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-center">
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{applications.filter(a => a.status === 'Under Review').length}</p>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Under Review</p>
        </div>
        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-center">
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{applications.filter(a => a.status === 'Shortlisted').length}</p>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Shortlisted</p>
        </div>
        <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-center">
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{Math.round(applications.reduce((acc, curr) => acc + curr.matchScore, 0) / (applications.length || 1))}%</p>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Avg Match</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search applications..." className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500" />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['All', 'Applied', 'Under Review', 'Shortlisted'].map(status => (
            <button 
              key={status} 
              onClick={() => setStatusFilter(status)}
              className={cn("px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors", statusFilter === status ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700")}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        {filteredApps.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 dark:bg-slate-800">
              <FileText className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-slate-900 dark:text-white font-medium">No applications found</p>
            <p className="text-slate-500 text-sm mt-1 mb-4">You haven't applied to any internships matching this status.</p>
            <Link to="/student/internships"><Button>Find Internships</Button></Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredApps.map((app) => (
              <div key={app.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">{app.role}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">{app.company}</p>
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Applied: {app.appliedDate}</span>
                    <span className="px-2 py-0.5 rounded bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">Match: {app.matchScore}%</span>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                  <div className={cn("px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5", getStatusClass(app.status))}>
                    {getStatusIcon(app.status)} {app.status}
                  </div>
                  <Button variant="ghost" size="sm">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
