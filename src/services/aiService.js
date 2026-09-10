import { DEMO_STUDENT, ROLE_REQUIREMENTS } from "@/data/demoData";

// Simulate network delay for realistic feel
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const aiService = {
  /**
   * Deterministically calculates match score and breakdown against a role.
   */
  calculateMatchScore: async (studentSkills, roleName) => {
    await delay(1200);
    const reqs = ROLE_REQUIREMENTS[roleName];
    if (!reqs) return null;

    let totalMatch = 0;
    let maxMatch = 0;
    let strong = [];
    let improve = [];
    let missing = [];
    let gapList = [];

    const assessCategory = (reqList, studentList, categoryWeight) => {
      let categoryMatch = 0;
      let categoryMax = 0;

      reqList.forEach(req => {
        const studentSkill = studentList.find(s => s.name === req.name);
        const current = studentSkill ? studentSkill.proficiency : 0;
        
        // Add to max possible
        categoryMax += req.target;
        // Add capped current to match
        categoryMatch += Math.min(current, req.target);

        // Classify
        if (current >= req.target - 5) {
          strong.push(req.name);
        } else if (current >= req.target / 2) {
          improve.push(req.name);
          gapList.push({
            skill: req.name,
            current,
            target: req.target,
            gap: req.target - current,
            priority: (req.target - current) > 30 ? 'High' : 'Medium',
            estimatedTime: Math.ceil((req.target - current) / 10) + ' weeks'
          });
        } else {
          missing.push(req.name);
          gapList.push({
            skill: req.name,
            current,
            target: req.target,
            gap: req.target - current,
            priority: 'High',
            estimatedTime: Math.ceil((req.target - current) / 10 + 2) + ' weeks'
          });
        }
      });

      return categoryMax > 0 ? (categoryMatch / categoryMax) * 100 : 100;
    };

    const techScore = assessCategory(reqs.technical, studentSkills, 0.6);
    const toolScore = assessCategory(reqs.tools, studentSkills, 0.4);
    
    const overallScore = Math.round((techScore * 0.6) + (toolScore * 0.4));
    
    // Deterministic mock values for Projects and Certifications based on role hash
    const roleHash = roleName.length;
    const projectScore = Math.min(100, 70 + (roleHash * 2));
    const certScore = Math.min(100, 50 + (roleHash * 3));

    return {
      matchScore: overallScore,
      strong,
      improve,
      missing,
      gaps: gapList.sort((a, b) => b.gap - a.gap),
      breakdown: {
        Technical: Math.round(techScore),
        Tools: Math.round(toolScore),
        Projects: projectScore,
        Certifications: certScore
      }
    };
  },

  /**
   * Generates a deterministic text explanation for the match.
   */
  generateMatchExplanation: (roleName, matchData) => {
    if (!matchData) return "";
    
    let strongestAdvantage = "your general technical foundation";
    if (matchData.strong.length > 0) {
      strongestAdvantage = matchData.strong[0];
    }

    let biggestGap = "some core role requirements";
    if (matchData.missing.length > 0) {
      biggestGap = matchData.missing[0] + " deployment & usage";
    } else if (matchData.improve.length > 0) {
      biggestGap = "improving your " + matchData.improve[0] + " proficiency";
    }

    return `Your strongest advantage is ${strongestAdvantage}. Your biggest gap is ${biggestGap}.`;
  },

  /**
   * Calculates specific gap for a single skill.
   */
  calculateSkillGap: (currentLevel, targetLevel) => {
    const gap = targetLevel - currentLevel;
    if (gap <= 0) return { gap: 0, priority: 'Low', estimatedTime: '0 weeks' };
    return {
      gap,
      priority: gap > 30 ? 'High' : gap > 15 ? 'Medium' : 'Low',
      estimatedTime: Math.ceil(gap / 10) + ' weeks'
    };
  },

  /**
   * Returns skill recommendations based on missing/improve lists.
   */
  getSkillRecommendations: async (matchData) => {
    await delay(500);
    if (!matchData) return [];
    
    // Combine missing and improve, taking top 3
    const priority = [...matchData.gaps].sort((a, b) => b.gap - a.gap).slice(0, 3);
    
    return priority.map(p => ({
      skill: p.skill,
      action: "Take recommended course",
      reason: `Required to close ${p.gap}% gap for target role`
    }));
  },

  /**
   * Generates a deterministic roadmap.
   */
  generateRoadmap: async (studentSkills, targetRole, customization = {}) => {
    // Dynamic import to avoid circular dependency issues if any
    const { ROLE_ROADMAPS, DEFAULT_ROADMAP } = await import('@/data/roadmapData');
    
    // Simulate generation time
    await delay(2500); 

    const template = ROLE_ROADMAPS[targetRole] || DEFAULT_ROADMAP;
    
    // Adjust duration based on customization
    let duration = template.baseDurationWeeks;
    if (customization.learningTime === '30 min/day') duration = Math.ceil(duration * 1.5);
    else if (customization.learningTime === '2 hours/day') duration = Math.ceil(duration * 0.8);
    else if (customization.learningTime === '3+ hours/day') duration = Math.ceil(duration * 0.6);

    // Deep copy to prevent mutating the template
    const roadmap = JSON.parse(JSON.stringify(template));
    
    // Calculate initial stage states based on some mock logic (e.g. stage 1 done, stage 2 in progress)
    roadmap.stages = roadmap.stages.map((stage, index) => {
      let status = "upcoming";
      if (index === 0) status = "completed";
      else if (index === 1) status = "in_progress";
      
      return {
        ...stage,
        status,
        progress: index === 0 ? 100 : (index === 1 ? 40 : 0)
      };
    });

    return {
      role: targetRole,
      durationWeeks: duration,
      stages: roadmap.stages,
      recommendedProjects: roadmap.recommendedProjects,
      industryChallenge: roadmap.industryChallenge,
      insights: {
        reasoning: `Your roadmap is prioritizing ${targetRole === 'AI Engineer' ? 'Cloud and Deep Learning' : 'core missing skills'} because these have the largest gaps for your selected ${targetRole} role.`,
        impact: `Completing the next 3 tasks can increase your role readiness from 82% to approximately 88%.`
      }
    };
  },

  /**
   * Deterministically calculates match score against a specific internship's required skills.
   */
  calculateInternshipMatch: (studentSkills, internshipReqs) => {
    if (!internshipReqs || internshipReqs.length === 0) return 100;
    
    let totalMatch = 0;
    let maxMatch = 0;
    let strong = [];
    let improve = [];
    let missing = [];

    internshipReqs.forEach(req => {
      const studentSkill = studentSkills.find(s => s.name === req.name);
      const current = studentSkill ? studentSkill.proficiency : 0;
      
      maxMatch += req.target;
      totalMatch += Math.min(current, req.target);

      if (current >= req.target - 5) {
        strong.push(req.name);
      } else if (current >= req.target / 2) {
        improve.push(req.name);
      } else {
        missing.push(req.name);
      }
    });

    const matchPercent = maxMatch > 0 ? Math.round((totalMatch / maxMatch) * 100) : 100;
    
    return {
      matchScore: matchPercent,
      strong,
      improve,
      missing,
      breakdown: {
        Technical: Math.min(100, matchPercent + 3),
        Projects: Math.min(100, matchPercent - 3),
        Tools: Math.min(100, matchPercent - 10 > 0 ? matchPercent - 10 : matchPercent),
        Overall: matchPercent
      }
    };
  },

  identifyInternshipSkillGaps: (studentSkills, internshipReqs) => {
    const gaps = [];
    internshipReqs.forEach(req => {
      const studentSkill = studentSkills.find(s => s.name === req.name);
      const current = studentSkill ? studentSkill.proficiency : 0;
      if (current < req.target) {
        gaps.push({
          skill: req.name,
          current,
          target: req.target,
          gap: req.target - current,
          priority: (req.target - current) > 20 ? 'High' : 'Medium'
        });
      }
    });
    return gaps.sort((a, b) => b.gap - a.gap);
  },

  generateInternshipMatchExplanation: (matchData) => {
    if (!matchData) return "";
    
    let str = "You're a strong match because you already have ";
    if (matchData.strong.length > 0) {
      str += matchData.strong.join(", ") + " experience. ";
    } else {
      str += "a solid foundational background. ";
    }
    
    if (matchData.missing.length > 0 || matchData.improve.length > 0) {
      const g = [...matchData.missing, ...matchData.improve][0];
      str += `Spend the next 1–2 weeks strengthening ${g} to perfectly align with this role.`;
    } else {
      str += "You are ready to apply.";
    }
    return str;
  },

  /**
   * Prototype Verification Logic
   * 
   * Evidence Types: 'Assessment', 'Project', 'Industry Challenge', 'Certification', 'Course'
   * 
   * Rules:
   * Assessment + Project + Industry Challenge -> Verified
   * Assessment + Project -> Partially Verified
   * Certification alone -> Partially Verified
   * No Evidence -> Unverified
   */
  calculateSkillVerification: (evidenceArray) => {
    if (!evidenceArray || evidenceArray.length === 0) return 'Unverified';
    
    const types = evidenceArray.map(e => e.type);
    const hasAssessment = types.includes('Assessment');
    const hasProject = types.includes('Project');
    const hasChallenge = types.includes('Industry Challenge');
    const hasCert = types.includes('Certification');

    if (hasAssessment && hasProject && hasChallenge) return 'Verified';
    if ((hasAssessment && hasProject) || hasChallenge || hasCert) return 'Partially Verified';
    return 'Unverified';
  },

  getSkillEvidence: (skillName, studentData, completedChallenges = []) => {
    // Look up base skill
    const skill = studentData.detailedSkills.find(s => s.name === skillName);
    if (!skill) return [];

    let evidence = skill.evidenceList || [];

    // Simulate appending evidence from completed challenges in localStorage
    const matchingChallenges = completedChallenges.filter(c => c.skills.includes(skillName));
    matchingChallenges.forEach(c => {
      // Avoid duplicates
      if (!evidence.find(e => e.title === c.title)) {
        evidence.push({
          type: 'Industry Challenge',
          title: c.title,
          date: c.completedDate || new Date().toISOString().split('T')[0],
          status: 'Simulated Verification'
        });
      }
    });

    return evidence.sort((a, b) => new Date(a.date) - new Date(b.date));
  },

  getVerificationInsights: (skillsWithVerification) => {
    const verified = skillsWithVerification.filter(s => s.verificationStatus === 'Verified').map(s => s.name);
    const unverified = skillsWithVerification.filter(s => s.verificationStatus === 'Unverified').map(s => s.name);
    
    return {
      strongest: verified.slice(0, 3),
      needsEvidence: unverified.slice(0, 2),
      recommendation: unverified.length > 0 
        ? `Complete an industry challenge to strengthen your ${unverified[0]} evidence.`
        : `Your profile is highly verified. Keep participating in challenges to maintain relevance.`
    };
  },

  /**
   * ACADEMIA ANALYTICS
   */
  analyzeInstitutionalSkillGaps: (heatmapData) => {
    // Calculates top gaps based on demo data.
    // In a real system, this would aggregate thousands of student profiles.
    const insights = [
      { skill: 'Cloud Computing', current: 46, target: 72, gap: 26, priority: 'HIGH' },
      { skill: 'DevOps / Docker', current: 35, target: 70, gap: 35, priority: 'HIGH' },
      { skill: 'Cybersecurity', current: 48, target: 80, gap: 32, priority: 'HIGH' },
      { skill: 'System Design', current: 55, target: 75, gap: 20, priority: 'MEDIUM' },
      { skill: 'Machine Learning', current: 65, target: 88, gap: 23, priority: 'MEDIUM' }
    ];
    return insights.sort((a, b) => b.gap - a.gap);
  },

  analyzeIndustryDemand: (demandData) => {
    // Finds skills where industry demand heavily outweighs student proficiency
    const critical = demandData.filter(d => (d.industryDemand - d.studentProficiency) > 30);
    return critical.map(c => c.skill);
  },

  recommendAcademicTraining: (gapData) => {
    const highestGap = gapData[0];
    return {
      title: `${highestGap.skill} Bootcamp`,
      reason: `${highestGap.skill} has a ${highestGap.gap}-point gap against current industry targets. Prioritize this for departments with low readiness.`,
      targetSkills: [highestGap.skill, 'Linux', 'Networking'],
      duration: '4 Weeks',
      expectedOutcome: `Increase ${highestGap.skill} readiness by 20% across targeted departments.`
    };
  },

  /**
   * INDUSTRY ANALYTICS & MATCHING
   */
  calculateTalentMatch: (studentSkills, roleRequirements) => {
    // Calculates a deterministic match score between a student's skills and a role's requirements
    const required = roleRequirements.requiredSkills || [];
    const preferred = roleRequirements.preferredSkills || [];
    
    let score = 0;
    const maxScore = (required.length * 2) + preferred.length;
    
    const strong = [];
    const partial = [];
    const missing = [];

    required.forEach(req => {
      // Find the skill in student's detailed skills
      const studentSkill = studentSkills.find(s => s.name.toLowerCase() === req.toLowerCase());
      
      if (studentSkill && studentSkill.proficiency >= 70) {
        score += 2;
        strong.push(req);
      } else if (studentSkill && studentSkill.proficiency >= 40) {
        score += 1;
        partial.push(req);
      } else {
        missing.push(req);
      }
    });

    preferred.forEach(pref => {
      const studentSkill = studentSkills.find(s => s.name.toLowerCase() === pref.toLowerCase());
      if (studentSkill && studentSkill.proficiency >= 60) {
        score += 1;
      }
    });

    const matchPercentage = Math.round((score / maxScore) * 100);
    
    return {
      matchPercentage: Math.min(matchPercentage, 100),
      strong,
      partial,
      missing
    };
  },

  rankCandidates: (students, roleRequirements) => {
    // Ranks an array of students based on their match to a specific role
    const ranked = students.map(student => {
      // In a real app we'd map student.detailedSkills, here we mock it based on topSkills string
      // Just returning a dummy mapped skill structure if detailedSkills is missing
      const mockDetailedSkills = student.detailedSkills || student.topSkills.split('•').map(s => ({
        name: s.trim(), proficiency: 85, verificationStatus: 'Verified'
      }));
      
      const match = aiService.calculateTalentMatch(mockDetailedSkills, roleRequirements);
      
      return {
        ...student,
        matchDetails: match,
        matchScore: match.matchPercentage
      };
    });
    
    return ranked.sort((a, b) => b.matchScore - a.matchScore);
  },

  generateIndustryInsights: (shortlistedCandidates, requirements) => {
    // Generates deterministic insights for the industry dashboard based on current state
    return [
      {
        type: "Talent Insight",
        message: "Students with Python + SQL + Machine Learning currently have the strongest alignment with your AI Engineer requirement."
      },
      {
        type: "Skill Gap Insight",
        message: "Docker is the most common missing skill among your top candidate matches."
      }
    ];
  }
};
