import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '@/pages/landing/LandingPage';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { storageService } from '@/services/storageService';
import { StudentLayout } from '@/layouts/StudentLayout';
import StudentDashboard from '@/pages/student/StudentDashboard';
import PlaceholderPage from '@/components/common/PlaceholderPage';

import SkillDNA from '@/pages/student/SkillDNA';
import SkillGapAnalyzer from '@/pages/student/SkillGapAnalyzer';
import Roadmap from '@/pages/student/Roadmap';
import Internships from '@/pages/student/Internships';
import StudentChallenges from '@/pages/student/Challenges';
import Applications from '@/pages/student/Applications';
import Passport from '@/pages/student/Passport';
import PassportPreview from '@/pages/student/PassportPreview';
import StudentProfile from '@/pages/student/Profile';
import StudentSettings from '@/pages/student/Settings';

// Academia Imports
import AcademiaLayout from '@/layouts/AcademiaLayout';
import AcademiaDashboard from '@/pages/academia/Dashboard';
import AcademiaStudents from '@/pages/academia/Students';
import AcademiaSkillGaps from '@/pages/academia/SkillGaps';
import AcademiaDemand from '@/pages/academia/Demand';
import AcademiaTraining from '@/pages/academia/Training';

// Industry Imports
import IndustryLayout from '@/layouts/IndustryLayout';
import IndustryDashboard from '@/pages/industry/Dashboard';
import IndustryTalent from '@/pages/industry/Talent';
import IndustryJobs from '@/pages/industry/Jobs';
import IndustryChallenges from '@/pages/industry/Challenges';
import IndustryRequirements from '@/pages/industry/Requirements';

import IndustryFeedback from '@/pages/industry/Feedback';

// Admin Imports
import AdminLayout from '@/layouts/AdminLayout';
import AdminDashboard from '@/pages/admin/Dashboard';

// Simple Protected Route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><span className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></span></div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }
  
  return children;
};

const LogoutButton = () => {
  const { logout } = useAuth();
  return <button onClick={logout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Logout</button>;
}

storageService.initMockData();

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
              <Route path="challenges" element={<StudentChallenges />} />
              <Route path="applications" element={<Applications />} />
              <Route path="passport" element={<Passport />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="settings" element={<StudentSettings />} />
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
            <Route path="/industry" element={
              <ProtectedRoute allowedRoles={['industry']}>
                <IndustryLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<IndustryDashboard />} />
              <Route path="talent" element={<IndustryTalent />} />
              <Route path="jobs" element={<IndustryJobs />} />
              <Route path="challenges" element={<IndustryChallenges />} />
              <Route path="requirements" element={<IndustryRequirements />} />
              <Route path="feedback" element={<IndustryFeedback />} />
              <Route path="settings" element={<PlaceholderPage title="Settings" />} />
            </Route>
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<PlaceholderPage title="Admin Students Directory" />} />
              <Route path="institutions" element={<PlaceholderPage title="Admin Institutions" />} />
              <Route path="industries" element={<PlaceholderPage title="Admin Industry Partners" />} />
              <Route path="skill-demand" element={<PlaceholderPage title="Ecosystem Skill Demand" />} />
              <Route path="analytics" element={<PlaceholderPage title="Ecosystem Analytics" />} />
              <Route path="settings" element={<PlaceholderPage title="Settings" />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
