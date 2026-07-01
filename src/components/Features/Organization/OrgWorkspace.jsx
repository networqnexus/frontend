import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAuth from "@/hooks/useAuth";
import {
  getOrg, getWorkspaceStats,
  getOrgCandidates, addOrgCandidate, updateOrgCandStage, deleteOrgCandidate,
  getOrgAtsReport, getOrgHiringAssistant, getOrgJobs, createOrgJob, toggleOrgJob, deleteOrgJob,
  getOrgLeads, addOrgLead, updateOrgLead, deleteOrgLead,
  getOrgEmployees, addOrgEmployee, updateOrgEmployee, deleteOrgEmployee,
  getOrgLeaves, updateOrgLeaveStatus, sendOrgLetter, confirmOrgOffer,
  getAttendance, bulkMarkAttendance, getAttendanceSummary
} from "@/api/orgApi";
import {
  Building2, LayoutDashboard, Users, Briefcase, TrendingUp, Plus,
  Trash2, X, Loader2, ArrowLeft, ArrowRight, Star, ChevronDown, IndianRupee,
  UserCheck, UserX, ClipboardList, BadgeCheck, CalendarCheck, ChevronLeft, ChevronRight,
  FileText, Send, Sparkles, SlidersHorizontal, Inbox, CheckCircle2, Clock, Calendar,
} from "lucide-react";

// ── Stage configs ─────────────────────────────────────────────────────
const ATS_STAGES = ["applied","screening","interview","offer","hired","rejected"];
const ATS_COLORS = { applied:"bg-muted text-muted-foreground", screening:"bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400", interview:"bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400", offer:"bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400", hired:"bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400", rejected:"bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" };
const CRM_STAGES = ["prospect","qualified","proposal","negotiation","closed_won","closed_lost"];
const CRM_COLORS = { prospect:"bg-muted text-muted-foreground", qualified:"bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400", proposal:"bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400", negotiation:"bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400", closed_won:"bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400", closed_lost:"bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" };
const LEAVE_COLORS = { pending:"bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400", approved:"bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400", rejected:"bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" };

// ── Reusable small modal ──────────────────────────────────────────────
const Modal = ({ title, onClose, children, footer }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-card rounded-2xl border border-border w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"><X size={15}/></button>
      </div>
      <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-3">{children}</div>
      {footer && <div className="flex gap-2 px-5 py-4 border-t border-border shrink-0">{footer}</div>}
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div><label className="text-xs font-medium text-foreground mb-1 block">{label}</label>{children}</div>
);

// ── Dashboard Tab ─────────────────────────────────────────────────────
const DashboardTab = ({ orgId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getWorkspaceStats(orgId).then(d => setStats(d.stats)).catch(() => {}).finally(() => setLoading(false));
  }, [orgId]);

  const cards = stats ? [
    { icon: <Users size={20} className="text-blue-500"/>, label: "Candidates", value: stats.candidates, bg: "bg-blue-50 dark:bg-blue-950" },
    { icon: <TrendingUp size={20} className="text-emerald-500"/>, label: "CRM Leads", value: stats.leads, bg: "bg-emerald-50 dark:bg-emerald-950" },
    { icon: <UserCheck size={20} className="text-purple-500"/>, label: "Employees", value: stats.employees, bg: "bg-purple-50 dark:bg-purple-950" },
    { icon: <IndianRupee size={20} className="text-amber-500"/>, label: "Pipeline Value", value: `₹${(stats.pipeline/100000).toFixed(1)}L`, bg: "bg-amber-50 dark:bg-amber-950" },
  ] : [];

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-muted-foreground"/></div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(c => (
          <div key={c.label} className={`rounded-xl border border-border p-4 flex flex-col gap-2 ${c.bg}`}>
            {c.icon}
            <p className="text-2xl font-bold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-5 text-center py-8">
        <ClipboardList size={32} className="text-muted-foreground mx-auto mb-2 opacity-30"/>
        <p className="text-sm text-muted-foreground">Use the tabs above to manage ATS, CRM, and HRMS for your organization.</p>
      </div>
    </div>
  );
};

// ── ATS Tab ───────────────────────────────────────────────────────────
const EMPTY_CAND = { name:"", email:"", phone:"", role:"", company:"", experience:"", skills:"", stage:"applied" };
const ATS_SUBTABS = [
  { id: "candidates", label: "Candidates" },
  { id: "jobs",        label: "Jobs" },
  { id: "reports",     label: "Reports" },
];

const ATSTab = ({ orgId }) => {
  const [subTab, setSubTab] = useState("candidates");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_CAND);
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(p => ({...p,[k]:v}));

  useEffect(() => { load(); }, [orgId]);
  const load = () => {
    setLoading(true);
    getOrgCandidates(orgId).then(d => setCandidates(d.candidates || [])).catch(() => {}).finally(() => setLoading(false));
  };

  const handleAdd = async () => {
    if (!form.name || !form.role) return;
    setSaving(true);
    try {
      const d = await addOrgCandidate(orgId, { ...form, skills: form.skills.split(",").map(s=>s.trim()).filter(Boolean) });
      setCandidates(p => [d.candidate, ...p]);
      setForm(EMPTY_CAND); setShowAdd(false);
    } catch {}
    setSaving(false);
  };

  const handleStage = async (id, stage) => {
    try {
      await updateOrgCandStage(orgId, id, stage);
      setCandidates(p => p.map(c => c._id === id ? {...c, stage} : c));
    } catch {}
  };

  const handleDelete = async (id) => {
    try { await deleteOrgCandidate(orgId, id); setCandidates(p => p.filter(c => c._id !== id)); } catch {}
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex bg-muted rounded-lg p-1 gap-1 w-fit">
        {ATS_SUBTABS.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${subTab === t.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {subTab === "jobs" ? (
        <JobsSubTab orgId={orgId} />
      ) : subTab === "reports" ? (
        <ATSReportsView orgId={orgId} />
      ) : (
      <>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{candidates.length} candidates</p>
        <Button size="sm" className="gap-1.5" onClick={() => setShowAdd(true)}><Plus size={13}/>Add Candidate</Button>
      </div>

      {showAdd && (
        <Modal title="Add Candidate" onClose={() => setShowAdd(false)}
          footer={<><Button variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button><Button className="flex-1" onClick={handleAdd} disabled={saving}>{saving ? <Loader2 size={14} className="animate-spin"/> : "Add"}</Button></>}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name *"><Input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Full name"/></Field>
            <Field label="Role *"><Input value={form.role} onChange={e=>set("role",e.target.value)} placeholder="Job title"/></Field>
            <Field label="Email"><Input value={form.email} onChange={e=>set("email",e.target.value)} placeholder="email@example.com"/></Field>
            <Field label="Phone"><Input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="+91 XXXXX XXXXX"/></Field>
            <Field label="Company"><Input value={form.company} onChange={e=>set("company",e.target.value)} placeholder="Current company"/></Field>
            <Field label="Experience"><Input value={form.experience} onChange={e=>set("experience",e.target.value)} placeholder="e.g. 3 years"/></Field>
            <Field label="Stage">
              <select value={form.stage} onChange={e=>set("stage",e.target.value)} className="w-full h-9 text-sm px-3 rounded-lg border border-input bg-background text-foreground outline-none">
                {ATS_STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </Field>
            <Field label="Skills"><Input value={form.skills} onChange={e=>set("skills",e.target.value)} placeholder="React, Node.js (comma sep)"/></Field>
          </div>
        </Modal>
      )}

      {loading ? <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-muted-foreground"/></div>
      : candidates.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <Users size={28} className="text-muted-foreground mx-auto mb-2 opacity-30"/>
          <p className="text-sm text-muted-foreground">No candidates yet. Add your first candidate.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30"><th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Candidate</th><th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Role</th><th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Stage</th><th className="px-4 py-2.5 text-xs font-medium text-muted-foreground"></th></tr></thead>
            <tbody className="divide-y divide-border">
              {candidates.map(c => (
                <tr key={c._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{c.role}{c.experience && ` · ${c.experience}`}</td>
                  <td className="px-4 py-3">
                    <select value={c.stage} onChange={e => handleStage(c._id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${ATS_COLORS[c.stage] || ATS_COLORS.applied}`}>
                      {ATS_STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(c._id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={13}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </>
      )}
    </div>
  );
};

// ── ATS: Jobs sub-tab (org-scoped job postings) ────────────────────────
const JOB_WORKPLACE_TYPES = ["Remote", "Hybrid", "On-site"];
const JOB_LEVELS = ["Junior", "Mid", "Senior", "Lead"];
const JOB_EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Temporary"];
const EMPTY_JOB_FORM = { title:"", company:"", location:"", type:"Remote", level:"Junior", employmentType:"Full-time", salary:"", description:"", skills:"", requirements:"", perks:"" };
const POST_JOB_STEPS = [
  { id: 1, label: "Job details" },
  { id: 2, label: "Description & skills" },
  { id: 3, label: "Review & publish" },
];

const StepBadge = ({ n, active, done }) => (
  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 shrink-0 ${
    done ? "bg-primary border-primary text-primary-foreground" : active ? "border-primary text-primary" : "border-border text-muted-foreground"
  }`}>
    {done ? <CheckCircle2 size={14} /> : n}
  </div>
);

// ── Post a Job wizard (with Applicant Insights + reuse-a-past-posting panel) ──
const PostJobWizard = ({ orgId, orgJobs, onClose, onPosted }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_JOB_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const insight = (() => {
    if (!form.type || !form.level) return null;
    const similar = orgJobs.filter(j => j.type === form.type && j.level === form.level);
    if (similar.length < 2) return null;
    const avg = Math.round(similar.reduce((s, j) => s + (j.applicants?.length || 0), 0) / similar.length);
    return { avg, sampleSize: similar.length };
  })();

  const reuseJob = (job) => {
    setForm({
      title: job.title, company: job.company, location: job.location,
      type: job.type, level: job.level, employmentType: job.employmentType || "Full-time",
      salary: job.salary || "", description: job.description || "",
      skills: (job.skills || []).join(", "),
      requirements: (job.requirements || []).join("\n"),
      perks: (job.perks || []).join(", "),
    });
    setStep(3);
  };

  const canAdvance = step === 1 ? (form.title && form.company && form.location) : true;

  const handlePublish = async () => {
    setSaving(true); setError("");
    try {
      await createOrgJob(orgId, {
        ...form,
        skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
        requirements: form.requirements.split("\n").map(s => s.trim()).filter(Boolean),
        perks: form.perks.split(",").map(s => s.trim()).filter(Boolean),
      });
      onPosted(); onClose();
    } catch (e) { setError(e.message || "Failed to post the job. Please try again."); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl border border-border w-full max-w-4xl shadow-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            {POST_JOB_STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <StepBadge n={s.id} active={step === s.id} done={step > s.id} />
                <span className={`text-xs font-medium hidden sm:inline ${step === s.id ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                {i < POST_JOB_STEPS.length - 1 && <div className="w-8 h-px bg-border" />}
              </div>
            ))}
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"><X size={16}/></button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Main form */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4 border-r border-border">
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Company *"><Input placeholder="Company name" value={form.company} onChange={e => set("company", e.target.value)} /></Field>
                <Field label="Job title *"><Input placeholder="e.g. Senior React Developer" value={form.title} onChange={e => set("title", e.target.value)} /></Field>
                <Field label="Workplace type">
                  <select value={form.type} onChange={e => set("type", e.target.value)} className="w-full h-9 text-sm px-3 rounded-lg border border-input bg-background text-foreground outline-none">
                    {JOB_WORKPLACE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Job location *"><Input placeholder="City or metro area" value={form.location} onChange={e => set("location", e.target.value)} /></Field>
                <Field label="Employment type">
                  <select value={form.employmentType} onChange={e => set("employmentType", e.target.value)} className="w-full h-9 text-sm px-3 rounded-lg border border-input bg-background text-foreground outline-none">
                    {JOB_EMPLOYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Seniority level">
                  <select value={form.level} onChange={e => set("level", e.target.value)} className="w-full h-9 text-sm px-3 rounded-lg border border-input bg-background text-foreground outline-none">
                    {JOB_LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </Field>
                <Field label="Salary"><Input placeholder="e.g. ₹8–12 LPA" value={form.salary} onChange={e => set("salary", e.target.value)} /></Field>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <Field label="Job description">
                  <textarea placeholder="Describe the role, responsibilities, and team…" value={form.description} onChange={e => set("description", e.target.value)} rows={5}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-transparent outline-none resize-none focus:ring-1 focus:ring-ring transition-colors" />
                </Field>
                <Field label="Required skills (comma separated)"><Input placeholder="React, Node.js, MongoDB" value={form.skills} onChange={e => set("skills", e.target.value)} /></Field>
                <Field label="Requirements (one per line)">
                  <textarea placeholder={"3+ years of experience\nB.Tech in CS or related field"} value={form.requirements} onChange={e => set("requirements", e.target.value)} rows={3}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-transparent outline-none resize-none focus:ring-1 focus:ring-ring transition-colors" />
                </Field>
                <Field label="Perks (comma separated)"><Input placeholder="Health Insurance, Flexible Hours, Stock Options" value={form.perks} onChange={e => set("perks", e.target.value)} /></Field>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-foreground mb-1">Review your job post</p>
                {[
                  ["Company", form.company], ["Job title", form.title], ["Location", form.location],
                  ["Workplace type", form.type], ["Employment type", form.employmentType], ["Seniority level", form.level],
                  ["Salary", form.salary || "—"], ["Skills", form.skills || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm border-b border-border pb-2">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium text-foreground text-right max-w-xs truncate">{v}</span>
                  </div>
                ))}
                {form.description && <div><p className="text-xs text-muted-foreground mb-1">Description</p><p className="text-sm text-foreground whitespace-pre-wrap">{form.description}</p></div>}
                {error && <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
              </div>
            )}
          </div>

          {/* Sidebar: Applicant Insights + AI job posting */}
          <div className="w-72 shrink-0 overflow-y-auto px-5 py-5 flex flex-col gap-4 bg-muted/20">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1.5"><TrendingUp size={14}/>Applicant insights</p>
              {insight ? (
                <>
                  <p className="text-2xl font-bold text-foreground mt-2">~{insight.avg}</p>
                  <p className="text-xs text-muted-foreground">expected applicants, based on {insight.sampleSize} similar postings ({form.type} · {form.level})</p>
                </>
              ) : (
                <>
                  <Sparkles size={20} className="text-muted-foreground mt-2 mb-1 opacity-40" />
                  <p className="text-xs font-medium text-foreground">Not enough data</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Fill out more of your job post to get applicant insight estimates.</p>
                </>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1.5"><Sparkles size={14}/>AI job posting</p>
              <p className="text-xs text-muted-foreground mb-3">Skip the editing and use the details from a posted job</p>
              {!orgJobs.length ? (
                <p className="text-xs text-muted-foreground">No past postings yet.</p>
              ) : (
                <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                  {orgJobs.slice(0, 8).map(j => (
                    <button key={j._id} onClick={() => reuseJob(j)}
                      className="text-left text-xs px-2.5 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors">
                      <p className="font-medium text-foreground truncate">{j.title}</p>
                      <p className="text-muted-foreground truncate">{j.company} · {j.location}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
          {step > 1 && <Button variant="outline" className="gap-1.5" onClick={() => setStep(s => s - 1)}><ArrowLeft size={14}/>Back</Button>}
          <div className="flex-1" />
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {step < 3 ? (
            <Button className="gap-1.5" disabled={!canAdvance} onClick={() => setStep(s => s + 1)}>Next<ArrowRight size={14}/></Button>
          ) : (
            <Button className="gap-1.5" disabled={saving} onClick={handlePublish}>
              {saving ? <><Loader2 size={14} className="animate-spin"/>Publishing…</> : "Publish Job"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const JobsSubTab = ({ orgId }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  const load = () => {
    setLoading(true);
    getOrgJobs(orgId).then(d => setJobs(d.jobs || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [orgId]);

  const handleToggle = async (id) => {
    try { const d = await toggleOrgJob(orgId, id); setJobs(p => p.map(j => j._id === id ? { ...j, active: d.active } : j)); } catch {}
  };
  const handleDelete = async (id) => {
    try { await deleteOrgJob(orgId, id); setJobs(p => p.filter(j => j._id !== id)); } catch {}
  };

  return (
    <div className="flex flex-col gap-3">
      {showWizard && (
        <PostJobWizard orgId={orgId} orgJobs={jobs} onClose={() => setShowWizard(false)} onPosted={load} />
      )}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{jobs.length} job postings</p>
        <Button size="sm" className="gap-1.5" onClick={() => setShowWizard(true)}><Plus size={13}/>Post a Job</Button>
      </div>

      {loading ? <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-muted-foreground"/></div>
      : jobs.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <Briefcase size={28} className="text-muted-foreground mx-auto mb-2 opacity-30"/>
          <p className="text-sm text-muted-foreground">No jobs posted yet. Post your first job for this organization.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Job</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Type / Level</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Applicants</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground"></th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {jobs.map(j => (
                <tr key={j._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{j.title}</p>
                    <p className="text-xs text-muted-foreground">{j.company} · {j.location}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{j.type} · {j.level}</td>
                  <td className="px-4 py-3 text-foreground">{j.applicants?.length || 0}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(j._id)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${j.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                      {j.active ? "Active" : "Closed"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(j._id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={13}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── ATS: Reports sub-tab (LinkedIn Recruiter–style report suite) ───────
const REPORT_STAGE_LABELS = { applied:"Applied", screening:"Screening", interview:"Interview", offer:"Offer", hired:"Hired", rejected:"Rejected" };
const REPORT_BAR_COLORS = { applied:"bg-blue-400", screening:"bg-violet-400", interview:"bg-amber-400", offer:"bg-emerald-400", hired:"bg-green-500", rejected:"bg-red-400" };
const REPORT_TABS = [
  { id: "summary",          label: "Summary" },
  { id: "pipeline",         label: "Pipeline" },
  { id: "usage",            label: "Usage" },
  { id: "inmail",           label: "InMail" },
  { id: "jobs",             label: "Jobs" },
  { id: "source",           label: "Source" },
  { id: "funnel",           label: "Funnel" },
  { id: "hiring-assistant", label: "Hiring Assistant" },
  { id: "custom",           label: "Custom" },
];

const MiniStars = ({ rating = 0 }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(i => <Star key={i} size={11} className={i <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"} />)}
  </div>
);

const ReportStatCard = ({ label, value, icon: Icon, color }) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <Icon size={16} className={`${color} mb-2`} />
    <p className="text-2xl font-bold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
  </div>
);

const EmptyReport = ({ icon: Icon = Inbox, title = "Not enough data", children }) => (
  <div className="rounded-xl border border-border bg-card p-8 text-center">
    <Icon size={32} className="mx-auto mb-3 text-muted-foreground opacity-40" />
    <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
    {children && <p className="text-xs text-muted-foreground max-w-sm mx-auto">{children}</p>}
  </div>
);

const ReportSummaryTab = ({ rep }) => {
  if (!rep) return <EmptyReport>Add candidates to start seeing summary metrics.</EmptyReport>;
  const stages = ["applied", "screening", "interview", "offer", "hired"];
  const maxCount = Math.max(...stages.map(s => rep.byStage?.find(x => x._id === s)?.count || 0), 1);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ReportStatCard label="Total Candidates" value={rep.total}                   icon={Users}        color="text-blue-500" />
        <ReportStatCard label="Hired"            value={rep.hired}                   icon={CheckCircle2} color="text-green-500" />
        <ReportStatCard label="Avg Rating"       value={`${rep.avgRating || 0}/5`}    icon={Star}         color="text-amber-500" />
        <ReportStatCard label="Avg Time to Hire" value={`${rep.avgTimeToHire || 0}d`} icon={Clock}        color="text-violet-500" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold mb-4">Hiring Funnel</p>
        <div className="flex flex-col gap-3">
          {stages.map(s => {
            const count = rep.byStage?.find(x => x._id === s)?.count || 0;
            const pct = Math.round((count / maxCount) * 100);
            return (
              <div key={s}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-foreground">{REPORT_STAGE_LABELS[s]}</span>
                  <span className="font-semibold text-foreground">{count}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${REPORT_BAR_COLORS[s]}`} style={{ width: `${pct}%` }} /></div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold mb-4">Offer Acceptance Rate</p>
        <div className="flex items-center justify-center">
          <div className="relative w-28 h-28">
            <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3"
                strokeDasharray={`${rep.offerAcceptanceRate} ${100 - rep.offerAcceptanceRate}`} className="text-primary" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground">{rep.offerAcceptanceRate}%</span>
              <span className="text-[10px] text-muted-foreground">acceptance</span>
            </div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-4">
          <span>Hired: <strong className="text-foreground">{rep.hired}</strong></span>
          <span>Rejected: <strong className="text-foreground">{rep.rejected || 0}</strong></span>
          <span>Total: <strong className="text-foreground">{rep.total}</strong></span>
        </div>
      </div>
    </div>
  );
};

const ReportPipelineTab = ({ pipeline }) => {
  const moved = [...(pipeline?.movedInto || [])].sort((a, b) => b.count - a.count);
  const byStage = pipeline?.byStage || [];
  const maxMoved = Math.max(...moved.map(m => m.count), 1);
  const maxSnap = Math.max(...byStage.map(s => s.count), 1);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold mb-1">Sourcing Pipeline</p>
        <p className="text-xs text-muted-foreground mb-4">Stage moves recorded in the selected date range</p>
        {!moved.length ? <p className="text-sm text-muted-foreground">No stage changes recorded yet</p> : (
          <div className="flex flex-col gap-3">
            {moved.map(m => {
              const pct = Math.round((m.count / maxMoved) * 100);
              return (
                <div key={m._id}>
                  <div className="flex items-baseline gap-1.5 text-xs mb-1">
                    <span className="text-lg font-bold text-foreground">{m.count}</span>
                    <span className="text-muted-foreground">moved into <strong className="text-foreground">{REPORT_STAGE_LABELS[m._id] || m._id}</strong></span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${REPORT_BAR_COLORS[m._id] || "bg-primary"}`} style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold mb-4">Current Pipeline Snapshot</p>
        {!byStage.length ? <p className="text-sm text-muted-foreground">No candidates yet</p> : (
          <div className="flex flex-col gap-3">
            {ATS_STAGES.map(s => {
              const count = byStage.find(x => x._id === s)?.count || 0;
              const pct = Math.round((count / maxSnap) * 100);
              return (
                <div key={s}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-foreground">{REPORT_STAGE_LABELS[s]}</span>
                    <span className="font-semibold text-foreground">{count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${REPORT_BAR_COLORS[s] || "bg-primary"}`} style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const ReportUsageTab = ({ usage }) => {
  const ts = usage?.timeseries || [];
  const max = Math.max(...ts.map(t => t.count), 1);
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ReportStatCard label="Job Slot Utilization" value={`${usage?.jobSlotUtilization ?? 0}%`} icon={Briefcase} color="text-blue-500" />
        <ReportStatCard label="Active Jobs"          value={usage?.activeJobs ?? 0}               icon={Building2} color="text-emerald-500" />
        <ReportStatCard label="Interviews Scheduled" value={usage?.interviewsScheduled ?? 0}       icon={Calendar}  color="text-amber-500" />
        <ReportStatCard label="Active Recruiters"    value={usage?.activeRecruiters ?? 0}          icon={Users}     color="text-violet-500" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold mb-1">Candidates Added Over Time</p>
        <p className="text-xs text-muted-foreground mb-4">Daily activity in the selected date range</p>
        {!ts.length ? <p className="text-sm text-muted-foreground">No activity yet</p> : (
          <div className="flex items-end gap-1 h-32">
            {ts.map(t => (
              <div key={t._id} title={`${t._id}: ${t.count}`} className="flex-1 bg-primary/70 hover:bg-primary rounded-t transition-colors"
                style={{ height: `${Math.max((t.count / max) * 100, 4)}%` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ReportInMailTab = () => (
  <EmptyReport icon={Inbox} title="Not enough data">
    This organization doesn't have an InMail/email integration connected yet, so response-rate tracking isn't available here.
    Reach out to candidates directly — once messaging is connected, this report will populate automatically.
  </EmptyReport>
);

const ReportJobsTab = ({ jobs }) => {
  if (!jobs?.length) return <EmptyReport icon={Building2}>Post a job and link candidates to it to see per-job performance here.</EmptyReport>;
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50"><tr>
          {["Job", "Status", "Candidates", "Hired", "Avg Rating"].map(h => <th key={h} className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">{h}</th>)}
        </tr></thead>
        <tbody className="divide-y divide-border">
          {jobs.map((j, i) => (
            <tr key={j.jobId || i} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3"><p className="font-medium text-foreground">{j.title}</p>{j.company && <p className="text-[10px] text-muted-foreground">{j.company}</p>}</td>
              <td className="px-4 py-3">
                {j.active === null ? <span className="text-xs text-muted-foreground">—</span> : (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${j.active ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-muted text-muted-foreground"}`}>{j.active ? "Active" : "Closed"}</span>
                )}
              </td>
              <td className="px-4 py-3 text-foreground">{j.candidatesCount}</td>
              <td className="px-4 py-3 text-foreground">{j.hiredCount}</td>
              <td className="px-4 py-3"><MiniStars rating={Math.round(j.avgRating)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ReportSourceTab = ({ source, total }) => {
  const bySource = source?.bySource || [];
  if (!bySource.length) return <EmptyReport icon={Users}>No sourced candidates yet.</EmptyReport>;
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50"><tr>
          {["Source", "Candidates", "Hired", "Conversion Rate"].map(h => <th key={h} className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">{h}</th>)}
        </tr></thead>
        <tbody className="divide-y divide-border">
          {bySource.map(s => (
            <tr key={s._id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 text-foreground capitalize">{s._id?.replace("_", " ") || "Unknown"}</td>
              <td className="px-4 py-3 text-foreground">{s.count} {total ? `(${Math.round((s.count / total) * 100)}%)` : ""}</td>
              <td className="px-4 py-3 text-foreground">{s.hired}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${s.conversionRate}%` }} /></div>
                  <span className="text-xs text-muted-foreground">{s.conversionRate}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ReportFunnelTab = ({ funnel }) => {
  const steps = funnel?.steps || [];
  const max = Math.max(...steps.map(s => s.count), 1);
  if (!steps.length) return <EmptyReport>No candidates yet.</EmptyReport>;
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm font-semibold mb-4">Hiring Funnel Conversion</p>
      <div className="flex flex-col gap-4">
        {steps.map((s, i) => {
          const pct = Math.round((s.count / max) * 100);
          return (
            <div key={s.stage}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-foreground">{REPORT_STAGE_LABELS[s.stage] || s.stage}</span>
                <span className="text-muted-foreground">
                  <strong className="text-foreground">{s.count}</strong>
                  {i > 0 && <span className="ml-2">· {s.conversionFromPrev}% from previous stage</span>}
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${REPORT_BAR_COLORS[s.stage] || "bg-primary"}`} style={{ width: `${pct}%` }} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ReportHiringAssistantTab = ({ orgId }) => {
  const [state, setState] = useState({ suggestions: [], loading: true });
  useEffect(() => {
    getOrgHiringAssistant(orgId).then(d => setState({ suggestions: d.suggestions || [], loading: false })).catch(() => setState({ suggestions: [], loading: false }));
  }, [orgId]);

  if (state.loading) return <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-muted-foreground" /></div>;
  if (!state.suggestions.length) return <EmptyReport icon={Sparkles}>Post an active job with required skills, and add candidates with matching skills, to get AI-assisted shortlist suggestions here.</EmptyReport>;

  return (
    <div className="flex flex-col gap-4">
      {state.suggestions.map(s => (
        <div key={s.job._id} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-primary" />
            <p className="text-sm font-semibold text-foreground">{s.job.title}</p>
            {s.job.company && <span className="text-xs text-muted-foreground">· {s.job.company}</span>}
          </div>
          <p className="text-xs text-muted-foreground mb-3">Best-matching candidates in your pipeline, ranked by skill overlap</p>
          <div className="flex flex-col gap-2">
            {s.candidates.map(c => (
              <div key={c._id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{c.name[0].toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{c.role} · {c.matchedSkills.join(", ")}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${c.matchScore}%` }} /></div>
                  <span className="text-xs font-semibold text-foreground w-9 text-right">{c.matchScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const ReportCustomTab = ({ data }) => {
  const METRICS = [
    { id: "total",              label: "Total Candidates",          value: data.report?.total },
    { id: "hired",               label: "Hired",                     value: data.report?.hired },
    { id: "rejected",            label: "Rejected",                  value: data.report?.rejected || 0 },
    { id: "avgRating",           label: "Avg Rating",                value: data.report?.avgRating },
    { id: "avgTimeToHire",       label: "Avg Time to Hire (days)",   value: data.report?.avgTimeToHire },
    { id: "offerAcceptanceRate", label: "Offer Acceptance Rate (%)", value: data.report?.offerAcceptanceRate },
    { id: "interviewsScheduled", label: "Interviews Scheduled",      value: data.usage?.interviewsScheduled },
    { id: "activeRecruiters",    label: "Active Recruiters",         value: data.usage?.activeRecruiters },
    { id: "jobSlotUtilization",  label: "Job Slot Utilization (%)",  value: data.usage?.jobSlotUtilization },
    { id: "activeJobs",          label: "Active Jobs",               value: data.usage?.activeJobs },
  ];
  const [selected, setSelected] = useState(["total", "hired", "avgRating", "avgTimeToHire"]);
  const toggle = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold mb-3 flex items-center gap-1.5"><SlidersHorizontal size={14} />Metric Selection</p>
        <div className="flex flex-col gap-2">
          {METRICS.map(m => (
            <label key={m.id} className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
              <input type="checkbox" checked={selected.includes(m.id)} onChange={() => toggle(m.id)} className="accent-primary" />{m.label}
            </label>
          ))}
        </div>
      </div>
      <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold mb-4">Custom Report</p>
        {!selected.length ? <p className="text-sm text-muted-foreground">Select at least one metric to build your report.</p> : (
          <div className="flex flex-col gap-3 text-sm">
            {METRICS.filter(m => selected.includes(m.id)).map(m => (
              <div key={m.id} className="flex justify-between border-b border-border pb-2 last:border-0">
                <span className="text-muted-foreground">{m.label}</span>
                <span className="font-semibold text-foreground">{m.value ?? "—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ReportFiltersSidebar = ({ filters, setFilters, onApply, recruiters }) => (
  <div className="w-52 shrink-0 flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold text-foreground">Showing data for</p>
      <button className="text-[10px] text-primary hover:underline" onClick={() => { const cleared = { from: "", to: "", ownerId: "" }; setFilters(cleared); onApply(cleared); }}>Clear all</button>
    </div>
    <div>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Date range</p>
      <div className="flex flex-col gap-1.5">
        <Input type="date" className="h-8 text-xs" value={filters.from} onChange={e => setFilters(p => ({ ...p, from: e.target.value }))} />
        <Input type="date" className="h-8 text-xs" value={filters.to} onChange={e => setFilters(p => ({ ...p, to: e.target.value }))} />
      </div>
    </div>
    {recruiters?.length > 0 && (
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Owner</p>
        <select value={filters.ownerId} onChange={e => setFilters(p => ({ ...p, ownerId: e.target.value }))}
          className="w-full h-9 text-sm px-3 rounded-lg border border-input bg-background text-foreground outline-none">
          <option value="">All owners</option>
          {recruiters.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
        </select>
      </div>
    )}
    <Button size="sm" className="h-7 text-xs" onClick={() => onApply(filters)}>Apply filters</Button>
  </div>
);

const ATSReportsView = ({ orgId }) => {
  const [subTab, setSubTab] = useState("summary");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: "", to: "", ownerId: "" });

  const load = (f = filters) => {
    setLoading(true);
    getOrgAtsReport(orgId, Object.fromEntries(Object.entries(f).filter(([, v]) => v)))
      .then(d => setData(d)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [orgId]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex border-b border-border overflow-x-auto">
        {REPORT_TABS.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${subTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-muted-foreground" /></div>
      : !data ? <div className="text-center py-16 text-muted-foreground">No data yet</div>
      : (
        <div className="flex gap-5 items-start">
          <ReportFiltersSidebar filters={filters} setFilters={setFilters} onApply={load} recruiters={data.recruiters} />
          <div className="flex-1 min-w-0">
            {subTab === "summary"          && <ReportSummaryTab rep={data.report} />}
            {subTab === "pipeline"         && <ReportPipelineTab pipeline={data.pipeline} />}
            {subTab === "usage"            && <ReportUsageTab usage={data.usage} />}
            {subTab === "inmail"           && <ReportInMailTab />}
            {subTab === "jobs"             && <ReportJobsTab jobs={data.jobs} />}
            {subTab === "source"           && <ReportSourceTab source={data.source} total={data.report?.total} />}
            {subTab === "funnel"           && <ReportFunnelTab funnel={data.funnel} />}
            {subTab === "hiring-assistant" && <ReportHiringAssistantTab orgId={orgId} />}
            {subTab === "custom"           && <ReportCustomTab data={data} />}
          </div>
        </div>
      )}
    </div>
  );
};

// ── CRM Tab ───────────────────────────────────────────────────────────
const EMPTY_LEAD = { companyName:"", contactName:"", contactEmail:"", contactPhone:"", value:0, stage:"prospect", priority:"medium", notes:"" };
const CRMTab = ({ orgId }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_LEAD);
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(p => ({...p,[k]:v}));

  useEffect(() => { load(); }, [orgId]);
  const load = () => {
    setLoading(true);
    getOrgLeads(orgId).then(d => setLeads(d.leads || [])).catch(() => {}).finally(() => setLoading(false));
  };

  const handleAdd = async () => {
    if (!form.companyName || !form.contactName) return;
    setSaving(true);
    try {
      const d = await addOrgLead(orgId, form);
      setLeads(p => [d.lead, ...p]);
      setForm(EMPTY_LEAD); setShowAdd(false);
    } catch {}
    setSaving(false);
  };

  const handleStage = async (id, stage) => {
    try { await updateOrgLead(orgId, id, { stage }); setLeads(p => p.map(l => l._id === id ? {...l, stage} : l)); } catch {}
  };

  const handleDelete = async (id) => {
    try { await deleteOrgLead(orgId, id); setLeads(p => p.filter(l => l._id !== id)); } catch {}
  };

  const totalPipeline = leads.filter(l => !["closed_won","closed_lost"].includes(l.stage)).reduce((s,l) => s+(l.value||0), 0);
  const totalWon = leads.filter(l => l.stage === "closed_won").reduce((s,l) => s+(l.value||0), 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{leads.length} leads</span>
          <span className="text-emerald-600 font-medium">Won ₹{(totalWon/100000).toFixed(1)}L</span>
          <span className="text-primary font-medium">Pipeline ₹{(totalPipeline/100000).toFixed(1)}L</span>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowAdd(true)}><Plus size={13}/>Add Lead</Button>
      </div>

      {showAdd && (
        <Modal title="Add Lead" onClose={() => setShowAdd(false)}
          footer={<><Button variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button><Button className="flex-1" onClick={handleAdd} disabled={saving}>{saving ? <Loader2 size={14} className="animate-spin"/> : "Add"}</Button></>}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company *"><Input value={form.companyName} onChange={e=>set("companyName",e.target.value)} placeholder="Company name"/></Field>
            <Field label="Contact Name *"><Input value={form.contactName} onChange={e=>set("contactName",e.target.value)} placeholder="Contact person"/></Field>
            <Field label="Email"><Input value={form.contactEmail} onChange={e=>set("contactEmail",e.target.value)} placeholder="contact@company.com"/></Field>
            <Field label="Phone"><Input value={form.contactPhone} onChange={e=>set("contactPhone",e.target.value)} placeholder="+91 XXXXX XXXXX"/></Field>
            <Field label="Deal Value (₹)"><Input type="number" value={form.value} onChange={e=>set("value",Number(e.target.value))} placeholder="500000"/></Field>
            <Field label="Stage">
              <select value={form.stage} onChange={e=>set("stage",e.target.value)} className="w-full h-9 text-sm px-3 rounded-lg border border-input bg-background text-foreground outline-none">
                {CRM_STAGES.map(s => <option key={s} value={s}>{s.replace("_"," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Notes"><textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={2} className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-transparent outline-none resize-none"/></Field>
        </Modal>
      )}

      {loading ? <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-muted-foreground"/></div>
      : leads.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <TrendingUp size={28} className="text-muted-foreground mx-auto mb-2 opacity-30"/>
          <p className="text-sm text-muted-foreground">No leads yet. Add your first deal.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30"><th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Company</th><th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Value</th><th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Stage</th><th className="px-4 py-2.5"></th></tr></thead>
            <tbody className="divide-y divide-border">
              {leads.map(l => (
                <tr key={l._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{l.companyName}</p>
                    <p className="text-xs text-muted-foreground">{l.contactName}</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {l.value > 0 ? `₹${(l.value/100000).toFixed(1)}L` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <select value={l.stage} onChange={e => handleStage(l._id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${CRM_COLORS[l.stage] || CRM_COLORS.prospect}`}>
                      {CRM_STAGES.map(s => <option key={s} value={s}>{s.replace("_"," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(l._id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={13}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── HRMS Tab ──────────────────────────────────────────────────────────
const EMPTY_EMP = { name:"", email:"", phone:"", department:"", role:"", salary:0, status:"active" };
const HRMSTab = ({ orgId }) => {
  const [tab, setTab] = useState("employees");
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_EMP);
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(p => ({...p,[k]:v}));

  // Letter modal state
  const [letterEmp,     setLetterEmp]     = useState(null);
  const [letterType,    setLetterType]    = useState(null);
  const [letterForm,    setLetterForm]    = useState({});
  const [sendingLetter, setSendingLetter] = useState(false);
  const [letterMsg,     setLetterMsg]     = useState("");
  const setLF = (k, v) => setLetterForm(p => ({...p,[k]:v}));

  const openLetter  = (emp) => { setLetterEmp(emp); setLetterType(null); setLetterForm({}); setLetterMsg(""); };
  const closeLetter = ()    => { setLetterEmp(null); setLetterType(null); setLetterMsg(""); };

  const handleSendLetter = async () => {
    setSendingLetter(true); setLetterMsg("");
    try {
      const d = await sendOrgLetter(orgId, letterEmp._id, { type: letterType, ...letterForm });
      // For offer letters, pendingOffer is stored on employee — reflect it in the list
      if (letterType === "offer" && d.employee) {
        setEmployees(prev => prev.map(e => e._id === d.employee._id ? { ...e, pendingOffer: d.employee.pendingOffer } : e));
      }
      setLetterMsg("success:" + d.message);
    } catch (e) { setLetterMsg("error:" + (e.message || "Failed to send.")); }
    setSendingLetter(false);
  };

  // Called from the employee ROW (not the modal) — after candidate actually responds
  const handleConfirmOffer = async (emp, action) => {
    try {
      const d = await confirmOrgOffer(orgId, emp._id, action);
      setEmployees(prev => prev.map(e => e._id === emp._id ? { ...e, ...d.employee, pendingOffer: undefined } : e));
    } catch {}
  };

  useEffect(() => { loadAll(); }, [orgId]);
  const loadAll = async () => {
    setLoading(true);
    try {
      const [e, l] = await Promise.all([getOrgEmployees(orgId), getOrgLeaves(orgId)]);
      setEmployees(e.employees || []);
      setLeaves(l.leaveRequests || []);
    } catch {}
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!form.name || !form.department || !form.role) return;
    setSaving(true);
    try {
      const d = await addOrgEmployee(orgId, form);
      setEmployees(p => [d.employee, ...p]);
      setForm(EMPTY_EMP); setShowAdd(false);
    } catch {}
    setSaving(false);
  };

  const handleLeaveStatus = async (id, status) => {
    try {
      await updateOrgLeaveStatus(orgId, id, status);
      setLeaves(p => p.map(l => l._id === id ? {...l, status} : l));
    } catch {}
  };

  const handleDeleteEmp = async (id) => {
    try { await deleteOrgEmployee(orgId, id); setEmployees(p => p.filter(e => e._id !== id)); } catch {}
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
          {["employees","leaves"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${tab===t?"bg-card text-foreground shadow-sm":"text-muted-foreground hover:text-foreground"}`}>
              {t.charAt(0).toUpperCase()+t.slice(1)} {t==="leaves" && leaves.filter(l=>l.status==="pending").length > 0 && <span className="ml-1 bg-primary text-primary-foreground text-[9px] px-1 rounded-full">{leaves.filter(l=>l.status==="pending").length}</span>}
            </button>
          ))}
        </div>
        {tab === "employees" && <Button size="sm" className="gap-1.5" onClick={() => setShowAdd(true)}><Plus size={13}/>Add Employee</Button>}
      </div>

      {showAdd && (
        <Modal title="Add Employee" onClose={() => setShowAdd(false)}
          footer={<><Button variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button><Button className="flex-1" onClick={handleAdd} disabled={saving}>{saving ? <Loader2 size={14} className="animate-spin"/> : "Add"}</Button></>}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name *"><Input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Full name"/></Field>
            <Field label="Email"><Input value={form.email} onChange={e=>set("email",e.target.value)} placeholder="emp@company.com"/></Field>
            <Field label="Department *"><Input value={form.department} onChange={e=>set("department",e.target.value)} placeholder="Engineering, HR, etc."/></Field>
            <Field label="Role *"><Input value={form.role} onChange={e=>set("role",e.target.value)} placeholder="Software Engineer, etc."/></Field>
            <Field label="Salary (₹/mo)"><Input type="number" value={form.salary} onChange={e=>set("salary",Number(e.target.value))} placeholder="50000"/></Field>
            <Field label="Phone"><Input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="+91 XXXXX XXXXX"/></Field>
          </div>
        </Modal>
      )}

      {/* ── Letter Modal ──────────────────────────────────────────────── */}
      {letterEmp && (
        <Modal
          title={
            letterType
              ? `${letterType === "offer" ? "Offer" : "Relieving"} Letter — ${letterEmp.name}`
              : `Generate Letter — ${letterEmp.name}`
          }
          onClose={closeLetter}
          footer={
            letterType && !letterMsg ? (
              <>
                <Button variant="outline" className="flex-1" onClick={() => { setLetterType(null); setLetterMsg(""); }}>Back</Button>
                <Button className="flex-1 gap-1.5" onClick={handleSendLetter}
                  disabled={sendingLetter || (letterType === "relieving" && !letterForm.lastWorkingDay)}>
                  {sendingLetter ? <><Loader2 size={13} className="animate-spin"/>Sending…</> : <><Send size={13}/>Send Letter</>}
                </Button>
              </>
            ) : null
          }
        >
          {letterMsg.startsWith("success") ? (
            /* ── Letter sent successfully ── */
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                <BadgeCheck size={28} className="text-emerald-600"/>
              </div>
              <p className="text-sm font-semibold text-foreground">Letter Sent!</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                {letterMsg.replace("success:", "")}
                {letterType === "offer" && (
                  <span className="block mt-1.5 text-amber-600 dark:text-amber-400 font-medium">
                    When the candidate responds, mark their decision from the Employees panel.
                  </span>
                )}
              </p>
              <Button size="sm" variant="outline" onClick={closeLetter}>Close</Button>
            </div>
          ) : !letterType ? (
            /* ── Step 1: Choose letter type ── */
            <div className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">
                Choose the type of letter to generate and send to{" "}
                <span className="font-medium text-foreground">{letterEmp.email || "this employee"}</span>.
              </p>
              {!letterEmp.email && (
                <p className="text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-900">
                  This employee has no email address on record. Please update their profile first.
                </p>
              )}
              <button
                onClick={() => { setLetterType("offer"); setLetterForm({ position: letterEmp.role || "", department: letterEmp.department || "", ctc: letterEmp.salary ? String(letterEmp.salary) : "", joiningDate: letterEmp.joinDate ? new Date(letterEmp.joinDate).toISOString().slice(0,10) : "", probationPeriod: "3 months", reportingManager: "", workLocation: "", offerExpiryDate: "" }); }}
                className="flex items-start gap-3 p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText size={18} className="text-emerald-600"/>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Offer Letter</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Send a formal offer with role, CTC, joining date, and employment terms.</p>
                </div>
              </button>
              <button
                onClick={() => { setLetterType("relieving"); setLetterForm({ reason: "Resignation" }); }}
                className="flex items-start gap-3 p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText size={18} className="text-rose-600"/>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Relieving Letter</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Issue a relieving &amp; experience certificate with last working day details.</p>
                </div>
              </button>
            </div>
          ) : letterType === "offer" ? (
            /* ── Offer Letter Form ── */
            <>
              <p className="text-xs text-muted-foreground -mt-1">Fields are pre-filled from the employee record — edit as needed before sending.</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Position / Role">
                  <Input value={letterForm.position ?? ""} onChange={e=>setLF("position",e.target.value)} placeholder="Software Engineer"/>
                </Field>
                <Field label="Department">
                  <Input value={letterForm.department ?? ""} onChange={e=>setLF("department",e.target.value)} placeholder="Engineering"/>
                </Field>
                <Field label="Date of Joining">
                  <Input type="date" value={letterForm.joiningDate ?? ""} onChange={e=>setLF("joiningDate",e.target.value)}/>
                </Field>
                <Field label="Annual CTC (₹)">
                  <Input type="text" inputMode="numeric" value={letterForm.ctc} onChange={e=>setLF("ctc",e.target.value)} placeholder="600000"/>
                </Field>
                <Field label="Reporting Manager">
                  <Input value={letterForm.reportingManager ?? ""} onChange={e=>setLF("reportingManager",e.target.value)} placeholder="Manager name"/>
                </Field>
                <Field label="Work Location">
                  <Input value={letterForm.workLocation ?? ""} onChange={e=>setLF("workLocation",e.target.value)} placeholder="Mumbai / WFH"/>
                </Field>
                <Field label="Probation Period">
                  <Input value={letterForm.probationPeriod ?? "3 months"} onChange={e=>setLF("probationPeriod",e.target.value)} placeholder="3 months"/>
                </Field>
                <Field label="Offer Expiry Date">
                  <Input type="date" value={letterForm.offerExpiryDate ?? ""} onChange={e=>setLF("offerExpiryDate",e.target.value)}/>
                </Field>
              </div>
              {letterMsg.startsWith("error") && (
                <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{letterMsg.replace("error:","")}</p>
              )}
            </>
          ) : (
            /* ── Relieving Letter Form ── */
            <>
              <p className="text-xs text-muted-foreground -mt-1">The employee's join date will be pulled automatically from their record.</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Last Working Day *">
                  <Input type="date" value={letterForm.lastWorkingDay ?? ""} onChange={e=>setLF("lastWorkingDay",e.target.value)}/>
                </Field>
                <Field label="Reason for Leaving">
                  <select value={letterForm.reason ?? "Resignation"} onChange={e=>setLF("reason",e.target.value)}
                    className="w-full h-9 text-sm px-3 rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring">
                    <option>Resignation</option>
                    <option>Mutual Consent</option>
                    <option>Contract End</option>
                    <option>Termination</option>
                    <option>Retirement</option>
                  </select>
                </Field>
              </div>
              <Field label="Additional Note (optional)">
                <textarea value={letterForm.note ?? ""} onChange={e=>setLF("note",e.target.value)}
                  rows={3} placeholder="Any farewell note or special mention to include in the letter…"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-transparent outline-none resize-none focus:ring-1 focus:ring-ring"/>
              </Field>
              {letterMsg.startsWith("error") && (
                <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{letterMsg.replace("error:","")}</p>
              )}
            </>
          )}
        </Modal>
      )}

      {loading ? <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-muted-foreground"/></div>
      : tab === "employees" ? (
        employees.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <UserCheck size={28} className="text-muted-foreground mx-auto mb-2 opacity-30"/>
            <p className="text-sm text-muted-foreground">No employees yet. Add your first team member.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30"><th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Employee</th><th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Department</th><th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Salary</th><th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th><th className="px-4 py-2.5 text-xs font-medium text-muted-foreground text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-border">
                {employees.map(e => (
                  <tr key={e._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{e.name}</p>
                      <p className="text-xs text-muted-foreground">{e.role}</p>
                      {e.pendingOffer && (
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            Offer Pending
                          </span>
                          <button onClick={() => handleConfirmOffer(e, "accept")}
                            className="text-[9px] font-semibold text-emerald-600 hover:underline">
                            Accept
                          </button>
                          <span className="text-[9px] text-muted-foreground">·</span>
                          <button onClick={() => handleConfirmOffer(e, "decline")}
                            className="text-[9px] font-semibold text-red-500 hover:underline">
                            Decline
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{e.department}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-foreground">₹{(e.salary||0).toLocaleString("en-IN")}</p>
                      {e.pendingOffer?.salary && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400">
                          → ₹{e.pendingOffer.salary.toLocaleString("en-IN")} if accepted
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        e.status === "active"        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : e.status === "on_leave"    ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                        : e.status === "offer_pending" ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                        : "bg-muted text-muted-foreground"
                      }`}>
                        {e.status === "offer_pending" ? "Offer Pending" : e.status.replace("_"," ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-2.5 justify-end">
                        <button onClick={() => openLetter(e)}
                          className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 hover:underline transition-colors">
                          <FileText size={11}/> Select
                        </button>
                        <button onClick={() => handleDeleteEmp(e._id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        // Leaves tab
        leaves.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <ClipboardList size={28} className="text-muted-foreground mx-auto mb-2 opacity-30"/>
            <p className="text-sm text-muted-foreground">No leave requests yet.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30"><th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Employee</th><th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Type</th><th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Days</th><th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th><th className="px-4 py-2.5"></th></tr></thead>
              <tbody className="divide-y divide-border">
                {leaves.map(l => (
                  <tr key={l._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground text-xs">{l.employee?.name || "—"}</p>
                      <p className="text-[10px] text-muted-foreground">{l.reason}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{l.type}</td>
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{l.days}d</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${LEAVE_COLORS[l.status] || ""}`}>{l.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {l.status === "pending" && (
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => handleLeaveStatus(l._id, "approved")} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">Approve</button>
                          <button onClick={() => handleLeaveStatus(l._id, "rejected")} className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors">Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

// ── Employees Directory Tab ───────────────────────────────────────────
const EmployeesTab = ({ orgId }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");

  useEffect(() => {
    setLoading(true);
    getOrgEmployees(orgId).then(d => setEmployees(d.employees || [])).catch(() => {}).finally(() => setLoading(false));
  }, [orgId]);

  const filtered = employees.filter(e =>
    !search || e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase()) ||
    e.role?.toLowerCase().includes(search.toLowerCase())
  );

  const deptMap = filtered.reduce((acc, e) => {
    const d = e.department || "General";
    if (!acc[d]) acc[d] = [];
    acc[d].push(e);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{employees.length} employees</p>
        <Input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, role, department..." className="w-56 h-8 text-xs"/>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-muted-foreground"/></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <UserCheck size={28} className="text-muted-foreground mx-auto mb-2 opacity-30"/>
          <p className="text-sm text-muted-foreground">{search ? "No employees match your search." : "No employees added yet. Add them in HRMS."}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {Object.entries(deptMap).map(([dept, emps]) => (
            <div key={dept} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-2.5 bg-muted/30 border-b border-border">
                <p className="text-xs font-semibold text-foreground">{dept}</p>
                <p className="text-[10px] text-muted-foreground">{emps.length} member{emps.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="divide-y divide-border">
                {emps.map(e => (
                  <div key={e._id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {e.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{e.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{e.role}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {e.email && <p className="text-[11px] text-muted-foreground">{e.email}</p>}
                      {e.phone && <p className="text-[11px] text-muted-foreground">{e.phone}</p>}
                    </div>
                    <div className="shrink-0 text-right min-w-[70px]">
                      <p className="text-xs font-medium text-foreground">₹{(e.salary||0).toLocaleString("en-IN")}<span className="text-[10px] text-muted-foreground">/mo</span></p>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                        e.status==="active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : e.status==="on_leave" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                        : "bg-muted text-muted-foreground"
                      }`}>{(e.status||"active").replace("_"," ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Attendance Tab ────────────────────────────────────────────────────
const STATUS_CONFIG = {
  present:   { label: "Present",  cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  absent:    { label: "Absent",   cls: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  late:      { label: "Late",     cls: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  "half-day":{ label: "Half Day", cls: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
};

const toDateStr = (d) => d.toISOString().slice(0, 10);
const toMonthStr = (d) => d.toISOString().slice(0, 7);

const AttendanceTab = ({ orgId }) => {
  const today = new Date();
  const [view,    setView]    = useState("daily");   // "daily" | "summary"
  const [date,    setDate]    = useState(toDateStr(today));
  const [month,   setMonth]   = useState(toMonthStr(today));
  const [data,    setData]    = useState([]);        // daily: [{employee, record}]
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [localStatus, setLocalStatus] = useState({}); // empId → status

  useEffect(() => { if (view === "daily") loadDaily(); else loadSummary(); }, [orgId, date, month, view]);

  const loadDaily = async () => {
    setLoading(true);
    try {
      const d = await getAttendance(orgId, date);
      setData(d.data || []);
      const init = {};
      (d.data || []).forEach(r => { init[r.employee._id] = r.record?.status || "present"; });
      setLocalStatus(init);
    } catch {}
    setLoading(false);
  };

  const loadSummary = async () => {
    setLoading(true);
    try {
      const d = await getAttendanceSummary(orgId, month);
      setSummary(d.summary || []);
    } catch {}
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = data.map(row => ({
        employeeId: row.employee._id,
        status:     localStatus[row.employee._id] || "present",
      }));
      await bulkMarkAttendance(orgId, { date, records });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  const shiftDate = (n) => {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    setDate(toDateStr(d));
  };

  const shiftMonth = (n) => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + n, 1);
    setMonth(toMonthStr(d));
  };

  const presentCount = Object.values(localStatus).filter(s => s === "present").length;
  const absentCount  = Object.values(localStatus).filter(s => s === "absent").length;

  return (
    <div className="flex flex-col gap-3">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
          {["daily","summary"].map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors
                ${view===v?"bg-card text-foreground shadow-sm":"text-muted-foreground hover:text-foreground"}`}>
              {v === "daily" ? "Daily Attendance" : "Monthly Summary"}
            </button>
          ))}
        </div>

        {view === "daily" ? (
          <div className="flex items-center gap-2">
            <button onClick={() => shiftDate(-1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors">
              <ChevronLeft size={14}/>
            </button>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="h-8 text-xs px-2 rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"/>
            <button onClick={() => shiftDate(1)} disabled={date >= toDateStr(today)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors disabled:opacity-30">
              <ChevronRight size={14}/>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => shiftMonth(-1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors">
              <ChevronLeft size={14}/>
            </button>
            <input type="month" value={month} onChange={e => setMonth(e.target.value)}
              className="h-8 text-xs px-2 rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"/>
            <button onClick={() => shiftMonth(1)} disabled={month >= toMonthStr(today)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors disabled:opacity-30">
              <ChevronRight size={14}/>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-muted-foreground"/></div>
      ) : view === "daily" ? (
        <>
          {/* Stats bar */}
          {data.length > 0 && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
              <span>{data.length} employees</span>
              <span className="text-emerald-600 font-medium">{presentCount} present</span>
              <span className="text-red-500 font-medium">{absentCount} absent</span>
              <span className="text-amber-600 font-medium">{Object.values(localStatus).filter(s=>s==="late").length} late</span>
            </div>
          )}

          {data.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <CalendarCheck size={28} className="text-muted-foreground mx-auto mb-2 opacity-30"/>
              <p className="text-sm text-muted-foreground">No employees found. Add employees in HRMS first.</p>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Employee</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Department</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.map(row => (
                      <tr key={row.employee._id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                              {row.employee.name?.[0]?.toUpperCase()}
                            </div>
                            <p className="text-sm font-medium text-foreground">{row.employee.name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{row.employee.role}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                              <button key={key}
                                onClick={() => setLocalStatus(p => ({...p, [row.employee._id]: key}))}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all border
                                  ${localStatus[row.employee._id] === key
                                    ? `${cfg.cls} border-transparent scale-105`
                                    : "bg-muted/30 text-muted-foreground border-border hover:border-primary/30"}`}>
                                {cfg.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5 min-w-[120px]">
                  {saving ? <Loader2 size={13} className="animate-spin"/> : saved ? "✓ Saved!" : <><CalendarCheck size={13}/>Save Attendance</>}
                </Button>
              </div>
            </>
          )}
        </>
      ) : (
        // Monthly Summary
        summary.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <CalendarCheck size={28} className="text-muted-foreground mx-auto mb-2 opacity-30"/>
            <p className="text-sm text-muted-foreground">No attendance data for this month.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Employee</th>
                  <th className="text-center px-3 py-2.5 text-xs font-medium text-emerald-600">Present</th>
                  <th className="text-center px-3 py-2.5 text-xs font-medium text-red-500">Absent</th>
                  <th className="text-center px-3 py-2.5 text-xs font-medium text-amber-600">Late</th>
                  <th className="text-center px-3 py-2.5 text-xs font-medium text-blue-500">Half Day</th>
                  <th className="text-center px-3 py-2.5 text-xs font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summary.map(row => (
                  <tr key={row.employee._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{row.employee.name}</p>
                      <p className="text-xs text-muted-foreground">{row.employee.department}</p>
                    </td>
                    <td className="text-center px-3 py-3 text-sm font-semibold text-emerald-600">{row.counts.present}</td>
                    <td className="text-center px-3 py-3 text-sm font-semibold text-red-500">{row.counts.absent}</td>
                    <td className="text-center px-3 py-3 text-sm font-semibold text-amber-600">{row.counts.late}</td>
                    <td className="text-center px-3 py-3 text-sm font-semibold text-blue-500">{row.counts["half-day"]}</td>
                    <td className="text-center px-3 py-3 text-xs text-muted-foreground">{row.total}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

// ── OrgWorkspace Main ─────────────────────────────────────────────────
const TABS = [
  { id: "dashboard",  label: "Dashboard",  icon: <LayoutDashboard size={14}/> },
  { id: "employees",  label: "Employees",  icon: <UserCheck size={14}/> },
  { id: "attendance", label: "Attendance", icon: <CalendarCheck size={14}/> },
  { id: "ats",        label: "ATS",        icon: <Users size={14}/> },
  { id: "crm",        label: "CRM",        icon: <TrendingUp size={14}/> },
  { id: "hrms",       label: "HRMS",       icon: <Briefcase size={14}/> },
];

const OrgWorkspace = () => {
  const { slug } = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [org,     setOrg]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("dashboard");
  const [denied,  setDenied]  = useState(false);

  useEffect(() => {
    getOrg(slug).then(d => {
      if (!d.isOwner && !d.isAdmin) { setDenied(true); }
      setOrg(d.org);
    }).catch(() => navigate("/feed")).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <MainLayout><div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-muted-foreground"/></div></MainLayout>;

  if (denied) return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <UserX size={48} className="text-muted-foreground opacity-30"/>
        <p className="text-lg font-semibold text-foreground">Access Denied</p>
        <p className="text-sm text-muted-foreground">You are not a member of this organization's workspace.</p>
        <Button onClick={() => navigate(`/org/${slug}`)}>View Public Page</Button>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/org/${slug}`)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors shrink-0">
            <ArrowLeft size={16}/>
          </button>
          <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
            {org?.logoUrl ? <img src={org.logoUrl} className="w-full h-full object-cover" alt=""/> : <Building2 size={18} className="text-muted-foreground"/>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-foreground truncate">{org?.name}</h1>
              {org?.verified && <BadgeCheck size={15} className="text-primary shrink-0"/>}
            </div>
            <p className="text-xs text-muted-foreground">Organization Workspace</p>
          </div>
          <Link to={`/org/${slug}`} className="text-xs text-primary hover:underline shrink-0">Public page →</Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {tab === "dashboard"  && <DashboardTab  orgId={org._id}/>}
          {tab === "employees"  && <EmployeesTab  orgId={org._id}/>}
          {tab === "attendance" && <AttendanceTab orgId={org._id}/>}
          {tab === "ats"        && <ATSTab        orgId={org._id}/>}
          {tab === "crm"        && <CRMTab        orgId={org._id}/>}
          {tab === "hrms"       && <HRMSTab       orgId={org._id}/>}
        </div>
      </div>
    </MainLayout>
  );
};

export default OrgWorkspace;
