import { useEffect, useState, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home, Users, Briefcase, MessageSquare, Layers, BarChart2,
  UserCheck, ClipboardList, Building2, Radio, Settings, HelpCircle
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import useAuth from "@/hooks/useAuth";
import { getStats } from "@/api/profileApi";

const mainLinks = [
  { label:"Feed",     icon:Home,          path:"/feed"      },
  { label:"Network",  icon:Users,         path:"/network"   },
  { label:"Jobs",     icon:Briefcase,     path:"/jobs"      },
  { label:"Messages", icon:MessageSquare, path:"/messages"  },
  { label:"Projects", icon:Layers,        path:"/projects"  },
];

const toolLinks = [
  { label:"ATS",       icon:UserCheck,    path:"/ats",       badge:"Pro" },
  { label:"CRM",       icon:ClipboardList,path:"/crm",       badge:"Pro" },
  { label:"HRMS",      icon:Building2,    path:"/hrms",      badge:"Pro" },
  { label:"Streaming", icon:Radio,        path:"/streaming"              },
  { label:"Analytics", icon:BarChart2,    path:"/analytics"              },
];

const bottomLinks = [
  { label:"Settings", icon:Settings,   path:"/settings" },
  { label:"Help",     icon:HelpCircle, path:"/help"     },
];

const NavLink = ({ label, icon: Icon, path, badge }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const active   = location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <button onClick={() => navigate(path)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group
        ${active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
      <Icon size={16} className={active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}/>
      <span className="flex-1 text-left">{label}</span>
      {badge && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary leading-none">{badge}</span>}
    </button>
  );
};

const Sidebar = memo(() => {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const [stats, setStats] = useState(null);

  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  // Fetch real stats from API
  useEffect(() => {
    if (!user) return;
    getStats()
      .then(d => setStats(d.stats))
      .catch(() => {});
  }, [user]);

  return (
    <div className="flex flex-col gap-1">

      {/* Profile card */}
      <div
        className="rounded-xl border border-border bg-card p-4 mb-3 cursor-pointer hover:shadow-sm transition-shadow"
        onClick={() => navigate(`/profile/${user?.username || "me"}`)}
      >
        {/* Avatar + name */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0 overflow-hidden">
            {user?.avatarUrl
              ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt=""/>
              : initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.headline || "No headline yet"}
            </p>
          </div>
        </div>

        {/* Real stats */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg bg-muted/50 p-2 hover:bg-muted transition-colors">
            <p className="text-sm font-bold text-foreground">
              {stats?.connections ?? user?.connections?.length ?? 0}
            </p>
            <p className="text-[10px] text-muted-foreground">Connections</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2 hover:bg-muted transition-colors">
            <p className="text-sm font-bold text-foreground">
              {stats?.profileViews ?? 0}
            </p>
            <p className="text-[10px] text-muted-foreground">Profile views</p>
          </div>
        </div>

        {/* Open to work badge */}
        {user?.openToWork && (
          <div className="mt-2 text-center">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              ✓ Open to Work
            </span>
          </div>
        )}
      </div>

      {/* Main nav */}
      <div className="flex flex-col gap-0.5">
        {mainLinks.map(l => <NavLink key={l.path} {...l}/>)}
      </div>

      <Separator className="my-2"/>

      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">
        Tools
      </p>
      <div className="flex flex-col gap-0.5">
        {toolLinks.map(l => <NavLink key={l.path} {...l}/>)}
      </div>

      <Separator className="my-2"/>

      <div className="flex flex-col gap-0.5">
        {bottomLinks.map(l => <NavLink key={l.path} {...l}/>)}
      </div>
    </div>
  );
});

Sidebar.displayName = "Sidebar";
export default Sidebar;
