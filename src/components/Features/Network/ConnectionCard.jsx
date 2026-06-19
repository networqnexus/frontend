import { useState } from "react";
import { UserPlus, UserCheck, MessageSquare, MoreHorizontal, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const ConnectionCard = ({ person, type = "connection" }) => {
  const [connected, setConnected] = useState(type === "connection");
  const [requested, setRequested] = useState(false);
  const [removed, setRemoved] = useState(false);

  if (removed) return null;

  const handleConnect = () => {
    if (requested) return;
    setRequested(true);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col transition-shadow hover:shadow-sm group">
      {/* Cover strip */}
      <div className="h-10 bg-gradient-to-r from-muted to-muted/50 relative">
        <div className={`absolute -bottom-5 left-4 w-11 h-11 rounded-full ring-2 ring-card flex items-center justify-center text-sm font-bold ${person.color}`}>
          {person.initials}
        </div>
        {/* More menu */}
        <button className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-card/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal size={12} className="text-muted-foreground" />
        </button>
      </div>

      {/* Body */}
      <div className="pt-7 px-4 pb-4 flex flex-col flex-1">
        <p className="text-sm font-semibold text-foreground hover:underline cursor-pointer leading-tight">
          {person.name}
        </p>
        <p className="text-xs text-muted-foreground leading-tight mt-0.5">{person.title}</p>
        <p className="text-xs text-muted-foreground">{person.company}</p>

        <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
          <MapPin size={11} />
          <span>{person.location}</span>
        </div>

        <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
          <Users size={11} />
          <span>{person.mutual} mutual connections</span>
        </div>

        {/* Reason tag (suggestions only) */}
        {person.reason && (
          <span className="mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground w-fit">
            {person.reason}
          </span>
        )}

        {/* Skills */}
        {person.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {person.skills.slice(0, 3).map(s => (
              <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Connected date (connections only) */}
        {type === "connection" && person.connected && (
          <p className="text-[10px] text-muted-foreground mt-2">
            Connected {person.connected}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          {type === "connection" ? (
            <>
              <Button variant="outline" size="xs" className="flex-1 gap-1">
                <MessageSquare size={11} />
                Message
              </Button>
              <Button
                variant="ghost"
                size="xs"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setRemoved(true)}
              >
                Remove
              </Button>
            </>
          ) : (
            <Button
              size="xs"
              variant={requested ? "secondary" : "default"}
              className="flex-1 gap-1"
              onClick={handleConnect}
              disabled={requested}
            >
              {requested ? (
                <><UserCheck size={11} /> Requested</>
              ) : (
                <><UserPlus size={11} /> Connect</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionCard;
