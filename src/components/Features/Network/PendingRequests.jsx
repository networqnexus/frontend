import { useState } from "react";
import { Check, X, ChevronDown, ChevronUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PENDING_REQUESTS } from "./networkData";

const PendingRequests = () => {
  const [requests, setRequests] = useState(PENDING_REQUESTS);
  const [collapsed, setCollapsed] = useState(false);
  const [actionDone, setActionDone] = useState({});

  const handleAccept = (id) => {
    setActionDone(p => ({ ...p, [id]: "accepted" }));
    setTimeout(() => setRequests(r => r.filter(x => x.id !== id)), 600);
  };

  const handleDecline = (id) => {
    setActionDone(p => ({ ...p, [id]: "declined" }));
    setTimeout(() => setRequests(r => r.filter(x => x.id !== id)), 600);
  };

  if (requests.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Users size={15} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Pending Requests</span>
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground leading-none">
            {requests.length}
          </span>
        </div>
        {collapsed ? <ChevronDown size={15} className="text-muted-foreground" /> : <ChevronUp size={15} className="text-muted-foreground" />}
      </button>

      {!collapsed && (
        <div className="divide-y divide-border">
          {requests.map((req) => {
            const done = actionDone[req.id];
            return (
              <div
                key={req.id}
                className={`px-4 py-3 transition-all duration-300 ${
                  done === "accepted" ? "bg-emerald-50 dark:bg-emerald-950/30" :
                  done === "declined" ? "bg-muted/30 opacity-50" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${req.color}`}>
                    {req.initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground leading-tight">{req.name}</p>
                        <p className="text-xs text-muted-foreground">{req.title} · {req.company}</p>
                        <p className="text-xs text-muted-foreground">{req.mutual} mutual · {req.sentAgo}</p>
                      </div>
                    </div>

                    {/* Note preview */}
                    {req.note && (
                      <p className="mt-1.5 text-xs text-foreground/80 italic bg-muted/40 rounded-lg px-2.5 py-1.5 leading-relaxed border-l-2 border-border">
                        "{req.note}"
                      </p>
                    )}

                    {/* Actions */}
                    {!done && (
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="xs"
                          onClick={() => handleAccept(req.id)}
                          className="gap-1"
                        >
                          <Check size={12} />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleDecline(req.id)}
                          className="gap-1"
                        >
                          <X size={12} />
                          Decline
                        </Button>
                      </div>
                    )}
                    {done === "accepted" && (
                      <p className="text-xs text-emerald-600 font-medium mt-1.5">✓ Connected!</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PendingRequests;
