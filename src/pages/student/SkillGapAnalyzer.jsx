import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { aiService } from "@/services/aiService";
import { DEMO_STUDENT } from "@/data/demoData";
import { Button } from "@/components/common/Button";
import { CheckCircle2, AlertTriangle, XCircle, BrainCircuit, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/utils/cn";

const ROLES = [
  "AI Engineer",
  "Full Stack Developer",
  "Data Analyst",
  "ML Engineer",
  "Cloud Engineer",
  "Software Developer"
];

// Simple Toast Component inline for prototype
const Toast = ({ message, show }) => (
  <div className={cn(
    "fixed bottom-4 right-4 z-50 transform transition-all duration-300",
    show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
  )}>
    <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 dark:bg-white dark:text-slate-900">
      <CheckCircle2 className="h-5 w-5 text-emerald-400 dark:text-emerald-600" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  </div>
);

export default function SkillGapAnalyzer() {
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      const matchData = await aiService.calculateMatchScore(DEMO_STUDENT.detailedSkills, selectedRole);
      setResult(matchData);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = () => {
    navigate('/student/roadmap', { state: { targetRole: selectedRole } });
  };

  return (
    <div className="space-y-6 pb-8 max-w-5xl mx-auto">
      <Toast message="Analysis complete!" show={showToast} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          AI Skill Gap Analyzer
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Select a target role to see how your Skill DNA matches industry requirements.
        </p>
      </div>

      {/* Controls */}
      <div className="rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:flex-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Role</label>
          <select 
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full rounded-lg border-slate-300 py-2.5 pl-3 pr-10 text-slate-900 focus:border-primary-500 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="w-full sm:w-auto sm:self-end pt-1">
          <Button onClick={handleAnalyze} disabled={loading} className="w-full sm:w-auto gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Analyze Match
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
            <div className="h-16 w-16 rounded-full border-4 border-primary-500 border-t-transparent animate-spin absolute top-0 left-0"></div>
            <BrainCircuit className="h-6 w-6 text-primary-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="mt-4 font-medium text-slate-600 dark:text-slate-400 animate-pulse">Running deterministic AI analysis...</p>
        </div>
      )}

      {/* Results View */}
      {result && !loading && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Match Score Card */}
            <div className="rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <BrainCircuit className="h-24 w-24 text-primary-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 z-10">Overall Match</h3>
              <div className="relative inline-flex items-center justify-center mb-2 z-10">
                <svg className="h-32 w-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="12" fill="none" />
                  <circle cx="64" cy="64" r="56" className="stroke-primary-500" strokeWidth="12" fill="none" strokeDasharray="351.8" strokeDashoffset={351.8 - (351.8 * result.matchScore) / 100} strokeLinecap="round" />
                </svg>
                <span className="absolute text-4xl font-extrabold text-slate-900 dark:text-white">{result.matchScore}%</span>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 z-10">for {selectedRole}</p>
            </div>

            {/* Breakdown Card */}
            <div className="rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Why is my score {result.matchScore}%?</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {Object.entries(result.breakdown).map(([cat, score]) => (
                  <div key={cat} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{cat}</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{score}%</p>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30 text-primary-800 dark:text-primary-300 text-sm leading-relaxed">
                <span className="font-semibold block mb-1">AI Summary:</span>
                {aiService.generateMatchExplanation(selectedRole, result)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Strong Skills */}
            <div className="rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6">
              <h3 className="text-md font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Strong Skills
              </h3>
              <ul className="space-y-3">
                {result.strong.length === 0 ? <li className="text-sm text-slate-500">None identified</li> : 
                 result.strong.map(s => <li key={s} className="text-sm font-medium text-slate-700 dark:text-slate-300">{s}</li>)}
              </ul>
            </div>
            
            {/* Improve Skills */}
            <div className="rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6">
              <h3 className="text-md font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" /> Improve
              </h3>
              <ul className="space-y-3">
                {result.improve.length === 0 ? <li className="text-sm text-slate-500">None identified</li> : 
                 result.improve.map(s => <li key={s} className="text-sm font-medium text-slate-700 dark:text-slate-300">{s}</li>)}
              </ul>
            </div>

            {/* Missing Skills */}
            <div className="rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6">
              <h3 className="text-md font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" /> Missing
              </h3>
              <ul className="space-y-3">
                {result.missing.length === 0 ? <li className="text-sm text-slate-500">None identified</li> : 
                 result.missing.map(s => <li key={s} className="text-sm font-medium text-slate-700 dark:text-slate-300">{s}</li>)}
              </ul>
            </div>
          </div>

          {/* Skill Gap Priority List */}
          {result.gaps.length > 0 && (
            <div className="rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Skill Gap Priority</h3>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {result.gaps.map((gap, i) => (
                  <div key={i} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">{gap.skill}</h4>
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-xs font-bold",
                          gap.priority === 'High' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        )}>
                          {gap.priority} Priority
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span>Current: <strong className="text-slate-700 dark:text-slate-200">{gap.current}%</strong></span>
                        <span>Target: <strong className="text-slate-700 dark:text-slate-200">{gap.target}%</strong></span>
                        <span>Gap: <strong className="text-red-600 dark:text-red-400">{gap.gap}%</strong></span>
                        <span>Est: <strong className="text-slate-700 dark:text-slate-200">{gap.estimatedTime}</strong></span>
                      </div>
                    </div>
                    <div className="w-full md:w-48">
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800 flex">
                        <div className="h-full bg-primary-500" style={{ width: `${gap.current}%` }} />
                        <div className="h-full bg-primary-200 dark:bg-primary-900/50" style={{ width: `${gap.target - gap.current}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <Button onClick={handleGenerateRoadmap} className="gap-2">
                  Generate My Roadmap <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
