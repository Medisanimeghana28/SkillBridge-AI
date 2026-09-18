import { supabase } from '@/lib/supabaseClient';

const VALID_ROLES = ['student', 'academia', 'industry', 'admin'];

function normalizeRole(role) {
  return VALID_ROLES.includes(role) ? role : 'student';
}

function toAppUser(authUser, profile) {
  return {
    id: authUser.id,
    email: authUser.email,
    role: profile?.role || authUser.user_metadata?.role || 'student',
    hasCompletedOnboarding: profile?.has_completed_onboarding ?? false,
    targetRole: profile?.target_role || authUser.user_metadata?.target_role || null,
    profile: profile || null,
  };
}

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Creates the public profile on first login when signup happened before
// email confirmation (no session existed at signup time to insert it).
async function ensureProfile(authUser) {
  const existing = await fetchProfile(authUser.id);
  if (existing) return existing;

  const meta = authUser.user_metadata || {};
  const payload = {
    id: authUser.id,
    email: authUser.email,
    role: normalizeRole(meta.role),
    full_name: meta.full_name || authUser.email?.split('@')[0] || 'New User',
    company_name: meta.company_name || null,
    institution_name: meta.institution_name || null,
    target_role: meta.target_role || null,
    has_completed_onboarding: false,
  };

  const { data, error } = await supabase
    .from('profiles')
    .insert([payload])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export const authService = {
  async register({ email, password, role, name, companyName, institutionName, targetRole }) {
    const cleanRole = normalizeRole(role);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: cleanRole,
          full_name: name,
          company_name: companyName || null,
          institution_name: institutionName || null,
          target_role: targetRole || null,
        },
      },
    });
    if (error) throw error;

    const authUser = data?.user;
    if (!authUser) throw new Error('Registration failed. Please try again.');

    // Email confirmation required -> no session yet; profile is created
    // on first login via ensureProfile().
    const needsEmailConfirmation = !data.session;

    if (data.session) {
      const profile = await ensureProfile(authUser);
      return { ...toAppUser(authUser, profile), needsEmailConfirmation: false };
    }

    return {
      id: authUser.id,
      email: authUser.email,
      role: cleanRole,
      hasCompletedOnboarding: false,
      targetRole: targetRole || null,
      profile: null,
      needsEmailConfirmation: true,
    };
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const authUser = data?.user;
    if (!authUser) throw new Error('Login failed. Please try again.');

    const profile = await ensureProfile(authUser);
    return toAppUser(authUser, profile);
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resendConfirmation(email) {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const profile = await ensureProfile(user);
    return toAppUser(user, profile);
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
