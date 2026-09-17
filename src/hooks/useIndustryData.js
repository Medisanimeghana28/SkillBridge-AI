import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export function useIndustryData() {
  const { user } = useAuth();
  const [data, setData] = useState({
    internships: [],
    challenges: [],
    candidates: [],
    requirements: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        if (!user) return;
        
        const [internshipsRes, challengesRes, reqRes] = await Promise.all([
          supabase.from('internships').select('*').eq('industry_id', user.id),
          supabase.from('challenges').select('*').eq('industry_id', user.id),
          supabase.from('industry_requirements').select('*').eq('industry_id', user.id)
        ]);
        
        setData({
          internships: internshipsRes.data || [],
          challenges: challengesRes.data || [],
          requirements: reqRes.data || [],
          candidates: [] // Handled dynamically via match APIs
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
