import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { skillService } from '@/services/skillService';
import { Button } from '@/components/common/Button';
import { Github, Linkedin, Globe, Check, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Onboarding() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState('');
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [profiles, setProfiles] = useState({ github: '', linkedin: '', portfolio: '' });
  
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  
  const [projects, setProjects] = useState([]);
  const [projectInput, setProjectInput] = useState({ title: '', tech: '', description: '' });
  
  const [certifications, setCertifications] = useState([]);
  const [certInput, setCertInput] = useState({ name: '', issuer: '', date: '' });

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const addProject = () => {
    if (projectInput.title.trim()) {
      setProjects([...projects, { ...projectInput }]);
      setProjectInput({ title: '', tech: '', description: '' });
    }
  };

  const removeProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const addCert = () => {
    if (certInput.name.trim()) {
      setCertifications([...certifications, { ...certInput }]);
      setCertInput({ name: '', issuer: '', date: '' });
    }
  };

  const removeCert = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const finishOnboarding = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      if (!user) throw new Error('No authenticated user.');

      await updateProfile({
        hasCompletedOnboarding: true,
        github_url: profiles.github || null,
        linkedin_url: profiles.linkedin || null,
        portfolio_url: profiles.portfolio || null,
      });

      for (const name of skills) {
        await skillService.addStudentSkill(user.id, name, 50, 'Onboarding');
      }

      if (projects.length > 0) {
        const { error } = await supabase.from('projects').insert(
          projects.map((p) => ({
            student_id: user.id,
            title: p.title,
            description: p.description || null,
            technologies: p.tech
              ? p.tech.split(',').map((t) => t.trim()).filter(Boolean)
              : [],
          }))
        );
        if (error) throw error;
      }

      if (certifications.length > 0) {
        const { error } = await supabase.from('certifications').insert(
          certifications.map((c) => ({
            student_id: user.id,
            name: c.name,
            issuer: c.issuer || 'Self-reported',
            issue_date: c.date ? `${c.date}-01` : null,
          }))
        );
        if (error) throw error;
      }

      navigate('/student/dashboard');
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      setSubmitError(err.message || 'Failed to save your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Progress Bar */}
        <div className="bg-slate-100 dark:bg-slate-800 h-2 w-full">
          <div 
            className="h-full bg-primary-500 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Profiles */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome! Let's build your profile.</h1>
                  <p className="text-slate-600 dark:text-slate-400">First, add your public profiles to help employers find you.</p>
                </div>
                
                <div className="space-y-4 max-w-lg mx-auto">
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="url"
                      placeholder="GitHub URL"
                      value={profiles.github}
                      onChange={e => setProfiles({...profiles, github: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:text-white"
                    />
                  </div>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="url"
                      placeholder="LinkedIn URL"
                      value={profiles.linkedin}
                      onChange={e => setProfiles({...profiles, linkedin: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:text-white"
                    />
                  </div>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="url"
                      placeholder="Portfolio / Personal Website"
                      value={profiles.portfolio}
                      onChange={e => setProfiles({...profiles, portfolio: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:text-white"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Skills */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">What are your skills?</h1>
                  <p className="text-slate-600 dark:text-slate-400">Add technical and soft skills you possess.</p>
                </div>
                
                <div className="max-w-lg mx-auto space-y-4">
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="e.g. React, Python, Communication"
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addSkill()}
                      className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:text-white"
                    />
                    <Button onClick={addSkill} variant="secondary">
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-4">
                    {skills.map(skill => (
                      <span key={skill} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium border border-primary-200 dark:border-primary-800">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="hover:text-primary-800 dark:hover:text-primary-200 focus:outline-none">
                          &times;
                        </button>
                      </span>
                    ))}
                    {skills.length === 0 && (
                      <p className="text-sm text-slate-400 italic">No skills added yet.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Projects */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Showcase your projects</h1>
                  <p className="text-slate-600 dark:text-slate-400">Add a few projects to stand out to employers.</p>
                </div>
                
                <div className="max-w-xl mx-auto space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <input 
                      type="text"
                      placeholder="Project Title"
                      value={projectInput.title}
                      onChange={e => setProjectInput({...projectInput, title: e.target.value})}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white text-sm focus:ring-1 focus:ring-primary-500"
                    />
                    <input 
                      type="text"
                      placeholder="Technologies used (e.g. Node.js, MongoDB)"
                      value={projectInput.tech}
                      onChange={e => setProjectInput({...projectInput, tech: e.target.value})}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white text-sm focus:ring-1 focus:ring-primary-500"
                    />
                    <textarea 
                      placeholder="Short description..."
                      rows={2}
                      value={projectInput.description}
                      onChange={e => setProjectInput({...projectInput, description: e.target.value})}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white text-sm focus:ring-1 focus:ring-primary-500"
                    />
                    <Button onClick={addProject} variant="secondary" className="w-full text-sm py-2">
                      <Plus className="w-4 h-4 mr-2" /> Add Project
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {projects.map((proj, i) => (
                      <div key={i} className="flex items-start justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{proj.title}</h4>
                          <p className="text-xs text-primary-500 mb-1">{proj.tech}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{proj.description}</p>
                        </div>
                        <button onClick={() => removeProject(i)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Certifications */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Any Certifications?</h1>
                  <p className="text-slate-600 dark:text-slate-400">List official certifications you've earned.</p>
                </div>
                
                <div className="max-w-xl mx-auto space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <input 
                      type="text"
                      placeholder="Certification Name"
                      value={certInput.name}
                      onChange={e => setCertInput({...certInput, name: e.target.value})}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white text-sm focus:ring-1 focus:ring-primary-500"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="text"
                        placeholder="Issuer (e.g. AWS, Coursera)"
                        value={certInput.issuer}
                        onChange={e => setCertInput({...certInput, issuer: e.target.value})}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white text-sm focus:ring-1 focus:ring-primary-500"
                      />
                      <input 
                        type="month"
                        value={certInput.date}
                        onChange={e => setCertInput({...certInput, date: e.target.value})}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white text-sm focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <Button onClick={addCert} variant="secondary" className="w-full text-sm py-2">
                      <Plus className="w-4 h-4 mr-2" /> Add Certification
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {certifications.map((cert, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{cert.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{cert.issuer} • {cert.date}</p>
                        </div>
                        <button onClick={() => removeCert(i)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {submitError && (
          <div className="mx-8 mb-4 p-3 rounded-lg bg-red-50 text-red-600 border border-red-100 text-sm font-medium dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
            {submitError}
          </div>
        )}

        {/* Footer actions */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={handlePrev}
            disabled={step === 1 || isSubmitting}
            className={step === 1 ? 'invisible' : ''}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          
          <div className="flex gap-2">
            <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
            <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
            <div className={`w-2 h-2 rounded-full ${step === 3 ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
            <div className={`w-2 h-2 rounded-full ${step === 4 ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
          </div>

          {step < 4 ? (
            <Button onClick={handleNext}>
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={finishOnboarding} isLoading={isSubmitting}>
              Complete Profile <Check className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
        
      </div>
    </div>
  );
}
