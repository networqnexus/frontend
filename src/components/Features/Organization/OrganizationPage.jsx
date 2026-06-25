import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { getOrg, followOrg, addAdmin, removeAdmin, sendInvite, getInvites, cancelInvite } from "@/api/orgApi";
import useAuth from "@/hooks/useAuth";
import {
  Building2, MapPin, Globe, Users, Briefcase, Calendar, BadgeCheck,
  Plus, Settings, ExternalLink, Loader2, X, UserPlus, LayoutDashboard,
  ChevronRight, IndianRupee, Mail, Clock, Trash2
} from "lucide-react";

const INDUSTRY_COLORS = {
  "Technology": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  "Finance": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  "Healthcare": "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  "Education": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  "default": "bg-primary/10 text-primary",
};

const OrganizationPage = () => {
  const { slug } = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [org,         setOrg]         = useState(null);
  const [jobs,        setJobs]        = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwner,     setIsOwner]     = useState(false);
  const [isAdmin,     setIsAdmin]     = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [following,   setFollowing]   = useState(false);
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [adminInput,  setAdminInput]  = useState("");
  const [adminError,  setAdminError]  = useState("");
  const [showAddAdmin,   setShowAddAdmin]   = useState(false);
  const [showInvite,     setShowInvite]     = useState(false);
  const [inviteEmail,    setInviteEmail]    = useState("");
  const [inviteRole,     setInviteRole]     = useState("employee");
  const [inviting,       setInviting]       = useState(false);
  const [inviteMsg,      setInviteMsg]      = useState("");
  const [pendingInvites, setPendingInvites] = useState([]);

  useEffect(() => { loadOrg(); }, [slug]);

  const loadOrg = async () => {
    setLoading(true);
    try {
      const d = await getOrg(slug);
      setOrg(d.org);
      setJobs(d.jobs || []);
      setIsFollowing(d.isFollowing);
      setIsOwner(d.isOwner);
      setIsAdmin(d.isAdmin);
      if (d.isOwner || d.isAdmin) {
        getInvites(d.org._id).then(r => setPendingInvites(r.invites || [])).catch(() => {});
      }
    } catch { navigate("/feed"); }
    setLoading(false);
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true); setInviteMsg("");
    try {
      await sendInvite(org._id, { email: inviteEmail.trim(), role: inviteRole });
      setInviteMsg("Invite sent successfully!");
      setInviteEmail("");
      getInvites(org._id).then(r => setPendingInvites(r.invites || [])).catch(() => {});
    } catch(e) { setInviteMsg(e.message || "Failed to send invite."); }
    setInviting(false);
  };

  const handleCancelInvite = async (inviteId) => {
    try {
      await cancelInvite(org._id, inviteId);
      setPendingInvites(p => p.filter(i => i._id !== inviteId));
    } catch {}
  };

  const handleFollow = async () => {
    setFollowing(true);
    try {
      const d = await followOrg(org._id);
      setIsFollowing(d.following);
      setOrg(o => ({ ...o, followers: { length: d.followerCount } }));
    } catch {}
    setFollowing(false);
  };

  const handleAddAdmin = async () => {
    if (!adminInput.trim()) return;
    setAddingAdmin(true); setAdminError("");
    try {
      const d = await addAdmin(org._id, adminInput.trim());
      setOrg(o => ({ ...o, admins: [...(o.admins || []), d.admin] }));
      setAdminInput(""); setShowAddAdmin(false);
    } catch(e) { setAdminError(e.message); }
    setAddingAdmin(false);
  };

  const handleRemoveAdmin = async (userId) => {
    try {
      await removeAdmin(org._id, userId);
      setOrg(o => ({ ...o, admins: o.admins.filter(a => a._id !== userId) }));
    } catch {}
  };

  if (loading) return (
    <MainLayout>
      <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-muted-foreground"/></div>
    </MainLayout>
  );

  if (!org) return null;

  const industryClass = INDUSTRY_COLORS[org.industry] || INDUSTRY_COLORS.default;
  const canManage = isOwner || isAdmin;

  return (
    <MainLayout>
      <div className="flex flex-col gap-4 max-w-4xl mx-auto">

        {/* Cover + Logo */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-muted relative">
            {org.coverUrl && <img src={org.coverUrl} className="w-full h-full object-cover absolute inset-0" alt=""/>}
          </div>
          <div className="px-6 pb-5">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="w-20 h-20 rounded-2xl border-4 border-card bg-muted flex items-center justify-center text-2xl font-bold text-foreground shrink-0 overflow-hidden shadow-sm">
                {org.logoUrl ? <img src={org.logoUrl} className="w-full h-full object-cover" alt=""/> : <Building2 size={32} className="text-muted-foreground"/>}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {canManage && (
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(`/org/${slug}/workspace`)}>
                    <LayoutDashboard size={13}/> Workspace
                  </Button>
                )}
                {isOwner && (
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(`/org/${slug}/settings`)}>
                    <Settings size={13}/> Manage
                  </Button>
                )}
                {!isOwner && (
                  <Button size="sm" variant={isFollowing ? "outline" : "default"} onClick={handleFollow} disabled={following} className="gap-1.5">
                    {following ? <Loader2 size={13} className="animate-spin"/> : isFollowing ? "Following" : <><Plus size={13}/>Follow</>}
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">{org.name}</h1>
                  {org.verified && <BadgeCheck size={18} className="text-primary shrink-0"/>}
                </div>
                {org.tagline && <p className="text-sm text-muted-foreground mt-0.5">{org.tagline}</p>}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                  {org.industry && <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${industryClass}`}>{org.industry}</span>}
                  {org.location && <span className="flex items-center gap-1"><MapPin size={11}/>{org.location}</span>}
                  {org.size     && <span className="flex items-center gap-1"><Users size={11}/>{org.size} employees</span>}
                  {org.foundedYear && <span className="flex items-center gap-1"><Calendar size={11}/>Founded {org.foundedYear}</span>}
                  <span className="flex items-center gap-1"><Users size={11}/>{org.followers?.length || 0} followers</span>
                </div>
                {org.website && (
                  <a href={org.website.startsWith("http") ? org.website : `https://${org.website}`} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1.5">
                    <Globe size={11}/>{org.website}<ExternalLink size={10}/>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: About + Team */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* About */}
            {org.description && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold text-foreground mb-2">About</h2>
                <p className="text-sm text-foreground/80 leading-relaxed">{org.description}</p>
              </div>
            )}

            {/* Jobs */}
            {jobs.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-foreground">Open Positions</h2>
                  <Link to="/jobs" className="text-xs text-primary hover:underline">View all jobs</Link>
                </div>
                <div className="flex flex-col gap-2">
                  {jobs.map(job => (
                    <Link key={job._id} to="/jobs" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 border border-border/50 transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                        {job.company?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{job.title}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin size={10}/>{job.location}</span>
                          <span className="flex items-center gap-1"><Briefcase size={10}/>{job.type}</span>
                          {job.salary && <span className="flex items-center gap-1"><IndianRupee size={10}/>{job.salary}</span>}
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-muted-foreground shrink-0"/>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Team */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground">Team</h2>
                {canManage && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowInvite(v => !v)}
                      className="text-xs text-primary hover:underline flex items-center gap-0.5">
                      <Mail size={11}/> Invite
                    </button>
                    {isOwner && (
                      <button onClick={() => setShowAddAdmin(v => !v)}
                        className="text-xs text-muted-foreground hover:underline flex items-center gap-0.5">
                        <UserPlus size={11}/> Add admin
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Invite form */}
              {showInvite && (
                <div className="mb-3 p-3 rounded-xl bg-muted/50 border border-border flex flex-col gap-2">
                  <p className="text-xs font-medium text-foreground">Invite via email</p>
                  <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                    placeholder="colleague@email.com" type="email"
                    onKeyDown={e => e.key === "Enter" && handleSendInvite()}
                    className="h-7 text-xs px-2 rounded-lg border border-input bg-transparent outline-none focus:ring-1 focus:ring-ring"/>
                  <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                    className="h-7 text-xs px-2 rounded-lg border border-input bg-transparent outline-none text-foreground">
                    <option value="employee">Employee</option>
                    <option value="hr">HR Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button size="sm" className="h-7 text-xs" onClick={handleSendInvite} disabled={inviting}>
                    {inviting ? <Loader2 size={11} className="animate-spin"/> : "Send Invite"}
                  </Button>
                  {inviteMsg && (
                    <p className={`text-[10px] ${inviteMsg.includes("success") ? "text-emerald-600" : "text-destructive"}`}>
                      {inviteMsg}
                    </p>
                  )}
                </div>
              )}

              {/* Pending invites */}
              {pendingInvites.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Pending Invites ({pendingInvites.length})
                  </p>
                  {pendingInvites.map(inv => (
                    <div key={inv._id} className="flex items-center gap-2 py-1.5">
                      <Clock size={11} className="text-amber-500 shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-foreground truncate">{inv.email}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{inv.role}</p>
                      </div>
                      <button onClick={() => handleCancelInvite(inv._id)}
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                        <X size={11}/>
                      </button>
                    </div>
                  ))}
                  <div className="border-t border-border/50 mt-2"/>
                </div>
              )}

              {showAddAdmin && (
                <div className="mb-3 p-3 rounded-xl bg-muted/50 border border-border">
                  <p className="text-xs font-medium text-foreground mb-1.5">Add by username</p>
                  <div className="flex gap-2">
                    <input value={adminInput} onChange={e => setAdminInput(e.target.value)}
                      placeholder="username" onKeyDown={e => e.key === "Enter" && handleAddAdmin()}
                      className="flex-1 h-7 text-xs px-2 rounded-lg border border-input bg-transparent outline-none focus:ring-1 focus:ring-ring"/>
                    <Button size="sm" className="h-7 text-xs px-3" onClick={handleAddAdmin} disabled={addingAdmin}>
                      {addingAdmin ? <Loader2 size={11} className="animate-spin"/> : "Add"}
                    </Button>
                  </div>
                  {adminError && <p className="text-[10px] text-destructive mt-1">{adminError}</p>}
                </div>
              )}

              {/* Owner */}
              <div className="flex items-center gap-2.5 py-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary overflow-hidden shrink-0">
                  {org.owner?.avatarUrl ? <img src={org.owner.avatarUrl} className="w-full h-full object-cover" alt=""/> : org.owner?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{org.owner?.name}</p>
                  <p className="text-[10px] text-muted-foreground">Owner · CEO</p>
                </div>
                <button onClick={() => navigate(`/profile/${org.owner?.username}`)} className="text-[10px] text-primary hover:underline shrink-0">View</button>
              </div>

              {/* Admins */}
              {org.admins?.map(a => (
                <div key={a._id} className="flex items-center gap-2.5 py-2 border-t border-border/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary overflow-hidden shrink-0">
                    {a.avatarUrl ? <img src={a.avatarUrl} className="w-full h-full object-cover" alt=""/> : a.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{a.name}</p>
                    <p className="text-[10px] text-muted-foreground">HR / Admin</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => navigate(`/profile/${a.username}`)} className="text-[10px] text-primary hover:underline">View</button>
                    {isOwner && (
                      <button onClick={() => handleRemoveAdmin(a._id)} className="text-[10px] text-destructive hover:underline ml-1">Remove</button>
                    )}
                  </div>
                </div>
              ))}

              {(!org.admins?.length) && (
                <p className="text-xs text-muted-foreground text-center py-2">{isOwner ? "Add your HR team above" : "No other team members yet"}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrganizationPage;
