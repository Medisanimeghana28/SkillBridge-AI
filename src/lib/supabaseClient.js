import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const DEMO_USERS_KEY = 'skillbridge_demo_users';
const DEMO_SESSION_KEY = 'skillbridge_demo_session';

const defaultUsers = [
  {
    id: 'demo-student',
    email: 'student@demo.com',
    password: 'student123',
    role: 'student',
    full_name: 'Aarav Sharma',
    hasCompletedProfile: true
  },
  {
    id: 'demo-academia',
    email: 'academia@demo.com',
    password: 'academia123',
    role: 'academia',
    full_name: 'Academia Demo',
    hasCompletedProfile: true
  },
  {
    id: 'demo-industry',
    email: 'industry@demo.com',
    password: 'industry123',
    role: 'industry',
    full_name: 'Industry Demo',
    hasCompletedProfile: true
  },
  {
    id: 'demo-admin',
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin',
    full_name: 'Platform Admin',
    hasCompletedProfile: true
  }
];

const cloneDefaultUsers = () => defaultUsers.map((user) => ({ ...user }));
const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const normalizePassword = (value) => String(value || '').trim();

const getStoredUsers = () => {
  const fallbackUsers = cloneDefaultUsers();

  try {
    const stored = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || 'null');
    if (Array.isArray(stored) && stored.length > 0) {
      const merged = [...fallbackUsers];

      stored.forEach((entry) => {
        if (!entry?.email) return;
        const email = normalizeEmail(entry.email);
        const existingIndex = merged.findIndex((user) => normalizeEmail(user.email) === email);

        if (existingIndex >= 0) {
          merged[existingIndex] = { ...merged[existingIndex], ...entry, email };
        } else {
          merged.push({ ...entry, email });
        }
      });

      localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch {
    // Ignore malformed local storage and fall back to defaults.
  }

  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(fallbackUsers));
  return fallbackUsers;
};

const readTable = (table) => {
  const key = `skillbridge_demo_${table}`;
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

const writeTable = (table, rows) => {
  localStorage.setItem(`skillbridge_demo_${table}`, JSON.stringify(rows));
};

const normalizeProfile = (user) => ({
  id: user.id,
  role: user.role,
  email: user.email,
  full_name: user.full_name || user.name || user.email?.split('@')[0] || 'Demo User',
  company_name: user.company_name || null,
  institution_name: user.institution_name || null,
  hasCompletedProfile: user.hasCompletedProfile ?? true
});

const normalizeUser = (user) => ({
  ...user,
  profile: normalizeProfile(user)
});

const buildFallbackClient = () => {
  const getProfiles = () =>
    getStoredUsers().map((user) => ({
      id: user.id,
      role: user.role,
      email: user.email,
      full_name: user.full_name || user.name || user.email?.split('@')[0] || 'Demo User',
      company_name: user.company_name || null,
      institution_name: user.institution_name || null,
      hasCompletedProfile: user.hasCompletedProfile ?? true
    }));

  const from = (table) => {
    const rowsForTable = () => {
      if (table === 'profiles') {
        return getProfiles();
      }

      return readTable(table);
    };

    return {
      select: () => ({
        eq: (field, value) => ({
          single: async () => ({
            data: rowsForTable().find((row) => row[field] === value) || null,
            error: null
          }),
          maybeSingle: async () => ({
            data: rowsForTable().find((row) => row[field] === value) || null,
            error: null
          })
        }),
        order: () => ({ data: rowsForTable(), error: null })
      }),
      insert: async (records) => {
        const items = Array.isArray(records) ? records : [records];

        if (table === 'profiles') {
          const users = getStoredUsers();

          items.forEach((record) => {
            const existingUser = users.find((user) => user.email?.toLowerCase() === record.email?.toLowerCase());

            if (existingUser) {
              Object.assign(existingUser, record);
            } else {
              users.push({
                id: record.id || `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                email: record.email,
                password: record.password || 'demo123',
                role: record.role || 'student',
                full_name: record.full_name || record.name || record.email?.split('@')[0] || 'Demo User',
                company_name: record.company_name || null,
                institution_name: record.institution_name || null,
                hasCompletedProfile: record.hasCompletedProfile ?? true
              });
            }
          });

          localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
          return { data: items, error: null };
        }

        const currentRows = readTable(table);
        const nextRows = [...currentRows, ...items];
        writeTable(table, nextRows);
        return { data: nextRows, error: null };
      },
      update: async (updates) => ({
        eq: (field, value) => ({
          select: () => ({
            single: async () => {
              const rows = rowsForTable();
              const index = rows.findIndex((row) => row[field] === value);

              if (index === -1) {
                return { data: null, error: null };
              }

              const updatedRow = { ...rows[index], ...updates };

              if (table === 'profiles') {
                const users = getStoredUsers();
                const userIndex = users.findIndex((user) => user.id === value);
                if (userIndex >= 0) {
                  users[userIndex] = { ...users[userIndex], ...updatedRow };
                  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
                }
              }

              return { data: updatedRow, error: null };
            }
          })
        })
      }),
      delete: async () => ({ error: null })
    };
  };

  return {
    auth: {
      signUp: async ({ email, password, role = 'student', name, companyName, institutionName } = {}) => {
        const users = getStoredUsers();
        const lowerEmail = normalizeEmail(email);
        const foundUser = users.find((user) => normalizeEmail(user.email) === lowerEmail);

        if (foundUser) {
          return { data: { user: normalizeUser(foundUser) }, error: null };
        }

        const newUser = {
          id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          email: lowerEmail,
          password: normalizePassword(password) || 'demo123',
          role,
          full_name: name || email?.split('@')[0] || 'Demo User',
          company_name: companyName || null,
          institution_name: institutionName || null,
          hasCompletedProfile: true
        };

        users.push(newUser);
        localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));

        return { data: { user: normalizeUser(newUser) }, error: null };
      },
      signInWithPassword: async ({ email, password } = {}) => {
        const users = getStoredUsers();
        const lowerEmail = normalizeEmail(email);
        const cleanPassword = normalizePassword(password);
        const foundUser = users.find(
          (user) => normalizeEmail(user.email) === lowerEmail && normalizePassword(user.password) === cleanPassword
        );

        if (!foundUser) {
          return {
            data: { user: null },
            error: new Error('Invalid email or password. Try student@demo.com / student123, academia@demo.com / academia123, industry@demo.com / industry123, or admin@demo.com / admin123.')
          };
        }

        localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({ userId: foundUser.id }));
        return { data: { user: normalizeUser(foundUser) }, error: null };
      },
      signOut: async () => {
        localStorage.removeItem(DEMO_SESSION_KEY);
        return { error: null };
      },
      getUser: async () => {
        const session = JSON.parse(localStorage.getItem(DEMO_SESSION_KEY) || 'null');

        if (!session?.userId) {
          return { data: { user: null }, error: null };
        }

        const users = getStoredUsers();
        const storedUser = users.find((user) => user.id === session.userId);

        if (!storedUser) {
          return { data: { user: null }, error: null };
        }

        return { data: { user: normalizeUser(storedUser) }, error: null };
      },
      onAuthStateChange: (callback) => {
        const session = JSON.parse(localStorage.getItem(DEMO_SESSION_KEY) || 'null');

        if (callback) {
          const currentUser = session?.userId
            ? normalizeUser(getStoredUsers().find((user) => user.id === session.userId))
            : null;

          callback(currentUser ? 'SIGNED_IN' : 'SIGNED_OUT', currentUser ? { user: currentUser } : null);
        }

        return {
          data: {
            subscription: {
              unsubscribe: () => {}
            }
          }
        };
      }
    },
    from
  };
};

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.');
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
