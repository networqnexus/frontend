import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { getOrg, followOrg, addAdmin, removeAdmin, sendInvite, getInvites, cancelInvite, updateOrg, leaveOrg } from "@/api/orgApi";
import useAuth from "@/hooks/useAuth";
import {
  Building2, MapPin, Globe, Users, Briefcase, Calendar, BadgeCheck,
  Plus, Settings, ExternalLink, Loader2, X, UserPlus, LayoutDashboard,
  ChevronRight, IndianRupee, Mail, Clock, Camera, ImagePlus, LogOut
} from "lucide-react";

const INDUSTRY_COLORS = {
  "Technology":    "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  "Finance":       "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  "Healthcare":    "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  "Education":     "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  "default":       "bg-primary/10 text-primary",
};

const PersonCard = ({ person, role, isYou, onView, showRemove, onRemove }) => (
  <div className="flex flex-col items-center p-3 rounded-xl border border-border/50 hover:border-border hover:bg-muted/30 transition-all text-center">
    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary overflow-hidden shrink-0 mb-2">
      {person?.avatarUrl
        ? <img src={person.avatarUrl} className="w-full h-full object-cover" alt=""/>
        : <span>{person?.name?.[0]?.toUpperCase()}</span>}
    </div>
    <p className="text-xs font-semibold text-foreground w-full truncate leading-tight">
      {person?.name}
      {isYou && <span className="ml-1 text-[9px] font-semibold px-1 py-0.5 rounded-full bg-primary/10 text-primary">You</span>}
    </p>
    <p className="text-[10px] text-muted-foreground mt-0.5 w-full truncate">{role}</p>
    <div className="flex items-center gap-1.5 mt-2">
      <button onClick={onView} className="text-[10px] text-primary hover:underline font-medium">View</button>
      {showRemove && (
        <>
          <span className="text-[10px] text-muted-foreground">·</span>
          <button onClick={onRemove} className="text-[10px] text-destructive hover:underline">Remove</button>
        </>
      )}
    </div>
  </div>
);

const OrganizationPage = () => {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const [org,           setOrg]           = useState(null);
  const [jobs,          setJobs]          = useState([]);
  const [members,       setMembers]       = useState([]);
  const [isFollowing,   setIsFollowing]   = useState(false);
  const [isOwner,       setIsOwner]       = useState(false);
  const [isAdmin,       setIsAdmin]       = useState(false);
  const [isMember,      setIsMember]      = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [following,     setFollowing]     = useState(false);
  const [addingAdmin,   setAddingAdmin]   = useState(false);
  const [adminInput,    setAdminInput]    = useState("");
  const [adminError,    setAdminError]    = useState("");
  const [showAddAdmin,  setShowAddAdmin]  = useState(false);
  const [showInvite,    setShowInvite]    = useState(false);
  const [inviteEmail,   setInviteEmail]   = useState("");
  const [inviteRole,    setInviteRole]    = useState("employee");
  const [inviting,      setInviting]      = useState(false);
  const [inviteMsg,     setInviteMsg]     = useState("");
  const [pendingInvites,setPendingInvites]= useState([]);
  const [imageUploading, setImageUploading] = useState(null); // "logo" | "cover" | null
  const [leaving,        setLeaving]        = useState(false);

  useEffect(() => { loadOrg(); }, [slug]);

  const loadOrg = async () => {
    setLoading(true);
    try {
      const d = await getOrg(slug);
      setOrg(d.org);
      setJobs(d.jobs || []);
      setMembers(d.members || []);
      setIsFollowing(d.isFollowing);
      setIsOwner(d.isOwner);
      setIsAdmin(d.isAdmin);
      setIsMember(d.isMember);
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

  const handleImageUpload = async (file, type) => {
    if (!file) return;
    setImageUploading(type);
    try {
      const fd = new FormData();
      fd.append(type === "logo" ? "logo" : "cover", file);
      const d = await updateOrg(org._id, fd);
      setOrg(o => ({ ...o, logoUrl: d.org.logoUrl, coverUrl: d.org.coverUrl }));
    } catch {}
    setImageUploading(null);
  };

  const handleLeave = async () => {
    if (!window.confirm(`Are you sure you want to leave ${org.name}? You will lose access immediately.`)) return;
    setLeaving(true);
    try {
      await leaveOrg(org._id);
      navigate("/feed");
    } catch (e) {
      alert(e.message || "Could not leave organization.");
    }
    setLeaving(false);
  };

  const handleRemoveAdmin = async (userId) => {
    try {
      await removeAdmin(org._id, userId);
      setOrg(o => ({ ...o, admins: o.admins.filter(a => a._id !== userId) }));
    } catch {}
  };

  if (loading) return (
    <MainLayout>
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-muted-foreground"/>
      </div>
    </MainLayout>
  );

  if (!org) return null;

  const industryClass  = INDUSTRY_COLORS[org.industry] || INDUSTRY_COLORS.default;
  const canManage      = isOwner || isAdmin;
  const isConnected    = isOwner || isAdmin || isMember;
  const totalMembers   = 1 + (org.admins?.length || 0) + members.length;

  return (
    <MainLayout>
      <div className="flex flex-col gap-4 max-w-4xl mx-auto">

        {/* ── Header card ─────────────────────────────────────────── */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {/* Cover */}
          <div className="h-48 bg-gradient-to-br from-primary/30 via-primary/15 to-muted relative group/cover">
            {org.coverUrl && (
              <img src={org.coverUrl} className="w-full h-full object-cover absolute inset-0" alt=""/>
            )}
            {canManage && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity cursor-pointer">
                {imageUploading === "cover"
                  ? <Loader2 size={22} className="text-white animate-spin"/>
                  : <div className="flex items-center gap-2 bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
                      <ImagePlus size={14}/> Change cover
                    </div>}
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => handleImageUpload(e.target.files[0], "cover")}/>
              </label>
            )}
          </div>

          {/* Logo + actions */}
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-12 mb-4">
              <div className="relative w-24 h-24 rounded-2xl border-4 border-card bg-muted flex items-center justify-center overflow-hidden shadow-md shrink-0 group/logo">
                {org.logoUrl
                  ? <img src={org.logoUrl} className="w-full h-full object-cover" alt=""/>
                  : <Building2 size={36} className="text-muted-foreground"/>}
                {canManage && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover/logo:opacity-100 transition-opacity cursor-pointer rounded-[14px]">
                    {imageUploading === "logo"
                      ? <Loader2 size={18} className="text-white animate-spin"/>
                      : <Camera size={18} className="text-white"/>}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => handleImageUpload(e.target.files[0], "logo")}/>
                  </label>
                )}
              </div>
              <div className="flex items-center gap-2 pb-1">
                {canManage && (
                  <Button variant="outline" size="sm" className="gap-1.5 h-8"
                    onClick={() => navigate(`/org/${slug}/workspace`)}>
                    <LayoutDashboard size={12}/> Workspace
                  </Button>
                )}
                {isOwner && (
                  <Button variant="outline" size="sm" className="gap-1.5 h-8"
                    onClick={() => navigate(`/org/${slug}/settings`)}>
                    <Settings size={12}/> Manage
                  </Button>
                )}
                {!isOwner && (
                  <Button size="sm" variant={isFollowing ? "outline" : "default"}
                    onClick={handleFollow} disabled={following} className="gap-1.5 h-8">
                    {following
                      ? <Loader2 size={12} className="animate-spin"/>
                      : isFollowing
                        ? <><BadgeCheck size={12}/>Following</>
                        : <><Plus size={12}/>Follow</>}
                  </Button>
                )}
                {(isAdmin || isMember) && !isOwner && (
                  <Button size="sm" variant="outline"
                    onClick={handleLeave} disabled={leaving}
                    className="gap-1.5 h-8 text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive">
                    {leaving
                      ? <Loader2 size={12} className="animate-spin"/>
                      : <><LogOut size={12}/>Leave</>}
                  </Button>
                )}
              </div>
            </div>

            {/* Name / tagline / meta */}
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{org.name}</h1>
              {org.verified && <BadgeCheck size={20} className="text-primary shrink-0"/>}
              {org.industry && (
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${industryClass}`}>
                  {org.industry}
                </span>
              )}
            </div>
            {org.tagline && (
              <p className="text-sm text-muted-foreground mt-1">{org.tagline}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-muted-foreground">
              {org.location && (
                <span className="flex items-center gap-1.5"><MapPin size={12}/>{org.location}</span>
              )}
              {org.size && (
                <span className="flex items-center gap-1.5"><Users size={12}/>{org.size} employees</span>
              )}
              {org.foundedYear && (
                <span className="flex items-center gap-1.5"><Calendar size={12}/>Founded {org.foundedYear}</span>
              )}
              <span className="flex items-center gap-1.5">
                <Users size={12}/>
                <strong className="text-foreground">{org.followers?.length || 0}</strong>&nbsp;followers
              </span>
            </div>
            {org.website && (
              <a href={org.website.startsWith("http") ? org.website : `https://${org.website}`}
                target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-2">
                <Globe size={12}/>{org.website}<ExternalLink size={10}/>
              </a>
            )}
          </div>
        </div>

        {/* ── Content grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left main column */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* About */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-foreground">About</h2>
                {canManage && !org.description && (
                  <button onClick={() => navigate(`/org/${slug}/settings`)}
                    className="text-xs text-primary hover:underline">+ Add description</button>
                )}
              </div>
              {org.description ? (
                <p className="text-sm text-foreground/80 leading-relaxed">{org.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  {canManage ? "No description yet — add one in settings." : "No description available."}
                </p>
              )}

              {/* Details grid */}
              {(org.website || org.industry || org.size || org.foundedYear || org.location) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 pt-4 border-t border-border/50">
                  {org.website && (
                    <div className="flex items-start gap-2">
                      <Globe size={14} className="text-muted-foreground mt-0.5 shrink-0"/>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Website</p>
                        <a href={org.website.startsWith("http") ? org.website : `https://${org.website}`}
                          target="_blank" rel="noreferrer"
                          className="text-xs text-primary hover:underline break-all">{org.website}</a>
                      </div>
                    </div>
                  )}
                  {org.industry && (
                    <div className="flex items-start gap-2">
                      <Briefcase size={14} className="text-muted-foreground mt-0.5 shrink-0"/>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Industry</p>
                        <p className="text-xs text-foreground">{org.industry}</p>
                      </div>
                    </div>
                  )}
                  {org.size && (
                    <div className="flex items-start gap-2">
                      <Users size={14} className="text-muted-foreground mt-0.5 shrink-0"/>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Company Size</p>
                        <p className="text-xs text-foreground">{org.size} employees</p>
                      </div>
                    </div>
                  )}
                  {org.foundedYear && (
                    <div className="flex items-start gap-2">
                      <Calendar size={14} className="text-muted-foreground mt-0.5 shrink-0"/>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Founded</p>
                        <p className="text-xs text-foreground">{org.foundedYear}</p>
                      </div>
                    </div>
                  )}
                  {org.location && (
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-muted-foreground mt-0.5 shrink-0"/>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Headquarters</p>
                        <p className="text-xs text-foreground">{org.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Services */}
            {(org.services?.length > 0 || canManage) && (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-foreground">Services</h2>
                  {canManage && (
                    <button onClick={() => navigate(`/org/${slug}/settings`)}
                      className="text-xs text-primary hover:underline">
                      {org.services?.length ? "Edit" : "+ Add services"}
                    </button>
                  )}
                </div>
                {org.services?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {org.services.map((s, i) => (
                      <span key={i}
                        className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No services listed yet —{" "}
                    <button onClick={() => navigate(`/org/${slug}/settings`)}
                      className="text-primary hover:underline not-italic">add them in settings</button>.
                  </p>
                )}
              </div>
            )}

            {/* Open Positions */}
            {jobs.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-foreground">Open Positions</h2>
                  <Link to="/jobs" className="text-xs text-primary hover:underline">View all jobs</Link>
                </div>
                <div className="flex flex-col gap-2">
                  {jobs.map(job => (
                    <Link key={job._id} to="/jobs"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 border border-border/50 transition-colors group">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-foreground shrink-0">
                        {(job.company?.[0] || org.name?.[0])?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {job.title}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          {job.location && <span className="flex items-center gap-1"><MapPin size={10}/>{job.location}</span>}
                          {job.type     && <span className="flex items-center gap-1"><Briefcase size={10}/>{job.type}</span>}
                          {job.salary   && <span className="flex items-center gap-1"><IndianRupee size={10}/>{job.salary}</span>}
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-muted-foreground shrink-0 group-hover:text-primary transition-colors"/>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right column: People ─────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-border bg-card p-5">

              {/* People header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">People</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {totalMembers} member{totalMembers !== 1 ? "s" : ""}
                  </p>
                </div>
                {canManage && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowInvite(v => !v)}
                      className="text-[11px] text-primary hover:underline font-medium flex items-center gap-0.5">
                      <Mail size={11}/> Invite
                    </button>
                    {isOwner && (
                      <button onClick={() => setShowAddAdmin(v => !v)}
                        className="text-[11px] text-muted-foreground hover:text-foreground hover:underline flex items-center gap-0.5">
                        <UserPlus size={11}/> Admin
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Invite form */}
              {showInvite && (
                <div className="mb-4 p-3 rounded-xl bg-muted/50 border border-border flex flex-col gap-2">
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
                <div className="mb-4">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Pending ({pendingInvites.length})
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
                  <div className="border-t border-border/50 mt-2 mb-1"/>
                </div>
              )}

              {/* Add admin form */}
              {showAddAdmin && (
                <div className="mb-4 p-3 rounded-xl bg-muted/50 border border-border">
                  <p className="text-xs font-medium text-foreground mb-1.5">Add admin by username</p>
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

              {/* People grid */}
              <div className="grid grid-cols-2 gap-2">
                {/* Owner */}
                <PersonCard
                  person={org.owner}
                  role="Owner · CEO"
                  isYou={user?.id === org.owner?._id?.toString()}
                  onView={() => navigate(`/profile/${org.owner?.username}`)}
                />

                {/* Admins */}
                {org.admins?.map(a => (
                  <PersonCard
                    key={a._id}
                    person={a}
                    role="HR / Admin"
                    isYou={user?.id === a._id?.toString()}
                    onView={() => navigate(`/profile/${a.username}`)}
                    showRemove={isOwner}
                    onRemove={() => handleRemoveAdmin(a._id)}
                  />
                ))}

                {/* Accepted members */}
                {isConnected && members.map(m => (
                  <PersonCard
                    key={m._id}
                    person={m}
                    role={m.inviteRole === "hr" ? "HR Manager" : m.inviteRole === "admin" ? "Admin" : "Employee"}
                    isYou={user?.id === m._id?.toString()}
                    onView={() => navigate(`/profile/${m.username}`)}
                  />
                ))}
              </div>

              {/* Empty state */}
              {!org.admins?.length && (!isConnected || !members.length) && (
                <p className="text-xs text-muted-foreground text-center py-3">
                  {canManage ? "Invite your team members above" : "No other team members yet"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrganizationPage;
