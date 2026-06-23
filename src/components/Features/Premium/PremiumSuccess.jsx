import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, CheckCircle2, ArrowRight } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";

export default function PremiumSuccess() {
  const navigate = useNavigate();

  // Auto-redirect after 8 seconds
  useEffect(() => {
    const t = setTimeout(() => navigate("/feed"), 8000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <MainLayout>
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500/40 flex items-center justify-center">
            <Crown size={36} className="text-yellow-500" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <CheckCircle2 size={20} className="text-emerald-500" />
          <p className="text-emerald-500 font-semibold text-sm">Payment Successful</p>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-3">
          Welcome to Premium!
        </h1>
        <p className="text-muted-foreground mb-8">
          Your subscription is now active. Unlock advanced analytics, unlimited connections,
          ATS/CRM/HRMS tools, live streaming, and much more.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/feed")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-yellow-950 font-semibold transition-colors"
          >
            Go to Feed <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate("/premium")}
            className="px-6 py-3 rounded-xl border border-border hover:bg-muted text-foreground font-medium transition-colors"
          >
            View Plan Details
          </button>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Redirecting to Feed in a few seconds…
        </p>
      </div>
    </MainLayout>
  );
}
