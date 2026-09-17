export default function PlaceholderPage({ title }) {
  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/50">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md">
        This section is part of the SkillBridge AI hackathon prototype and will be implemented in a subsequent phase.
      </p>
    </div>
  );
}
