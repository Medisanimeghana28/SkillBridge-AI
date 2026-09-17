import { useAcademiaData } from "@/hooks/useAcademiaData";
import { AlertCircle, TrendingUp } from "lucide-react";

export default function Demand() {
  const { data, loading } = useAcademiaData();

  if (loading) return <div className="p-8 text-slate-500">Loading industry demand...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Industry Demand Alignment</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Track real-time hiring trends and skill requirements to ensure your curriculum stays relevant.
        </p>
      </div>

      {data.industryDemand.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center">
          <TrendingUp className="h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Industry Data Available</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            Import industry requirement datasets to map your curriculum alignment.
          </p>
        </div>
      ) : (
        <div>
          {/* Real charts go here */}
        </div>
      )}
    </div>
  );
}
