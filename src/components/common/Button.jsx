import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";
import { forwardRef } from "react";

const Button = forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md", 
  isLoading = false, 
  children, 
  disabled,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-sm",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700",
    outline: "border border-slate-200 bg-transparent hover:bg-slate-100 text-slate-900 dark:border-slate-800 dark:text-slate-50 dark:hover:bg-slate-800",
    ghost: "hover:bg-slate-100 hover:text-slate-900 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50",
    link: "text-primary-600 underline-offset-4 hover:underline dark:text-primary-500"
  };

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-11 px-8 text-lg",
    icon: "h-10 w-10"
  };

  return (
    <button
      ref={ref}
      disabled={isLoading || disabled}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button };
export default Button;
