-- SkillBridge AI Database Schema

-- Enums
CREATE TYPE user_role AS ENUM ('student', 'academia', 'industry', 'admin');
CREATE TYPE application_status AS ENUM ('Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected');
CREATE TYPE verification_status AS ENUM ('Unverified', 'Claimed', 'Partially Verified', 'Verified');

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  company_name TEXT, -- for industry
  institution_name TEXT, -- for academia
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills Reference Dictionary
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL
);

-- Academic Records
CREATE TABLE academic_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  department TEXT,
  degree TEXT,
  graduation_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Skills (Skill DNA)
CREATE TABLE student_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  proficiency INTEGER DEFAULT 0 CHECK (proficiency >= 0 AND proficiency <= 100),
  verification_status verification_status DEFAULT 'Claimed',
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, skill_id)
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  github_url TEXT,
  demo_url TEXT,
  technologies JSONB, -- array of strings
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certifications
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE,
  credential_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skill Evidence (Mapping evidence to skills)
CREATE TABLE skill_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_skill_id UUID REFERENCES student_skills(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL, -- 'Project', 'Certification', 'Challenge'
  reference_id UUID, -- ID to the specific project/challenge/cert
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Internships
CREATE TABLE internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  work_mode TEXT,
  duration TEXT,
  required_skills JSONB, -- { "React": 80, "Node": 70 }
  status TEXT DEFAULT 'Open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  internship_id UUID REFERENCES internships(id) ON DELETE CASCADE,
  status application_status DEFAULT 'Applied',
  match_score INTEGER DEFAULT 0,
  resume_url TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, internship_id)
);

-- Industry Challenges
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  domain TEXT,
  difficulty TEXT,
  duration TEXT,
  description TEXT,
  required_skills JSONB, -- array of skill names
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge Submissions
CREATE TABLE challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_title TEXT,
  github_url TEXT,
  demo_url TEXT,
  technologies JSONB,
  status TEXT DEFAULT 'Submitted',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, student_id)
);

-- Industry Feedback
CREATE TABLE industry_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  importance TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Industry Requirements (For Talent Discovery Demand)
CREATE TABLE industry_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  skills JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Academic Training Programs
CREATE TABLE training_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academia_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  skills JSONB,
  departments JSONB,
  duration TEXT,
  participants INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Planned',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resumes
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT,
  status TEXT DEFAULT 'Uploaded',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resume Analysis
CREATE TABLE resume_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  overall_score INTEGER,
  skills_detected JSONB,
  technical_skills JSONB,
  soft_skills JSONB,
  projects_identified JSONB,
  certifications_identified JSONB,
  strengths JSONB,
  missing_skills JSONB,
  recommendations JSONB,
  target_role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Examples - to be expanded based on exact business logic)

-- Profiles: Users can read all profiles (to see names/companies), but only update their own.
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Skills: Viewable by everyone.
CREATE POLICY "Skills viewable by everyone" ON skills FOR SELECT USING (true);

-- Internships: Viewable by everyone, created/updated by industry owner.
CREATE POLICY "Internships viewable by everyone" ON internships FOR SELECT USING (true);
CREATE POLICY "Industry can insert internships" ON internships FOR INSERT WITH CHECK (auth.uid() = industry_id);
CREATE POLICY "Industry can update own internships" ON internships FOR UPDATE USING (auth.uid() = industry_id);

-- Applications: Students can view/insert their own. Industry can view applications for their internships.
CREATE POLICY "Students manage own applications" ON applications FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Industry can view applications to their internships" ON applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM internships WHERE id = internship_id AND industry_id = auth.uid())
);
CREATE POLICY "Industry can update applications to their internships" ON applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM internships WHERE id = internship_id AND industry_id = auth.uid())
);

-- Resumes: Students can only view and manage their own resumes.
CREATE POLICY "Students manage own resumes" ON resumes FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Students manage own resume analysis" ON resume_analysis FOR ALL USING (
  EXISTS (SELECT 1 FROM resumes WHERE id = resume_id AND student_id = auth.uid())
);

-- Storage bucket for resumes (assuming a bucket named 'resumes' exists)
-- CREATE POLICY "Users can upload own resumes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can read own resumes" ON storage.objects FOR SELECT USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- (Note: Additional granular RLS policies should be added for each table following the same pattern)
