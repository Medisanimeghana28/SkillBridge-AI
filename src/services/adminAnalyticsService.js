import { supabase } from '@/lib/supabaseClient';

export const adminAnalyticsService = {
  getGlobalKPIs: async () => {
    // Return zeros if DB empty
    const { count: studentCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
    const { count: industryCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'industry');
    const { count: internshipCount } = await supabase.from('internships').select('*', { count: 'exact', head: true });
    const { count: challengeCount } = await supabase.from('challenges').select('*', { count: 'exact', head: true });
    const { count: verifiedSkills } = await supabase.from('student_skills').select('*', { count: 'exact', head: true }).eq('verification_status', 'Verified');

    return {
      totalStudents: studentCount || 0,
      profilesCompleted: studentCount || 0,
      industryPartners: industryCount || 0,
      activeInternships: internshipCount || 0,
      activeChallenges: challengeCount || 0,
      avgIndustryReadiness: 0,
      verifiedSkills: verifiedSkills || 0,
      placementReady: 0
    };
  },

  getStudentReadinessDistribution: async () => {
    return [];
  },

  getTopEcosystemSkillGaps: async () => {
    return [];
  },

  getIndustryDemandRadar: async () => {
    return [];
  },

  getRecentActivity: async () => {
    return [];
  }
};
