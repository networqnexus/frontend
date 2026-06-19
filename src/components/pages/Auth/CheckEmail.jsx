import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { resendVerification } from "@/api/authApi";

const CheckEmail = () => {
  const location      = useLocation();
  const email         = location.state?.email || "";
  const [resent,   setResent]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleResend = async () => {
    if (!email || loading) return;
    setLoading(true);
    setError("");
    try {
      await resendVerification({ email });
      setResent(true);
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
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-primary/10 rounded-full border border-primary/20 flex items-center justify-center">
              <Mail size={30} className="text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription className="mt-1">
            We've sent a verification link to{" "}
            {email && <strong className="text-foreground">{email}</strong>}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4 space-y-3">
          <div className="bg-muted rounded-lg px-4 py-3 space-y-1.5">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="text-primary">•</span> Inbox aur spam folder check karo
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="text-primary">•</span> Link 24 ghante mein expire ho jaayega
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="text-primary">•</span> Link click karne pe account activate ho jaayega
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {email && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleResend}
              disabled={loading || resent}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              {resent ? "Email sent! Check inbox" : loading ? "Sending..." : "Resend verification email"}
            </Button>
          )}

          <Link to="/login">
            <Button variant="ghost" className="w-full gap-2">
              <ArrowLeft size={14} /> Back to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckEmail;
