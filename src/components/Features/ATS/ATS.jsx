import { useState, useEffect, useCallback } from "react";
import MainLayout from "@/layouts/MainLayout";
import PremiumGate from "@/components/Features/Premium/PremiumGate";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getCandidates, getAtsReport,
  addCandidate, parseResume,
  updateStage, updateRating, updateNotes,
  updateOffer, updateApproval, triggerOnboarding,
  scheduleInterview, updateInterview, submitFeedback,
  deleteCandidate,
} from "@/api/atsApi";
import {
  Plus, Search, Users, Calendar, CheckCircle2, TrendingUp, Star, Clock,
  Mail, Trash2, Loader2, X, Phone, Video, MapPin,
  FileText, MessageSquare, UserCheck,
  Briefcase, Download, RefreshCw,
  AlertCircle, CheckCircle, XCircle, Eye, Edit2, Save, ArrowRight,
  CalendarCheck, UserPlus,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────────
const STAGES = [
  { id: "applied",   label: "Applied",   color: "border-t-blue-400",    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"       },
  { id: "screening", label: "Screening", color: "border-t-violet-400",  badge: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300" },
  { id: "interview", label: "Interview", color: "border-t-amber-400",   badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"    },
  { id: "offer",     label: "Offer",     color: "border-t-emerald-400", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
  { id: "hired",     label: "Hired",     color: "border-t-green-500",   badge: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"    },
  { id: "rejected",  label: "Rejected",  color: "border-t-red-400",     badge: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"            },
];

const SOURCES = ["manual", "job_board", "referral", "website", "linkedin", "other"];
const INTERVIEW_TYPES = ["phone", "video", "in-person", "technical", "hr"];
const RECOMMENDATIONS = [
  { value: "strong_yes", label: "Strong Yes", color: "text-green-600" },
  { value: "yes",        label: "Yes",         color: "text-emerald-600" },
  { value: "no",         label: "No",          color: "text-orange-600" },
  { value: "strong_no",  label: "Strong No",   color: "text-red-600" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const StageBadge = ({ stage }) => {
  const s = STAGES.find(x => x.id === stage);
  return s ? <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.badge}`}>{s.label}</span> : null;
};

const StarRating = ({ rating, onChange, size = 12 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i} size={size}
        className={i <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}
        onClick={() => onChange?.(i)}
        style={onChange ? { cursor: "pointer" } : {}}
      />
    ))}
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
    <div className="mt-1">{children}</div>
  </div>
);

const Sel = ({ value, onChange, children, className = "" }) => (
  <select
    value={value} onChange={e => onChange(e.target.value)}
    className={`w-full h-9 text-sm px-3 rounded-lg border border-input bg-background text-foreground outline-none focus:border-ring ${className}`}
  >
    {children}
  </select>
);

const generateOfferHTML = (candidate, companyName) => {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const benefits = candidate.offer?.benefits?.length
    ? `<ul class="bl">${candidate.offer.benefits.map(b => `<li>${b}</li>`).join("")}</ul>` : "";
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Offer Letter – ${candidate.name}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;max-width:760px;margin:0 auto;padding:60px 80px;color:#1a1a1a;line-height:1.7}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:16px;border-bottom:2px solid #1a1a2e}
.co{font-size:22px;font-weight:bold;color:#1a1a2e;letter-spacing:1px}.dt{font-size:12px;color:#666}
h1{font-size:22px;text-align:center;margin:28px 0;color:#1a1a2e;letter-spacing:3px;text-transform:uppercase}
p{font-size:14px;margin:14px 0}table{width:100%;border-collapse:collapse;margin:20px 0}
td{padding:10px 14px;border:1px solid #ddd;font-size:14px}td:first-child{font-weight:bold;background:#f7f7f7;width:38%}
.bl{padding-left:20px;font-size:14px}.bl li{margin:4px 0}.sigs{display:flex;justify-content:space-between;margin-top:60px}
.sb{text-align:center;flex:1}.sl{border-top:1px solid #333;padding-top:8px;font-size:13px;font-weight:bold}.sl2{font-size:12px;color:#666;margin-top:4px}
.acc{margin-top:40px;padding:20px;border:1px solid #ccc;font-size:13px}.btn{position:fixed;bottom:24px;right:24px;background:#1a1a2e;color:#fff;border:none;padding:12px 24px;font-size:14px;cursor:pointer;border-radius:6px}
@media print{.btn{display:none}body{padding:40px}}</style></head>
<body>
<div class="hdr"><div class="co">${companyName || "The Company"}</div><div class="dt">Date: ${today}</div></div>
<h1>Offer of Employment</h1>
<p>Dear <strong>${candidate.name}</strong>,</p>
<p>We are pleased to extend an offer for the position of <strong>${candidate.offer?.position || candidate.role}</strong> at <strong>${companyName || "our company"}</strong>. We believe your skills and experience make you an excellent addition to our team.</p>
<table>
<tr><td>Position</td><td>${candidate.offer?.position || candidate.role}</td></tr>
<tr><td>Department</td><td>${candidate.offer?.department || "—"}</td></tr>
<tr><td>Reporting To</td><td>${candidate.offer?.reportingTo || "—"}</td></tr>
<tr><td>Start Date</td><td>${candidate.offer?.startDate || "To be confirmed"}</td></tr>
<tr><td>Compensation</td><td>${candidate.offer?.salary || "As discussed"}</td></tr>
</table>
${benefits ? `<p><strong>Benefits Package:</strong></p>${benefits}` : ""}
<p>This offer is contingent upon satisfactory background verification. Please confirm acceptance by <strong>${candidate.offer?.expiresAt ? new Date(candidate.offer.expiresAt).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}) : "the agreed date"}</strong>.</p>
<p>We look forward to welcoming you. Please reach out with any questions.</p>
<p>Sincerely,</p>
<div class="sigs">
  <div class="sb"><div class="sl">Authorized Signatory</div><div class="sl2">${companyName || "Company"}</div></div>
  <div class="sb"><div class="sl">${candidate.name}</div><div class="sl2">Candidate Signature &amp; Date</div></div>
</div>
<div class="acc"><strong>Acceptance:</strong><br>I, <strong>${candidate.name}</strong>, accept the terms of this offer.<br><br>Signature: _________________________________ &nbsp; Date: _________________</div>
<button class="btn" onclick="window.print()">Print / Save PDF</button>
</body></html>`;
};

// ── Add Candidate Modal ────────────────────────────────────────────────────────
const AddCandidateModal = ({ onClose, onAdd }) => {
  const [tab, setTab] = useState("manual"); // manual | resume
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "", company: "", experience: "", skills: "", stage: "applied", rating: 3, source: "manual", resumeUrl: "", notes: "" });
  const [resumeText, setResumeText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleParse = async () => {
    if (!resumeText.trim()) return;
    setParsing(true);
    try {
      const { parsed } = await parseResume(resumeText);
      setForm(p => ({
        ...p,
        email:      parsed.email      || p.email,
        phone:      parsed.phone      || p.phone,
        experience: parsed.experience || p.experience,
        skills:     parsed.skills?.join(", ") || p.skills,
      }));
      setTab("manual");
    } catch {}
    setParsing(false);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.role) return;
    setSaving(true);
    try {
      const payload = { ...form, skills: form.skills.split(",").map(s => s.trim()).filter(Boolean) };
      if (resumeText) payload.resumeText = resumeText;
      const data = await addCandidate(payload);
      onAdd(data.candidate);
      onClose();
    } catch {}
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Add Candidate</h3>
          <Button variant="ghost" size="icon-sm" onClick={onClose}><X size={16} /></Button>
        </div>

        <div className="flex gap-1 mb-4 bg-muted rounded-lg p-1">
          {["manual", "resume"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${tab === t ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>
              {t === "manual" ? "Manual Entry" : "Parse Resume"}
            </button>
          ))}
        </div>

        {tab === "resume" ? (
          <div className="flex flex-col gap-3">
            <Field label="Paste Resume Text">
              <textarea
                className="w-full h-40 text-sm px-3 py-2 rounded-lg border border-input bg-background text-foreground outline-none focus:border-ring resize-none"
                placeholder="Paste the full resume text here and we'll auto-fill the fields…"
                value={resumeText} onChange={e => setResumeText(e.target.value)}
              />
            </Field>
            <Button onClick={handleParse} disabled={parsing || !resumeText.trim()} className="w-full">
              {parsing ? <><Loader2 size={14} className="animate-spin mr-1.5" />Parsing…</> : "Parse & Fill Fields →"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name *"><Input value={form.name} onChange={e => set("name", e.target.value)} /></Field>
              <Field label="Email *"><Input type="email" value={form.email} onChange={e => set("email", e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Role *"><Input value={form.role} onChange={e => set("role", e.target.value)} /></Field>
              <Field label="Phone"><Input value={form.phone} onChange={e => set("phone", e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Company"><Input value={form.company} onChange={e => set("company", e.target.value)} /></Field>
              <Field label="Experience"><Input placeholder="e.g. 3 yrs" value={form.experience} onChange={e => set("experience", e.target.value)} /></Field>
            </div>
            <Field label="Skills (comma separated)"><Input placeholder="React, Node.js, SQL" value={form.skills} onChange={e => set("skills", e.target.value)} /></Field>
            <Field label="Resume URL"><Input placeholder="https://…" value={form.resumeUrl} onChange={e => set("resumeUrl", e.target.value)} /></Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Stage">
                <Sel value={form.stage} onChange={v => set("stage", v)}>
                  {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </Sel>
              </Field>
              <Field label="Source">
                <Sel value={form.source} onChange={v => set("source", v)}>
                  {SOURCES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </Sel>
              </Field>
              <Field label="Rating">
                <Sel value={form.rating} onChange={v => set("rating", Number(v))}>
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{"★".repeat(n)}</option>)}
                </Sel>
              </Field>
            </div>
            <Field label="Notes">
              <textarea className="w-full h-16 text-sm px-3 py-2 rounded-lg border border-input bg-background text-foreground outline-none focus:border-ring resize-none"
                value={form.notes} onChange={e => set("notes", e.target.value)} />
            </Field>
            <div className="flex gap-2 mt-1">
              <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={saving || !form.name || !form.email || !form.role}>
                {saving ? <><Loader2 size={14} className="animate-spin mr-1" />Adding…</> : "Add Candidate"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Schedule Interview Modal ───────────────────────────────────────────────────
const ScheduleInterviewModal = ({ candidateId, onClose, onScheduled }) => {
  const [form, setForm] = useState({ date: "", time: "", type: "video", interviewers: "", meetLink: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.date || !form.time) return;
    setSaving(true);
    try {
      const data = await scheduleInterview(candidateId, {
        ...form,
        interviewers: form.interviewers.split(",").map(s => s.trim()).filter(Boolean),
      });
      onScheduled(data.candidate);
      onClose();
    } catch {}
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Schedule Interview</h3>
          <Button variant="ghost" size="icon-sm" onClick={onClose}><X size={16} /></Button>
        </div>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date *"><Input type="date" value={form.date} onChange={e => set("date", e.target.value)} /></Field>
            <Field label="Time *"><Input type="time" value={form.time} onChange={e => set("time", e.target.value)} /></Field>
          </div>
          <Field label="Interview Type">
            <Sel value={form.type} onChange={v => set("type", v)}>
              {INTERVIEW_TYPES.map(t => <option key={t} value={t}>{t.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </Sel>
          </Field>
          <Field label="Interviewers (comma separated)">
            <Input placeholder="Alice, Bob" value={form.interviewers} onChange={e => set("interviewers", e.target.value)} />
          </Field>
          <Field label="Meeting Link">
            <Input placeholder="https://meet.google.com/…" value={form.meetLink} onChange={e => set("meetLink", e.target.value)} />
          </Field>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={saving || !form.date || !form.time}>
              {saving ? <><Loader2 size={14} className="animate-spin mr-1" />Scheduling…</> : <><CalendarCheck size={14} className="mr-1" />Schedule</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Feedback Modal ─────────────────────────────────────────────────────────────
const FeedbackModal = ({ candidateId, interview, onClose, onSubmitted }) => {
  const [form, setForm] = useState({
    rating: interview.feedback?.rating || 3,
    strengths: interview.feedback?.strengths || "",
    weaknesses: interview.feedback?.weaknesses || "",
    recommendation: interview.feedback?.recommendation || "yes",
    notes: interview.feedback?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const data = await submitFeedback(candidateId, interview._id, form);
      onSubmitted(data.candidate);
      onClose();
    } catch {}
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Interview Feedback</h3>
          <Button variant="ghost" size="icon-sm" onClick={onClose}><X size={16} /></Button>
        </div>
        <div className="text-xs text-muted-foreground mb-4 bg-muted/50 rounded-lg px-3 py-2">
          {interview.type?.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())} · {interview.date} at {interview.time}
        </div>
        <div className="flex flex-col gap-3">
          <Field label="Overall Rating">
            <StarRating rating={form.rating} onChange={v => set("rating", v)} size={20} />
          </Field>
          <Field label="Recommendation">
            <Sel value={form.recommendation} onChange={v => set("recommendation", v)}>
              {RECOMMENDATIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </Sel>
          </Field>
          <Field label="Strengths">
            <textarea className="w-full h-16 text-sm px-3 py-2 rounded-lg border border-input bg-background text-foreground outline-none focus:border-ring resize-none"
              placeholder="Key strengths observed…" value={form.strengths} onChange={e => set("strengths", e.target.value)} />
          </Field>
          <Field label="Areas for Improvement">
            <textarea className="w-full h-16 text-sm px-3 py-2 rounded-lg border border-input bg-background text-foreground outline-none focus:border-ring resize-none"
              placeholder="Concerns or gaps…" value={form.weaknesses} onChange={e => set("weaknesses", e.target.value)} />
          </Field>
          <Field label="Additional Notes">
            <textarea className="w-full h-16 text-sm px-3 py-2 rounded-lg border border-input bg-background text-foreground outline-none focus:border-ring resize-none"
              placeholder="Any other observations…" value={form.notes} onChange={e => set("notes", e.target.value)} />
          </Field>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={saving}>
              {saving ? <><Loader2 size={14} className="animate-spin mr-1" />Submitting…</> : "Submit Feedback"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Offer Modal ────────────────────────────────────────────────────────────────
const OfferModal = ({ candidate, onClose, onSaved }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    position:    candidate.offer?.position    || candidate.role || "",
    salary:      candidate.offer?.salary      || "",
    department:  candidate.offer?.department  || "",
    reportingTo: candidate.offer?.reportingTo || "",
    startDate:   candidate.offer?.startDate   || "",
    benefits:    candidate.offer?.benefits?.join(", ") || "",
    status:      candidate.offer?.status      || "draft",
    expiresAt:   candidate.offer?.expiresAt   ? new Date(candidate.offer.expiresAt).toISOString().split("T")[0] : "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, benefits: form.benefits.split(",").map(s => s.trim()).filter(Boolean) };
      const data = await updateOffer(candidate._id, payload);
      onSaved(data.candidate);
      onClose();
    } catch {}
    setSaving(false);
  };

  const handlePreview = () => {
    const previewCandidate = {
      ...candidate,
      offer: { ...form, benefits: form.benefits.split(",").map(s => s.trim()).filter(Boolean) },
    };
    const html = generateOfferHTML(previewCandidate, user?.name || "Your Company");
    const blob = new Blob([html], { type: "text/html" });
    window.open(URL.createObjectURL(blob), "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Offer Letter</h3>
          <Button variant="ghost" size="icon-sm" onClick={onClose}><X size={16} /></Button>
        </div>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Position"><Input value={form.position} onChange={e => set("position", e.target.value)} /></Field>
            <Field label="Department"><Input value={form.department} onChange={e => set("department", e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Salary / Compensation"><Input placeholder="e.g. ₹12 LPA" value={form.salary} onChange={e => set("salary", e.target.value)} /></Field>
            <Field label="Reporting To"><Input value={form.reportingTo} onChange={e => set("reportingTo", e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date"><Input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} /></Field>
            <Field label="Offer Expires"><Input type="date" value={form.expiresAt} onChange={e => set("expiresAt", e.target.value)} /></Field>
          </div>
          <Field label="Benefits (comma separated)">
            <Input placeholder="Health insurance, 21 days PTO, Laptop…" value={form.benefits} onChange={e => set("benefits", e.target.value)} />
          </Field>
          <Field label="Status">
            <Sel value={form.status} onChange={v => set("status", v)}>
              {["draft", "sent", "accepted", "declined", "expired"].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </Sel>
          </Field>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={handlePreview}>
              <Eye size={14} className="mr-1.5" />Preview
            </Button>
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 size={14} className="animate-spin mr-1" />Saving…</> : <><Save size={14} className="mr-1" />Save</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Onboard Modal ──────────────────────────────────────────────────────────────
const OnboardModal = ({ candidate, onClose, onOnboarded }) => {
  const [form, setForm] = useState({
    department: candidate.offer?.department || "",
    salary:     candidate.offer?.salary     || "",
    joinDate:   candidate.offer?.startDate  || new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const data = await triggerOnboarding(candidate._id, form);
      onOnboarded(data.candidate);
      onClose();
    } catch {}
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Trigger Onboarding</h3>
          <Button variant="ghost" size="icon-sm" onClick={onClose}><X size={16} /></Button>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-3 mb-4 text-xs text-amber-800 dark:text-amber-300">
          This will create an Employee record for <strong>{candidate.name}</strong> and move them to Hired.
        </div>
        <div className="flex flex-col gap-3">
          <Field label="Department"><Input value={form.department} onChange={e => set("department", e.target.value)} /></Field>
          <Field label="Salary (number)"><Input type="number" value={form.salary} onChange={e => set("salary", e.target.value)} /></Field>
          <Field label="Join Date"><Input type="date" value={form.joinDate} onChange={e => set("joinDate", e.target.value)} /></Field>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={saving}>
              {saving ? <><Loader2 size={14} className="animate-spin mr-1" />Creating…</> : <><UserPlus size={14} className="mr-1" />Onboard</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Candidate Detail Panel ─────────────────────────────────────────────────────
const CandidatePanel = ({ candidate, onClose, onUpdate, onDelete }) => {
  const [tab, setTab] = useState("overview");
  const [notes, setNotes] = useState(candidate.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [feedbackInterview, setFeedbackInterview] = useState(null);
  const [showOffer, setShowOffer] = useState(false);
  const [showOnboard, setShowOnboard] = useState(false);
  const [approveSaving, setApproveSaving] = useState(false);
  const [interviewStatus, setInterviewStatus] = useState({});

  useEffect(() => {
    setNotes(candidate.notes || "");
    setTab("overview");
  }, [candidate._id]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const data = await updateNotes(candidate._id, notes);
      onUpdate(data.candidate);
    } catch {}
    setSavingNotes(false);
  };

  const handleRating = async (rating) => {
    setSavingRating(true);
    try {
      const data = await updateRating(candidate._id, rating);
      onUpdate(data.candidate);
    } catch {}
    setSavingRating(false);
  };

  const handleApproval = async (status, rejectionReason) => {
    setApproveSaving(true);
    try {
      const data = await updateApproval(candidate._id, { status, rejectionReason });
      onUpdate(data.candidate);
    } catch {}
    setApproveSaving(false);
  };

  const handleInterviewStatus = async (iid, status) => {
    setInterviewStatus(p => ({ ...p, [iid]: true }));
    try {
      const data = await updateInterview(candidate._id, iid, status);
      onUpdate(data.candidate);
    } catch {}
    setInterviewStatus(p => ({ ...p, [iid]: false }));
  };

  const PANEL_TABS = [
    { id: "overview",   label: "Overview",   icon: Eye },
    { id: "interviews", label: "Interviews", icon: Calendar },
    { id: "offer",      label: "Offer",      icon: FileText },
    { id: "approval",   label: "Approval",   icon: UserCheck },
    { id: "history",    label: "History",    icon: Clock },
  ];

  const typeIcon = { phone: Phone, video: Video, "in-person": MapPin, technical: Briefcase, hr: Users };

  return (
    <>
      {showSchedule && (
        <ScheduleInterviewModal
          candidateId={candidate._id}
          onClose={() => setShowSchedule(false)}
          onScheduled={onUpdate}
        />
      )}
      {feedbackInterview && (
        <FeedbackModal
          candidateId={candidate._id}
          interview={feedbackInterview}
          onClose={() => setFeedbackInterview(null)}
          onSubmitted={onUpdate}
        />
      )}
      {showOffer && (
        <OfferModal
          candidate={candidate}
          onClose={() => setShowOffer(false)}
          onSaved={onUpdate}
        />
      )}
      {showOnboard && (
        <OnboardModal
          candidate={candidate}
          onClose={() => setShowOnboard(false)}
          onOnboarded={onUpdate}
        />
      )}

      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-card border-l border-border z-50 flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {candidate.name[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-foreground">{candidate.name}</p>
              <p className="text-xs text-muted-foreground">{candidate.role} {candidate.company ? `· ${candidate.company}` : ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StageBadge stage={candidate.stage} />
            <Button variant="ghost" size="icon-sm" onClick={onClose}><X size={16} /></Button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/30 flex-wrap">
          <a href={`mailto:${candidate.email}`}>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Mail size={12} />Email</Button>
          </a>
          {candidate.phone && (
            <a href={`tel:${candidate.phone}`}>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Phone size={12} />Call</Button>
            </a>
          )}
          {candidate.resumeUrl && (
            <a href={candidate.resumeUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Eye size={12} />Resume</Button>
            </a>
          )}
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowSchedule(true)}>
            <CalendarCheck size={12} />Schedule
          </Button>
          {!candidate.onboarding?.triggered && (
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowOnboard(true)}>
              <UserPlus size={12} />Onboard
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-destructive ml-auto" onClick={() => { onDelete(candidate._id); onClose(); }}>
            <Trash2 size={12} />Delete
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-4 overflow-x-auto">
          {PANEL_TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <Icon size={12} />{label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ── Overview ── */}
          {tab === "overview" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Email</p><p className="text-foreground">{candidate.email}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Phone</p><p className="text-foreground">{candidate.phone || "—"}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Experience</p><p className="text-foreground">{candidate.experience || "—"}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Source</p><p className="text-foreground capitalize">{candidate.source?.replace("_", " ") || "—"}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Applied</p><p className="text-foreground">{new Date(candidate.appliedDate).toLocaleDateString()}</p></div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Rating</p>
                  <StarRating rating={candidate.rating} onChange={handleRating} size={16} />
                </div>
              </div>

              {candidate.skills?.length > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Notes</p>
                <textarea
                  className="w-full h-24 text-sm px-3 py-2 rounded-lg border border-input bg-background text-foreground outline-none focus:border-ring resize-none"
                  value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Add notes about this candidate…"
                />
                <Button size="sm" className="mt-2 h-7 text-xs gap-1" onClick={handleSaveNotes} disabled={savingNotes || notes === (candidate.notes || "")}>
                  {savingNotes ? <><Loader2 size={12} className="animate-spin mr-1" />Saving…</> : <><Save size={12} />Save Notes</>}
                </Button>
              </div>

              {candidate.onboarding?.triggered && (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-600 shrink-0" />
                  <p className="text-xs text-green-800 dark:text-green-300">
                    Onboarded · Employee record created on {new Date(candidate.onboarding.triggeredAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Interviews ── */}
          {tab === "interviews" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">Interviews ({candidate.interviews?.length || 0})</p>
                <Button size="sm" className="h-7 text-xs gap-1" onClick={() => setShowSchedule(true)}>
                  <Plus size={12} />Schedule
                </Button>
              </div>

              {!candidate.interviews?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No interviews scheduled yet</p>
                </div>
              ) : (
                candidate.interviews.map((iv) => {
                  const TypeIcon = typeIcon[iv.type] || Video;
                  const rec = RECOMMENDATIONS.find(r => r.value === iv.feedback?.recommendation);
                  return (
                    <div key={iv._id} className="rounded-xl border border-border bg-muted/20 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <TypeIcon size={14} className="text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium capitalize">{iv.type?.replace("-", " ")} Interview</p>
                            <p className="text-xs text-muted-foreground">{iv.date} at {iv.time}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          iv.status === "completed" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" :
                          iv.status === "cancelled" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" :
                          iv.status === "no-show"   ? "bg-orange-100 text-orange-700" :
                          "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        }`}>{iv.status}</span>
                      </div>

                      {iv.interviewers?.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">Interviewers: {iv.interviewers.join(", ")}</p>
                      )}
                      {iv.meetLink && (
                        <a href={iv.meetLink} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">Join meeting →</a>
                      )}

                      {iv.feedback ? (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex items-center gap-2 mb-1.5">
                            <StarRating rating={iv.feedback.rating} size={12} />
                            {rec && <span className={`text-xs font-semibold ${rec.color}`}>{rec.label}</span>}
                          </div>
                          {iv.feedback.strengths && <p className="text-xs text-muted-foreground">✓ {iv.feedback.strengths}</p>}
                          {iv.feedback.weaknesses && <p className="text-xs text-muted-foreground mt-0.5">✗ {iv.feedback.weaknesses}</p>}
                          {iv.feedback.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">{iv.feedback.notes}</p>}
                          <Button size="sm" variant="ghost" className="h-6 text-xs mt-2 px-2" onClick={() => setFeedbackInterview(iv)}>
                            <Edit2 size={10} className="mr-1" />Edit Feedback
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                          {iv.status === "scheduled" && (
                            <>
                              <Button size="sm" variant="outline" className="h-7 text-xs flex-1"
                                disabled={!!interviewStatus[iv._id]} onClick={() => handleInterviewStatus(iv._id, "completed")}>
                                Mark Complete
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs flex-1"
                                disabled={!!interviewStatus[iv._id]} onClick={() => handleInterviewStatus(iv._id, "cancelled")}>
                                Cancel
                              </Button>
                            </>
                          )}
                          {iv.status === "completed" && (
                            <Button size="sm" className="h-7 text-xs w-full gap-1" onClick={() => setFeedbackInterview(iv)}>
                              <MessageSquare size={12} />Add Feedback
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── Offer ── */}
          {tab === "offer" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Offer Letter</p>
                <Button size="sm" className="h-7 text-xs gap-1" onClick={() => setShowOffer(true)}>
                  <Edit2 size={12} />{candidate.offer?.generatedAt ? "Edit Offer" : "Create Offer"}
                </Button>
              </div>

              {!candidate.offer?.generatedAt ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No offer letter yet</p>
                  <Button size="sm" className="mt-3 gap-1" onClick={() => setShowOffer(true)}>
                    <Plus size={12} />Generate Offer Letter
                  </Button>
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2.5">
                    {[
                      ["Position",    candidate.offer.position],
                      ["Department",  candidate.offer.department],
                      ["Salary",      candidate.offer.salary],
                      ["Start Date",  candidate.offer.startDate],
                      ["Reporting To",candidate.offer.reportingTo],
                    ].map(([k, v]) => v ? (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{k}</span>
                        <span className="font-medium text-foreground">{v}</span>
                      </div>
                    ) : null)}

                    {candidate.offer.benefits?.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Benefits</p>
                        <div className="flex flex-wrap gap-1">
                          {candidate.offer.benefits.map(b => (
                            <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{b}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        candidate.offer.status === "accepted" ? "bg-green-100 text-green-700" :
                        candidate.offer.status === "declined" ? "bg-red-100 text-red-700" :
                        candidate.offer.status === "sent"     ? "bg-blue-100 text-blue-700" :
                        "bg-muted text-muted-foreground"
                      }`}>{candidate.offer.status}</span>
                      <p className="text-[10px] text-muted-foreground">Generated {new Date(candidate.offer.generatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <Button variant="outline" className="gap-2" onClick={() => {
                    const html = generateOfferHTML(candidate, "Your Company");
                    const blob = new Blob([html], { type: "text/html" });
                    window.open(URL.createObjectURL(blob), "_blank");
                  }}>
                    <Download size={14} />Preview & Print Offer Letter
                  </Button>
                </>
              )}
            </div>
          )}

          {/* ── Approval ── */}
          {tab === "approval" && (
            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium">Hiring Approval</p>

              <div className={`rounded-xl border p-4 ${
                candidate.approval?.status === "approved" ? "border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900" :
                candidate.approval?.status === "rejected" ? "border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900" :
                "border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {candidate.approval?.status === "approved" ? <CheckCircle size={16} className="text-green-600" /> :
                   candidate.approval?.status === "rejected" ? <XCircle size={16} className="text-red-600" /> :
                   <AlertCircle size={16} className="text-amber-600" />}
                  <p className={`text-sm font-semibold capitalize ${
                    candidate.approval?.status === "approved" ? "text-green-700 dark:text-green-400" :
                    candidate.approval?.status === "rejected" ? "text-red-700 dark:text-red-400" :
                    "text-amber-700 dark:text-amber-400"
                  }`}>
                    {candidate.approval?.status || "Pending Approval"}
                  </p>
                </div>
                {candidate.approval?.approvedAt && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(candidate.approval.approvedAt).toLocaleDateString()}
                  </p>
                )}
                {candidate.approval?.rejectionReason && (
                  <p className="text-xs text-muted-foreground mt-1">Reason: {candidate.approval.rejectionReason}</p>
                )}
              </div>

              {candidate.approval?.status !== "approved" && (
                <Button className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                  disabled={approveSaving} onClick={() => handleApproval("approved")}>
                  {approveSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Approve Hiring
                </Button>
              )}
              {candidate.approval?.status !== "rejected" && (
                <Button variant="outline" className="w-full gap-2 border-destructive text-destructive hover:bg-destructive/10"
                  disabled={approveSaving}
                  onClick={() => {
                    const reason = window.prompt("Rejection reason (optional):");
                    if (reason !== null) handleApproval("rejected", reason);
                  }}>
                  <XCircle size={14} />Reject
                </Button>
              )}

              {!candidate.onboarding?.triggered && candidate.approval?.status === "approved" && (
                <div className="border border-dashed border-border rounded-xl p-4 text-center">
                  <UserPlus size={20} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">Approval granted. Ready to onboard?</p>
                  <Button size="sm" className="gap-1" onClick={() => setShowOnboard(true)}>
                    <ArrowRight size={12} />Start Onboarding
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ── History ── */}
          {tab === "history" && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium mb-1">Status History</p>
              {!candidate.statusHistory?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No status changes recorded</p>
                </div>
              ) : (
                <div className="relative pl-4">
                  <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border" />
                  {[...candidate.statusHistory].reverse().map((h, i) => (
                    <div key={i} className="relative mb-4 pl-4">
                      <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full border-2 border-primary bg-card" />
                      <StageBadge stage={h.stage} />
                      <p className="text-xs text-muted-foreground mt-1">{new Date(h.changedAt).toLocaleString()}</p>
                      {h.note && <p className="text-xs text-foreground mt-0.5">{h.note}</p>}
                    </div>
                  ))}
                  <div className="relative pl-4">
                    <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full border-2 border-muted-foreground bg-card" />
                    <StageBadge stage="applied" />
                    <p className="text-xs text-muted-foreground mt-1">{new Date(candidate.appliedDate).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ── Pipeline View (Kanban) ─────────────────────────────────────────────────────
const PipelineView = ({ candidates, onSelect, onStageChange, onDelete, dragging, setDragging }) => (
  <div className="flex gap-3 overflow-x-auto pb-3">
    {STAGES.map(stage => {
      const cols = candidates.filter(c => c.stage === stage.id);
      return (
        <div key={stage.id}
          className={`shrink-0 w-56 rounded-xl border-t-4 border border-border bg-muted/20 ${stage.color} flex flex-col`}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); if (dragging && dragging !== stage.id) onStageChange(dragging, stage.id); setDragging(null); }}>
          <div className="px-3 py-2.5 flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">{stage.label}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${stage.badge}`}>{cols.length}</span>
          </div>
          <div className="flex flex-col gap-2 p-2 flex-1 min-h-[180px]">
            {cols.map(c => (
              <div key={c._id} draggable
                onDragStart={() => setDragging(c._id)}
                onClick={() => onSelect(c)}
                className="rounded-lg border border-border bg-card p-3 hover:shadow-sm hover:border-primary/30 transition-all group cursor-pointer active:cursor-grabbing">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                      {c.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground leading-tight">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">{c.experience || "—"}</p>
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); if (window.confirm("Delete candidate?")) onDelete(c._id); }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0">
                    <Trash2 size={11} />
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mb-1.5 truncate">{c.role}</p>
                <StarRating rating={c.rating} />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {c.skills?.slice(0, 2).map(s => (
                    <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock size={9} />{new Date(c.appliedDate).toLocaleDateString()}
                  </span>
                  {c.interviews?.length > 0 && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar size={9} />{c.interviews.length}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {cols.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[10px] text-muted-foreground">Drop here</p>
              </div>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

// ── Candidates Table View ──────────────────────────────────────────────────────
const CandidatesView = ({ candidates, onSelect, onDelete, onStageChange }) => (
  <div className="rounded-xl border border-border overflow-hidden">
    <table className="w-full text-sm">
      <thead className="bg-muted/50">
        <tr>
          {["Candidate", "Role", "Stage", "Rating", "Source", "Interviews", "Applied", ""].map(h => (
            <th key={h} className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {candidates.length === 0 ? (
          <tr><td colSpan={8} className="text-center py-12 text-muted-foreground text-sm">No candidates found</td></tr>
        ) : candidates.map(c => (
          <tr key={c._id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => onSelect(c)}>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                  {c.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-foreground">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground">{c.email}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-muted-foreground">{c.role}</td>
            <td className="px-4 py-3">
              <select
                value={c.stage}
                onClick={e => e.stopPropagation()}
                onChange={e => onStageChange(c._id, e.target.value)}
                className="text-xs border border-input rounded-lg px-2 py-1 bg-background text-foreground outline-none focus:border-ring"
              >
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </td>
            <td className="px-4 py-3"><StarRating rating={c.rating} /></td>
            <td className="px-4 py-3 text-muted-foreground capitalize">{c.source?.replace("_", " ") || "—"}</td>
            <td className="px-4 py-3 text-muted-foreground">{c.interviews?.length || 0}</td>
            <td className="px-4 py-3 text-muted-foreground">{new Date(c.appliedDate).toLocaleDateString()}</td>
            <td className="px-4 py-3">
              <button onClick={e => { e.stopPropagation(); if (window.confirm("Delete?")) onDelete(c._id); }}
                className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 size={14} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ── Reports View ───────────────────────────────────────────────────────────────
const ReportsView = ({ report, loading }) => {
  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-muted-foreground" /></div>;
  if (!report) return <div className="text-center py-16 text-muted-foreground">No data yet</div>;

  const funnelStages = ["applied", "screening", "interview", "offer", "hired"];
  const maxCount = Math.max(...funnelStages.map(s => report.byStage?.find(x => x._id === s)?.count || 0), 1);
  const stageColors = { applied: "bg-blue-400", screening: "bg-violet-400", interview: "bg-amber-400", offer: "bg-emerald-400", hired: "bg-green-500", rejected: "bg-red-400" };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Summary cards */}
      <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Candidates",    value: report.total,                   icon: Users,        color: "text-blue-500" },
          { label: "Hired",               value: report.hired,                   icon: CheckCircle2, color: "text-green-500" },
          { label: "Avg Rating",          value: `${report.avgRating || 0}/5`,   icon: Star,         color: "text-amber-500" },
          { label: "Avg Time to Hire",    value: `${report.avgTimeToHire || 0}d`,icon: Clock,        color: "text-violet-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <Icon size={16} className={`${color} mb-2`} />
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Stage funnel */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold mb-4">Hiring Funnel</p>
        <div className="flex flex-col gap-3">
          {funnelStages.map(s => {
            const count = report.byStage?.find(x => x._id === s)?.count || 0;
            const pct = Math.round((count / maxCount) * 100);
            return (
              <div key={s}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="capitalize text-foreground">{s}</span>
                  <span className="font-semibold text-foreground">{count}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${stageColors[s] || "bg-primary"} transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Source breakdown */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold mb-4">Candidate Sources</p>
        {!report.bySource?.length ? (
          <p className="text-sm text-muted-foreground">No data yet</p>
        ) : (
          <div className="flex flex-col gap-3">
            {report.bySource.map(({ _id: src, count }) => {
              const pct = Math.round((count / report.total) * 100);
              return (
                <div key={src}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="capitalize text-foreground">{src?.replace("_", " ") || "Unknown"}</span>
                    <span className="font-semibold text-foreground">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Offer acceptance */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold mb-4">Offer Acceptance Rate</p>
        <div className="flex items-center justify-center">
          <div className="relative w-28 h-28">
            <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3"
                strokeDasharray={`${report.offerAcceptanceRate} ${100 - report.offerAcceptanceRate}`}
                className="text-primary" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground">{report.offerAcceptanceRate}%</span>
              <span className="text-[10px] text-muted-foreground">acceptance</span>
            </div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-4">
          <span>Hired: <strong className="text-foreground">{report.hired}</strong></span>
          <span>Rejected: <strong className="text-foreground">{report.rejected || 0}</strong></span>
          <span>Total: <strong className="text-foreground">{report.total}</strong></span>
        </div>
      </div>

      {/* Compliance summary */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold mb-4">Compliance Summary</p>
        <div className="flex flex-col gap-3 text-sm">
          {[
            { label: "Total Applications",  value: report.total },
            { label: "Candidates Hired",    value: report.hired },
            { label: "Candidates Rejected", value: report.rejected || 0 },
            { label: "Avg Rating",          value: `${report.avgRating}/5` },
            { label: "Avg Days to Hire",    value: `${report.avgTimeToHire} days` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main ATS Component ─────────────────────────────────────────────────────────
const ATS = () => {
  const { user } = useAuth();
  if (!user?.isPremium) return <MainLayout><PremiumGate feature="ATS (Applicant Tracking System)" /></MainLayout>;

  const [candidates, setCandidates]         = useState([]);
  const [loading, setLoading]               = useState(true);
  const [reportLoading, setReportLoading]   = useState(false);
  const [search, setSearch]                 = useState("");
  const [stageFilter, setStageFilter]       = useState("all");
  const [sourceFilter, setSourceFilter]     = useState("all");
  const [activeTab, setActiveTab]           = useState("pipeline");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showAddModal, setShowAddModal]     = useState(false);
  const [dragging, setDragging]             = useState(null);
  const [report, setReport]                 = useState(null);

  const loadCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCandidates();
      setCandidates(data.candidates || []);
    } catch {}
    setLoading(false);
  }, []);

  const loadReport = useCallback(async () => {
    setReportLoading(true);
    try {
      const data = await getAtsReport();
      setReport(data.report);
    } catch {}
    setReportLoading(false);
  }, []);

  useEffect(() => { loadCandidates(); }, [loadCandidates]);

  useEffect(() => {
    if (activeTab === "reports" && !report) loadReport();
  }, [activeTab]);

  const updateCandidateInList = useCallback((updated) => {
    setCandidates(prev => prev.map(c => c._id === updated._id ? updated : c));
    setSelectedCandidate(updated);
  }, []);

  const handleStageChange = async (id, stage) => {
    try {
      const data = await updateStage(id, stage);
      setCandidates(prev => prev.map(c => c._id === id ? data.candidate : c));
      if (selectedCandidate?._id === id) setSelectedCandidate(data.candidate);
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await deleteCandidate(id);
      setCandidates(prev => prev.filter(c => c._id !== id));
      if (selectedCandidate?._id === id) setSelectedCandidate(null);
    } catch {}
  };

  const filtered = candidates.filter(c => {
    if (stageFilter !== "all" && c.stage !== stageFilter) return false;
    if (sourceFilter !== "all" && c.source !== sourceFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
    }
    return true;
  });

  const statCards = [
    { label: "Total",      value: candidates.length,                                  icon: Users        },
    { label: "Interviews", value: candidates.filter(c => c.stage === "interview").length, icon: Calendar },
    { label: "Offers",     value: candidates.filter(c => c.stage === "offer").length, icon: FileText     },
    { label: "Hired",      value: candidates.filter(c => c.stage === "hired").length, icon: TrendingUp   },
  ];

  const MAIN_TABS = [
    { id: "pipeline",   label: "Pipeline" },
    { id: "candidates", label: "All Candidates" },
    { id: "reports",    label: "Reports" },
  ];

  return (
    <MainLayout>
      {showAddModal && (
        <AddCandidateModal
          onClose={() => setShowAddModal(false)}
          onAdd={c => setCandidates(prev => [c, ...prev])}
        />
      )}
      {selectedCandidate && (
        <CandidatePanel
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onUpdate={updateCandidateInList}
          onDelete={handleDelete}
        />
      )}

      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">Applicant Tracking</h1>
            <p className="text-xs text-muted-foreground">End-to-end hiring pipeline management</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1.5 h-8" onClick={loadCandidates}>
              <RefreshCw size={13} />
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setShowAddModal(true)}>
              <Plus size={14} />Add Candidate
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <Icon size={16} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs + filters */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex bg-muted rounded-lg p-1 gap-1">
            {MAIN_TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${activeTab === t.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {activeTab !== "reports" && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input placeholder="Search…" className="pl-8 h-8 text-sm w-44" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select
                value={stageFilter} onChange={e => setStageFilter(e.target.value)}
                className="h-8 text-xs px-2.5 rounded-lg border border-input bg-background text-foreground outline-none">
                <option value="all">All stages</option>
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <select
                value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
                className="h-8 text-xs px-2.5 rounded-lg border border-input bg-background text-foreground outline-none">
                <option value="all">All sources</option>
                {SOURCES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-muted-foreground" />
          </div>
        ) : activeTab === "pipeline" ? (
          <PipelineView
            candidates={filtered}
            onSelect={setSelectedCandidate}
            onStageChange={(id, stage) => handleStageChange(id, stage)}
            onDelete={handleDelete}
            dragging={dragging}
            setDragging={setDragging}
          />
        ) : activeTab === "candidates" ? (
          <CandidatesView
            candidates={filtered}
            onSelect={setSelectedCandidate}
            onDelete={handleDelete}
            onStageChange={(id, stage) => handleStageChange(id, stage)}
          />
        ) : (
          <ReportsView report={report} loading={reportLoading} />
        )}
      </div>
    </MainLayout>
  );
};

export default ATS;
