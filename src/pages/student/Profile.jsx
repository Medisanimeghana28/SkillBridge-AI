import { storageService } from "@/services/storageService";
import { User, Mail, MapPin, Building, GraduationCap } from "lucide-react";

export default function StudentProfile() {
  const student = storageService.getCurrentStudent();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Profile</h1>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="h-24 w-24 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-3xl font-bold dark:bg-primary-900/50 dark:text-primary-400">
          {student.name.charAt(0)}
        </div>
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{student.name}</h2>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 justify-center sm:justify-start">
            <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" /> {student.department} • {student.year}</span>
            <span className="flex items-center gap-1"><Building className="h-4 w-4" /> {student.institution}</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 justify-center sm:justify-start">
            <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {student.id}@student.demo</span>
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Bangalore, India</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Target Role: <span className="text-primary-600">{student.targetRole}</span></h3>
        <p className="text-slate-600 dark:text-slate-400">This profile is generated using the <span className="font-semibold text-slate-800 dark:text-slate-200">Prototype Demo Data</span> to showcase SkillBridge AI's capabilities.</p>
      </div>
    </div>
  );
}
