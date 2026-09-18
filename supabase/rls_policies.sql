-- SkillBridge AI: least-privilege RLS policies.
-- Replaces the permissive `all_access` policies. Run after schema.sql.
-- Assumes the authenticated role; anon has no table access
-- (GoTrue handles signup/login/confirmation, not PostgREST).

-- Helper: true when the current user is an admin.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ---------------------------------------------------------------- profiles
DROP POLICY IF EXISTS all_access ON public.profiles;

-- Everyone signed in can browse profiles (talent directory,
-- internship/challenge authors, academia rosters).
DROP POLICY IF EXISTS profiles_select_authenticated ON public.profiles;
CREATE POLICY profiles_select_authenticated
  ON public.profiles FOR SELECT TO authenticated USING (true);

-- Users create their own profile at signup/first login.
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Users update only their own profile.
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Admins can manage any profile.
DROP POLICY IF EXISTS profiles_admin_all ON public.profiles;
CREATE POLICY profiles_admin_all
  ON public.profiles FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------- student-owned tables
-- student_skills, academic_records, projects, certifications, resumes:
-- readable by any signed-in user (talent browsing), writable only by owner.

DROP POLICY IF EXISTS all_access ON public.student_skills;
DROP POLICY IF EXISTS student_skills_select_authenticated ON public.student_skills;
CREATE POLICY student_skills_select_authenticated
  ON public.student_skills FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS student_skills_write_own ON public.student_skills;
CREATE POLICY student_skills_write_own
  ON public.student_skills FOR ALL TO authenticated
  USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS all_access ON public.academic_records;
DROP POLICY IF EXISTS academic_records_select_authenticated ON public.academic_records;
CREATE POLICY academic_records_select_authenticated
  ON public.academic_records FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS academic_records_write_own ON public.academic_records;
CREATE POLICY academic_records_write_own
  ON public.academic_records FOR ALL TO authenticated
  USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS all_access ON public.projects;
DROP POLICY IF EXISTS projects_select_authenticated ON public.projects;
CREATE POLICY projects_select_authenticated
  ON public.projects FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS projects_write_own ON public.projects;
CREATE POLICY projects_write_own
  ON public.projects FOR ALL TO authenticated
  USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS all_access ON public.certifications;
DROP POLICY IF EXISTS certifications_select_authenticated ON public.certifications;
CREATE POLICY certifications_select_authenticated
  ON public.certifications FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS certifications_write_own ON public.certifications;
CREATE POLICY certifications_write_own
  ON public.certifications FOR ALL TO authenticated
  USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS all_access ON public.resumes;
DROP POLICY IF EXISTS resumes_select_own ON public.resumes;
CREATE POLICY resumes_select_own
  ON public.resumes FOR SELECT TO authenticated USING (student_id = auth.uid());
DROP POLICY IF EXISTS resumes_write_own ON public.resumes;
CREATE POLICY resumes_write_own
  ON public.resumes FOR ALL TO authenticated
  USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS all_access ON public.resume_analysis;
-- Analysis rows inherit access from the parent resume.
DROP POLICY IF EXISTS resume_analysis_select_own ON public.resume_analysis;
CREATE POLICY resume_analysis_select_own
  ON public.resume_analysis FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.resumes r
    WHERE r.id = resume_analysis.resume_id AND r.student_id = auth.uid()
  ));
DROP POLICY IF EXISTS resume_analysis_write_own ON public.resume_analysis;
CREATE POLICY resume_analysis_write_own
  ON public.resume_analysis FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.resumes r
    WHERE r.id = resume_analysis.resume_id AND r.student_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.resumes r
    WHERE r.id = resume_analysis.resume_id AND r.student_id = auth.uid()
  ));

-- -------------------------------------- industry-published catalog tables
-- internships, challenges, industry_requirements:
-- readable by any signed-in user; writable by the owning industry profile
-- (industry_id = auth.uid()) or an admin.

DROP POLICY IF EXISTS all_access ON public.internships;
DROP POLICY IF EXISTS internships_select_authenticated ON public.internships;
CREATE POLICY internships_select_authenticated
  ON public.internships FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS internships_write_owner ON public.internships;
CREATE POLICY internships_write_owner
  ON public.internships FOR ALL TO authenticated
  USING (industry_id = auth.uid() OR public.is_admin())
  WITH CHECK (industry_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS all_access ON public.challenges;
DROP POLICY IF EXISTS challenges_select_authenticated ON public.challenges;
CREATE POLICY challenges_select_authenticated
  ON public.challenges FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS challenges_write_owner ON public.challenges;
CREATE POLICY challenges_write_owner
  ON public.challenges FOR ALL TO authenticated
  USING (industry_id = auth.uid() OR public.is_admin())
  WITH CHECK (industry_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS all_access ON public.industry_requirements;
DROP POLICY IF EXISTS industry_requirements_select_authenticated ON public.industry_requirements;
CREATE POLICY industry_requirements_select_authenticated
  ON public.industry_requirements FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS industry_requirements_write_owner ON public.industry_requirements;
CREATE POLICY industry_requirements_write_owner
  ON public.industry_requirements FOR ALL TO authenticated
  USING (industry_id = auth.uid() OR public.is_admin())
  WITH CHECK (industry_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS all_access ON public.skills;
DROP POLICY IF EXISTS skills_select_authenticated ON public.skills;
CREATE POLICY skills_select_authenticated
  ON public.skills FOR SELECT TO authenticated USING (true);
-- Skill dictionary grows via onboarding (find-or-create); allow inserts,
-- but only admins may update/delete canonical mappings.
DROP POLICY IF EXISTS skills_insert_authenticated ON public.skills;
CREATE POLICY skills_insert_authenticated
  ON public.skills FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS skills_admin_write ON public.skills;
CREATE POLICY skills_admin_write
  ON public.skills FOR UPDATE TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS skills_admin_delete ON public.skills;
CREATE POLICY skills_admin_delete
  ON public.skills FOR DELETE TO authenticated USING (public.is_admin());

-- ------------------------------------------------------------ applications
DROP POLICY IF EXISTS all_access ON public.applications;

-- Students see their own; industry sees applications to its internships.
DROP POLICY IF EXISTS applications_select_scoped ON public.applications;
CREATE POLICY applications_select_scoped
  ON public.applications FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.internships i
      WHERE i.id = applications.internship_id AND i.industry_id = auth.uid()
    )
  );

-- Students apply as themselves.
DROP POLICY IF EXISTS applications_insert_own ON public.applications;
CREATE POLICY applications_insert_own
  ON public.applications FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

-- Students manage their own; industry updates status on its postings.
DROP POLICY IF EXISTS applications_update_scoped ON public.applications;
CREATE POLICY applications_update_scoped
  ON public.applications FOR UPDATE TO authenticated
  USING (
    student_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.internships i
      WHERE i.id = applications.internship_id AND i.industry_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS applications_delete_own ON public.applications;
CREATE POLICY applications_delete_own
  ON public.applications FOR DELETE TO authenticated
  USING (student_id = auth.uid() OR public.is_admin());

-- ----------------------------------------------------- challenge_submissions
DROP POLICY IF EXISTS all_access ON public.challenge_submissions;

DROP POLICY IF EXISTS challenge_submissions_select_scoped ON public.challenge_submissions;
CREATE POLICY challenge_submissions_select_scoped
  ON public.challenge_submissions FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.challenges c
      WHERE c.id = challenge_submissions.challenge_id AND c.industry_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS challenge_submissions_insert_own ON public.challenge_submissions;
CREATE POLICY challenge_submissions_insert_own
  ON public.challenge_submissions FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS challenge_submissions_update_scoped ON public.challenge_submissions;
CREATE POLICY challenge_submissions_update_scoped
  ON public.challenge_submissions FOR UPDATE TO authenticated
  USING (
    student_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.challenges c
      WHERE c.id = challenge_submissions.challenge_id AND c.industry_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS challenge_submissions_delete_own ON public.challenge_submissions;
CREATE POLICY challenge_submissions_delete_own
  ON public.challenge_submissions FOR DELETE TO authenticated
  USING (student_id = auth.uid() OR public.is_admin());

-- ------------------------------------------------------- feedback
DROP POLICY IF EXISTS all_access ON public.feedback;
DROP POLICY IF EXISTS feedback_select_authenticated ON public.feedback;
CREATE POLICY feedback_select_authenticated
  ON public.feedback FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS feedback_write_own ON public.feedback;
CREATE POLICY feedback_write_own
  ON public.feedback FOR ALL TO authenticated
  USING (industry_id = auth.uid()) WITH CHECK (industry_id = auth.uid());

-- ------------------------------------------------ notifications
DROP POLICY IF EXISTS all_access ON public.notifications;
DROP POLICY IF EXISTS notifications_select_own ON public.notifications;
CREATE POLICY notifications_select_own
  ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS notifications_write_own ON public.notifications;
CREATE POLICY notifications_write_own
  ON public.notifications FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------- share tokens
-- A share token opts a student profile into public read-only access.
DROP POLICY IF EXISTS all_access ON public.profile_share_tokens;
DROP POLICY IF EXISTS share_tokens_select_anon ON public.profile_share_tokens;
CREATE POLICY share_tokens_select_anon
  ON public.profile_share_tokens FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS share_tokens_read_own ON public.profile_share_tokens;
CREATE POLICY share_tokens_read_own
  ON public.profile_share_tokens FOR SELECT TO authenticated USING (student_id = auth.uid());
DROP POLICY IF EXISTS share_tokens_write_own ON public.profile_share_tokens;
CREATE POLICY share_tokens_write_own
  ON public.profile_share_tokens FOR ALL TO authenticated
  USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- Public (anon) read access for profiles that opted into sharing,
-- plus the passport-relevant child tables.
DROP POLICY IF EXISTS profiles_select_shared_anon ON public.profiles;
CREATE POLICY profiles_select_shared_anon
  ON public.profiles FOR SELECT TO anon
  USING (EXISTS (
    SELECT 1 FROM public.profile_share_tokens t WHERE t.student_id = profiles.id
  ));
DROP POLICY IF EXISTS student_skills_select_shared_anon ON public.student_skills;
CREATE POLICY student_skills_select_shared_anon
  ON public.student_skills FOR SELECT TO anon
  USING (EXISTS (
    SELECT 1 FROM public.profile_share_tokens t WHERE t.student_id = student_skills.student_id
  ));
DROP POLICY IF EXISTS academic_records_select_shared_anon ON public.academic_records;
CREATE POLICY academic_records_select_shared_anon
  ON public.academic_records FOR SELECT TO anon
  USING (EXISTS (
    SELECT 1 FROM public.profile_share_tokens t WHERE t.student_id = academic_records.student_id
  ));
DROP POLICY IF EXISTS projects_select_shared_anon ON public.projects;
CREATE POLICY projects_select_shared_anon
  ON public.projects FOR SELECT TO anon
  USING (EXISTS (
    SELECT 1 FROM public.profile_share_tokens t WHERE t.student_id = projects.student_id
  ));
DROP POLICY IF EXISTS certifications_select_shared_anon ON public.certifications;
CREATE POLICY certifications_select_shared_anon
  ON public.certifications FOR SELECT TO anon
  USING (EXISTS (
    SELECT 1 FROM public.profile_share_tokens t WHERE t.student_id = certifications.student_id
  ));

-- ------------------------------------------------------- roadmaps
DROP POLICY IF EXISTS all_access ON public.roadmaps;
DROP POLICY IF EXISTS roadmaps_select_own ON public.roadmaps;
CREATE POLICY roadmaps_select_own
  ON public.roadmaps FOR SELECT TO authenticated USING (student_id = auth.uid());
DROP POLICY IF EXISTS roadmaps_write_own ON public.roadmaps;
CREATE POLICY roadmaps_write_own
  ON public.roadmaps FOR ALL TO authenticated
  USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- ------------------------------------------- dataset tracking (admin write)
DROP POLICY IF EXISTS all_access ON public.dataset_sources;
DROP POLICY IF EXISTS dataset_sources_select_authenticated ON public.dataset_sources;
CREATE POLICY dataset_sources_select_authenticated
  ON public.dataset_sources FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS dataset_sources_write_admin ON public.dataset_sources;
CREATE POLICY dataset_sources_write_admin
  ON public.dataset_sources FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS all_access ON public.import_batches;
DROP POLICY IF EXISTS import_batches_select_authenticated ON public.import_batches;
CREATE POLICY import_batches_select_authenticated
  ON public.import_batches FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS import_batches_write_admin ON public.import_batches;
CREATE POLICY import_batches_write_admin
  ON public.import_batches FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
