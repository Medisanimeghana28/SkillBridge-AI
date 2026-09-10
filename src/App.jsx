import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '@/pages/landing/LandingPage';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { StudentLayout } from '@/layouts/StudentLayout';
import StudentDashboard from '@/pages/student/StudentDashboard';
import PlaceholderPage from '@/components/common/PlaceholderPage';

import SkillDNA from '@/pages/student/SkillDNA';
import SkillGapAnalyzer from '@/pages/student/SkillGapAnalyzer';
import Roadmap from '@/pages/student/Roadmap';
import Internships from '@/pages/student/Internships';
import Applications from '@/pages/student/Applications';
import Passport from '@/pages/student/Passport';
import PassportPreview from '@/pages/student/PassportPreview';

// Academia Imports
import AcademiaLayout from '@/layouts/AcademiaLayout';
import AcademiaDashboard from '@/pages/academia/Dashboard';
import AcademiaStudents from '@/pages/academia/Students';
import AcademiaSkillGaps from '@/pages/academia/SkillGaps';
import AcademiaDemand from '@/pages/academia/Demand';
import AcademiaTraining from '@/pages/academia/Training';

// Simple Protected Route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  const activeUser = user || (() => {
    try {
      const s = localStorage.getItem('sb_session');
      return (s && s !== 'logged_out') ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();
  
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><span className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></span></div>;

  if (!activeUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(activeUser.role)) {
    return <Navigate to={`/${activeUser.role}/dashboard`} replace />;
  }
  
  return children;
};

// Placeholder Dashboards for other roles
const IndustryDashboard = () => <div className="p-8">Industry Dashboard (Coming Soon) <LogoutButton /></div>;

const LogoutButton = () => {
  const { logout } = useAuth();
  return <button onClick={logout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Logout</button>;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Public Preview Route (does not need sidebar layout) */}
            <Route path="/student/passport/preview" element={<PassportPreview />} />
            
            {/* Student Routes */}
            <Route path="/student" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="skills" element={<SkillDNA />} />
              <Route path="skill-gap" element={<SkillGapAnalyzer />} />
              <Route path="roadmap" element={<Roadmap />} />
              <Route path="internships" element={<Internships />} />
              <Route path="challenges" element={<PlaceholderPage title="Industry Challenges" />} />
              <Route path="applications" element={<Applications />} />
              <Route path="passport" element={<Passport />} />
              <Route path="profile" element={<PlaceholderPage title="Student Profile" />} />
              <Route path="settings" element={<PlaceholderPage title="Account Settings" />} />
            </Route>

            {/* Academia Routes */}
            <Route path="/academia" element={
              <ProtectedRoute allowedRoles={['academia']}>
                <AcademiaLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AcademiaDashboard />} />
              <Route path="students" element={<AcademiaStudents />} />
              <Route path="skill-gaps" element={<AcademiaSkillGaps />} />
              <Route path="demand" element={<AcademiaDemand />} />
              <Route path="training" element={<AcademiaTraining />} />
              <Route path="reports" element={<PlaceholderPage title="Academia Reports" />} />
              <Route path="settings" element={<PlaceholderPage title="Settings" />} />
            </Route>
            

            
            {/* Industry Routes */}
            <Route path="/industry/*" element={
              <ProtectedRoute allowedRoles={['industry']}>
                <Routes>
                  <Route path="dashboard" element={<IndustryDashboard />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
