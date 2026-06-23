import { useState, useRef } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ThemeSelector } from "@/components/ui/ThemeToggle";
import { updateProfile, changePassword } from "@/api/profileApi";
import useAuth from "@/hooks/useAuth";
import { User, Lock, Bell, Shield, Camera, Loader2, Check, X, Palette } from "lucide-react";

const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${type==="error"?"bg-destructive text-destructive-foreground":"bg-foreground text-background"}`}>
    {message}<button onClick={onClose}><X size={14}/></button>
  </div>
);

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const fileRef = useRef(null);
  const showToast = (msg, type="success") => { setToast({message:msg,type}); setTimeout(()=>setToast(null),3000); };

  const [profile, setProfile] = useState({
    name:user?.name||"", headline:user?.headline||"", bio:user?.bio||"",
    location:user?.location||"", website:user?.website||"",
    contactNumber:user?.contactNumber||"", openToWork:user?.openToWork||false,
    skills:user?.skills?.join(", ")||"",
  });

  const [passwords, setPasswords] = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [hideOnlineStatus, setHideOnlineStatus] = useState(user?.hideOnlineStatus || false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl||null);
  const [avatarFile,    setAvatarFile]    = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(profile).forEach(([k,v]) => {
        if (k==="skills") fd.append(k, JSON.stringify(v.split(",").map(s=>s.trim()).filter(Boolean)));
        else fd.append(k, v);
      });
      if (avatarFile) fd.append("avatar", avatarFile);
      const data = await updateProfile(fd);
      updateUser({...user,...data.user});
      showToast("Profile updated!");
    } catch(e) { showToast(e.message,"error"); }
    setSaving(false);
  };

  const handleToggleOnlineStatus = async (val) => {
    setHideOnlineStatus(val);
    try {
      const data = await updateProfile({ hideOnlineStatus: val });
      updateUser({ ...user, ...data.user });
      showToast(val ? "Online status hidden" : "Online status visible");
    } catch(e) {
      showToast(e.message, "error");
      setHideOnlineStatus(!val);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword!==passwords.confirmPassword) { showToast("Passwords do not match","error"); return; }
    if (passwords.newPassword.length<6) { showToast("Min 6 characters","error"); return; }
    setSaving(true);
    try {
      await changePassword({currentPassword:passwords.currentPassword,newPassword:passwords.newPassword});
      setPasswords({currentPassword:"",newPassword:"",confirmPassword:""});
      showToast("Password changed!");
    } catch(e) { showToast(e.message,"error"); }
    setSaving(false);
  };

  return (
    <MainLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)}/>}
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <div><h1 className="text-xl font-bold text-foreground">Settings</h1><p className="text-sm text-muted-foreground">Manage your account and preferences</p></div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-auto flex-wrap gap-1 p-1 justify-start w-full">
            <TabsTrigger value="profile"       className="text-xs gap-1"><User size={12}/>Profile</TabsTrigger>
            <TabsTrigger value="password"      className="text-xs gap-1"><Lock size={12}/>Password</TabsTrigger>
            <TabsTrigger value="appearance"    className="text-xs gap-1"><Palette size={12}/>Appearance</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs gap-1"><Bell size={12}/>Notifications</TabsTrigger>
            <TabsTrigger value="privacy"       className="text-xs gap-1"><Shield size={12}/>Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground overflow-hidden">
                    {avatarPreview?<img src={avatarPreview} className="w-full h-full object-cover" alt=""/>:user?.name?.[0]?.toUpperCase()}
                  </div>
                  <button onClick={()=>fileRef.current?.click()} className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground"><Camera size={12}/></button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange}/>
                </div>
                <div><p className="text-sm font-semibold text-foreground">{user?.name}</p><p className="text-xs text-muted-foreground">{user?.email}</p><button onClick={()=>fileRef.current?.click()} className="text-xs text-primary hover:underline">Change photo</button></div>
              </div>
              <Separator/>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-foreground">Full Name</label><Input className="mt-1" value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))}/></div>
                <div><label className="text-xs font-medium text-foreground">Phone</label><Input className="mt-1" value={profile.contactNumber} onChange={e=>setProfile(p=>({...p,contactNumber:e.target.value}))}/></div>
              </div>
              <div><label className="text-xs font-medium text-foreground">Headline</label><Input className="mt-1" value={profile.headline} onChange={e=>setProfile(p=>({...p,headline:e.target.value}))}/></div>
              <div><label className="text-xs font-medium text-foreground">Bio</label><textarea className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-input bg-transparent outline-none resize-none min-h-[80px]" value={profile.bio} onChange={e=>setProfile(p=>({...p,bio:e.target.value}))}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-foreground">Location</label><Input className="mt-1" value={profile.location} onChange={e=>setProfile(p=>({...p,location:e.target.value}))}/></div>
                <div><label className="text-xs font-medium text-foreground">Website</label><Input className="mt-1" value={profile.website} onChange={e=>setProfile(p=>({...p,website:e.target.value}))}/></div>
              </div>
              <div><label className="text-xs font-medium text-foreground">Skills (comma separated)</label><Input className="mt-1" value={profile.skills} onChange={e=>setProfile(p=>({...p,skills:e.target.value}))}/></div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                <div><p className="text-sm font-medium text-foreground">Open to Work</p><p className="text-xs text-muted-foreground">Let recruiters know</p></div>
                <button onClick={()=>setProfile(p=>({...p,openToWork:!p.openToWork}))} className={`w-10 h-5 rounded-full transition-colors relative ${profile.openToWork?"bg-emerald-500":"bg-muted"}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${profile.openToWork?"left-5":"left-0.5"}`}/>
                </button>
              </div>
              <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                {saving?<><Loader2 size={14} className="animate-spin"/>Saving…</>:<><Check size={14}/>Save Changes</>}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="password" className="mt-4">
            <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-foreground">Change Password</h3>
              <div><label className="text-xs font-medium text-foreground">Current Password</label><Input className="mt-1" type="password" value={passwords.currentPassword} onChange={e=>setPasswords(p=>({...p,currentPassword:e.target.value}))}/></div>
              <div><label className="text-xs font-medium text-foreground">New Password</label><Input className="mt-1" type="password" value={passwords.newPassword} onChange={e=>setPasswords(p=>({...p,newPassword:e.target.value}))}/></div>
              <div>
                <label className="text-xs font-medium text-foreground">Confirm Password</label>
                <Input className="mt-1" type="password" value={passwords.confirmPassword} onChange={e=>setPasswords(p=>({...p,confirmPassword:e.target.value}))} className={`mt-1 ${passwords.confirmPassword&&passwords.confirmPassword!==passwords.newPassword?"border-destructive":""}`}/>
                {passwords.confirmPassword&&passwords.confirmPassword!==passwords.newPassword&&<p className="text-xs text-destructive mt-1">Passwords do not match</p>}
              </div>
              <Button onClick={handleChangePassword} disabled={saving||!passwords.currentPassword||!passwords.newPassword}>
                {saving?<><Loader2 size={14} className="animate-spin mr-2"/>Updating…</>:"Update Password"}
              </Button>
            </div>
          </TabsContent>

          {/* ✨ Appearance — Theme selector */}
          <TabsContent value="appearance" className="mt-4">
            <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-5">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Theme</h3>
                <p className="text-xs text-muted-foreground mb-4">Choose how Networq Nexus looks to you</p>
                <ThemeSelector />
              </div>
              <Separator/>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Preview</h3>
                <div className="rounded-xl border border-border bg-background p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground overflow-hidden">
                    {user?.avatarUrl?<img src={user.avatarUrl} className="w-full h-full object-cover" alt=""/>:user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.headline||"No headline yet"}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-4">
            <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-foreground">Notification Preferences</h3>
              {[{label:"Connection requests",desc:"When someone wants to connect"},{label:"Post likes",desc:"When someone likes your post"},{label:"Comments",desc:"When someone comments"},{label:"Messages",desc:"New message received"},{label:"Job alerts",desc:"Matching jobs"}].map(({label,desc})=>(
                <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div><p className="text-sm font-medium text-foreground">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
                  <button className="w-10 h-5 rounded-full bg-primary relative"><div className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-5"/></button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="mt-4">
            <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-foreground">Privacy Settings</h3>

              {/* Online status toggle */}
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Hide online status</p>
                  <p className="text-xs text-muted-foreground">Others won't see when you're active or your last seen</p>
                </div>
                <button
                  onClick={() => handleToggleOnlineStatus(!hideOnlineStatus)}
                  className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${hideOnlineStatus ? "bg-primary" : "bg-muted"}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${hideOnlineStatus ? "left-5" : "left-0.5"}`} />
                </button>
              </div>

              {[{label:"Profile visibility",desc:"Who can see your profile",value:"Everyone"},{label:"Connection list",desc:"Who can see connections",value:"Connections"},{label:"Email visibility",desc:"Who can see your email",value:"Only me"}].map(({label,desc,value})=>(
                <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div><p className="text-sm font-medium text-foreground">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
                  <select className="text-xs px-2 py-1 rounded-lg border border-input bg-transparent text-foreground outline-none">
                    <option>{value}</option><option>Everyone</option><option>Connections</option><option>Only me</option>
                  </select>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
