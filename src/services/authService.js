import { supabase } from '@/lib/supabaseClient';

export const authService = {
  async register({ email, password, role, name, companyName, institutionName }) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: data.user.id,
          role,
          email,
          full_name: name,
          company_name: companyName || null,
          institution_name: institutionName || null
        }
      ]);
      if (profileError) throw profileError;
    }

    return { ...data, role };
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { ...user, profile: profile || { role: 'student' } };
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
