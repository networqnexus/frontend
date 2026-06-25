import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOrg, updateOrg, deleteOrg } from "@/api/orgApi";
import useAuth from "@/hooks/useAuth";
import {
  Building2, ArrowLeft, Camera, Loader2, Check, X, Trash2,
  BadgeCheck, AlertTriangle, Upload, Plus
} from "lucide-react";

const INDUSTRIES = [
  "Technology","Finance","Healthcare","Education","Retail","Manufacturing",
  "Media","Real Estate","Consulting","Hospitality","Transportation","Non-Profit","Other"
];
const SIZES = ["1-10","11-50","51-200","201-500","501-1000","1000+"];

const Field = ({ label, hint, children }) => (
  <div>
    <label className="text-xs font-medium text-foreground block mb-1">{label}</label>
    {hint && <p className="text-[11px] text-muted-foreground mb-1">{hint}</p>}
    {children}
  </div>
);

const Toast = ({ msg, ok }) => (
  <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2
    ${ok ? "bg-foreground text-background" : "bg-destructive text-destructive-foreground"}`}>
    {ok ? <Check size={14}/> : <X size={14}/>}{msg}
  </div>
);

const OrgSettings = () => {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const { user, updateUser } = useAuth();

  const [org,      setOrg]      = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteInput,   setDeleteInput]   = useState("");
  const [toast, setToast] = useState(null);

  const [logoPreview,  setLogoPreview]  = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [logoFile,     setLogoFile]     = useState(null);
  const [coverFile,    setCoverFile]    = useState(null);

  const [form, setForm] = useState({
    name: "", tagline: "", description: "",
    industry: "", location: "", size: "",
    foundedYear: "", website: "", services: [],
  });
  const [serviceInput, setServiceInput] = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    getOrg(slug).then(d => {
      if (!d.isOwner) { navigate(`/org/${slug}`); return; }
      const o = d.org;
      setOrg(o);
      setLogoPreview(o.logoUrl || null);
      setCoverPreview(o.coverUrl || null);
      setForm({
        name:        o.name        || "",
        tagline:     o.tagline     || "",
        description: o.description || "",
        industry:    o.industry    || "",
        location:    o.location    || "",
        size:        o.size        || "",
        foundedYear: o.foundedYear || "",
        website:     o.website     || "",
        services:    o.services    || [],
      });
    }).catch(() => navigate("/feed")).finally(() => setLoading(false));
  }, [slug]);

  const handleImage = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (type === "logo")  { setLogoFile(file);  setLogoPreview(URL.createObjectURL(file)); }
    else                  { setCoverFile(file); setCoverPreview(URL.createObjectURL(file)); }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { showToast("Organization name is required.", false); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) { v.forEach(item => fd.append(k, item)); }
        else if (v !== "") fd.append(k, v);
      });
      if (logoFile)  fd.append("logo",  logoFile);
      if (coverFile) fd.append("cover", coverFile);
      const d = await updateOrg(org._id, fd);
      setOrg(d.org);
      setLogoFile(null); setCoverFile(null);
      if (d.org.slug !== slug) {
        navigate(`/org/${d.org.slug}/settings`, { replace: true });
      }
      showToast("Settings saved!");
    } catch(e) { showToast(e.message || "Failed to save.", false); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (deleteInput !== org.name) { showToast("Name doesn't match.", false); return; }
    setDeleting(true);
    try {
      await deleteOrg(org._id);
      showToast("Organization deleted.");
      setTimeout(() => navigate("/feed"), 1500);
    } catch(e) { showToast(e.message || "Failed to delete.", false); setDeleting(false); }
  };

  if (loading) return (
    <MainLayout>
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-muted-foreground"/>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      {toast && <Toast msg={toast.msg} ok={toast.ok}/>}

      <div className="max-w-2xl mx-auto flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/org/${org?.slug}`)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors shrink-0">
            <ArrowLeft size={16}/>
          </button>
          <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
            {org?.logoUrl ? <img src={org.logoUrl} className="w-full h-full object-cover" alt=""/> : <Building2 size={17} className="text-muted-foreground"/>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-foreground truncate">{org?.name}</h1>
              {org?.verified && <BadgeCheck size={14} className="text-primary"/>}
            </div>
            <p className="text-xs text-muted-foreground">Organization Settings</p>
          </div>
          <Link to={`/org/${org?.slug}`} className="text-xs text-primary hover:underline shrink-0">Public page →</Link>
        </div>

        {/* Cover image */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="relative h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-muted">
            {coverPreview && <img src={coverPreview} className="w-full h-full object-cover absolute inset-0" alt=""/>}
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <div className="flex items-center gap-1.5 text-white text-xs font-medium bg-black/50 px-3 py-1.5 rounded-lg">
                <Upload size={12}/> Change cover
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={e => handleImage(e, "cover")}/>
            </label>
          </div>
          <div className="px-5 pb-4 -mt-8 flex items-end gap-3">
            <div className="relative w-16 h-16 rounded-xl border-4 border-card bg-muted flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {logoPreview ? <img src={logoPreview} className="w-full h-full object-cover" alt=""/> : <Building2 size={22} className="text-muted-foreground"/>}
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-[9px]">
                <Camera size={14} className="text-white"/>
                <input type="file" accept="image/*" className="hidden" onChange={e => handleImage(e, "logo")}/>
              </label>
            </div>
            <p className="text-[11px] text-muted-foreground pb-1">Click logo or cover to change images</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-foreground">Basic Information</h2>

          <Field label="Organization Name">
            <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Acme Corp"/>
          </Field>

          <Field label="Tagline">
            <Input value={form.tagline} onChange={e => set("tagline", e.target.value)} placeholder="Your company's motto or mission"/>
          </Field>

          <Field label="About / Description">
            <textarea value={form.description} onChange={e => set("description", e.target.value)}
              rows={4} placeholder="Describe what your organization does..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-transparent outline-none resize-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground"/>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Industry">
              <select value={form.industry} onChange={e => set("industry", e.target.value)}
                className="w-full h-9 text-sm px-3 rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring">
                <option value="">Select industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Location">
              <Input value={form.location} onChange={e => set("location", e.target.value)} placeholder="City, Country"/>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Company Size">
              <select value={form.size} onChange={e => set("size", e.target.value)}
                className="w-full h-9 text-sm px-3 rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring">
                <option value="">Select size</option>
                {SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
              </select>
            </Field>
            <Field label="Founded Year">
              <Input type="number" value={form.foundedYear} onChange={e => set("foundedYear", e.target.value)}
                placeholder="e.g. 2020" min="1800" max={new Date().getFullYear()}/>
            </Field>
          </div>

          <Field label="Website">
            <Input value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://yourcompany.com"/>
          </Field>

          <Field label="Services" hint="Services your organization offers (press Enter or click + to add)">
            <div className="flex gap-2 mb-2">
              <Input
                value={serviceInput}
                onChange={e => setServiceInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && serviceInput.trim()) {
                    e.preventDefault();
                    const trimmed = serviceInput.trim();
                    if (!form.services.includes(trimmed)) set("services", [...form.services, trimmed]);
                    setServiceInput("");
                  }
                }}
                placeholder="e.g. Web Development, Cloud Consulting"
              />
              <button
                type="button"
                onClick={() => {
                  const trimmed = serviceInput.trim();
                  if (trimmed && !form.services.includes(trimmed)) set("services", [...form.services, trimmed]);
                  setServiceInput("");
                }}
                className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg border border-input bg-muted hover:bg-muted/80 text-foreground transition-colors">
                <Plus size={14}/>
              </button>
            </div>
            {form.services.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.services.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                    {s}
                    <button type="button" onClick={() => set("services", form.services.filter((_, idx) => idx !== i))}
                      className="ml-0.5 hover:text-destructive transition-colors">
                      <X size={11}/>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          <Button onClick={handleSave} disabled={saving} className="gap-2 w-fit">
            {saving ? <><Loader2 size={13} className="animate-spin"/>Saving...</> : <><Check size={13}/>Save Changes</>}
          </Button>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border border-destructive/40 bg-card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-destructive"/>
            <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
          </div>

          {!confirmDelete ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Delete Organization</p>
                <p className="text-xs text-muted-foreground">Permanently deletes this org, all employees, candidates, leads and data. Cannot be undone.</p>
              </div>
              <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground shrink-0 ml-4"
                onClick={() => setConfirmDelete(true)}>
                Delete
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-foreground">
                Type <strong className="font-mono">{org?.name}</strong> to confirm deletion:
              </p>
              <Input
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder={org?.name}
                className="border-destructive/50 focus:ring-destructive"
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setConfirmDelete(false); setDeleteInput(""); }} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleting || deleteInput !== org?.name}
                  className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5">
                  {deleting ? <Loader2 size={13} className="animate-spin"/> : <Trash2 size={13}/>}
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </MainLayout>
  );
};

export default OrgSettings;
