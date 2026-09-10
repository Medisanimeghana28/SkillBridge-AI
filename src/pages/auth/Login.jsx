import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/common/Button";
import { BrainCircuit, Eye, EyeOff, AlertCircle } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("password123");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);
      navigate(`/${user.role}/dashboard`, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-slate-950">
      <div className="absolute top-4 right-4 z-10"><ThemeToggle /></div>
      
      {/* Form Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-4 sm:px-12 lg:px-24 py-12">
        <div className="w-full max-w-md mx-auto">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
              <BrainCircuit className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">SkillBridge</span>
          </Link>

          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome back</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Enter your credentials to access your account.</p>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-start gap-3 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 bg-white dark:border-slate-700 dark:bg-slate-900" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400" onClick={(e) => { e.preventDefault(); alert('Forgot password flow to be implemented'); }}>
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full" isLoading={loading}>
              Sign In
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            Don't have an account? <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400">Sign up</Link>
          </p>

          <div className="mt-12 p-6 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Demo Access</h4>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleDemoLogin('student@demo.com')} type="button">Student</Button>
              <Button variant="outline" size="sm" onClick={() => handleDemoLogin('academia@demo.com')} type="button">Academia</Button>
              <Button variant="outline" size="sm" onClick={() => handleDemoLogin('industry@demo.com')} type="button">Industry</Button>
              <Button variant="outline" size="sm" onClick={() => handleDemoLogin('admin@demo.com')} type="button">Admin</Button>
            </div>
            <p className="mt-3 text-xs text-slate-500">Password for all demo accounts: <strong>password123</strong></p>
          </div>
        </div>
      </div>
      
      {/* Brand Section */}
      <div className="hidden md:flex w-1/2 bg-slate-900 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-primary-600/30 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 max-w-lg text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Empower your career with data-driven skills</h2>
          <p className="text-xl text-slate-300">Join the SkillBridge ecosystem to identify your gaps and land the perfect role.</p>
        </div>
      </div>
    </div>
  );
}
