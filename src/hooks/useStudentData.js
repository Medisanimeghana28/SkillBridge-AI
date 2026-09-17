import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export function useStudentData() {
  const { user } = useAuth();
  const [data, setData] = useState({
    skills: [],
    projects: [],
    certifications: [],
    academic: null,
    applications: [],
    skillGaps: [],
    roadmap: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const [skillsRes, projectsRes, certsRes, academicRes, appsRes] = await Promise.all([
          supabase.from('student_skills').select('*, skills(name, category)').eq('student_id', user.id),
          supabase.from('projects').select('*').eq('student_id', user.id),
          supabase.from('certifications').select('*').eq('student_id', user.id),
          supabase.from('academic_records').select('*').eq('student_id', user.id).single(),
          supabase.from('applications').select('*, internships(*, profiles(company_name))').eq('student_id', user.id)
        ]);

        setData({
          skills: skillsRes.data || [],
          projects: projectsRes.data || [],
          certifications: certsRes.data || [],
          academic: academicRes.data || null,
          applications: appsRes.data || [],
          skillGaps: [], // Calculate via AI service in production
          roadmap: [] // Generate via AI service in production
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  return { data, loading, refetch: () => setLoading(true) };
}
