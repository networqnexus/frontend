import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createOrg } from "@/api/orgApi";
import { X, Building2, Loader2, Upload } from "lucide-react";

const INDUSTRIES = [
  "Technology","Finance","Healthcare","Education","Retail","Manufacturing",
  "Media","Real Estate","Consulting","Hospitality","Transportation","Non-Profit","Other"
];
const SIZES = ["1-10","11-50","51-200","201-500","501-1000","1000+"];

const Field = ({ label, required, children }) => (
  <div>
    <label className="text-xs font-medium text-foreground mb-1 block">
      {label}{required && <span className="text-destructive ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const CreateOrgModal = ({ onClose, onCreated }) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [form, setForm] = useState({
    name: "", tagline: "", description: "",
    industry: "", location: "", size: "",
    foundedYear: "", website: "",
  });
  const [logo, setLogo]   = useState(null);
  const [cover, setCover] = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleImage = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (type === "logo") { setLogo(file); setLogoPreview(URL.createObjectURL(file)); }
    else { setCover(file); setCoverPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Organization name is required."); return; }
    setSaving(true); setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (logo)  fd.append("logo",  logo);
      if (cover) fd.append("cover", cover);
      const d = await createOrg(fd);
      onCreated?.(d.org);
      navigate(`/org/${d.org.slug}`);
      onClose();
    } catch(e) {
      setError(e.message || "Failed to create organization.");
    }
    setSaving(false);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-card rounded-2xl border border-border w-full max-w-xl shadow-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 size={15} className="text-primary"/>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Create Organization</h2>
              <p className="text-[10px] text-muted-foreground">Build your company's presence on Networq</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <X size={15}/>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4 scrollbar-hide">

          {/* Cover image */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Cover Image</label>
            <label className="relative block w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer overflow-hidden bg-muted/30">
              {coverPreview
                ? <img src={coverPreview} className="w-full h-full object-cover" alt=""/>
                : <div className="flex flex-col items-center justify-center h-full gap-1">
                    <Upload size={16} className="text-muted-foreground"/>
                    <span className="text-[10px] text-muted-foreground">Upload cover (1200×300 recommended)</span>
                  </div>
              }
              <input type="file" accept="image/*" className="hidden" onChange={e => handleImage(e, "cover")}/>
            </label>
          </div>

          {/* Logo + Name row */}
          <div className="flex gap-3 items-end">
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Logo</label>
              <label className="w-16 h-16 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center bg-muted/30 overflow-hidden">
                {logoPreview
                  ? <img src={logoPreview} className="w-full h-full object-cover" alt=""/>
                  : <Building2 size={22} className="text-muted-foreground"/>}
                <input type="file" accept="image/*" className="hidden" onChange={e => handleImage(e, "logo")}/>
              </label>
            </div>
            <div className="flex-1">
              <Field label="Organization Name" required>
                <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Acme Corp"/>
              </Field>
            </div>
          </div>

          {/* Tagline */}
          <Field label="Tagline">
            <Input value={form.tagline} onChange={e => set("tagline", e.target.value)} placeholder="Your company's motto or mission in one line"/>
          </Field>

          {/* Description */}
          <Field label="About / Description">
            <textarea value={form.description} onChange={e => set("description", e.target.value)}
              rows={3} placeholder="Describe what your organization does..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-transparent outline-none resize-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground"/>
          </Field>

          {/* Industry + Location */}
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

          {/* Size + Founded */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company Size">
              <select value={form.size} onChange={e => set("size", e.target.value)}
                className="w-full h-9 text-sm px-3 rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring">
                <option value="">Select size</option>
                {SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
              </select>
            </Field>
            <Field label="Founded Year">
              <Input type="number" value={form.foundedYear} onChange={e => set("foundedYear", e.target.value)} placeholder="e.g. 2020" min="1800" max={new Date().getFullYear()}/>
            </Field>
          </div>

          {/* Website */}
          <Field label="Website">
            <Input value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://yourcompany.com"/>
          </Field>

          {error && <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-border shrink-0">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 gap-1.5" onClick={handleSubmit} disabled={saving}>
            {saving ? <><Loader2 size={13} className="animate-spin"/>Creating...</> : <><Building2 size={13}/>Create Organization</>}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CreateOrgModal;
