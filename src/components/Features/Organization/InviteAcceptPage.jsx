import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getInviteByToken, acceptInvite } from "@/api/orgApi";
import useAuth from "@/hooks/useAuth";
import { Building2, BadgeCheck, UserPlus, Loader2, X, CheckCircle } from "lucide-react";

const ROLE_LABELS = { employee: "Employee", hr: "HR Manager", admin: "Admin" };

const InviteAcceptPage = () => {
  const { token }    = useParams();
  const navigate     = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [invite,   setInvite]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [accepting, setAccepting] = useState(false);
  const [done,     setDone]     = useState(false);

  useEffect(() => {
    getInviteByToken(token)
      .then(d => setInvite(d.invite))
      .catch(e => setError(e.message || "Invite not found or expired."))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const d = await acceptInvite(token);
      setDone(true);
      setTimeout(() => navigate(`/org/${d.orgSlug}`), 2500);
    } catch (e) {
      setError(e.message || "Failed to accept invite.");
    }
    setAccepting(false);
  };

  const emailMismatch = invite && user && user.email !== invite.email;

  // Center layout (no sidebar)
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-3">
            <Building2 size={22} className="text-primary-foreground"/>
          </div>
          <p className="text-sm text-muted-foreground">Networq Nexus</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">

          {/* Loading */}
          {(loading || authLoading) && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 size={28} className="animate-spin text-muted-foreground"/>
              <p className="text-sm text-muted-foreground">Loading invitation...</p>
            </div>
          )}

          {/* Error state */}
          {!loading && !authLoading && error && !done && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                <X size={24} className="text-destructive"/>
              </div>
              <div>
                <p className="font-semibold text-foreground">Invitation Unavailable</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
              <Button variant="outline" onClick={() => navigate("/feed")}>Go to Feed</Button>
            </div>
          )}

          {/* Success state */}
          {done && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                <CheckCircle size={28} className="text-emerald-600 dark:text-emerald-400"/>
              </div>
              <div>
                <p className="font-semibold text-foreground">Welcome aboard!</p>
                <p className="text-sm text-muted-foreground mt-1">You've joined <strong>{invite?.org?.name}</strong>. Redirecting...</p>
              </div>
            </div>
          )}

          {/* Invite details */}
          {!loading && !authLoading && invite && !error && !done && (
            <>
              {/* Org info */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {invite.org?.logoUrl
                    ? <img src={invite.org.logoUrl} className="w-full h-full object-cover" alt=""/>
                    : <Building2 size={22} className="text-muted-foreground"/>}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-foreground">{invite.org?.name}</p>
                    <BadgeCheck size={14} className="text-primary"/>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Invited by <span className="font-medium text-foreground">{invite.invitedBy?.name}</span>
                  </p>
                </div>
              </div>

              {/* Role badge */}
              <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl p-3 mb-5">
                <UserPlus size={15} className="text-primary shrink-0"/>
                <div>
                  <p className="text-xs text-muted-foreground">You're invited as</p>
                  <p className="text-sm font-semibold text-foreground">{ROLE_LABELS[invite.role] || invite.role}</p>
                </div>
              </div>

              {/* Invited email */}
              <p className="text-xs text-muted-foreground mb-4 text-center">
                This invite was sent to <span className="font-medium text-foreground">{invite.email}</span>
              </p>

              {/* Not logged in */}
              {!isAuthenticated && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-center text-muted-foreground mb-1">Login or sign up to accept this invitation</p>
                  <Button className="w-full" onClick={() => navigate(`/login?next=/invite/${token}`)}>
                    Login to Accept
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate(`/signup?next=/invite/${token}`)}>
                    Create Account
                  </Button>
                </div>
              )}

              {/* Email mismatch */}
              {isAuthenticated && emailMismatch && (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3 text-center">
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                    You're logged in as <strong>{user.email}</strong>.<br/>
                    This invite is for <strong>{invite.email}</strong>. Please login with the correct account.
                  </p>
                </div>
              )}

              {/* Accept button */}
              {isAuthenticated && !emailMismatch && (
                <Button className="w-full gap-2" onClick={handleAccept} disabled={accepting}>
                  {accepting
                    ? <><Loader2 size={14} className="animate-spin"/>Accepting...</>
                    : <><CheckCircle size={14}/>Accept Invitation</>}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteAcceptPage;
