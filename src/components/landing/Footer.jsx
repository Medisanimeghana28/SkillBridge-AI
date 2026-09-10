import { BrainCircuit } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary-600" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              SkillBridge AI
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © 2026 SkillBridge AI. SIH26044 Hackathon Prototype.
          </p>
        </div>
      </div>
    </footer>
  );
}
