import SignupForm from "./ui/SignupForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap } from "lucide-react";

const Signup = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-primary-foreground fill-primary-foreground" />
          </div>
          <span className="font-semibold text-xl text-foreground">Networq Nexus</span>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>Join millions of professionals on Networq Nexus</CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm />
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Signup;
