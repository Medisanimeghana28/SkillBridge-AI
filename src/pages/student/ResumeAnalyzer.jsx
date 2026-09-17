import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { resumeService } from '@/services/resumeService';
import { Button } from '@/components/common/Button';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function ResumeAnalyzer() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResumes();
  }, [user]);

  async function loadResumes() {
    if (!user) return;
    try {
      const data = await resumeService.getStudentResumes(user.id);
      setResumes(data || []);
      if (data && data.length > 0 && data[0].resume_analysis?.length > 0) {
        setActiveAnalysis(data[0].resume_analysis[0]);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await resumeService.uploadResume(user.id, file);
      setFile(null);
      await loadResumes();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async (resumeId) => {
    setAnalyzing(true);
    setError(null);
    try {
      const data = await resumeService.analyzeResume(resumeId);
      setActiveAnalysis(data);
      await loadResumes();
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          Resume Analyzer
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Upload your resume to automatically extract skills, projects, and get AI-driven feedback.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">Upload New Resume</h3>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center text-center">
              <UploadCloud className="h-10 w-10 text-slate-400 mb-3" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Drag & drop or click to upload</p>
              <p className="text-xs text-slate-500 mb-4">Supported formats: PDF, JPG, PNG (Max 5MB)</p>
              <input 
                type="file" 
                accept=".pdf,.jpg,.png" 
                className="hidden" 
                id="resume-upload" 
                onChange={handleFileChange}
              />
              <label htmlFor="resume-upload">
                <Button as="span" variant="outline" className="cursor-pointer">Select File</Button>
              </label>
            </div>
            
            {file && (
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="h-4 w-4 text-primary-500 shrink-0" />
                  <span className="text-sm truncate dark:text-slate-200">{file.name}</span>
                </div>
                <Button size="sm" onClick={handleUpload} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">Your Resumes</h3>
            {resumes.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No resumes uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {resumes.map(r => (
                  <div key={r.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium truncate dark:text-slate-200">{r.file_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString()}</span>
                      {r.status === 'Uploaded' ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs gap-1"
                          onClick={() => handleAnalyze(r.id)}
                          disabled={analyzing}
                        >
                          <Sparkles className="h-3 w-3" /> {analyzing ? 'Analyzing...' : 'Analyze'}
                        </Button>
                      ) : (
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Analyzed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Analysis Results Section */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm min-h-[500px] flex flex-col">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              Analysis Results
            </h3>
            
            {!activeAnalysis ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
                <Sparkles className="h-12 w-12 text-slate-200 dark:text-slate-700 mb-4" />
                <p>Select an analyzed resume to view insights,<br/>or upload and analyze a new one.</p>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-500">
                
                {/* Score & Role */}
                <div className="flex items-center justify-between bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg border border-primary-100 dark:border-primary-900/50">
                  <div>
                    <p className="text-sm text-primary-700 dark:text-primary-400 font-medium">Inferred Target Role</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{activeAnalysis.target_role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-primary-700 dark:text-primary-400 font-medium">Resume Score</p>
                    <p className="text-2xl font-black text-primary-600 dark:text-primary-400">{activeAnalysis.overall_score}/100</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Skills Detected */}
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Detected Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeAnalysis.skills_detected?.map(skill => (
                        <div key={skill} className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 group cursor-pointer hover:bg-primary-100 hover:text-primary-700 transition-colors">
                          {skill}
                          <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">Click a skill to add it to your Skill DNA (Source: Resume)</p>
                  </div>

                  {/* Missing Skills */}
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" /> Missing / Weak Areas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeAnalysis.missing_skills?.map(skill => (
                        <div key={skill} className="bg-rose-50 dark:bg-rose-900/20 px-3 py-1 rounded-full text-xs font-medium text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50">
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">AI Recommendations</h4>
                  <ul className="space-y-2">
                    {activeAnalysis.recommendations?.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="text-primary-500 mt-0.5">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
                
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
