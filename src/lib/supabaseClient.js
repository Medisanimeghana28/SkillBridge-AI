import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const buildFallbackClient = () => ({
  auth: {
    signUp: async () => ({ data: { user: null }, error: new Error('Supabase is not configured yet.') }),
    signInWithPassword: async () => ({ data: { user: null }, error: new Error('Supabase is not configured yet.') }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => ({
    select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
    insert: async () => ({ error: null }),
    update: async () => ({ error: null }),
    delete: async () => ({ error: null })
  })
});

export const supabase = supabaseUrl && supabasePublishableKey
  ? createClient(supabaseUrl, supabasePublishableKey)
  : buildFallbackClient();
