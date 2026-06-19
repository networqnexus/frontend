import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoogleLogin } from "@react-oauth/google";
import { login, googleLogin } from "@/api/authApi";
import useAuth from "@/hooks/useAuth";

const LoginForm = () => {
  const navigate         = useNavigate();
  const { saveSession }  = useAuth();

  const [showPassword,  setShowPassword]  = useState(false);
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [loading,       setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error,         setError]         = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login({ email, password });
      saveSession(data.token, data.user);
      if (!data.user.onboardingCompleted) navigate("/onboarding");
      else navigate("/feed");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setError("");
    try {
      const data = await googleLogin({ credential: credentialResponse.credential });
      saveSession(data.token, data.user);
      if (!data.user.onboardingCompleted) navigate("/onboarding");
      else navigate("/feed");
    } catch (err) {
      setError(err.message || "Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Email</label>
        <div className="relative">
          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-9"
            required
            autoComplete="email"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Password</label>
          <Link to="/forgot-password" className="text-xs text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-9 pr-10"
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={loading || googleLoading} size="lg">
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Signing in...
          </span>
        ) : (
          <span className="flex items-center gap-2">Sign in <ArrowRight size={15} /></span>
        )}
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Google Login */}
      <div className="flex justify-center">
        {googleLoading ? (
          <Button type="button" variant="outline" className="w-full" size="lg" disabled>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
              Signing in with Google...
            </span>
          </Button>
        ) : (
          <div className="w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google login failed. Please try again.")}
              width="100%"
              theme="outline"
              shape="rectangular"
              text="signin_with"
              locale="en"
            />
          </div>
        )}
      </div>

      {/* Sign up link */}
      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/signup" className="text-primary font-medium hover:underline">
          Sign up free
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
