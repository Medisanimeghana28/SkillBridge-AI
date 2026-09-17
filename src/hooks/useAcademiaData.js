import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export function useAcademiaData() {
  const { user } = useAuth();
  const [data, setData] = useState({
    students: [],
    departments: [],
    skillGaps: [],
    industryDemand: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all students
        const { data: students } = await supabase
          .from('profiles')
          .select('*, academic_records(*)')
          .eq('role', 'student');
          
        // Mocking skill gaps / heatmap since complex aggregate queries require RPCs or specific dataset info
        // In a real scenario, this would aggregate `student_skills` versus `industry_requirements`.
        
        setData({
          students: students || [],
          departments: ['Computer Science', 'Data Science', 'Electrical Engineering'],
          skillGaps: [],
          industryDemand: []
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      fetchData();
    }
  }, [user]);

  return { data, loading };
}
