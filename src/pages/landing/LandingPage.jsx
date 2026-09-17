import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { 
  ArrowRight, Dna, TrendingDown, Map, 
  Briefcase, Trophy, BadgeCheck, GraduationCap, Building2, User 
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Dna, title: "AI Skill DNA", desc: "Map your unique technical and soft skills." },
  { icon: TrendingDown, title: "Skill Gap Analyzer", desc: "Identify what's missing for your dream role." },
  { icon: Map, title: "Career Roadmap", desc: "Get AI-generated personalized learning paths." },
  { icon: Briefcase, title: "Smart Internship Matching", desc: "Find roles based on true skill alignment." },
  { icon: Trophy, title: "Industry Challenges", desc: "Solve real problems to prove your worth." },
  { icon: BadgeCheck, title: "Verified Skill Passport", desc: "Build an unforgeable credential profile." },
  { icon: GraduationCap, title: "Academia Skill Analytics", desc: "Colleges can align curricula to demand." },
  { icon: Building2, title: "Industry Talent Discovery", desc: "Hire based on verified skills, not just CVs." },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light dark:opacity-10"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary-500/10 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="container relative z-10 mx-auto px-4 text-center sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-block py-1 px-3 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold mb-6 dark:bg-primary-900/30 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                SkillBridge AI
              </span>
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl">
                Map Skills. <span className="text-primary-600 dark:text-primary-500">Close Gaps.</span> <br className="hidden md:block"/>Connect Talent.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
                Bridge the gap between what students learn and what industries need. SkillBridge AI connects students, academia, and industry through skill intelligence, internships, challenges, and placement readiness.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/login">
                  <Button size="lg" className="w-full sm:w-auto gap-2">
                    Explore Platform <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#ecosystem">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/50 dark:bg-slate-900/50 backdrop-blur">
                    View Demo
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feature Ecosystem Section */}
        <section id="features" className="py-24 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Powered by AI Intelligence</h2>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Everything you need to succeed in the modern tech ecosystem.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary-200 hover:shadow-md transition-all dark:bg-slate-800/50 dark:border-slate-800 dark:hover:border-primary-800"
                >
                  <div className="h-12 w-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform dark:bg-primary-900/30 dark:text-primary-400">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-24 bg-slate-50 dark:bg-slate-950">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">The Student Journey</h2>
            </div>
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-2 lg:gap-4 max-w-5xl mx-auto text-center">
              {['Build Skill DNA', 'Identify Gaps', 'Follow Roadmap', 'Connect Industry', 'Placement Ready'].map((step, i) => (
                <div key={i} className="flex flex-col items-center group w-full md:w-auto relative">
                  <div className="h-16 w-16 rounded-full bg-white border-2 border-primary-200 flex items-center justify-center text-primary-600 text-xl font-bold mb-4 shadow-sm group-hover:border-primary-500 group-hover:bg-primary-50 transition-colors dark:bg-slate-900 dark:border-primary-800 dark:text-primary-400 dark:group-hover:bg-primary-900/30 z-10">
                    {i + 1}
                  </div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{step}</span>
                  {i < 4 && <div className="hidden md:block absolute top-8 left-[60%] w-full h-[2px] bg-slate-200 dark:bg-slate-800 -z-0"></div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section id="ecosystem" className="py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-16">ACADEMIA ↔ SKILL INTELLIGENCE ↔ INDUSTRY</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="p-8 rounded-2xl bg-gradient-to-b from-blue-50 to-white border border-blue-100 dark:from-blue-950/20 dark:to-slate-900 dark:border-blue-900/30">
                <User className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 dark:text-white">Students</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Discover your skill gaps, get a personalized learning path, and land your dream role.</p>
              </div>
              <div className="p-8 rounded-2xl bg-gradient-to-b from-emerald-50 to-white border border-emerald-100 dark:from-emerald-950/20 dark:to-slate-900 dark:border-emerald-900/30">
                <GraduationCap className="h-10 w-10 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 dark:text-white">Academia</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Align your curriculum with real-time industry demand and boost placement rates.</p>
              </div>
              <div className="p-8 rounded-2xl bg-gradient-to-b from-purple-50 to-white border border-purple-100 dark:from-purple-950/20 dark:to-slate-900 dark:border-purple-900/30">
                <Building2 className="h-10 w-10 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 dark:text-white">Industry</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Hire verified talent that actually meets your skill requirements seamlessly.</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
