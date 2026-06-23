// import { useState, useMemo } from "react";
// import MainLayout from "@/layouts/MainLayout";
// import NetworkStats from "./NetworkStats";
// import PendingRequests from "./PendingRequests";
// import ConnectionCard from "./ConnectionCard";
// import { MY_CONNECTIONS, SUGGESTIONS, INDUSTRIES, LOCATIONS } from "./networkData";
// import { Search, SlidersHorizontal, X } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// const SORT_OPTIONS = ["Recent", "Name A–Z", "Most Mutual"];

// const FilterBar = ({ search, setSearch, industry, setIndustry, location, setLocation, sort, setSort, showFilters, setShowFilters }) => (
//   <div className="rounded-xl border border-border bg-card p-3 flex flex-col gap-3">
//     {/* Search + toggle */}
//     <div className="flex items-center gap-2">
//       <div className="relative flex-1">
//         <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
//         <Input
//           placeholder="Search by name, company, or skill…"
//           className="pl-8 h-8 text-sm"
//           value={search}
//           onChange={e => setSearch(e.target.value)}
//         />
//         {search && (
//           <button
//             onClick={() => setSearch("")}
//             className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
//           >
//             <X size={13} />
//           </button>
//         )}
//       </div>
//       <Button
//         variant={showFilters ? "default" : "outline"}
//         size="sm"
//         className="gap-1.5 shrink-0"
//         onClick={() => setShowFilters(f => !f)}
//       >
//         <SlidersHorizontal size={13} />
//         Filters
//       </Button>
//     </div>

//     {/* Expanded filters */}
//     {showFilters && (
//       <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
//         {/* Industry */}
//         <select
//           value={industry}
//           onChange={e => setIndustry(e.target.value)}
//           className="h-7 text-xs px-2 rounded-lg border border-input bg-transparent text-foreground outline-none focus:border-ring"
//         >
//           {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
//         </select>

//         {/* Location */}
//         <select
//           value={location}
//           onChange={e => setLocation(e.target.value)}
//           className="h-7 text-xs px-2 rounded-lg border border-input bg-transparent text-foreground outline-none focus:border-ring"
//         >
//           {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
//         </select>

//         {/* Sort */}
//         <div className="flex items-center gap-1.5 ml-auto">
//           <span className="text-xs text-muted-foreground">Sort:</span>
//           <div className="flex gap-1">
//             {SORT_OPTIONS.map(opt => (
//               <button
//                 key={opt}
//                 onClick={() => setSort(opt)}
//                 className={`text-xs px-2 py-1 rounded-lg border transition-colors
//                   ${sort === opt
//                     ? "border-primary bg-primary/5 text-primary"
//                     : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
//                   }`}
//               >
//                 {opt}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Clear */}
//         {(industry !== INDUSTRIES[0] || location !== LOCATIONS[0]) && (
//           <button
//             onClick={() => { setIndustry(INDUSTRIES[0]); setLocation(LOCATIONS[0]); }}
//             className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
//           >
//             Clear filters
//           </button>
//         )}
//       </div>
//     )}
//   </div>
// );

// const EmptyState = ({ message }) => (
//   <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
//     <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
//       <Search size={22} className="text-muted-foreground" />
//     </div>
//     <p className="text-sm font-medium text-foreground mb-1">No results found</p>
//     <p className="text-xs text-muted-foreground">{message}</p>
//   </div>
// );

// const Network = () => {
//   const [tab, setTab] = useState("connections");
//   const [search, setSearch] = useState("");
//   const [industry, setIndustry] = useState(INDUSTRIES[0]);
//   const [location, setLocation] = useState(LOCATIONS[0]);
//   const [sort, setSort] = useState("Recent");
//   const [showFilters, setShowFilters] = useState(false);

//   const filterAndSort = (list) => {
//     let result = list.filter(p => {
//       const q = search.toLowerCase();
//       const matchSearch = !q ||
//         p.name.toLowerCase().includes(q) ||
//         p.company.toLowerCase().includes(q) ||
//         p.title.toLowerCase().includes(q) ||
//         p.skills?.some(s => s.toLowerCase().includes(q));
//       const matchLoc = location === LOCATIONS[0] || p.location.includes(location);
//       return matchSearch && matchLoc;
//     });

//     if (sort === "Name A–Z")      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
//     if (sort === "Most Mutual")   result = [...result].sort((a, b) => b.mutual - a.mutual);

//     return result;
//   };

//   const filteredConnections = useMemo(() => filterAndSort(MY_CONNECTIONS), [search, industry, location, sort]);
//   const filteredSuggestions  = useMemo(() => filterAndSort(SUGGESTIONS),    [search, industry, location, sort]);

//   return (
//     <MainLayout>
//       <div className="flex flex-col gap-4">
//         {/* Stats */}
//         <NetworkStats />

//         {/* Pending requests */}
//         <PendingRequests />

//         {/* Tabs */}
//         <Tabs value={tab} onValueChange={setTab}>
//           <div className="flex items-center justify-between gap-3 flex-wrap">
//             <TabsList className="h-9">
//               <TabsTrigger value="connections" className="text-xs gap-1.5">
//                 My Connections
//                 <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted-foreground/20 text-foreground/70 leading-none">
//                   {MY_CONNECTIONS.length}
//                 </span>
//               </TabsTrigger>
//               <TabsTrigger value="suggestions" className="text-xs gap-1.5">
//                 People You May Know
//                 <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted-foreground/20 text-foreground/70 leading-none">
//                   {SUGGESTIONS.length}
//                 </span>
//               </TabsTrigger>
//             </TabsList>
//           </div>

//           {/* Shared filter bar */}
//           <div className="mt-3">
//             <FilterBar
//               search={search} setSearch={setSearch}
//               industry={industry} setIndustry={setIndustry}
//               location={location} setLocation={setLocation}
//               sort={sort} setSort={setSort}
//               showFilters={showFilters} setShowFilters={setShowFilters}
//             />
//           </div>

//           {/* Connections tab */}
//           <TabsContent value="connections" className="mt-4">
//             {filteredConnections.length === 0 ? (
//               <div className="grid">
//                 <EmptyState message="Try a different name, company, or skill" />
//               </div>
//             ) : (
//               <>
//                 <p className="text-xs text-muted-foreground mb-3">
//                   {filteredConnections.length} connection{filteredConnections.length !== 1 ? "s" : ""}
//                   {search && ` matching "${search}"`}
//                 </p>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                   {filteredConnections.map(p => (
//                     <ConnectionCard key={p.id} person={p} type="connection" />
//                   ))}
//                 </div>
//               </>
//             )}
//           </TabsContent>

//           {/* Suggestions tab */}
//           <TabsContent value="suggestions" className="mt-4">
//             {filteredSuggestions.length === 0 ? (
//               <div className="grid">
//                 <EmptyState message="Try adjusting your filters" />
//               </div>
//             ) : (
//               <>
//                 <p className="text-xs text-muted-foreground mb-3">
//                   {filteredSuggestions.length} suggestion{filteredSuggestions.length !== 1 ? "s" : ""}
//                 </p>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                   {filteredSuggestions.map(p => (
//                     <ConnectionCard key={p.id} person={p} type="suggestion" />
//                   ))}
//                 </div>
//               </>
//             )}
//           </TabsContent>
//         </Tabs>
//       </div>
//     </MainLayout>
//   );
// };

// export default Network;

import { useState, useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  getSuggestions, getConnections, getRequests,
  sendRequest, acceptRequest, rejectRequest, removeConnection
} from "@/api/networkApi";
import {
  Search, MapPin, Users, UserPlus, UserCheck,
  Check, X, Loader2, MessageSquare, Eye, TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

// ── Avatar helper ─────────────────────────────────────────────────
const Avatar = ({ user, size = "md" }) => {
  const ini = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  const cls = size === "sm" ? "w-8 h-8 text-xs"
            : size === "lg" ? "w-12 h-12 text-sm"
            : "w-10 h-10 text-sm";
  return (
    <div className={`${cls} rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 overflow-hidden`}>
      {user?.avatarUrl
        ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt=""/>
        : ini}
    </div>
  );
};

// ── Stat cards ────────────────────────────────────────────────────
const StatsRow = ({ connections, requests, suggestions }) => (
  <div className="grid grid-cols-3 gap-3">
    {[
      { label:"Connections",      value:connections, icon:Users,      color:"text-blue-600 bg-blue-50 dark:bg-blue-950"         },
      { label:"Pending Requests", value:requests,    icon:UserCheck,  color:"text-amber-600 bg-amber-50 dark:bg-amber-950"      },
      { label:"Suggestions",      value:suggestions, icon:UserPlus,   color:"text-violet-600 bg-violet-50 dark:bg-violet-950"   },
    ].map(({ label, value, icon: Icon, color }) => (
      <div key={label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
          <Icon size={16}/>
        </div>
        <div>
          <p className="text-xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    ))}
  </div>
);

// ── Person card ───────────────────────────────────────────────────
const PersonCard = ({ user, type, onConnect, onRemove, connected, requested }) => {
  const navigate = useNavigate();
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <Avatar user={user} size="lg"/>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold text-foreground truncate cursor-pointer hover:underline"
            onClick={() => navigate(`/profile/${user.username}`)}
          >
            {user.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">{user.headline || user.title}</p>
          {user.location && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin size={10}/>{user.location}
            </p>
          )}
          {user.connections?.length > 0 && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Users size={10}/>{user.connections.length} connections
            </p>
          )}
        </div>
      </div>

      {user.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {user.skills.slice(0, 3).map(s => (
            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s}</span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border">
        {type === "connection" ? (
          <>
            <Button size="xs" variant="outline" className="flex-1 gap-1"
              onClick={() => navigate("/messages")}>
              <MessageSquare size={11}/>Message
            </Button>
            <Button size="xs" variant="ghost"
              className="text-muted-foreground hover:text-destructive text-xs"
              onClick={() => onRemove(user._id)}>
              Remove
            </Button>
          </>
        ) : (
          <Button
            size="xs"
            className="w-full gap-1"
            variant={connected || requested ? "secondary" : "default"}
            disabled={connected || requested}
            onClick={() => onConnect(user._id)}
          >
            {connected ? <><UserCheck size={11}/>Connected</>
            : requested ? <><UserCheck size={11}/>Requested</>
            : <><UserPlus size={11}/>Connect</>}
          </Button>
        )}
      </div>
    </div>
  );
};

// ── Pending requests panel ────────────────────────────────────────
const PendingPanel = ({ requests, onAccept, onReject }) => {
  if (requests.length === 0) return null;
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Pending Requests</h3>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
          {requests.length}
        </span>
      </div>
      <div className="divide-y divide-border">
        {requests.map(req => (
          <div key={req._id} className="px-4 py-3 flex items-start gap-3">
            <Avatar user={req.requester}/>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{req.requester?.name}</p>
              <p className="text-xs text-muted-foreground">{req.requester?.headline}</p>
              <p className="text-xs text-muted-foreground">
                {req.requester?.connections?.length || 0} mutual connections
              </p>
              <div className="flex gap-2 mt-2">
                <Button size="xs" className="gap-1" onClick={() => onAccept(req._id)}>
                  <Check size={12}/>Accept
                </Button>
                <Button size="xs" variant="outline" onClick={() => onReject(req._id)}>
                  <X size={12}/>Decline
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main Network page ─────────────────────────────────────────────
const Network = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab,         setTab]         = useState("suggestions");
  const [suggestions, setSuggestions] = useState([]);
  const [connections, setConnections] = useState([]);
  const [requests,    setRequests]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [sent,        setSent]        = useState({});

  // Load all data in parallel
  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, c, r] = await Promise.all([
        getSuggestions(),
        getConnections(),
        getRequests(),
      ]);
      setSuggestions(s.users        || []);
      setConnections(c.connections  || []);
      setRequests(r.requests        || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const handleConnect = async (userId) => {
    try {
      await sendRequest(userId);
      setSent(p => ({ ...p, [userId]: true }));
    } catch (e) {
      if (e.message?.includes("50 connections") || e.message?.includes("Premium")) {
        if (window.confirm("Free plan allows only 50 connections.\n\nUpgrade to Premium for unlimited connections?\n\nClick OK to go to the upgrade page.")) {
          navigate("/premium");
        }
      }
    }
  };

  const handleAccept = async (id) => {
    try {
      await acceptRequest(id);
      setRequests(r => r.filter(x => x._id !== id));
      loadAll(); // refresh connections
    } catch {}
  };

  const handleReject = async (id) => {
    try {
      await rejectRequest(id);
      setRequests(r => r.filter(x => x._id !== id));
    } catch {}
  };

  const handleRemove = async (userId) => {
    if (!window.confirm("Remove this connection?")) return;
    try {
      await removeConnection(userId);
      setConnections(c => c.filter(x => x._id !== userId));
    } catch {}
  };

  const filterList = (list) =>
    !search ? list : list.filter(u =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.headline?.toLowerCase().includes(search.toLowerCase()) ||
      u.location?.toLowerCase().includes(search.toLowerCase())
    );

  if (loading) return (
    <MainLayout>
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-muted-foreground"/>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="flex flex-col gap-4">

        {/* Stats */}
        <StatsRow
          connections={connections.length}
          requests={requests.length}
          suggestions={suggestions.length}
        />

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"/>
          <Input
            placeholder="Search by name, headline or location…"
            className="pl-8"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14}/>
            </button>
          )}
        </div>

        {/* Pending requests */}
        <PendingPanel
          requests={requests}
          onAccept={handleAccept}
          onReject={handleReject}
        />

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="suggestions" className="text-xs">
              People You May Know
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-muted-foreground/20">
                {suggestions.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="connections" className="text-xs">
              My Connections
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-muted-foreground/20">
                {connections.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Suggestions */}
          <TabsContent value="suggestions" className="mt-4">
            {filterList(suggestions).length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <UserPlus size={32} className="text-muted-foreground mx-auto mb-3"/>
                <p className="text-sm font-medium text-foreground">No suggestions</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {search ? "Try a different search" : "Invite people to join!"}
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-3">
                  {filterList(suggestions).length} suggestion{filterList(suggestions).length !== 1 ? "s" : ""}
                  {search && ` for "${search}"`}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filterList(suggestions).map(u => (
                    <PersonCard
                      key={u._id}
                      user={u}
                      type="suggestion"
                      onConnect={handleConnect}
                      requested={sent[u._id]}
                      connected={false}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Connections */}
          <TabsContent value="connections" className="mt-4">
            {filterList(connections).length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <Users size={32} className="text-muted-foreground mx-auto mb-3"/>
                <p className="text-sm font-medium text-foreground">No connections yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {search ? "Try a different search" : "Start connecting with people!"}
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-3">
                  {filterList(connections).length} connection{filterList(connections).length !== 1 ? "s" : ""}
                  {search && ` matching "${search}"`}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filterList(connections).map(u => (
                    <PersonCard
                      key={u._id}
                      user={u}
                      type="connection"
                      onRemove={handleRemove}
                      connected={true}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

      </div>
    </MainLayout>
  );
};

export default Network;
