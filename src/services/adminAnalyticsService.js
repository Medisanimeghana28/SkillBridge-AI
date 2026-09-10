import { ACADEMIA_DATA } from '@/data/academiaData';
import { INDUSTRY_DATA } from '@/data/industryData';
import { INTERNSHIP_DATA } from '@/data/internshipData';
import { DEMO_STUDENT } from '@/data/demoData';
import { storageService } from '@/services/storageService';

export const adminAnalyticsService = {
  getGlobalKPIs: () => {
    // Collect stats from storageService
    const createdInternships = storageService.getInternships();
    const industryChallenges = storageService.getChallenges();
    const applications = storageService.getApplications();
    const feedback = storageService.getFeedback();
    
    // Derived values
    const activeInternshipsCount = createdInternships.length > 0 ? createdInternships.length : 124;
    const activeChallengesCount = industryChallenges.length > 0 ? industryChallenges.length : 42;
    
    return {
      totalStudents: 2480,
      profilesCompleted: 1964 + applications.length, // Just to show dynamic movement
      industryPartners: 86 + feedback.length, // Dynamic movement
      activeInternships: activeInternshipsCount,
      activeChallenges: activeChallengesCount,
      avgIndustryReadiness: 68,
      verifiedSkills: 8720 + storageService.getCompletedChallenges().length * 2,
      placementReady: 412
    };
  },

  getStudentReadinessDistribution: () => {
    // Deterministic distribution
    return [
      { name: 'Not Ready', value: 15, fill: '#ef4444' }, // Red
      { name: 'Developing', value: 45, fill: '#f59e0b' }, // Amber
      { name: 'Industry Ready', value: 25, fill: '#14b8a6' }, // Teal
      { name: 'Placement Ready', value: 15, fill: '#6366f1' } // Indigo
    ];
  },

  getTopEcosystemSkillGaps: () => {
    // Based on the academia heatmap logic but generalized
    return [
      { skill: 'Cloud Computing', studentLevel: 42, industryTarget: 75, gap: 33, priority: 'Critical', affected: 1240 },
      { skill: 'System Design', studentLevel: 35, industryTarget: 65, gap: 30, priority: 'Critical', affected: 980 },
      { skill: 'Docker', studentLevel: 50, industryTarget: 75, gap: 25, priority: 'High', affected: 1100 },
      { skill: 'Advanced SQL', studentLevel: 60, industryTarget: 80, gap: 20, priority: 'Medium', affected: 850 },
      { skill: 'Machine Learning', studentLevel: 55, industryTarget: 70, gap: 15, priority: 'Medium', affected: 720 }
    ];
  },

  getIndustryDemandRadar: () => {
    // Supply vs Demand for Radar Chart
    return [
      { subject: 'AI/ML', supply: 65, demand: 90 },
      { subject: 'Full Stack', supply: 80, demand: 85 },
      { subject: 'Cloud', supply: 48, demand: 82 },
      { subject: 'Data Analytics', supply: 70, demand: 75 },
      { subject: 'Cybersecurity', supply: 45, demand: 70 },
      { subject: 'Software Dev', supply: 85, demand: 80 },
    ];
  },

  getInstitutionPerformance: () => {
    return [
      { id: 'inst1', name: 'CMR Institute of Technology', students: 420, completion: 82, readiness: 71, criticalGaps: ['Cloud', 'System Design'], alignment: 76 },
      { id: 'inst2', name: 'IIT Bombay', students: 850, completion: 94, readiness: 88, criticalGaps: ['Advanced SQL'], alignment: 91 },
      { id: 'inst3', name: 'NIT Surathkal', students: 600, completion: 78, readiness: 65, criticalGaps: ['Cloud', 'Docker', 'ML'], alignment: 68 },
      { id: 'inst4', name: 'RV College of Engineering', students: 510, completion: 85, readiness: 74, criticalGaps: ['Cybersecurity', 'Cloud'], alignment: 79 }
    ];
  },

  getRecentActivity: () => {
    // Dynamic timeline combining localstorage and mock data
    const applications = storageService.getApplications();
    const trainingPrograms = storageService.getTrainingPrograms();
    const feedback = storageService.getFeedback();
    const completedChallenges = storageService.getCompletedChallenges();

    const timeline = [];
    
    if (applications.length > 0) {
      timeline.push(`Student applied for ${applications[0].role} at ${applications[0].company}`);
    } else {
      timeline.push(`TechNova Labs published a Full Stack internship`);
    }

    if (feedback.length > 0) {
      timeline.push(`Industry partners submitted feedback regarding: ${feedback[0].skill}`);
    } else {
      timeline.push(`12 students shortlisted by leading tech firms`);
    }

    if (trainingPrograms.length > 0) {
      timeline.push(`Academia launched new training program: ${trainingPrograms[0].name || trainingPrograms[0].title}`);
    } else {
      timeline.push(`Academia initiated 'Cloud & DevOps Bootcamp'`);
    }

    if (completedChallenges.length > 0) {
      timeline.push(`Student completed challenge: ${completedChallenges[0].projectTitle}`);
    } else {
      timeline.push(`Student Aarav Sharma verified 7 skills via Passport`);
    }

    return timeline;
  },

  getEcosystemPriorities: () => {
    return [
      { level: 'Critical', issue: 'Cloud skill gap is affecting a large student population.', action: 'Recommend cloud-focused academic training and industry challenges.' },
      { level: 'High', issue: 'Industry demand for AI/ML exceeds current student proficiency.', action: 'Alert academia to update curriculum and boost AI specialization tracks.' },
      { level: 'Medium', issue: 'Industry feedback participation is lower than internship participation.', action: 'Prompt companies to provide skill requirements post-internship.' }
    ];
  },

  getAdminInsights: () => {
    return [
      "Cloud Computing is the largest cross-institution skill gap.",
      "Students with verified project evidence show 40% higher readiness scores.",
      "Industry demand is currently strongest for AI/ML and Full Stack roles.",
      "Hands-on challenges have proven to be the fastest way to close practical skill gaps."
    ];
  }
};
