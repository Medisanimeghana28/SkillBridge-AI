export const DEMO_STUDENT = {
  id: "u1",
  name: "Aarav Sharma",
  role: "student",
  readinessScore: 82,
  skillsVerified: 7,
  totalSkills: 10,
  internshipMatchesCount: 12,
  skillGapsCount: 4,
  
  skillDNA: [
    { subject: 'Java', A: 90, fullMark: 100 },
    { subject: 'Python', A: 85, fullMark: 100 },
    { subject: 'SQL', A: 80, fullMark: 100 },
    { subject: 'React', A: 65, fullMark: 100 },
    { subject: 'Machine Learning', A: 75, fullMark: 100 },
    { subject: 'Cloud', A: 40, fullMark: 100 },
    { subject: 'Communication', A: 85, fullMark: 100 },
  ],

  detailedSkills: [
    { name: "Java", proficiency: 92, category: "Technical", status: "Verified", evidence: "HackerRank Gold", lastUpdated: "2 weeks ago" },
    { 
      name: 'Python', 
      proficiency: 92, 
      category: 'Technical', 
      status: 'Verified', 
      evidence: 'HackerRank Gold, 3 Projects',
      evidenceList: [
        { type: 'Assessment', title: 'HackerRank Advanced Python', date: '2026-01-15', status: 'Verified' },
        { type: 'Project', title: 'AI Resume Analyzer', date: '2026-03-20', status: 'Verified' },
        { type: 'Industry Challenge', title: 'Customer Churn Prediction', date: '2026-05-10', status: 'Verified' }
      ],
      lastUpdated: '2 days ago' 
    },
    { 
      name: 'SQL', 
      proficiency: 88, 
      category: 'Technical', 
      status: 'Verified', 
      evidence: 'LeetCode 50+ problems',
      evidenceList: [
        { type: 'Assessment', title: 'SQL Advanced Certification', date: '2026-04-12', status: 'Verified' }
      ],
      lastUpdated: '1 month ago' 
    },
    { 
      name: 'React', 
      proficiency: 81, 
      category: 'Technical', 
      status: 'Project Verified', 
      evidence: 'Portfolio, E-commerce Clone',
      evidenceList: [
        { type: 'Course', title: 'Meta Front-End Developer', date: '2025-11-10', status: 'Verified' },
        { type: 'Project', title: 'E-commerce React Clone', date: '2026-02-14', status: 'Verified' }
      ],
      lastUpdated: '1 week ago' 
    },
    { 
      name: 'Machine Learning', 
      proficiency: 84, 
      category: 'Technical', 
      status: 'Verified', 
      evidence: 'Stanford Coursera, Kaggle Top 10%',
      evidenceList: [
        { type: 'Certification', title: 'Stanford Machine Learning', date: '2025-08-20', status: 'Verified' },
        { type: 'Industry Challenge', title: 'Kaggle House Prices', date: '2025-12-05', status: 'Verified' }
      ],
      lastUpdated: '3 weeks ago' 
    },
    { name: "Communication", proficiency: 85, category: "Soft Skills", status: "Verified", evidence: "Debate Club Lead", lastUpdated: "6 months ago" },
    { name: "Problem Solving", proficiency: 90, category: "Soft Skills", status: "Verified", evidence: "LeetCode Top 5%", lastUpdated: "1 week ago" },
    { name: "Git & GitHub", proficiency: 88, category: "Tools", status: "Project Verified", evidence: "50+ Commits", lastUpdated: "2 days ago" },
    { 
      name: 'Docker', 
      proficiency: 35, 
      category: 'Tools', 
      status: 'Needs Improvement', 
      evidence: 'Basic Tutorial',
      evidenceList: [],
      lastUpdated: '2 months ago' 
    },
    { 
      name: 'AWS', 
      proficiency: 42, 
      category: 'Tools', 
      status: 'Needs Improvement', 
      evidence: 'AWS Cloud Practitioner Prep',
      evidenceList: [
        { type: 'Course', title: 'AWS Concepts Basics', date: '2026-06-01', status: 'Partial' }
      ],
      lastUpdated: '5 days ago' 
    },
  ],

  certifications: [
    { name: "AWS Cloud Practitioner", status: "Planned", date: "ETA: Nov 2026" },
    { name: "Oracle Certified Associate, Java SE 8", status: "Earned", date: "Jan 2025" },
    { name: "DeepLearning.AI ML Specialization", status: "In Progress", date: "Current" },
  ],

  projects: [
    { name: "AI Health Assistant", tech: "Python, TensorFlow, React", type: "Hackathon Winner" },
    { name: "E-Commerce Backend", tech: "Java, Spring Boot, MySQL", type: "Academic Project" },
  ],

  skillGaps: [
    { id: 1, skill: "Cloud Computing", current: 40, target: 80, priority: "High" },
    { id: 2, skill: "Docker", current: 30, target: 70, priority: "High" },
    { id: 3, skill: "Deep Learning", current: 50, target: 75, priority: "Medium" },
    { id: 4, skill: "System Design", current: 45, target: 80, priority: "Medium" },
  ],

  internships: [
    { id: 101, role: "AI/ML Intern", company: "TechNova Labs", location: "Hyderabad", matchPercent: 91, skills: ["Python", "Machine Learning", "SQL"], reason: "Strong Python & ML skills align perfectly." },
    { id: 102, role: "Data Science Intern", company: "DataSync Solutions", location: "Bengaluru", matchPercent: 85, skills: ["Python", "SQL", "Deep Learning"], reason: "Good SQL and Data fundamentals." },
    { id: 103, role: "Backend Developer", company: "CloudCore", location: "Pune", matchPercent: 78, skills: ["Java", "Cloud", "Docker"], reason: "Excellent Java skills, needs some Cloud exposure." }
  ],

  roadmap: [
    { id: 1, step: "Current State", status: "completed" },
    { id: 2, step: "Strengthen ML", status: "completed" },
    { id: 3, step: "Learn Deep Learning", status: "current" },
    { id: 4, step: "Build AI Project", status: "upcoming" },
    { id: 5, step: "Industry Challenge", status: "upcoming" },
    { id: 6, step: "Internship", status: "upcoming" },
    { id: 7, step: "Placement Ready", status: "upcoming" },
  ],

  recentActivity: [
    { id: 1, text: "Completed Python Assessment", date: "2 days ago", type: "assessment" },
    { id: 2, text: "Added AI Project to Portfolio", date: "4 days ago", type: "project" },
    { id: 3, text: "Applied for ML Internship at TechNova", date: "1 week ago", type: "application" },
    { id: 4, text: "Skill verified: SQL", date: "1 week ago", type: "verification" },
  ]
};

export const ROLE_REQUIREMENTS = {
  "AI Engineer": {
    technical: [
      { name: "Python", target: 90 },
      { name: "Machine Learning", target: 85 },
      { name: "Deep Learning", target: 80 },
      { name: "SQL", target: 70 }
    ],
    tools: [
      { name: "Git & GitHub", target: 80 },
      { name: "Docker", target: 70 },
      { name: "AWS", target: 65 }
    ]
  },
  "Full Stack Developer": {
    technical: [
      { name: "React", target: 85 },
      { name: "Node.js", target: 80 },
      { name: "Java", target: 80 },
      { name: "SQL", target: 75 }
    ],
    tools: [
      { name: "Git & GitHub", target: 85 },
      { name: "Docker", target: 60 }
    ]
  },
  "Data Analyst": {
    technical: [
      { name: "SQL", target: 90 },
      { name: "Python", target: 85 },
      { name: "Data Visualization", target: 80 }
    ],
    tools: [
      { name: "Excel", target: 90 },
      { name: "Tableau/PowerBI", target: 80 }
    ]
  },
  "ML Engineer": {
    technical: [
      { name: "Python", target: 90 },
      { name: "Machine Learning", target: 90 },
      { name: "System Design", target: 75 }
    ],
    tools: [
      { name: "Docker", target: 85 },
      { name: "AWS", target: 80 },
      { name: "Kubernetes", target: 70 }
    ]
  },
  "Cloud Engineer": {
    technical: [
      { name: "Python", target: 75 },
      { name: "Linux", target: 85 },
      { name: "Networking", target: 80 }
    ],
    tools: [
      { name: "AWS", target: 90 },
      { name: "Docker", target: 85 },
      { name: "Terraform", target: 80 }
    ]
  },
  "Software Developer": {
    technical: [
      { name: "Java", target: 85 },
      { name: "Python", target: 75 },
      { name: "System Design", target: 70 }
    ],
    tools: [
      { name: "Git & GitHub", target: 85 },
      { name: "Docker", target: 60 },
      { name: "AWS", target: 50 }
    ]
  }
};
