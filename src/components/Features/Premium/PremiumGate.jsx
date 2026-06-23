import { Crown, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PremiumGate({ feature = "this feature" }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center mb-5">
        <Lock size={32} className="text-yellow-500" />
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Crown size={18} className="text-yellow-500" />
        <h2 className="text-xl font-bold text-foreground">Premium Feature</h2>
      </div>

      <p className="text-muted-foreground max-w-sm mb-6">
        <span className="font-medium text-foreground">{feature}</span> is available on the Premium plan.
        Upgrade to unlock this and all other advanced tools.
      </p>

      <button
        onClick={() => navigate("/premium")}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-yellow-950 font-semibold transition-colors"
      >
        <Crown size={16} />
        Upgrade to Premium
      </button>

      <p className="mt-4 text-xs text-muted-foreground">
        Starting at ₹499/month · Cancel anytime
      </p>
    </div>
  );
}
