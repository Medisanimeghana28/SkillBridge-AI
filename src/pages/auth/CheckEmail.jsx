import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/common/Button";
import { BrainCircuit, MailCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export default function CheckEmail() {
  const location = useLocation();
  const { resendConfirmation } = useAuth();
  const email = location.state?.email || "";

  const [status, setStatus] = useState({ type: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleResend = async () => {
    if (!email) {
      setStatus({ type: "error", message: "No email address found. Please register again." });
      return;
    }
    setStatus({ type: "", message: "" });
    setSending(true);
    try {
      await resendConfirmation(email);
      setStatus({ type: "success", message: "Confirmation email resent. Please check your inbox." });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Failed to resend confirmation email." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-4">
      <div className="absolute top-4 right-4 z-10"><ThemeToggle /></div>

      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
          <BrainCircuit className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">SkillBridge</span>
      </Link>

      <div className="w-full max-w-md text-center">
        <MailCheck className="h-14 w-14 text-primary-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Check your inbox</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-2">
          We sent a confirmation link to
        </p>
        {email && (
          <p className="font-semibold text-slate-800 dark:text-slate-200 mb-6">{email}</p>
        )}

        {status.message && (
          <div className={`mb-6 p-4 rounded-lg border flex items-start gap-3 text-left ${
            status.type === "error"
              ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400"
              : "bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-400"
          }`}>
            {status.type === "error"
              ? <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              : <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />}
            <p className="text-sm font-medium">{status.message}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button onClick={handleResend} isLoading={sending} className="w-full" disabled={!email}>
            Resend confirmation email
          </Button>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Already confirmed? <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
