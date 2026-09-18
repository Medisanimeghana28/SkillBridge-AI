import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/common/Button";
import { BrainCircuit, Eye, EyeOff, AlertCircle } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await register(formData);
      if (user.needsEmailConfirmation) {
        navigate('/check-email', { replace: true, state: { email: formData.email } });
      } else {
        navigate(`/${user.role}/dashboard`, { replace: true });
      }
    } catch (err) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row-reverse bg-white dark:bg-slate-950">
      <div className="absolute top-4 left-4 z-10"><ThemeToggle /></div>
      
      {/* Form Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-4 sm:px-12 lg:px-24 py-12">
        <div className="w-full max-w-md mx-auto">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
              <BrainCircuit className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">SkillBridge</span>
          </Link>

          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create an account</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Join the ecosystem and accelerate your journey.</p>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-start gap-3 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                placeholder="Aarav Sharma"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-4 pr-12 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  placeholder="••••••••"
                  minLength={6}
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
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">I am joining as a</label>
              <div className="grid grid-cols-3 gap-3">
                {['student', 'academia', 'industry'].map((r) => (
                  <label key={r} className={`cursor-pointer rounded-lg border py-2.5 px-3 text-center text-sm font-medium transition-colors ${formData.role === r ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 dark:border-primary-500' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                    <input type="radio" name="role" value={r} checked={formData.role === r} onChange={handleChange} className="sr-only" />
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={loading}>
              Create Account
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account? <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400">Sign in</Link>
          </p>
        </div>
      </div>
      
      {/* Brand Section */}
      <div className="hidden md:flex w-1/2 bg-slate-900 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        <div className="absolute bottom-1/4 -left-1/4 w-[800px] h-[800px] bg-primary-600/30 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 max-w-lg text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Map your journey from classroom to industry</h2>
          <p className="text-xl text-slate-300">Join thousands of students and top recruiters bridging the skill gap today.</p>
        </div>
      </div>
    </div>
  );
}
