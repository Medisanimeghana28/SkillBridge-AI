import { DEMO_STUDENT } from './demoData';

export const ACADEMIA_DATA = {
  institution: "CMR Institute of Technology",
  stats: {
    totalStudents: 2450,
    profiledStudents: 1980,
    averageReadiness: 74,
    criticalGaps: 8,
    industryAligned: 68,
    internshipParticipation: 42
  },
  departments: [
    { id: 'dept_cse', name: 'CSE', studentCount: 850, avgSkillScore: 76, readiness: 79, topSkill: 'Java', biggestGap: 'Cloud' },
    { id: 'dept_aiml', name: 'AI & ML', studentCount: 420, avgSkillScore: 78, readiness: 81, topSkill: 'Machine Learning', biggestGap: 'Cloud Deployment' },
    { id: 'dept_ece', name: 'ECE', studentCount: 600, avgSkillScore: 71, readiness: 68, topSkill: 'Networking', biggestGap: 'Data Structures' },
    { id: 'dept_it', name: 'IT', studentCount: 380, avgSkillScore: 74, readiness: 75, topSkill: 'SQL', biggestGap: 'System Design' },
    { id: 'dept_eee', name: 'EEE', studentCount: 200, avgSkillScore: 65, readiness: 62, topSkill: 'Circuit Design', biggestGap: 'Programming' }
  ],
  // Simulated heatmap data
  heatmap: [
    { skill: 'Java', CSE: 82, AIML: 76, ECE: 68, IT: 74, EEE: 55 },
    { skill: 'Python', CSE: 74, AIML: 91, ECE: 52, IT: 69, EEE: 48 },
    { skill: 'SQL', CSE: 79, AIML: 83, ECE: 58, IT: 72, EEE: 42 },
    { skill: 'React', CSE: 71, AIML: 62, ECE: 45, IT: 68, EEE: 35 },
    { skill: 'Cloud', CSE: 42, AIML: 51, ECE: 31, IT: 46, EEE: 25 },
    { skill: 'ML', CSE: 55, AIML: 88, ECE: 39, IT: 48, EEE: 30 },
    { skill: 'Cybersecurity', CSE: 38, AIML: 46, ECE: 72, IT: 51, EEE: 28 },
    { skill: 'Docker', CSE: 35, AIML: 40, ECE: 25, IT: 38, EEE: 20 }
  ],
  industryDemand: [
    { skill: 'AI/ML', studentProficiency: 65, industryDemand: 88 },
    { skill: 'Cloud', studentProficiency: 46, industryDemand: 82 },
    { skill: 'Full Stack', studentProficiency: 68, industryDemand: 75 },
    { skill: 'Data Analytics', studentProficiency: 62, industryDemand: 78 },
    { skill: 'Cybersecurity', studentProficiency: 48, industryDemand: 80 },
    { skill: 'DevOps', studentProficiency: 35, industryDemand: 85 },
    { skill: 'Communication', studentProficiency: 75, industryDemand: 90 }
  ],
  demandTrends: [
    { quarter: 'Q1', Cloud: 65, AI: 70, Cyber: 60 },
    { quarter: 'Q2', Cloud: 72, AI: 76, Cyber: 65 },
    { quarter: 'Q3', Cloud: 78, AI: 82, Cyber: 72 },
    { quarter: 'Q4', Cloud: 85, AI: 90, Cyber: 80 }
  ],
  // Demo students for the directory
  students: [
    { ...DEMO_STUDENT, id: 'stu_001', readiness: 82, status: 'Active' },
    { id: 'stu_002', name: 'Priya Patel', department: 'CSE', year: '4th Year', topSkills: 'Java • SQL', readiness: 75, verifiedSkills: 5, status: 'Active' },
    { id: 'stu_003', name: 'Rahul Kumar', department: 'IT', year: '3rd Year', topSkills: 'React • Node.js', readiness: 68, verifiedSkills: 3, status: 'Active' },
    { id: 'stu_004', name: 'Sneha Reddy', department: 'ECE', year: '4th Year', topSkills: 'C++ • Networking', readiness: 71, verifiedSkills: 4, status: 'Active' },
    { id: 'stu_005', name: 'Vikram Singh', department: 'AI & ML', year: '2nd Year', topSkills: 'Python • Math', readiness: 60, verifiedSkills: 2, status: 'Active' }
  ],
  defaultTraining: [
    { id: 'tr_001', name: 'Cloud Deployment Bootcamp', skills: ['AWS', 'Docker', 'Linux'], departments: ['CSE', 'AI & ML', 'IT'], duration: '4 Weeks', participants: 120, status: 'Active' },
    { id: 'tr_002', name: 'Advanced Java Patterns', skills: ['Java', 'System Design'], departments: ['CSE', 'IT'], duration: '2 Weeks', participants: 85, status: 'Completed' },
    { id: 'tr_003', name: 'Cybersecurity Fundamentals', skills: ['Networking', 'Security'], departments: ['ECE', 'IT'], duration: '3 Weeks', participants: 0, status: 'Planned' }
  ]
};
