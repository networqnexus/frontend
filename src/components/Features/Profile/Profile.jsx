import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getProfile, getMe, updateProfile, endorseSkill } from "@/api/profileApi";
import { sendRequest } from "@/api/networkApi";
import { likePost } from "@/api/postApi";
import useAuth from "@/hooks/useAuth";
import {
  MapPin, Link2, Edit3, Plus, Briefcase, GraduationCap, Award,
  Star, ThumbsUp, MessageCircle, ExternalLink, CheckCircle2,
  Users, Eye, MoreHorizontal, Camera, Loader2, X, Crown
} from "lucide-react";

const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${type==="error"?"bg-destructive text-destructive-foreground":"bg-foreground text-background"}`}>
    {message}<button onClick={onClose}><X size={14}/></button>
  </div>
);

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("about");
  const [connected, setConnected] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [showAllSkills, setShowAllSkills] = useState(false);
  const fileRef = useRef(null);
  const coverRef = useRef(null);

  const isOwnProfile = !id || id === "me" || id === currentUser?.username || id === currentUser?.id;
  const showToast = (msg, type="success") => { setToast({message:msg,type}); setTimeout(()=>setToast(null),3000); };

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      let data;
      if (isOwnProfile) {
        data = await getMe();
        setProfile(data.user);
      } else {
        data = await getProfile(id);
        setProfile(data.user);
        setPosts(data.posts || []);
        setConnected(data.user.connections?.some(c => c._id === currentUser?.id || c === currentUser?.id));
      }
      if (isOwnProfile) {
        const myPosts = await import("@/api/postApi").then(m => m.getMyPosts());
        setPosts(myPosts.posts || []);
      }
    } catch (e) { showToast(e.message, "error"); }
    setLoading(false);
  };

  const handleConnect = async () => {
    if (!profile) return;
    setRequesting(true);
    try { await sendRequest(profile._id); setConnected(true); showToast("Connection request sent!"); }
    catch (e) { showToast(e.message, "error"); }
    setRequesting(false);
  };

  const handleAvatarChange = async (e, type="avatar") => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append(type, file);
      const data = await updateProfile(formData);
      setProfile(data.user);
      updateUser({...currentUser,...data.user});
      showToast("Photo updated!");
    } catch (e) { showToast(e.message,"error"); }
  };

  const handleLike = async (postId) => {
    try {
      await likePost(postId);
      setLikedPosts(p => ({...p,[postId]:!p[postId]}));
    } catch {}
  };

  const timeAgo = (d) => { const m=Math.floor((Date.now()-new Date(d))/60000); if(m<60)return`${m}m ago`;if(m<1440)return`${Math.floor(m/60)}h ago`;return`${Math.floor(m/1440)}d ago`; };

  if (loading) return <MainLayout><div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-muted-foreground"/></div></MainLayout>;
  if (!profile) return <MainLayout><div className="text-center py-20 text-muted-foreground">User not found</div></MainLayout>;

  const initials = profile.name?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)||"U";
  const visibleSkills = showAllSkills ? profile.skills : profile.skills?.slice(0,6);

  return (
    <MainLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)}/>}
      <div className="flex flex-col gap-4">

        {/* Cover + Avatar */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="h-32 sm:h-44 relative group">
            {profile.coverUrl
              ? <img src={profile.coverUrl} className="w-full h-full object-cover" alt="cover"/>
              : <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-muted"/>
            }
            {isOwnProfile && (
              <>
                <button onClick={()=>coverRef.current?.click()} className="absolute top-3 right-3 w-8 h-8 bg-card/80 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={14}/>
                </button>
                <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={e=>handleAvatarChange(e,"cover")}/>
              </>
            )}
          </div>

          <div className="px-5 pb-5">
            <div className="flex items-end justify-between -mt-8 sm:-mt-12 mb-3">
              <div className="relative group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-4 ring-card overflow-hidden bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                  {profile.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover" alt=""/> : initials}
                </div>
                {isOwnProfile && (
                  <>
                    <button onClick={()=>fileRef.current?.click()} className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={18} className="text-white"/>
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>handleAvatarChange(e,"avatar")}/>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 mb-1">
                {isOwnProfile ? (
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={()=>navigate("/settings")}>
                    <Edit3 size={13}/>Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={()=>navigate("/messages")}>
                      <MessageCircle size={13}/>Message
                    </Button>
                    <Button size="sm" className="gap-1.5" onClick={handleConnect} disabled={connected||requesting}>
                      {connected ? <><CheckCircle2 size={13}/>Connected</> : requesting ? <><Loader2 size={13} className="animate-spin"/>Sending…</> : <><Plus size={13}/>Connect</>}
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-foreground">{profile.name}</h1>
              {profile.isPremium && (
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30">
                  <Crown size={11} /> Premium
                </span>
              )}
            </div>
            <p className="text-sm text-foreground/80 mt-0.5">{profile.headline || "No headline yet"}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
              {profile.location && <span className="flex items-center gap-1"><MapPin size={11}/>{profile.location}</span>}
              {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline"><Link2 size={11}/>{profile.website.replace(/https?:\/\//,"")}</a>}
              <span className="flex items-center gap-1"><Users size={11}/>{profile.connections?.length||0} connections</span>
            </div>

            {profile.openToWork && (
              <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 size={12}/>Open to Work
              </div>
            )}

            {isOwnProfile && (
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
                {[{icon:Eye,label:"Profile views",value:profile.profileViews||0},{icon:Users,label:"Connections",value:profile.connections?.length||0},{icon:Star,label:"Posts",value:posts.length}].map(({icon:Icon,label,value})=>(
                  <div key={label} className="flex items-center gap-2 cursor-pointer group">
                    <Icon size={15} className="text-muted-foreground group-hover:text-primary transition-colors"/>
                    <div><p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{value}</p><p className="text-[10px] text-muted-foreground">{label}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full justify-start h-10 bg-card border border-border rounded-xl px-2">
            {["about","experience","education","skills","posts"].map(t=>(
              <TabsTrigger key={t} value={t} className="text-xs capitalize">{t}</TabsTrigger>
            ))}
          </TabsList>

          {/* About */}
          <TabsContent value="about" className="mt-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-foreground">About</h2>
                {isOwnProfile && <Button variant="ghost" size="icon-sm" onClick={()=>navigate("/settings")}><Edit3 size={15}/></Button>}
              </div>
              {profile.bio ? (
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{profile.bio}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">{isOwnProfile ? "Add a bio to tell people about yourself" : "No bio yet"}</p>
              )}
              {profile.skills?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {profile.skills.map(s=><span key={s} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{s}</span>)}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Experience */}
          <TabsContent value="experience" className="mt-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground">Experience</h2>
                {isOwnProfile && <Button variant="ghost" size="icon-sm" onClick={()=>navigate("/settings")}><Plus size={15}/></Button>}
              </div>
              {profile.experience?.length > 0 ? (
                <div className="flex flex-col gap-5">
                  {profile.experience.map((exp,i)=>(
                    <div key={i}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-sm shrink-0">{exp.company?.[0]?.toUpperCase()||"C"}</div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">{exp.role}</p>
                          <p className="text-xs text-foreground/80">{exp.company} · {exp.type}</p>
                          <p className="text-xs text-muted-foreground">{exp.startDate} – {exp.current?"Present":exp.endDate}</p>
                          {exp.location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={10}/>{exp.location}</p>}
                          {exp.desc && <p className="text-xs text-foreground/80 mt-2 leading-relaxed">{exp.desc}</p>}
                          {exp.skills?.length > 0 && <div className="flex flex-wrap gap-1.5 mt-2">{exp.skills.map(s=><span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s}</span>)}</div>}
                        </div>
                      </div>
                      {i < profile.experience.length-1 && <Separator className="mt-5"/>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic text-center py-6">{isOwnProfile?"Add your work experience":"No experience added yet"}</p>
              )}
            </div>
          </TabsContent>

          {/* Education */}
          <TabsContent value="education" className="mt-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground">Education</h2>
                {isOwnProfile && <Button variant="ghost" size="icon-sm" onClick={()=>navigate("/settings")}><Plus size={15}/></Button>}
              </div>
              {profile.education?.length > 0 ? (
                <div className="flex flex-col gap-5">
                  {profile.education.map((edu,i)=>(
                    <div key={i}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-sm shrink-0"><GraduationCap size={18} className="text-muted-foreground"/></div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{edu.school}</p>
                          <p className="text-xs text-foreground/80">{edu.degree}</p>
                          <p className="text-xs text-muted-foreground">{edu.startYear} – {edu.endYear}</p>
                          {edu.grade && <p className="text-xs text-muted-foreground">Grade: {edu.grade}</p>}
                        </div>
                      </div>
                      {i < profile.education.length-1 && <Separator className="mt-5"/>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic text-center py-6">No education added yet</p>
              )}
              {profile.certifications?.length > 0 && (
                <>
                  <Separator className="my-5"/>
                  <h3 className="text-sm font-semibold text-foreground mb-4">Certifications</h3>
                  <div className="flex flex-col gap-4">
                    {profile.certifications.map((cert,i)=>(
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center shrink-0"><Award size={16} className="text-blue-600"/></div>
                        <div><p className="text-sm font-semibold text-foreground">{cert.name}</p><p className="text-xs text-muted-foreground">{cert.issuer} · {cert.year}</p></div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* Skills */}
          <TabsContent value="skills" className="mt-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground">Skills & Endorsements</h2>
                {isOwnProfile && <Button variant="ghost" size="icon-sm" onClick={()=>navigate("/settings")}><Edit3 size={15}/></Button>}
              </div>
              {profile.skills?.length > 0 ? (
                <>
                  <div className="flex flex-col gap-3">
                    {visibleSkills?.map((skill) => {
                      const endorsement = profile.endorsements?.find(e => e.skill === skill);
                      const count = endorsement?.endorsedBy?.length || 0;
                      const iEndorsed = endorsement?.endorsedBy?.some(id => (id?._id||id)?.toString() === currentUser?.id);
                      return (
                        <div key={skill} className="flex items-center gap-3 group">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Star size={14} className="text-muted-foreground"/>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium text-foreground">{skill}</p>
                              <div className="flex items-center gap-2 shrink-0">
                                {count > 0 && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <ThumbsUp size={11}/>{count}
                                  </span>
                                )}
                                {!isOwnProfile && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        const data = await endorseSkill(profile.username, skill);
                                        setProfile(p => ({ ...p, endorsements: data.endorsements }));
                                        showToast(data.endorsed ? `Endorsed ${skill}!` : "Endorsement removed");
                                      } catch(e) { showToast(e.message,"error"); }
                                    }}
                                    className={`text-xs px-2 py-0.5 rounded-full border transition-all ${iEndorsed?"bg-primary/10 border-primary/30 text-primary":"border-border text-muted-foreground hover:border-primary hover:text-primary"}`}
                                  >
                                    {iEndorsed ? "✓ Endorsed" : "+ Endorse"}
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(40 + count * 10, 100)}%` }}/>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {profile.skills.length > 6 && (
                    <Button variant="ghost" size="sm" className="w-full mt-3 text-muted-foreground" onClick={()=>setShowAllSkills(s=>!s)}>
                      {showAllSkills?"Show less":`Show all ${profile.skills.length} skills`}
                    </Button>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic text-center py-6">{isOwnProfile?"Add your skills in Settings":"No skills added yet"}</p>
              )}
            </div>
          </TabsContent>

          {/* Posts */}
          <TabsContent value="posts" className="mt-4">
            <div className="flex flex-col gap-3">
              {posts.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center"><p className="text-muted-foreground text-sm">No posts yet</p></div>
              ) : posts.map(post=>(
                <div key={post._id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 overflow-hidden">
                      {profile.avatarUrl?<img src={profile.avatarUrl} className="w-full h-full object-cover" alt=""/>:initials}
                    </div>
                    <div><p className="text-sm font-semibold text-foreground">{profile.name}</p><p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</p></div>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{post.content}</p>
                  {post.media?.data && <div className="mt-3 rounded-lg overflow-hidden border border-border"><img src={post.media.data} alt="" className="w-full max-h-64 object-cover"/></div>}
                  <Separator className="my-3"/>
                  <div className="flex items-center gap-3">
                    <button onClick={()=>handleLike(post._id)} className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${likedPosts[post._id]?"text-primary":"text-muted-foreground hover:text-foreground"}`}>
                      <ThumbsUp size={14} className={likedPosts[post._id]?"fill-primary":""}/>{post.likes?.length||0}
                    </button>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><MessageCircle size={14}/>{post.comments?.length||0}</span>
                    <a href="#" className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"><ExternalLink size={14}/>View</a>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Profile;
