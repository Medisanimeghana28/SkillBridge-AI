import { INTERNSHIP_DATA } from './internshipData';

export const INDUSTRY_DATA = {
  company: {
    id: "comp_01",
    name: "TechNova Labs",
    industry: "Artificial Intelligence & Cloud",
    location: "Bangalore, India",
    description: "Building scalable AI solutions and cloud infrastructure for the next generation of web applications."
  },
  stats: {
    openInternships: 8,
    activeChallenges: 5,
    talentMatches: 124,
    applications: 86,
    verifiedCandidates: 42,
    skillRequirements: 18
  },
  // Default Roles / Requirements that the industry is looking for
  requirements: [
    {
      id: "req_01",
      role: "AI Engineer",
      department: "Data Science",
      requiredSkills: ["Python", "Machine Learning", "SQL", "Deep Learning"],
      preferredSkills: ["Docker", "AWS"],
      priority: "High"
    },
    {
      id: "req_02",
      role: "Full Stack Developer",
      department: "Engineering",
      requiredSkills: ["React", "Node.js", "JavaScript", "SQL"],
      preferredSkills: ["Docker", "AWS", "TypeScript"],
      priority: "High"
    },
    {
      id: "req_03",
      role: "Cloud Engineer",
      department: "DevOps",
      requiredSkills: ["AWS", "Linux", "Docker", "Networking"],
      preferredSkills: ["Python", "Kubernetes"],
      priority: "Medium"
    },
    {
      id: "req_04",
      role: "Cybersecurity Analyst",
      department: "Security",
      requiredSkills: ["Networking", "Security", "Linux"],
      preferredSkills: ["Python", "Cloud"],
      priority: "Medium"
    }
  ],
  // Pre-populate some industry challenges
  defaultChallenges: [
    {
      id: "chal_01",
      title: "Customer Churn Prediction",
      domain: "AI / Data Science",
      difficulty: "Intermediate",
      duration: "2 Weeks",
      requiredSkills: ["Python", "Machine Learning", "SQL"],
      status: "Active",
      participants: 45
    },
    {
      id: "chal_02",
      title: "Secure Cloud Architecture Design",
      domain: "Cloud / Security",
      difficulty: "Advanced",
      duration: "3 Weeks",
      requiredSkills: ["AWS", "Networking", "Security"],
      status: "Active",
      participants: 12
    },
    {
      id: "chal_03",
      title: "Real-time Chat Application",
      domain: "Full Stack Web",
      difficulty: "Beginner",
      duration: "1 Week",
      requiredSkills: ["React", "Node.js", "JavaScript"],
      status: "Draft",
      participants: 0
    }
  ]
};
