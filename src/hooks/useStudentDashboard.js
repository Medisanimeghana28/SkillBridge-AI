import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export function useStudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    async function fetchDashboardData() {
      try {
        // Fetch skills
        const { data: skills } = await supabase
          .from('student_skills')
          .select('*, skills(name, category)')
          .eq('student_id', user.id);
          
        // Fetch applications
        const { data: applications } = await supabase
          .from('applications')
          .select('id')
          .eq('student_id', user.id);
          
        // Fetch projects
        const { data: projects } = await supabase
          .from('projects')
          .select('id')
          .eq('student_id', user.id);
          
        // Map radar data
        const mappedSkills = skills?.map(s => ({
          subject: s.skills?.name,
          A: s.proficiency
        })) || [];
        
        const verifiedCount = skills?.filter(s => s.verification_status === 'Verified').length || 0;
        const totalSkills = skills?.length || 0;
        
        // Mock readiness if no skills
        const avgProficiency = totalSkills > 0 
          ? Math.round(skills.reduce((acc, curr) => acc + curr.proficiency, 0) / totalSkills)
          : 0;

        setData({
          totalSkills,
          verifiedSkills: verifiedCount,
          internshipMatchesCount: applications?.length || 0, // In real app, calculate matches based on open internships
          skillGapsCount: totalSkills > 0 ? Math.floor(totalSkills / 3) : 0, // Placeholder calculation
          readinessScore: avgProficiency,
          skillDNA: mappedSkills,
          projectsCount: projects?.length || 0
        });
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, [user]);

  return { data, loading, error };
}
