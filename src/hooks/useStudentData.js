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
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);
      try {
        // Each query resolves independently: a missing academic record (or any
        // single failure) must not wipe out skills, projects, and applications.
        const [skillsRes, projectsRes, certsRes, academicRes, appsRes] = await Promise.all([
          supabase.from('student_skills').select('*, skills(name, category)').eq('student_id', user.id)
            .then((r) => r, (e) => ({ data: [], error: e })),
          supabase.from('projects').select('*').eq('student_id', user.id)
            .then((r) => r, (e) => ({ data: [], error: e })),
          supabase.from('certifications').select('*').eq('student_id', user.id)
            .then((r) => r, (e) => ({ data: [], error: e })),
          supabase.from('academic_records').select('*').eq('student_id', user.id).maybeSingle()
            .then((r) => r, (e) => ({ data: null, error: e })),
          supabase.from('applications').select('*, internships(*, profiles(company_name))').eq('student_id', user.id)
            .then((r) => r, (e) => ({ data: [], error: e })),
        ]);

        [skillsRes, projectsRes, certsRes, academicRes, appsRes].forEach((r) => {
          if (r.error) console.error('useStudentData query failed:', r.error.message || r.error);
        });

        setData({
          skills: skillsRes.data || [],
          projects: projectsRes.data || [],
          certifications: certsRes.data || [],
          academic: academicRes.data || null,
          applications: appsRes.data || [],
          skillGaps: [],
          roadmap: []
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, refreshKey]);

  return { data, loading, refetch: () => setRefreshKey((k) => k + 1) };
}
