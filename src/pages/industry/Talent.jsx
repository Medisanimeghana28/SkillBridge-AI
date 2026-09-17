import { useState } from "react";
import { useIndustryData } from "@/hooks/useIndustryData";
import { Search, Filter, Dna, Briefcase, ChevronRight, CheckCircle2, UserCircle } from "lucide-react";
import { Button } from "@/components/common/Button";
import { cn } from "@/utils/cn";

export default function Talent() {
  const { data, loading } = useIndustryData();
  const [activeTab, setActiveTab] = useState('all');

  if (loading) return <div className="p-8 text-slate-500">Loading talent pool...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Talent Discovery</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Discover and filter candidates based on verified skills and ecosystem performance.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search candidates by skill, role, or matching score..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>
        <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" /> Filters</Button>
      </div>

      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        <button 
          className={cn("pb-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'all' ? "border-primary-500 text-primary-600 dark:text-primary-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
          onClick={() => setActiveTab('all')}
        >
          All Candidates
        </button>
        <button 
          className={cn("pb-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'matched' ? "border-primary-500 text-primary-600 dark:text-primary-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
          onClick={() => setActiveTab('matched')}
        >
          Top Matches
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {data.candidates.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <UserCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Candidates Available</h3>
            <p className="text-slate-500 max-w-md mx-auto mt-2">
              Import a student dataset and post requirements to see matched candidates.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
             {/* Candidates list rendering logic */}
          </div>
        )}
      </div>
    </div>
  );
}
