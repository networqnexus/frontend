import LoginForm from "./ui/LoginForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap } from "lucide-react";

const Login = () => {
  return (
    <div className="min-h-screen bg-background flex">

      {/* Left decorative panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-muted/30 border-r border-border">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-primary-foreground fill-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-foreground">Networq Nexus</span>
        </div>

        {/* Center content */}
        <div className="max-w-sm">
          <h2 className="text-4xl font-bold text-foreground leading-tight tracking-tight mb-4">
            Connect with your professional world
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed mb-8">
            Join millions of professionals. Network, find jobs, manage hiring, and grow your career — all in one place.
          </p>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-2">
            {["Feed", "Jobs", "ATS", "CRM", "HRMS", "Streaming", "Messages", "Network"].map((f) => (
              <span
                key={f}
                className="px-3 py-1 text-xs font-medium text-muted-foreground border border-border rounded-full bg-background"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { value: "2M+", label: "Professionals" },
            { value: "50K+", label: "Companies" },
            { value: "200+", label: "Countries" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right - auth panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-primary-foreground fill-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your Networq Nexus account</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <LoginForm />
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default Login;
