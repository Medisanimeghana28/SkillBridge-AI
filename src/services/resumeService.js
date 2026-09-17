import { supabase } from '@/lib/supabaseClient';

export const resumeService = {
  async uploadResume(studentId, file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${studentId}-${Date.now()}.${fileExt}`;
    const filePath = `resumes/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Create database record
    const { data, error } = await supabase.from('resumes').insert([{
      student_id: studentId,
      file_name: file.name,
      file_path: filePath,
      file_type: file.type,
      status: 'Uploaded'
    }]).select().single();

    if (error) throw error;
    return data;
  },

  async getStudentResumes(studentId) {
    const { data, error } = await supabase
      .from('resumes')
      .select('*, resume_analysis(*)')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Prototype parser - in a real app this would call an Edge Function / LLM endpoint
  async analyzeResume(resumeId) {
    // 1. Mark as analyzing
    await supabase.from('resumes').update({ status: 'Analyzing' }).eq('id', resumeId);
    
    // 2. Simulate processing delay
    await new Promise(r => setTimeout(r, 2000));
    
    // 3. Mock analysis result for prototype based on a dataset-driven approach
    // In production, the backend would generate this JSON.
    const analysis = {
      resume_id: resumeId,
      overall_score: 85,
      skills_detected: ['React', 'JavaScript', 'Node.js', 'PostgreSQL'],
      technical_skills: ['React', 'Node.js', 'PostgreSQL'],
      soft_skills: ['Communication', 'Teamwork'],
      projects_identified: ['E-commerce Platform', 'Task Manager API'],
      certifications_identified: ['AWS Cloud Practitioner'],
      strengths: ['Strong frontend fundamentals', 'Full-stack exposure'],
      missing_skills: ['Docker', 'CI/CD', 'TypeScript'],
      recommendations: ['Add testing frameworks (Jest/Cypress)', 'Learn Docker for deployment'],
      target_role: 'Full Stack Developer'
    };

    const { data, error } = await supabase.from('resume_analysis').insert([analysis]).select().single();
    if (error) throw error;

    await supabase.from('resumes').update({ status: 'Analyzed' }).eq('id', resumeId);
    
    return data;
  }
};
