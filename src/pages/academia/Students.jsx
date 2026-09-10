import { useState } from "react";
import { ACADEMIA_DATA } from "@/data/academiaData";
import { Search, Filter, ShieldCheck } from "lucide-react";
import { Button } from "@/components/common/Button";
import { cn } from "@/utils/cn";

export default function StudentsDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  const filtered = ACADEMIA_DATA.students.filter(s => {
    if (deptFilter !== "All" && s.department !== deptFilter) return false;
    if (searchTerm && !s.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Student Directory</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          View and analyze individual student profiles and skill readiness.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search students by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
          />
        </div>
        <select 
          value={deptFilter} 
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
        >
          <option value="All">All Departments</option>
          <option value="CSE">CSE</option>
          <option value="AI & ML">AI & ML</option>
          <option value="IT">IT</option>
          <option value="ECE">ECE</option>
        </select>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> More Filters
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Year</th>
                <th className="px-6 py-4 font-medium">Top Skills</th>
                <th className="px-6 py-4 font-medium">Readiness</th>
                <th className="px-6 py-4 font-medium">Verification</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(student => (
                <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold dark:bg-indigo-900/50 dark:text-indigo-400">
                        {student.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-300">{student.department || 'B.Tech CSE'}</td>
                  <td className="px-6 py-4 text-slate-500">{student.year || '3rd Year'}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {student.topSkills || 'Python • React'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "font-bold",
                      student.readiness >= 80 ? "text-emerald-600" : student.readiness >= 60 ? "text-amber-600" : "text-red-600"
                    )}>{student.readiness}%</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 w-fit">
                      <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" /> {student.verifiedSkills || 7} Verified
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* Placeholder action for prototype */}
                    <Button variant="ghost" size="sm" onClick={() => alert(`View Profile: ${student.name}`)}>View Profile</Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">No students match your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
