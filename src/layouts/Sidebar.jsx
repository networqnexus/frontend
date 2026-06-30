import { useEffect, useState, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home, Users, Briefcase, MessageSquare, Layers, BarChart2,
  UserCheck, ClipboardList, Building2, Radio, Settings, HelpCircle, CalendarDays, Crown, Plus
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import useAuth from "@/hooks/useAuth";
import { getStats } from "@/api/profileApi";
import { getMyOrg } from "@/api/orgApi";
import CreateOrgModal from "@/components/Features/Organization/CreateOrgModal";

const mainLinks = [
  { label:"Feed",      icon:Home,          path:"/feed"       },
  { label:"Network",   icon:Users,         path:"/network"    },
  { label:"Jobs",      icon:Briefcase,     path:"/jobs"       },
  { label:"Chats",     icon:MessageSquare, path:"/messages"   },
  { label:"Events",    icon:CalendarDays,  path:"/events"     },
  { label:"Streaming", icon:Radio,         path:"/streaming"  },
  { label:"Projects",  icon:Layers,        path:"/projects"   },
];

// Employee (default) — Analytics only
const employeeTools = [
  { label:"Analytics", icon:BarChart2, path:"/analytics" },
];
// Recruiter / HR (no org) — hiring + analytics tools
const recruiterTools = [
  { label:"ATS",       icon:UserCheck,     path:"/ats",       badge:"Pro" },
  { label:"CRM",       icon:ClipboardList, path:"/crm",       badge:"Pro" },
  { label:"HRMS",      icon:Building2,     path:"/hrms",      badge:"Pro" },
  { label:"Analytics", icon:BarChart2,     path:"/analytics"              },
];

const bottomLinks = [
  { label:"Settings", icon:Settings,   path:"/settings" },
  { label:"Help",     icon:HelpCircle, path:"/help"     },
];

const PremiumLink = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname.startsWith("/premium");
  return (
    <button
      onClick={() => { navigate("/premium"); onNavigate?.(); }}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors group
        ${active
          ? "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
          : "text-yellow-600 dark:text-yellow-500 hover:bg-yellow-500/10"}`}
    >
      <Crown size={16} className="text-yellow-500" />
      <span className="flex-1 text-left">Premium</span>
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 leading-none">PRO</span>
    </button>
  );
};

const NavLink = ({ label, icon: Icon, path, badge, onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const active   = location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <button onClick={() => { navigate(path); onNavigate?.(); }}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group
        ${active
          ? "bg-primary text-primary-foreground dark:bg-muted dark:text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
      <Icon size={16} className={active ? "text-primary-foreground dark:text-foreground" : "text-muted-foreground group-hover:text-foreground"}/>
      <span className="flex-1 text-left">{label}</span>
      {badge && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary leading-none">{badge}</span>}
    </button>
  );
};

const Sidebar = memo(({ onNavigate }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [myOrg, setMyOrg] = useState(null);
  const [orgLoaded, setOrgLoaded] = useState(false);
  const [showCreateOrg, setShowCreateOrg] = useState(false);

  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  useEffect(() => {
    if (!user) return;
    getStats().then(d => setStats(d.stats)).catch(() => {});
    getMyOrg().then(d => {
      const org  = d.owned || d.adminOf?.[0] || d.memberOf || null;
      const role = d.owned ? "Owner" : d.adminOf?.[0] ? "Admin" : d.memberOf ? "Member" : null;
      setMyOrg(org ? { ...org, myRole: role } : null);
    }).catch(() => {}).finally(() => setOrgLoaded(true));
  }, [user]);

  return (
    <div className="flex flex-col gap-1">

      {/* Profile card */}
      <div
        className="rounded-xl border border-primary/20 bg-primary/5 dark:bg-card dark:border-border p-4 mb-3 cursor-pointer hover:shadow-sm transition-shadow"
        onClick={() => { navigate(`/profile/${user?.username || "me"}`); onNavigate?.(); }}
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
          <div className="rounded-lg bg-primary/8 dark:bg-muted/50 p-2 hover:bg-primary/15 dark:hover:bg-muted transition-colors">
            <p className="text-sm font-bold text-primary dark:text-foreground">
              {stats?.connections ?? user?.connections?.length ?? 0}
            </p>
            <p className="text-[10px] lg:text-[8px] xl:text-[10px] text-muted-foreground">Connections</p>
          </div>
          <div className="rounded-lg bg-primary/8 dark:bg-muted/50 p-2 hover:bg-primary/15 dark:hover:bg-muted transition-colors">
            <p className="text-sm font-bold text-primary dark:text-foreground">
              {stats?.profileViews ?? 0}
            </p>
            <p className="text-[10px] lg:text-[8px] xl:text-[10px] text-muted-foreground">Profile views</p>
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
        {mainLinks.map(l => <NavLink key={l.path} {...l} onNavigate={onNavigate}/>)}
      </div>

      <Separator className="my-2"/>

      {/* WorkSpace — role-based only, wait for auth to verify */}
      {!authLoading && orgLoaded && (() => {
        const activeTools = (user?.role === "recruiter" || user?.role === "hr")
          ? recruiterTools
          : employeeTools;
        return (
          <>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">WorkSpace</p>
            <div className="flex flex-col gap-0.5">
              {activeTools.map(l => <NavLink key={l.path} {...l} onNavigate={onNavigate}/>)}
            </div>
            <Separator className="my-2"/>
          </>
        );
      })()}

      {/* Organization section */}
      {orgLoaded && (
        <>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">Organization</p>
          {myOrg ? (
            <button
              onClick={() => { navigate(`/org/${myOrg.slug}`); onNavigate?.(); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group
                ${location.pathname.startsWith(`/org/${myOrg.slug}`)
                  ? "bg-primary text-primary-foreground dark:bg-muted dark:text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
              <div className="w-4 h-4 rounded bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                {myOrg.logoUrl ? <img src={myOrg.logoUrl} className="w-full h-full object-cover" alt=""/> : <Building2 size={10} className="text-primary"/>}
              </div>
              <span className="flex-1 text-left truncate">{myOrg.name}</span>
              {myOrg.myRole && (
                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                  {myOrg.myRole}
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={() => setShowCreateOrg(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors group">
              <Plus size={16} className="text-muted-foreground group-hover:text-foreground"/>
              <span className="flex-1 text-left">Create Organization</span>
            </button>
          )}
          <Separator className="my-2"/>
        </>
      )}

      <div className="flex flex-col gap-0.5">
        <PremiumLink onNavigate={onNavigate}/>
        {bottomLinks.map(l => <NavLink key={l.path} {...l} onNavigate={onNavigate}/>)}
      </div>

      {showCreateOrg && (
        <CreateOrgModal
          onClose={() => setShowCreateOrg(false)}
          onCreated={(org) => { setMyOrg(org); setShowCreateOrg(false); }}
        />
      )}
    </div>
  );
});

Sidebar.displayName = "Sidebar";
export default Sidebar;
