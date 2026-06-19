import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { forgotPassword } from "@/api/authApi";

const ForgotPassword = () => {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-primary-foreground fill-primary-foreground" />
            </div>
          </div>

          {sent ? (
            <>
              <div className="flex justify-center mb-3">
                <CheckCircle size={44} className="text-green-500" />
              </div>
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription>
                We've sent a reset link to <strong className="text-foreground">{email}</strong>.
                Check your inbox and spam folder.
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="text-2xl">Forgot password?</CardTitle>
              <CardDescription>Enter your email and we'll send you a reset link</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="pt-4">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email address</label>
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

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <Button variant="outline" className="w-full" size="lg" onClick={() => setSent(false)}>
              Send again
            </Button>
          )}

          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5">
              <ArrowLeft size={13} /> Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
