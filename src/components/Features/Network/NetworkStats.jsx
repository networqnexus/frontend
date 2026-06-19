import { Users, UserCheck, Eye, TrendingUp } from "lucide-react";

const stats = [
  { label: "Connections",      value: "142",  icon: Users,      color: "text-blue-600 bg-blue-50 dark:bg-blue-950"     },
  { label: "Pending Requests", value: "3",    icon: UserCheck,  color: "text-amber-600 bg-amber-50 dark:bg-amber-950"  },
  { label: "Profile Views",    value: "248",  icon: Eye,        color: "text-violet-600 bg-violet-50 dark:bg-violet-950"},
  { label: "Search Appearances",value:"93",   icon: TrendingUp, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950"},
];

const NetworkStats = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
    {stats.map(({ label, value, icon: Icon, color }) => (
      <div key={label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
          <Icon size={16} />
        </div>
        <div>
          <p className="text-xl font-bold text-foreground leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      </div>
    ))}
  </div>
);

export default NetworkStats;
