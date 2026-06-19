import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Zap, Search, Bell, MessageSquare, Home, Users, Briefcase,
  BarChart2, Menu, X, ChevronDown, Layers, LogOut, User, Settings, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggleButton } from "@/components/ui/ThemeToggle";
import useAuth from "@/hooks/useAuth";
import { getNotifications, markAllRead } from "@/api/notificationApi";
import { search } from "@/api/searchApi";

const navItems = [
  { label:"Home",     icon:Home,      path:"/feed"      },
  { label:"Network",  icon:Users,     path:"/network"   },
  { label:"Jobs",     icon:Briefcase, path:"/jobs"      },
  { label:"Projects", icon:Layers,    path:"/projects"  },
  { label:"Analytics",icon:BarChart2, path:"/analytics" },
];

const Header = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [profileOpen,   setProfileOpen]   = useState(false);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread,        setUnread]        = useState(0);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching,     setSearching]     = useState(false);
  const searchTimeout = useRef(null);
  const userInitial = user?.name ? user.name[0].toUpperCase() : "U";

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications || []);
      setUnread(data.unreadCount || 0);
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try { await markAllRead(); setUnread(0); setNotifications(n => n.map(x => ({...x,read:true}))); } catch {}
  };

  const handleSearch = (q) => {
    setSearchQuery(q);
    clearTimeout(searchTimeout.current);
    if (!q.trim()) { setSearchResults(null); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try { const data = await search(q); setSearchResults(data.results); } catch {}
      setSearching(false);
    }, 400);
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const timeAgo = (d) => {
    const m = Math.floor((Date.now()-new Date(d))/60000);
    if(m<1)return"now";if(m<60)return`${m}m`;if(m<1440)return`${Math.floor(m/60)}h`;return`${Math.floor(m/1440)}d`;
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">

        {/* Logo */}
        <button onClick={() => navigate("/feed")} className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:opacity-80 transition-opacity">
            <Zap size={16} className="text-primary-foreground fill-primary-foreground"/>
          </div>
          <span className="font-semibold text-sm text-foreground hidden sm:block">Networq Nexus</span>
        </button>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"/>
          <Input placeholder="Search people, posts, jobs..."
            className="pl-8 h-8 text-sm bg-muted/50 border-transparent focus:bg-background"
            value={searchQuery} onChange={e => handleSearch(e.target.value)}/>
          {searchQuery && <button onClick={() => { setSearchQuery(""); setSearchResults(null); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"><X size={13}/></button>}

          {/* Search results */}
          {searchResults && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 max-h-80 overflow-y-auto">
              {searchResults.people?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground px-3 pt-2 pb-1 uppercase tracking-wider">People</p>
                  {searchResults.people.slice(0,3).map(p => (
                    <button key={p._id} onClick={() => { navigate(`/profile/${p.username}`); setSearchResults(null); setSearchQuery(""); }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors text-left">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 overflow-hidden">
                        {p.avatarUrl ? <img src={p.avatarUrl} className="w-full h-full object-cover" alt=""/> : p.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{p.headline}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {searchResults.jobs?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground px-3 pt-2 pb-1 uppercase tracking-wider">Jobs</p>
                  {searchResults.jobs.slice(0,2).map(j => (
                    <button key={j._id} onClick={() => { navigate("/jobs"); setSearchResults(null); setSearchQuery(""); }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors text-left">
                      <Briefcase size={14} className="text-muted-foreground shrink-0"/>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{j.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{j.company}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {!searchResults.people?.length && !searchResults.jobs?.length && !searching && (
                <div className="px-3 py-4 text-center text-sm text-muted-foreground">No results found</div>
              )}
            </div>
          )}
        </div>

        {/* Nav — desktop */}
        <nav className="hidden lg:flex items-center gap-0.5 mx-2">
          {navItems.map(({ label, icon: Icon, path }) => {
            const active = location.pathname === path;
            return (
              <button key={path} onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-w-[52px]
                  ${active ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
                <Icon size={18}/><span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-1">

          {/* 🌙 Theme toggle */}
          <ThemeToggleButton />

          {/* Messages */}
          <Button variant="ghost" size="icon-sm" className="relative" onClick={() => navigate("/messages")}>
            <MessageSquare size={18}/>
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="icon-sm" className="relative" onClick={() => setNotifOpen(o=>!o)}>
              <Bell size={18}/>
              {unread > 0 && <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-[9px] font-bold text-white">{unread>9?"9+":unread}</span>}
            </Button>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)}/>
                <div className="absolute right-0 top-full mt-1 w-80 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                    {unread > 0 && <button onClick={handleMarkAllRead} className="text-xs text-primary hover:underline flex items-center gap-1"><Check size={11}/>Mark all read</button>}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-border">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet</div>
                    ) : notifications.map(n => (
                      <div key={n._id} className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer ${!n.read?"bg-primary/5":""}`}
                        onClick={() => { navigate(n.link||"/feed"); setNotifOpen(false); }}>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 overflow-hidden">
                          {n.sender?.avatarUrl ? <img src={n.sender.avatarUrl} className="w-full h-full object-cover" alt=""/> : n.sender?.name?.[0]?.toUpperCase()||"N"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground leading-tight"><span className="font-semibold">{n.sender?.name}</span> {n.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(n.createdAt)}</p>
                        </div>
                        {!n.read && <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1"/>}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button onClick={() => setProfileOpen(o=>!o)} className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-lg hover:bg-muted transition-colors">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground overflow-hidden">
                {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt=""/> : userInitial}
              </div>
              <ChevronDown size={12} className="text-muted-foreground hidden sm:block"/>
            </button>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)}/>
                <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden py-1">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <button onClick={() => { navigate(`/profile/${user?.username||"me"}`); setProfileOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                    <User size={14}/>View Profile
                  </button>
                  <button onClick={() => { navigate("/settings"); setProfileOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                    <Settings size={14}/>Settings
                  </button>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors">
                    <LogOut size={14}/>Sign Out
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <Button variant="ghost" size="icon-sm" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={18}/> : <Menu size={18}/>}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background px-4 py-3 flex gap-2 overflow-x-auto">
          {navItems.map(({ label, icon: Icon, path }) => (
            <button key={path} onClick={() => { navigate(path); setMobileOpen(false); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                ${location.pathname===path?"bg-muted text-foreground":"text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
              <Icon size={16}/>{label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
