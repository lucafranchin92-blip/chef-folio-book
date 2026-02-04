import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Eye, EyeOff, ChefHat, AlertCircle, User, UtensilsCrossed } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import GoogleSignInButton from "@/components/GoogleSignInButton";

const checkRateLimit = async (email: string, attemptType: "login" | "signup"): Promise<{ allowed: boolean; retryAfter?: number }> => {
  try {
    const { data, error } = await supabase.functions.invoke("check-rate-limit", {
      body: { identifier: email, attemptType },
    });
    
    if (error) {
      // Fail open - allow request if rate limiting fails
      return { allowed: true };
    }
    
    return data;
  } catch {
    // Fail open - allow request if rate limiting fails
    return { allowed: true };
  }
};

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type UserRole = "buyer" | "chef";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("buyer");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});
  
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as { from?: Location })?.from?.pathname || "/";

  useEffect(() => {
    if (!loading && user) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (!isLogin && !fullName.trim()) {
      newErrors.fullName = "Please enter your name";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      // Check rate limit before attempting auth
      const rateLimitCheck = await checkRateLimit(email, isLogin ? "login" : "signup");
      
      if (!rateLimitCheck.allowed) {
        const minutes = Math.ceil((rateLimitCheck.retryAfter || 900) / 60);
        toast({
          title: "Too Many Attempts",
          description: `Please wait ${minutes} minutes before trying again.`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Login Failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in.",
          });
        }
      } else {
        const { error } = await signUp(email, password, fullName, selectedRole);
        if (error) {
          if (error.message.includes("User already registered")) {
            toast({
              title: "Account Exists",
              description: "An account with this email already exists. Please sign in instead.",
              variant: "destructive",
            });
            setIsLogin(true);
          } else {
            toast({
              title: "Sign Up Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Account Created",
            description: "Welcome! Your account has been created successfully.",
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border p-4">
        <Link to="/" className="flex items-center gap-2">
          <ChefHat className="w-8 h-8 text-primary" />
          <span className="font-serif text-xl">Private Chef</span>
        </Link>
      </header>

      {/* Auth Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
            {showForgotPassword ? (
              <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="font-serif text-2xl mb-2">
                    {isLogin ? "Welcome Back" : "Create Account"}
                  </h1>
                  <p className="text-muted-foreground font-sans text-sm">
                    {isLogin
                      ? "Sign in to manage your reservations"
                      : "Join us to book private chef experiences"}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <>
                      {/* Role Selection */}
                      <div>
                        <Label className="font-sans mb-3 block">I want to join as</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedRole("buyer")}
                            className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                              selectedRole === "buyer"
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-muted-foreground"
                            }`}
                          >
                            <User className={`w-6 h-6 ${selectedRole === "buyer" ? "text-primary" : "text-muted-foreground"}`} />
                            <span className={`font-medium text-sm ${selectedRole === "buyer" ? "text-primary" : "text-foreground"}`}>
                              Buyer
                            </span>
                            <span className="text-xs text-muted-foreground text-center">
                              Book private chefs
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRole("chef")}
                            className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                              selectedRole === "chef"
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-muted-foreground"
                            }`}
                          >
                            <UtensilsCrossed className={`w-6 h-6 ${selectedRole === "chef" ? "text-primary" : "text-muted-foreground"}`} />
                            <span className={`font-medium text-sm ${selectedRole === "chef" ? "text-primary" : "text-foreground"}`}>
                              Chef
                            </span>
                            <span className="text-xs text-muted-foreground text-center">
                              Offer your services
                            </span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="fullName" className="font-sans">Full Name</Label>
                        <Input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            setErrors((prev) => ({ ...prev, fullName: undefined }));
                          }}
                          placeholder="John Doe"
                          className={errors.fullName ? "border-destructive" : ""}
                        />
                        {errors.fullName && (
                          <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.fullName}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="email" className="font-sans">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      placeholder="you@example.com"
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="font-sans">Password</Label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrors((prev) => ({ ...prev, password: undefined }));
                        }}
                        placeholder="••••••••"
                        className={errors.password ? "border-destructive pr-10" : "pr-10"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="gold"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        {isLogin ? "Signing In..." : "Creating Account..."}
                      </span>
                    ) : (
                      isLogin ? "Sign In" : "Create Account"
                    )}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <GoogleSignInButton isLogin={isLogin} />

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setErrors({});
                    }}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors font-sans"
                  >
                    {isLogin
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Sign in"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Auth;
