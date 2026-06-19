import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { resetPassword } from "@/api/authApi";

const ResetPassword = () => {
  const [searchParams]        = useSearchParams();
  const token                 = searchParams.get("token");
  const navigate              = useNavigate();
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match"); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    setError("");
    try {
      await resetPassword({ token, password });
      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <Card className="w-full max-w-md text-center p-8">
        <p className="text-destructive font-medium">Invalid reset link.</p>
        <Link to="/forgot-password" className="text-primary hover:underline text-sm mt-3 block">
          Request a new reset link
        </Link>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-primary-foreground fill-primary-foreground" />
            </div>
          </div>
          {done ? (
            <>
              <div className="flex justify-center mb-3">
                <CheckCircle size={44} className="text-green-500" />
              </div>
              <CardTitle>Password Reset!</CardTitle>
              <CardDescription>Redirecting you to login...</CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="text-2xl">Set new password</CardTitle>
              <CardDescription>Enter a strong new password for your account</CardDescription>
            </>
          )}
        </CardHeader>

        {!done && (
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">New Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    type={showPass ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                {confirm && confirm !== password && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit" className="w-full" size="lg"
                disabled={loading || (!!confirm && confirm !== password)}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Resetting...
                  </span>
                ) : "Reset Password"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
                Back to Login
              </Link>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ResetPassword;
