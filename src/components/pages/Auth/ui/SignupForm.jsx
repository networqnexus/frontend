import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye, EyeOff, ArrowRight, ArrowLeft, Check,
  User, Mail, Lock, Phone, MapPin, Briefcase
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoogleLogin } from "@react-oauth/google";
import { cn } from "@/lib/utils";
import { signup, googleLogin } from "@/api/authApi";
import useAuth from "@/hooks/useAuth";

const STEPS = ["Account", "Profile", "Role"];

const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Education",
  "Marketing", "Design", "Engineering", "Legal", "Consulting", "Other",
];

const ROLES = [
  { id: "professional", label: "Professional",  desc: "Network, find jobs & grow my career",    emoji: "👔", backendRole: "candidate"  },
  { id: "recruiter",    label: "Recruiter",      desc: "Hire talent and manage applicants (ATS)", emoji: "🎯", backendRole: "recruiter" },
  { id: "founder",      label: "Founder / HR",   desc: "Build a company and manage a team",      emoji: "🚀", backendRole: "recruiter" },
  { id: "student",      label: "Student",        desc: "Explore opportunities & learn",          emoji: "🎓", backendRole: "candidate" },
];

const SignupForm = () => {
  const navigate        = useNavigate();
  const { saveSession } = useAuth();
  const [step,          setStep]         = useState(0);
  const [showPassword,  setShowPassword] = useState(false);
  const [loading,       setLoading]      = useState(false);
  const [googleLoading, setGoogleLoading]= useState(false);
  const [error,         setError]        = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setError("");
    try {
      const data = await googleLogin({ credential: credentialResponse.credential });
      saveSession(data.token, data.user);
      if (!data.user.onboardingCompleted) navigate("/onboarding");
      else navigate("/feed");
    } catch (err) {
      setError(err.message || "Google signup failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const [form, setForm] = useState({
    name: "", email: "", contactNumber: "", location: "",
    username: "", password: "", confirmPassword: "",
    headline: "", industry: "", role: "",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleNext = async (e) => {
    e.preventDefault();
    setError("");

    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    setLoading(true);
    try {
      const selectedRole = ROLES.find(r => r.id === form.role);
      const backendRole  = selectedRole?.backendRole || "candidate";

      await signup({
        name:          form.name,
        email:         form.email,
        contactNumber: form.contactNumber,
        location:      form.location,
        username:      form.username,
        password:      form.password,
        role:          backendRole,
      });

      navigate("/check-email", { state: { email: form.email } });
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return { score: 0, label: "", color: "" };
    let score = 0;
    if (p.length >= 8)          score++;
    if (/[A-Z]/.test(p))        score++;
    if (/\d/.test(p))           score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    const labels = ["", "Weak", "Fair", "Good", "Strong"];
    const colors = ["", "text-destructive", "text-yellow-500", "text-green-500", "text-green-600"];
    return { score, label: labels[score], color: colors[score] };
  };

  const strength = passwordStrength();

  return (
    <div className="space-y-6">

      {/* Google Sign up */}
      <div className="space-y-3">
        <div className="flex justify-center">
          {googleLoading ? (
            <Button type="button" variant="outline" className="w-full" disabled>
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                Signing up with Google...
              </span>
            </Button>
          ) : (
            <div className="w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google signup failed. Please try again.")}
                width="100%"
                theme="outline"
                shape="rectangular"
                text="signup_with"
                locale="en"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or sign up with email</span>
          <div className="flex-1 h-px bg-border" />
        </div>
      </div>

      {/* Step indicator */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                i < step   && "bg-primary text-primary-foreground",
                i === step && "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2",
                i > step   && "bg-muted text-muted-foreground"
              )}>
                {i < step ? <Check size={13} /> : i + 1}
              </div>
              <span className={cn(
                "text-xs font-medium",
                i === step ? "text-foreground" : i < step ? "text-primary" : "text-muted-foreground"
              )}>
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div className={cn("w-8 h-px mx-1", i < step ? "bg-primary" : "bg-border")} />
              )}
            </div>
          ))}
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleNext} className="space-y-4">

        {/* STEP 0: Account */}
        {step === 0 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input placeholder="Arjun Singh" value={form.name} onChange={(e) => set("name", e.target.value)} className="pl-9" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Username</label>
                <Input placeholder="arjunsingh" value={form.username} onChange={(e) => set("username", e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input type="email" placeholder="you@company.com" value={form.email} onChange={(e) => set("email", e.target.value)} className="pl-9" required autoComplete="email" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Phone</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input type="tel" placeholder="+91 98765 43210" value={form.contactNumber} onChange={(e) => set("contactNumber", e.target.value)} className="pl-9" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Location</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input placeholder="Delhi, India" value={form.location} onChange={(e) => set("location", e.target.value)} className="pl-9" required />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={form.password} onChange={(e) => set("password", e.target.value)} className="pl-9 pr-10" required minLength={8} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {form.password && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className={cn(
                        "h-1 flex-1 rounded-full transition-all",
                        i <= strength.score
                          ? strength.score <= 1 ? "bg-destructive" : strength.score === 2 ? "bg-yellow-500" : "bg-green-500"
                          : "bg-muted"
                      )} />
                    ))}
                  </div>
                  <p className={cn("text-xs", strength.color)}>{strength.label} password</p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Confirm Password</label>
              <Input
                type="password" placeholder="Re-enter password" value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)} required autoComplete="new-password"
                className={cn(form.confirmPassword && form.confirmPassword !== form.password && "border-destructive focus-visible:border-destructive")}
              />
              {form.confirmPassword && form.confirmPassword !== form.password && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>
          </>
        )}

        {/* STEP 1: Profile */}
        {step === 1 && (
          <>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Professional Headline</label>
              <div className="relative">
                <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input placeholder="e.g. Full Stack Developer at Acme Corp" value={form.headline} onChange={(e) => set("headline", e.target.value)} className="pl-9" />
              </div>
              <p className="text-xs text-muted-foreground">This shows under your name on your profile</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Industry</label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map((ind) => (
                  <button key={ind} type="button" onClick={() => set("industry", ind)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-lg border transition-all",
                      form.industry === ind ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    )}>
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-border rounded-xl p-4 bg-muted/20">
              <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Profile Preview</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-lg font-semibold shrink-0">
                  {form.name ? form.name[0].toUpperCase() : "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{form.name || "Your Name"}</p>
                  <p className="text-xs text-muted-foreground truncate">{form.headline || "No headline yet"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{[form.location, form.industry].filter(Boolean).join(" · ") || "Location · Industry"}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* STEP 2: Role */}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Choose your primary role — this personalises your dashboard and features.
            </p>
            {ROLES.map((r) => (
              <button key={r.id} type="button" onClick={() => set("role", r.id)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                  form.role === r.id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-background hover:border-foreground/20 hover:bg-muted/30"
                )}>
                <div className="w-10 h-10 shrink-0 bg-muted rounded-xl flex items-center justify-center text-xl">{r.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{r.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                </div>
                <div className={cn(
                  "w-4 h-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-all",
                  form.role === r.id ? "border-primary bg-primary" : "border-muted-foreground/30"
                )}>
                  {form.role === r.id && <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />}
                </div>
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <Button type="button" variant="outline" size="lg" onClick={() => { setStep((s) => s - 1); setError(""); }} className="flex items-center gap-2">
              <ArrowLeft size={15} /> Back
            </Button>
          )}
          <Button
            type="submit" size="lg" className="flex-1 flex items-center justify-center gap-2"
            disabled={loading || (step === 2 && !form.role) || (step === 0 && form.confirmPassword && form.confirmPassword !== form.password)}
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Creating account...</>
            ) : (
              <>{step < STEPS.length - 1 ? "Continue" : "Create Account"}<ArrowRight size={15} /></>
            )}
          </Button>
        </div>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/" className="text-primary font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
};

export default SignupForm;