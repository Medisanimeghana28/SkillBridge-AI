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

-- NOTE: profiles.id intentionally has no FK to auth.users: dataset-imported
-- profiles exist without auth accounts, and are linked on user signup.
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  company_name TEXT,
  institution_name TEXT,
  has_completed_onboarding BOOLEAN NOT NULL DEFAULT FALSE,
  intent_role TEXT,
  target_role TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
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

CREATE TABLE IF NOT EXISTS roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  duration_weeks INTEGER,
  stages JSONB NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'Active',
  import_batch_id UUID REFERENCES import_batches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  institution TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Application events -> notifications (both directions).
CREATE OR REPLACE FUNCTION public.notify_application_events()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  job_title TEXT;
  industry_owner UUID;
BEGIN
  SELECT title, industry_id INTO job_title, industry_owner
  FROM public.internships
  WHERE id = COALESCE(NEW.internship_id, OLD.internship_id);

  IF TG_OP = 'INSERT' THEN
    -- New application -> notify the industry poster.
    IF industry_owner IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, title, body, link)
      VALUES (
        industry_owner,
        'new_application',
        'New application received',
        'A candidate applied for "' || COALESCE(job_title, 'your internship') || '".',
        '/industry/jobs'
      );
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    -- Status change -> notify the student.
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      NEW.student_id,
      'application_status',
      'Application update: ' || NEW.status,
      'Your application for "' || COALESCE(job_title, 'an internship') || '" is now ' || NEW.status || '.',
      '/student/applications'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_application_events ON public.applications;
CREATE TRIGGER trg_notify_application_events
  AFTER INSERT OR UPDATE OF status ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.notify_application_events();

-- Challenge submission events -> notify the industry poster.
CREATE OR REPLACE FUNCTION public.notify_submission_events()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ch_title TEXT;
  industry_owner UUID;
BEGIN
  SELECT title, industry_id INTO ch_title, industry_owner
  FROM public.challenges
  WHERE id = NEW.challenge_id;

  IF TG_OP = 'INSERT' AND industry_owner IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      industry_owner,
      'new_submission',
      'New challenge submission',
      'A student submitted "' || COALESCE(NEW.project_title, 'a project') || '" for "' || COALESCE(ch_title, 'your challenge') || '".',
      '/industry/challenges'
    );
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      NEW.student_id,
      'submission_status',
      'Submission update: ' || NEW.status,
      'Your submission for "' || COALESCE(ch_title, 'a challenge') || '" is now ' || NEW.status || '.',
      '/student/challenges'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_submission_events ON public.challenge_submissions;
CREATE TRIGGER trg_notify_submission_events
  AFTER INSERT OR UPDATE OF status ON public.challenge_submissions
  FOR EACH ROW EXECUTE FUNCTION public.notify_submission_events();

CREATE TABLE IF NOT EXISTS profile_share_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Private bucket for student resume files. First path segment must be the
-- owner's auth user id (enforced by the storage RLS policies below).
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS resumes_insert_own ON storage.objects;
DROP POLICY IF EXISTS resumes_select_own ON storage.objects;
DROP POLICY IF EXISTS resumes_update_own ON storage.objects;
DROP POLICY IF EXISTS resumes_delete_own ON storage.objects;

CREATE POLICY resumes_insert_own ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY resumes_select_own ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY resumes_update_own ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY resumes_delete_own ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS policies live in rls_policies.sql (least-privilege, see that file).
