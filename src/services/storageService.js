export const KEYS = {
  USERS: 'sb_users',
  SESSION: 'sb_session',
  INTERNSHIPS: 'sb_created_internships',
  APPLICATIONS: 'sb_applications',
  CHALLENGES: 'sb_industry_challenges',
  COMPLETED_CHALLENGES: 'sb_completed_challenges',
  SHORTLIST: 'sb_industry_shortlist',
  TRAINING: 'sb_training_programs',
  FEEDBACK: 'sb_feedback',
  STUDENT_DATA: 'sb_student_data'
};

const get = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const set = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const emptyStudent = {
  id: '',
  name: '',
  role: 'student',
  department: '',
  year: '',
  institution: '',
  targetRole: '',
  skills: [],
  projects: [],
  certifications: []
};

export const storageService = {
  initMockData: () => {
    if (!localStorage.getItem(KEYS.INTERNSHIPS)) set(KEYS.INTERNSHIPS, []);
    if (!localStorage.getItem(KEYS.CHALLENGES)) set(KEYS.CHALLENGES, []);
    if (!localStorage.getItem(KEYS.STUDENT_DATA)) set(KEYS.STUDENT_DATA, emptyStudent);
    if (!localStorage.getItem(KEYS.APPLICATIONS)) set(KEYS.APPLICATIONS, []);
    if (!localStorage.getItem(KEYS.COMPLETED_CHALLENGES)) set(KEYS.COMPLETED_CHALLENGES, []);
    if (!localStorage.getItem(KEYS.SHORTLIST)) set(KEYS.SHORTLIST, []);
    if (!localStorage.getItem(KEYS.TRAINING)) set(KEYS.TRAINING, []);
    if (!localStorage.getItem(KEYS.FEEDBACK)) set(KEYS.FEEDBACK, []);
  },

  resetDemoData: () => {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
    storageService.initMockData();
    window.location.reload();
  },

  getCurrentStudent: () => get(KEYS.STUDENT_DATA, emptyStudent),

  updateCurrentStudent: (updatedData) => {
    set(KEYS.STUDENT_DATA, updatedData);
  },

  getInternships: () => get(KEYS.INTERNSHIPS, []),

  saveInternship: (internship) => {
    const existing = storageService.getInternships();
    set(KEYS.INTERNSHIPS, [internship, ...existing]);
  },

  getApplications: () => get(KEYS.APPLICATIONS, []),

  saveApplication: (application) => {
    const existing = storageService.getApplications();
    if (existing.find((a) => a.internshipId === application.internshipId)) return false;
    set(KEYS.APPLICATIONS, [application, ...existing]);
    return true;
  },

  updateApplicationStatus: (applicationId, status) => {
    const apps = storageService.getApplications();
    const updated = apps.map((a) => (a.id === applicationId ? { ...a, status } : a));
    set(KEYS.APPLICATIONS, updated);
  },

  getChallenges: () => get(KEYS.CHALLENGES, []),

  saveChallenge: (challenge) => {
    const existing = storageService.getChallenges();
    set(KEYS.CHALLENGES, [challenge, ...existing]);
  },

  getCompletedChallenges: () => get(KEYS.COMPLETED_CHALLENGES, []),

  completeChallenge: (challengeId, projectData) => {
    const existing = storageService.getCompletedChallenges();
    if (!existing.find((c) => c.challengeId === challengeId)) {
      set(KEYS.COMPLETED_CHALLENGES, [...existing, { challengeId, ...projectData, completedAt: new Date().toISOString() }]);
    }
  },

  getFeedback: () => get(KEYS.FEEDBACK, []),

  saveFeedback: (feedback) => {
    const existing = storageService.getFeedback();
    set(KEYS.FEEDBACK, [feedback, ...existing]);
  },

  getTrainingPrograms: () => get(KEYS.TRAINING, []),

  saveTrainingProgram: (program) => {
    const existing = storageService.getTrainingPrograms();
    set(KEYS.TRAINING, [program, ...existing]);
  }
};
