export const ROLE_ROADMAPS = {
  "AI Engineer": {
    baseDurationWeeks: 12,
    stages: [
      {
        id: "s1",
        title: "Foundation",
        goal: "Solidify core programming and database fundamentals.",
        skills: ["Python", "SQL"],
        tasks: [
          { id: "t1_1", text: "Master advanced Python concepts (Generators, Decorators)" },
          { id: "t1_2", text: "Complete Advanced SQL queries module" },
          { id: "t1_3", text: "Review Data Structures & Algorithms basics" }
        ]
      },
      {
        id: "s2",
        title: "Skill Development",
        goal: "Strengthen the core skills required for AI Engineer roles.",
        skills: ["Machine Learning", "Deep Learning", "Docker"],
        tasks: [
          { id: "t2_1", text: "Complete Deep Learning fundamentals" },
          { id: "t2_2", text: "Build a CNN project from scratch" },
          { id: "t2_3", text: "Learn Docker basics" },
          { id: "t2_4", text: "Containerize a simple ML application" }
        ]
      },
      {
        id: "s3",
        title: "Project Building",
        goal: "Apply skills to build end-to-end AI applications.",
        skills: ["Machine Learning", "Python", "Cloud"],
        tasks: [
          { id: "t3_1", text: "Deploy ML model using FastAPI" },
          { id: "t3_2", text: "Build an AI Resume Analyzer" }
        ]
      },
      {
        id: "s4",
        title: "Industry Exposure",
        goal: "Gain real-world experience through challenges.",
        skills: ["Problem Solving", "System Design"],
        tasks: [
          { id: "t4_1", text: "Participate in an industry hackathon" },
          { id: "t4_2", text: "Complete Customer Churn Prediction Challenge" }
        ]
      },
      {
        id: "s5",
        title: "Internship",
        goal: "Apply to matched internships and gain professional experience.",
        skills: ["Communication", "Interviewing"],
        tasks: [
          { id: "t5_1", text: "Update resume with verified skills" },
          { id: "t5_2", text: "Apply to 5 matched AI/ML internships" }
        ]
      },
      {
        id: "s6",
        title: "Placement Ready",
        goal: "Final preparation for full-time roles.",
        skills: ["System Design", "Algorithms"],
        tasks: [
          { id: "t6_1", text: "Mock technical interviews" },
          { id: "t6_2", text: "System design practice" }
        ]
      }
    ],
    recommendedProjects: [
      {
        id: "p1",
        title: "AI Resume Analyzer",
        skills: ["Python", "NLP", "React"],
        difficulty: "Intermediate",
        time: "2 weeks",
        description: "Parse and score resumes against job descriptions using LLMs."
      },
      {
        id: "p2",
        title: "Customer Churn Predictor",
        skills: ["Python", "Machine Learning", "SQL"],
        difficulty: "Beginner",
        time: "1 week",
        description: "Predict which customers will leave based on historical data."
      },
      {
        id: "p3",
        title: "ML Model Deployment Platform",
        skills: ["Docker", "AWS", "FastAPI"],
        difficulty: "Advanced",
        time: "3 weeks",
        description: "Create a scalable microservice for serving ML models."
      }
    ],
    industryChallenge: {
      title: "Customer Churn Prediction Challenge",
      company: "TechNova Labs",
      skills: ["Python", "Machine Learning", "SQL"]
    }
  }
};

// Fallback roadmap for roles that might not be fully defined yet
export const DEFAULT_ROADMAP = {
  baseDurationWeeks: 10,
  stages: [
    { id: "s1", title: "Foundation", goal: "Core fundamentals.", skills: [], tasks: [{ id: "d1_1", text: "Review basics" }] },
    { id: "s2", title: "Skill Development", goal: "Learn core requirements.", skills: [], tasks: [{ id: "d2_1", text: "Take online courses" }] },
    { id: "s3", title: "Project Building", goal: "Build portfolio.", skills: [], tasks: [{ id: "d3_1", text: "Complete main project" }] },
    { id: "s4", title: "Industry Exposure", goal: "Real-world experience.", skills: [], tasks: [{ id: "d4_1", text: "Industry challenge" }] },
    { id: "s5", title: "Internship", goal: "Get practical experience.", skills: [], tasks: [{ id: "d5_1", text: "Apply for internships" }] },
    { id: "s6", title: "Placement Ready", goal: "Interview prep.", skills: [], tasks: [{ id: "d6_1", text: "Mock interviews" }] }
  ],
  recommendedProjects: [
    { id: "dp1", title: "Portfolio Website", skills: ["HTML", "CSS"], difficulty: "Beginner", time: "1 week", description: "Build a personal portfolio." }
  ],
  industryChallenge: {
    title: "General Tech Challenge",
    company: "Industry Partner",
    skills: ["Problem Solving"]
  }
};
