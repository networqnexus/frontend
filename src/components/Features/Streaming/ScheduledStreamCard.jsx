import { useEffect, useState } from "react";
import { Calendar, Clock, Globe, Lock, Users, Play, Edit2, Trash2, Crown, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

const ScheduledStreamCard = ({ stream, currentUserId, onLaunch, onEdit, onCancel }) => {
  const isHost    = String(stream.host?._id) === String(currentUserId);
  const isInvited = stream.invitedUsers?.some(u => String(u._id || u) === String(currentUserId));

  const scheduledDate = new Date(stream.scheduledAt);
  const [timeLeft, setTimeLeft] = useState("");
  const [isDue,    setIsDue]    = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = scheduledDate - new Date();
      if (diff <= 0) {
        setTimeLeft("Starting now!");
        setIsDue(true);
        return;
      }
      setIsDue(false);
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h >= 24) {
        setTimeLeft(`${Math.floor(h / 24)}d ${h % 24}h`);
      } else if (h > 0) {
        setTimeLeft(`${h}h ${m}m ${s}s`);
      } else if (m > 0) {
        setTimeLeft(`${m}m ${s}s`);
      } else {
        setTimeLeft(`${s}s`);
      }
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [stream.scheduledAt]);

  const formatTime = (d) =>
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d) =>
    d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className={`rounded-xl border bg-card overflow-hidden transition-all ${
      isDue ? "border-red-500 shadow-lg shadow-red-500/10" : "border-border hover:shadow-sm"
    }`}>

      {isDue && isHost && (
        <div className="bg-red-500 text-white text-xs font-bold px-4 py-1.5 flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-ping flex-shrink-0" />
          Tumhara stream ab live hona chahiye! Neeche "Go Live Now" dabao.
        </div>
      )}

      <div className="p-4 flex gap-3">
        <div className={`flex-shrink-0 w-12 h-14 rounded-lg flex flex-col items-center justify-center border ${
          isDue ? "bg-red-500/10 border-red-500/30" : "bg-primary/10 border-primary/20"
        }`}>
          <span className={`text-[9px] font-bold uppercase leading-none tracking-wide ${isDue ? "text-red-400" : "text-primary"}`}>
            {scheduledDate.toLocaleDateString("en-IN", { month: "short" })}
          </span>
          <span className={`text-xl font-black leading-tight ${isDue ? "text-red-400" : "text-primary"}`}>
            {scheduledDate.getDate()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-foreground leading-tight line-clamp-1">{stream.title}</p>
            <div className="flex items-center gap-1 flex-shrink-0">
              {isHost && (
                <span className="flex items-center gap-0.5 text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded-full font-bold">
                  <Crown size={8} /> Host
                </span>
              )}
              {isInvited && !isHost && (
                <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full font-medium">
                  Invited
                </span>
              )}
              {stream.isPublic ? <Globe size={12} className="text-green-500" /> : <Lock size={12} className="text-amber-500" />}
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-0.5">{stream.host?.name}</p>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock size={10} />{formatTime(scheduledDate)}
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Calendar size={10} />{formatDate(scheduledDate)}
            </span>
          </div>

          <div className={`mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg border ${
            isDue
              ? "bg-red-500/10 text-red-400 border-red-500/20"
              : !timeLeft.includes("m") && !timeLeft.includes("h") && !timeLeft.includes("d")
              ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
              : "bg-primary/10 text-primary border-primary/20"
          }`}>
            <Timer size={11} />{timeLeft}
          </div>

          <div className="flex items-center gap-3 mt-1.5">
            {stream.invitedUsers?.length > 0 && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Users size={10} />{stream.invitedUsers.length} invited
              </span>
            )}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{stream.category}</span>
          </div>
        </div>
      </div>

      {isHost && (
        <div className="px-4 pb-3 flex gap-2 border-t border-border pt-3">
          <Button
            size="sm" onClick={() => onLaunch(stream)}
            className={`flex-1 gap-1.5 h-8 text-xs font-semibold ${isDue ? "bg-red-500 hover:bg-red-600 text-white" : "bg-primary hover:bg-primary/90"}`}
          >
            <Play size={11} fill="currentColor" />
            {isDue ? "Go Live Now!" : "Launch Early"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => onEdit(stream)} className="h-8 w-8 p-0" title="Edit">
            <Edit2 size={12} />
          </Button>
          <Button size="sm" variant="outline" onClick={() => onCancel(stream)} className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:border-red-300" title="Cancel">
            <Trash2 size={12} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ScheduledStreamCard;
