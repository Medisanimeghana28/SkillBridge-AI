-- SkillBridge AI Database Schema (Updated with Dataset Tracking)

-- Enums
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'academia', 'industry', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('Unverified', 'Claimed', 'Partially Verified', 'Verified');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Dataset Tracking Tables
CREATE TABLE IF NOT EXISTS dataset_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  source_type TEXT,
  license TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_source_id UUID REFERENCES dataset_sources(id) ON DELETE SET NULL,
  imported_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'Pending', -- Pending, Completed, Failed
  records_processed INTEGER DEFAULT 0,
  records_imported INTEGER DEFAULT 0,
  records_skipped INTEGER DEFAULT 0,
  invalid_records INTEGER DEFAULT 0,
  import_date TIMESTAMPTZ DEFAULT NOW(),
  mapping_config JSONB
);

-- (Adding import_batch_id to main tables if they don't have it)
-- Note: In a real migration we'd use ALTER TABLE IF NOT EXISTS, but this schema acts as the master reference.

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  company_name TEXT,
  institution_name TEXT,
  import_batch_id UUID REFERENCES import_batches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  canonical_id UUID REFERENCES skills(id), -- For normalization (points to the main skill)
  import_batch_id UUID REFERENCES import_batches(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS student_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  proficiency INTEGER DEFAULT 0 CHECK (proficiency >= 0 AND proficiency <= 100),
  verification_status verification_status DEFAULT 'Claimed',
  source TEXT,
  import_batch_id UUID REFERENCES import_batches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, skill_id)
);

CREATE TABLE IF NOT EXISTS academic_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  department TEXT,
  degree TEXT,
  graduation_year INTEGER,
  gpa NUMERIC,
  employability_score NUMERIC, -- Kept separate from AI readiness score
  import_batch_id UUID REFERENCES import_batches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  github_url TEXT,
  demo_url TEXT,
  technologies JSONB,
  import_batch_id UUID REFERENCES import_batches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE,
  credential_url TEXT,
  import_batch_id UUID REFERENCES import_batches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  work_mode TEXT,
  duration TEXT,
  required_skills JSONB, 
  status TEXT DEFAULT 'Open',
  import_batch_id UUID REFERENCES import_batches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
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

CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  domain TEXT,
  difficulty TEXT,
  duration TEXT,
  description TEXT,
  required_skills JSONB,
  status TEXT DEFAULT 'Active',
  import_batch_id UUID REFERENCES import_batches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge_submissions (
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

CREATE TABLE IF NOT EXISTS industry_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  skills JSONB,
  import_batch_id UUID REFERENCES import_batches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT,
  status TEXT DEFAULT 'Uploaded',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resume_analysis (
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

-- Note: RLS Policies should be applied here following the previous pattern.
