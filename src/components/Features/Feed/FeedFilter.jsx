import { Flame, Users, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const TABS = [
  { key: "foryou",     label: "For You",    icon: Sparkles },
  { key: "following",  label: "Following",  icon: Users    },
  { key: "trending",   label: "Trending",   icon: Flame    },
];

const FeedFilter = ({ active, onChange, onRefresh, loading }) => {
  return (
    <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2">
      <div className="flex items-center gap-0.5">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${active === key
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onRefresh}
        className={`text-muted-foreground transition-transform ${loading ? "animate-spin" : ""}`}
      >
        <RefreshCw size={14} />
      </Button>
    </div>
  );
};

export default FeedFilter;
