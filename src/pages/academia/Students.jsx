import { useAcademiaData } from "@/hooks/useAcademiaData";
import { Search, Filter, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/common/Button";

export default function Students() {
  const { data, loading } = useAcademiaData();

  if (loading) return <div className="p-8 text-slate-500">Loading student directory...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Student Directory</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Manage and monitor all students registered under your institution.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search students by name, email, or department..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>
        <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" /> Filters</Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {data.students.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No students found. Import student datasets to populate this directory.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">Name</th>
                <th className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">Email</th>
                <th className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">Degree / Dept</th>
                <th className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map((student) => (
                <tr key={student.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{student.full_name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-slate-500"><div className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {student.email}</div></td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {student.academic_records?.[0]?.degree || 'Unspecified'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-medium">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
