import { useState } from "react";
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/common/Button";

export default function Feedback() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Curriculum Feedback</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Provide direct feedback to academic institutions regarding skill readiness.
          </p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Submit Feedback</Button>
      </div>

      <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Feedback Submitted</h3>
        <p className="text-slate-500 max-w-md mx-auto mt-2">
          You haven't submitted any curriculum feedback yet. Your feedback helps institutions align their training with your needs.
        </p>
      </div>
    </div>
  );
}
