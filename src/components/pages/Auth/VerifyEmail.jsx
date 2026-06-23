import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { verifyEmail } from "@/api/authApi";

const VerifyEmail = () => {
  const [searchParams]       = useSearchParams();
  const token                = searchParams.get("token");
  const [status,  setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage]= useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("Invalid verification link"); return; }
    verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => { setStatus("error"); setMessage(err.message); });
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-primary-foreground fill-primary-foreground" />
            </div>
          </div>

          {status === "loading" && (
            <>
              <div className="flex justify-center mb-3">
                <Loader size={44} className="text-primary animate-spin" />
              </div>
              <CardTitle>Verifying your email...</CardTitle>
              <CardDescription>Please wait a moment</CardDescription>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center mb-3">
                <CheckCircle size={44} className="text-green-500" />
              </div>
              <CardTitle>Email Verified!</CardTitle>
              <CardDescription>
                Your email has been verified successfully. You can now sign in to your account.
              </CardDescription>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center mb-3">
                <XCircle size={44} className="text-destructive" />
              </div>
              <CardTitle>Verification Failed</CardTitle>
              <CardDescription>
                {message || "The link is invalid or has expired. Please request a new one."}
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="pt-2 space-y-3">
          {status === "success" && (
            <Link to="/login">
              <Button className="w-full" size="lg">Continue to Login</Button>
            </Link>
          )}
          {status === "error" && (
            <div className="space-y-2">
              <Link to="/login">
                <Button className="w-full" size="lg">Go to Login</Button>
              </Link>
              <p className="text-center text-xs text-muted-foreground">
                Sign up again to receive a new verification email
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
