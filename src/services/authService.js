// Simulated backend service for authentication

const DEMO_USERS = [
  {
    id: 'u1',
    name: 'Aarav Sharma',
    email: 'student@demo.com',
    password: 'password123',
    role: 'student',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav',
  },
  {
    id: 'u2',
    name: 'Dr. Meera Patel',
    email: 'academia@demo.com',
    password: 'password123',
    role: 'academia',
    institution: 'IIT Bombay',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Meera',
  },
  {
    id: 'u3',
    name: 'Vikram Malhotra',
    email: 'industry@demo.com',
    password: 'password123',
    role: 'industry',
    company: 'TCS Digital',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
  }
];

// Initialize mock DB in localStorage if empty
const initDB = () => {
  if (!localStorage.getItem('sb_users')) {
    localStorage.setItem('sb_users', JSON.stringify(DEMO_USERS));
  }
};

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  login: async (email, password) => {
    initDB();
    await delay(800); // Simulate network latency

    const users = JSON.parse(localStorage.getItem('sb_users'));
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Exclude password from session
    const { password: _, ...userSession } = user;
    localStorage.setItem('sb_session', JSON.stringify(userSession));
    
    return userSession;
  },

  register: async ({ name, email, password, role }) => {
    initDB();
    await delay(1000);

    const users = JSON.parse(localStorage.getItem('sb_users'));
    if (users.find(u => u.email === email)) {
      throw new Error('Email already registered');
    }

    const newUser = {
      id: `u${Date.now()}`,
      name,
      email,
      password,
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(' ', '')}`,
    };

    users.push(newUser);
    localStorage.setItem('sb_users', JSON.stringify(users));

    const { password: _, ...userSession } = newUser;
    localStorage.setItem('sb_session', JSON.stringify(userSession));

    return userSession;
  },

  logout: () => {
    localStorage.setItem('sb_session', 'logged_out');
  },

  getCurrentUser: async () => {
    initDB();
    await delay(100);
    const session = localStorage.getItem('sb_session');
    if (session === 'logged_out') {
      return null;
    }
    if (session) {
      try {
        return JSON.parse(session);
      } catch (e) {
        // fallback
      }
    }
    // Default to student demo user so dashboard works immediately on first visit
    const defaultStudent = DEMO_USERS[0];
    const { password: _, ...userSession } = defaultStudent;
    localStorage.setItem('sb_session', JSON.stringify(userSession));
    return userSession;
  }
};
