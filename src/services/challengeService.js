import { supabase } from '@/lib/supabaseClient';

export const challengeService = {
  async getAllChallenges() {
    const { data, error } = await supabase.from('challenges').select('*, profiles(company_name)');
    if (error) throw error;
    return data;
  },

  async getIndustryChallenges(industryId) {
    const { data, error } = await supabase.from('challenges').select('*').eq('industry_id', industryId);
    if (error) throw error;
    return data;
  },

  async getStudentSubmissions(studentId) {
    const { data, error } = await supabase.from('challenge_submissions').select('*, challenges(*)').eq('student_id', studentId);
    if (error) throw error;
    return data;
  },

  async createChallenge(challengeData) {
    const { data, error } = await supabase.from('challenges').insert([challengeData]).select().single();
    if (error) throw error;
    return data;
  },

  async submitChallenge(submissionData) {
    const { data, error } = await supabase.from('challenge_submissions').insert([submissionData]).select().single();
    if (error) throw error;
    return data;
  }
};
