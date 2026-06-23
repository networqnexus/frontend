import { memo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, UserPlus, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getSuggestions } from "@/api/networkApi";
import { sendRequest } from "@/api/networkApi";

const TRENDING = [
  { tag: "#OpenToWork",     posts: "4.2k posts" },
  { tag: "#ReactJS",        posts: "2.8k posts" },
  { tag: "#AIEngineering",  posts: "6.1k posts" },
  { tag: "#IndianStartups", posts: "1.9k posts" },
  { tag: "#RemoteJobs",     posts: "3.4k posts" },
];

const RightSidebar = memo(() => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [sent, setSent] = useState({});

  useEffect(() => {
    getSuggestions()
      .then(d => setSuggestions((d.users || []).slice(0, 3)))
      .catch(() => {});
  }, []);

  const handleConnect = async (id) => {
    try { await sendRequest(id); setSent(p => ({ ...p, [id]: true })); } catch {}
  };

  const getInitials = (name) => name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  return (
    <div className="flex flex-col gap-4">

      {/* People you may know */}
      {suggestions.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">People you may know</h3>
            <Button variant="ghost" size="xs" onClick={() => navigate("/network")}>
              See all <ChevronRight size={12} />
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {suggestions.map(u => (
              <div key={u._id} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/profile/${u.username}`)}
                >
                  {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover" alt="" /> : getInitials(u.name)}
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/profile/${u.username}`)}>
                  <p className="text-sm font-medium text-foreground truncate leading-tight hover:text-primary transition-colors">{u.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.headline || u.location}</p>
                </div>
                <Button variant="outline" size="xs" className="shrink-0" disabled={sent[u._id]} onClick={() => handleConnect(u._id)}>
                  <UserPlus size={11} />
                  {sent[u._id] ? "Sent" : "Connect"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Trending in your network</h3>
        </div>
        <div className="flex flex-col gap-1">
          {TRENDING.map(t => (
            <button key={t.tag} className="flex items-center justify-between group hover:bg-muted/50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{t.tag}</span>
              <span className="text-xs text-muted-foreground">{t.posts}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="text-[10px] text-muted-foreground text-center leading-relaxed px-2">
        Networq Nexus © 2025 · <button className="hover:underline">Privacy</button> · <button className="hover:underline">Terms</button>
      </p>
    </div>
  );
});

RightSidebar.displayName = "RightSidebar";
export default RightSidebar;
