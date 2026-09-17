import { useStudentData } from "@/hooks/useStudentData";
import { Briefcase, MapPin, Building } from "lucide-react";
import { Button } from "@/components/common/Button";

export default function Internships() {
  const { data, loading } = useStudentData();

  if (loading) return <div className="p-8 text-slate-500">Loading recommended internships...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Matched Internships</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Opportunities matched to your verified skills and ecosystem readiness.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Internships Available</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            There are currently no internship postings matching your skill profile in the database. 
          </p>
        </div>
      </div>
    </div>
  );
}
