import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { aiService } from "@/services/aiService";
import { DEMO_STUDENT } from "@/data/demoData";
import { Button } from "@/components/common/Button";
import { 
  CheckCircle2, Circle, CircleDashed, ChevronDown, ChevronUp, 
  Map, Sparkles, BrainCircuit, Clock, Trophy, Briefcase, 
  Settings2, Rocket, FolderGit2
} from "lucide-react";
import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export default function Roadmap() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialRole = location.state?.targetRole || "AI Engineer";

  const [targetRole, setTargetRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [roadmap, setRoadmap] = useState(null);
  const [completedTasks, setCompletedTasks] = useState(() => {
    const saved = localStorage.getItem('sb_completed_tasks');
    return saved ? JSON.parse(saved) : {};
  });
  const [expandedStage, setExpandedStage] = useState(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [customization, setCustomization] = useState({
    learningTime: "1 hour/day",
    focus: "Technical Skills"
  });

  // Loading steps text
  const loadingStepsText = [
    "Analyzing your Skill DNA...",
    "Identifying priority skills...",
    "Building your personalized roadmap..."
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setLoadingStep(0);
    
    // Simulate multi-step loading
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < 2 ? prev + 1 : prev));
    }, 800);

    try {
      const data = await aiService.generateRoadmap(DEMO_STUDENT.detailedSkills, targetRole, customization);
      setRoadmap(data);
      // Auto-expand first incomplete stage
      const firstIncomplete = data.stages.find(s => s.status !== 'completed');
      if (firstIncomplete) setExpandedStage(firstIncomplete.id);
    } catch (error) {
      console.error(error);
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
      setShowCustomize(false);
    }
  };

  useEffect(() => {
    // Generate roadmap on mount if none exists
    if (!roadmap) {
      handleGenerate();
    }
  }, []);

  const toggleTask = (taskId) => {
    const updated = { ...completedTasks, [taskId]: !completedTasks[taskId] };
    setCompletedTasks(updated);
    localStorage.setItem('sb_completed_tasks', JSON.stringify(updated));
  };

  const getStageProgress = (stage) => {
    if (!stage.tasks || stage.tasks.length === 0) return 0;
    const completed = stage.tasks.filter(t => completedTasks[t.id]).length;
    return Math.round((completed / stage.tasks.length) * 100);
  };

  const getOverallProgress = () => {
    if (!roadmap) return 0;
    let totalTasks = 0;
    let totalCompleted = 0;
    roadmap.stages.forEach(stage => {
      totalTasks += stage.tasks.length;
      totalCompleted += stage.tasks.filter(t => completedTasks[t.id]).length;
    });
    // Combine with AI's base progress logic for demo effect
    return totalTasks === 0 ? 0 : Math.round((totalCompleted / totalTasks) * 100);
  };

  const overallProgress = getOverallProgress();
  // Adjust base percentage visually for prototype (e.g. 64% base + task completions)
  const displayProgress = Math.max(64, Math.min(100, 64 + overallProgress));

  // Pie chart data for progress visualization
  const pieData = [
    { name: 'Completed', value: displayProgress, color: '#6366f1' },
    { name: 'Remaining', value: 100 - displayProgress, color: '#e2e8f0' }
  ];

  return (
    <div className="space-y-6 pb-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl flex items-center gap-3">
            <Map className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            Your Career Roadmap
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Turn your skill gaps into a step-by-step path toward your target role.
          </p>
        </div>
        {!loading && roadmap && (
          <Button variant="outline" onClick={() => setShowCustomize(!showCustomize)} className="gap-2">
            <Settings2 className="h-4 w-4" /> Customize Roadmap
          </Button>
        )}
      </div>

      {/* Customization Panel */}
      <AnimatePresence>
        {showCustomize && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Customize Your Path</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Learning Time</label>
                  <select 
                    value={customization.learningTime}
                    onChange={(e) => setCustomization({...customization, learningTime: e.target.value})}
                    className="w-full rounded-lg border-slate-300 py-2 pl-3 pr-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  >
                    <option>30 min/day</option>
                    <option>1 hour/day</option>
                    <option>2 hours/day</option>
                    <option>3+ hours/day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Preferred Focus</label>
                  <select 
                    value={customization.focus}
                    onChange={(e) => setCustomization({...customization, focus: e.target.value})}
                    className="w-full rounded-lg border-slate-300 py-2 pl-3 pr-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  >
                    <option>Technical Skills</option>
                    <option>Projects</option>
                    <option>Certifications</option>
                    <option>Interview Preparation</option>
                    <option>Industry Experience</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowCustomize(false)}>Cancel</Button>
                <Button onClick={handleGenerate} className="gap-2"><Sparkles className="h-4 w-4" /> Regenerate AI Roadmap</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-32 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <BrainCircuit className="h-12 w-12 text-primary-500 animate-pulse mb-6" />
          <div className="h-6 overflow-hidden relative w-64 text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingStep}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="text-lg font-medium text-slate-700 dark:text-slate-300 absolute w-full"
              >
                {loadingStepsText[loadingStep]}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="mt-8 flex gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className={cn("h-2 w-2 rounded-full transition-colors", i <= loadingStep ? "bg-primary-500" : "bg-slate-200 dark:bg-slate-800")} />
            ))}
          </div>
        </div>
      )}

      {/* Roadmap Content */}
      {!loading && roadmap && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          
          {/* Overview Header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-xl bg-gradient-to-r from-primary-900 to-primary-700 p-6 text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Rocket className="h-32 w-32" />
              </div>
              <div className="relative z-10">
                <p className="text-primary-200 text-sm font-medium uppercase tracking-wider mb-1">Target Role</p>
                <h2 className="text-3xl font-bold mb-6">{roadmap.role}</h2>
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-primary-200 text-sm mb-1">Estimated Completion</p>
                    <p className="text-xl font-semibold flex items-center gap-2"><Clock className="h-5 w-5" /> {roadmap.durationWeeks} weeks</p>
                  </div>
                  <div>
                    <p className="text-primary-200 text-sm mb-1">Overall Progress</p>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full transition-all" style={{ width: `${displayProgress}%` }} />
                      </div>
                      <span className="font-bold">{displayProgress}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights Card */}
            <div className="rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-5 dark:opacity-10">
                <BrainCircuit className="h-24 w-24" />
              </div>
              <h3 className="text-sm font-bold text-primary-600 dark:text-primary-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Sparkles className="h-4 w-4" /> AI Insights
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 relative z-10">
                {roadmap.insights.reasoning}
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-white relative z-10 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                {roadmap.insights.impact}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Timeline (Main Column) */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Roadmap Timeline</h3>
              
              <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent dark:before:via-slate-800 space-y-4">
                {roadmap.stages.map((stage, index) => {
                  const isExpanded = expandedStage === stage.id;
                  const stageProg = getStageProgress(stage);
                  
                  // Visual status determination based on progress
                  const visualStatus = stageProg === 100 ? 'completed' : (stageProg > 0 || stage.status === 'in_progress' ? 'in_progress' : 'upcoming');
                  
                  return (
                    <div key={stage.id} className="relative flex flex-col md:flex-row gap-4 items-start z-10 group">
                      
                      {/* Timeline Node */}
                      <div className="absolute left-0 md:left-1/2 md:-ml-4 flex items-center justify-center w-8 h-8 md:w-8 md:h-8 rounded-full border-4 bg-white dark:bg-slate-950 transition-colors z-20 mt-4 md:mt-0 shadow-sm"
                           style={{ 
                             borderColor: visualStatus === 'completed' ? '#10b981' : (visualStatus === 'in_progress' ? '#6366f1' : '#cbd5e1')
                           }}>
                        {visualStatus === 'completed' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : 
                         visualStatus === 'in_progress' ? <Circle className="h-3 w-3 fill-primary-500 text-primary-500" /> : 
                         <CircleDashed className="h-4 w-4 text-slate-400" />}
                      </div>

                      {/* Content Card (Alternating left/right for desktop, left for mobile) */}
                      <div className={cn(
                        "w-full md:w-[calc(50%-2rem)] ml-12 md:ml-0 rounded-xl bg-white shadow-sm border transition-all duration-300 dark:bg-slate-900",
                        visualStatus === 'in_progress' ? "border-primary-200 dark:border-primary-800/50 shadow-md ring-1 ring-primary-500/10" : "border-slate-200 dark:border-slate-800",
                        index % 2 === 0 ? "md:mr-auto" : "md:ml-auto"
                      )}>
                        
                        {/* Card Header (Clickable) */}
                        <div 
                          className="p-5 cursor-pointer flex items-center justify-between"
                          onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
                        >
                          <div>
                            <p className={cn(
                              "text-xs font-bold uppercase tracking-wider mb-1",
                              visualStatus === 'completed' ? "text-emerald-600 dark:text-emerald-400" : 
                              visualStatus === 'in_progress' ? "text-primary-600 dark:text-primary-400" : "text-slate-500 dark:text-slate-400"
                            )}>
                              0{index + 1} — {visualStatus === 'completed' ? 'Completed' : (visualStatus === 'in_progress' ? 'In Progress' : 'Upcoming')}
                            </p>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">{stage.title}</h4>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{stageProg}%</span>
                            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center dark:bg-slate-800 group-hover:bg-slate-100 dark:group-hover:bg-slate-700 transition-colors">
                              {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-600 dark:text-slate-300" /> : <ChevronDown className="h-5 w-5 text-slate-600 dark:text-slate-300" />}
                            </div>
                          </div>
                        </div>

                        {/* Expandable Details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 mt-2">
                                <p className="text-sm text-slate-600 dark:text-slate-400 my-4">
                                  <span className="font-semibold text-slate-900 dark:text-slate-200">Goal:</span> {stage.goal}
                                </p>
                                
                                {stage.skills.length > 0 && (
                                  <div className="mb-5">
                                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Focus Skills</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {stage.skills.map(s => (
                                        <span key={s} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium dark:bg-slate-800 dark:text-slate-300">
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                                    Tasks 
                                    <span className="text-slate-400 normal-case font-normal">{stage.tasks.filter(t => completedTasks[t.id]).length}/{stage.tasks.length} done</span>
                                  </h5>
                                  <div className="space-y-2">
                                    {stage.tasks.map(task => (
                                      <label key={task.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors dark:border-slate-800 dark:hover:bg-slate-800/50">
                                        <div className="mt-0.5 relative flex items-center justify-center">
                                          <input 
                                            type="checkbox" 
                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-slate-300 checked:border-primary-500 checked:bg-primary-500 transition-all dark:border-slate-600 dark:checked:bg-primary-500 dark:checked:border-primary-500"
                                            checked={!!completedTasks[task.id]}
                                            onChange={() => toggleTask(task.id)}
                                          />
                                          <CheckCircle2 className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" strokeWidth={3} />
                                        </div>
                                        <span className={cn(
                                          "text-sm font-medium transition-colors select-none",
                                          completedTasks[task.id] ? "text-slate-400 line-through dark:text-slate-500" : "text-slate-700 dark:text-slate-200"
                                        )}>
                                          {task.text}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                                
                                {/* Quick Action Link based on stage */}
                                {index === 3 && (
                                  <div className="mt-5 p-4 rounded-lg bg-indigo-50 border border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/30">
                                    <h5 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-1 flex items-center gap-2"><Trophy className="h-4 w-4" /> Apply your skills</h5>
                                    <p className="text-xs text-indigo-700 dark:text-indigo-400 mb-3">Compete in a real industry challenge to validate this stage.</p>
                                    <Button variant="outline" size="sm" className="w-full text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-900/30" onClick={() => navigate('/student/challenges')}>
                                      Explore Challenges
                                    </Button>
                                  </div>
                                )}
                                
                                {index === 4 && (
                                  <div className="mt-5 p-4 rounded-lg bg-emerald-50 border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30">
                                    <h5 className="text-sm font-bold text-emerald-900 dark:text-emerald-300 mb-1 flex items-center gap-2"><Briefcase className="h-4 w-4" /> Almost internship ready</h5>
                                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-3">Your profile matches 3 active internships.</p>
                                    <Button variant="outline" size="sm" className="w-full text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900/30" onClick={() => navigate('/student/internships')}>
                                      View Matched Internships
                                    </Button>
                                  </div>
                                )}

                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Column (Projects & Progress) */}
            <div className="space-y-6">
              
              {/* Progress Summary */}
              <div className="rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Progress Visualized</h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} className={index === 1 ? 'dark:fill-slate-800' : ''} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Roadmap Progress</span>
                    <span className="font-bold text-slate-900 dark:text-white">{displayProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                    <div className="h-full bg-primary-500" style={{ width: `${displayProgress}%` }} />
                  </div>
                </div>
              </div>

              {/* Recommended Projects */}
              <div className="rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <FolderGit2 className="h-5 w-5 text-primary-500" /> Profile Boosters
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Projects that directly strengthen your profile for {targetRole}.
                </p>
                <div className="space-y-4">
                  {roadmap.recommendedProjects.map((proj, i) => (
                    <div key={proj.id} className="p-4 rounded-lg border border-slate-100 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{proj.title}</h4>
                        <span className={cn(
                          "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap ml-2",
                          proj.difficulty === 'Beginner' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                          proj.difficulty === 'Intermediate' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}>
                          {proj.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">{proj.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {proj.skills.map(s => (
                          <span key={s} className="text-[10px] font-medium bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400">
                            {s}
                          </span>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="w-full text-xs h-8">Add to Roadmap</Button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
