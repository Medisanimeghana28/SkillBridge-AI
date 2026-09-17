import { supabase } from '@/lib/supabaseClient';

export const internshipService = {
  async getAllInternships() {
    const { data, error } = await supabase.from('internships').select('*, profiles(company_name)');
    if (error) throw error;
    return data;
  },

  async getIndustryInternships(industryId) {
    const { data, error } = await supabase.from('internships').select('*').eq('industry_id', industryId);
    if (error) throw error;
    return data;
  },

  async createInternship(internshipData) {
    const { data, error } = await supabase.from('internships').insert([internshipData]).select().single();
    if (error) throw error;
    return data;
  }
};

export const applicationService = {
  async getStudentApplications(studentId) {
    const { data, error } = await supabase
      .from('applications')
      .select('*, internships(*, profiles(company_name))')
      .eq('student_id', studentId);
    if (error) throw error;
    return data;
  },

  async getInternshipApplications(internshipId) {
    const { data, error } = await supabase
      .from('applications')
      .select('*, profiles(full_name, email)')
      .eq('internship_id', internshipId);
    if (error) throw error;
    return data;
  },

  async apply(studentId, internshipId, matchScore) {
    const { data, error } = await supabase.from('applications').insert([{
      student_id: studentId,
      internship_id: internshipId,
      match_score: matchScore,
      status: 'Applied'
    }]).select().single();
    if (error) throw error;
    return data;
  },

  async updateStatus(applicationId, status) {
    const { data, error } = await supabase.from('applications').update({ status }).eq('id', applicationId).select().single();
    if (error) throw error;
    return data;
  }
};
