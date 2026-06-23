import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Crown, Zap, Star, Shield, X } from "lucide-react";
import { createCheckoutSession, getPaymentStatus, cancelSubscription } from "@/api/paymentApi";
import useAuth from "@/hooks/useAuth";
import MainLayout from "@/layouts/MainLayout";

const FEATURES_FREE = [
  "Create & view posts",
  "Connect with 50 people",
  "Basic job search",
  "Public profile",
  "Community messaging",
];

const FEATURES_PREMIUM = [
  "Everything in Free",
  "Unlimited connections",
  "Priority job matching",
  "Advanced analytics",
  "ATS, CRM & HRMS tools",
  "Live streaming",
  "Premium badge on profile",
  "Early access to new features",
];

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—";

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getPaymentStatus()
      .then(setStatus)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async (plan) => {
    setError("");
    setCheckoutLoading(plan);
    try {
      const data = await createCheckoutSession(plan);
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError(e?.message || "Failed to start checkout. Please try again.");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel your premium subscription? You'll keep access until the billing period ends.")) return;
    setCancelLoading(true);
    try {
      await cancelSubscription();
      const updated = await getPaymentStatus();
      setStatus(updated);
    } catch (e) {
      setError(e?.message || "Failed to cancel. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  const isPremium = status?.isPremium;
  const sub = status?.subscription;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Crown size={28} className="text-yellow-500" />
            <h1 className="text-3xl font-bold text-foreground">Networq Nexus Premium</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Unlock the full power of your professional network
          </p>
        </div>

        {/* Current plan banner */}
        {!loading && isPremium && (
          <div className="mb-8 rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Crown size={22} className="text-yellow-500" />
                <div>
                  <p className="font-semibold text-foreground">You have Premium!</p>
                  <p className="text-sm text-muted-foreground">
                    {sub?.cancelAtEnd
                      ? `Cancels on ${fmtDate(status.premiumExpiresAt)}`
                      : `Renews on ${fmtDate(sub?.renewsAt || status.premiumExpiresAt)}`}
                    {sub?.plan && ` · ${sub.plan === "yearly" ? "Yearly" : "Monthly"} plan`}
                  </p>
                </div>
              </div>
              {!sub?.cancelAtEnd && (
                <button
                  onClick={handleCancel}
                  disabled={cancelLoading}
                  className="text-sm text-red-500 hover:text-red-400 border border-red-500/30 hover:border-red-400/50 px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {cancelLoading ? "Cancelling…" : "Cancel Subscription"}
                </button>
              )}
              {sub?.cancelAtEnd && (
                <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                  Cancellation scheduled
                </span>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm">
            <X size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Plan cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">

          {/* Free plan */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={18} className="text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">Free</h2>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold text-foreground">₹0</span>
                <span className="text-muted-foreground text-sm">forever</span>
              </div>
              <p className="text-sm text-muted-foreground">Perfect for getting started</p>
            </div>
            <ul className="space-y-3 mb-6">
              {FEATURES_FREE.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check size={15} className="text-muted-foreground mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="rounded-lg border border-border bg-muted/30 text-center py-2.5 text-sm text-muted-foreground font-medium">
              Current plan
            </div>
          </div>

          {/* Premium plan */}
          <div className="rounded-2xl border-2 border-yellow-500/60 bg-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-500 text-yellow-950 text-[11px] font-bold px-3 py-1 rounded-bl-xl">
              MOST POPULAR
            </div>
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <Crown size={18} className="text-yellow-500" />
                <h2 className="text-lg font-semibold text-foreground">Premium</h2>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-foreground">₹499</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">or</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold text-yellow-500">₹4,999</span>
                <span className="text-muted-foreground text-sm">/year</span>
                <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded ml-1">Save 17%</span>
              </div>
              <p className="text-sm text-muted-foreground">For serious professionals</p>
            </div>
            <ul className="space-y-3 mb-6">
              {FEATURES_PREMIUM.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <Check size={15} className="text-yellow-500 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {isPremium ? (
              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-center py-2.5 text-sm font-medium text-yellow-600 dark:text-yellow-400 flex items-center justify-center gap-2">
                <Crown size={14} />
                Active Plan
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleUpgrade("monthly")}
                  disabled={!!checkoutLoading}
                  className="w-full py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-yellow-950 font-semibold text-sm transition-colors disabled:opacity-60"
                >
                  {checkoutLoading === "monthly" ? "Redirecting…" : "Upgrade Monthly — ₹499/mo"}
                </button>
                <button
                  onClick={() => handleUpgrade("yearly")}
                  disabled={!!checkoutLoading}
                  className="w-full py-2.5 rounded-lg border border-yellow-500/50 hover:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-semibold text-sm transition-colors disabled:opacity-60"
                >
                  {checkoutLoading === "yearly" ? "Redirecting…" : "Upgrade Yearly — ₹4,999/yr"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield size={15} className="text-primary" />
            Secured by Stripe
          </div>
          <div className="flex items-center gap-2">
            <Star size={15} className="text-yellow-500" />
            Cancel anytime
          </div>
          <div className="flex items-center gap-2">
            <Check size={15} className="text-emerald-500" />
            Instant activation
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
