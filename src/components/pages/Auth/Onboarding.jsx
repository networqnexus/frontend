import OnboardingForm from "./ui/OnboardingForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap } from "lucide-react";

const Onboarding = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">Networq Nexus</span>
          </div>
          <CardTitle className="text-2xl">Complete your profile</CardTitle>
          <CardDescription>
            Help others find you — takes less than 2 minutes
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <OnboardingForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
