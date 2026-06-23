import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, MapPin, Briefcase, IndianRupee, Bookmark, BookmarkCheck,
  CheckCircle2, SlidersHorizontal, X, Loader2, ChevronRight,
  Plus, Users, Trash2, ArrowLeft, Upload, FileText, Download, Calendar
} from "lucide-react";
import {
  getJobs, getSavedJobs, getMyPostedJobs, getApplicants,
  createJob, applyJob, saveJob, deleteJob, toggleJobStatus,
  updateApplicationStatus, scheduleInterview
} from "@/api/jobApi";

import useAuth from "@/hooks/useAuth";

const JOB_TYPES   = ["All Types",  "Remote", "Hybrid", "On-site"];
const LEVELS      = ["All Levels", "Junior", "Mid",    "Senior", "Lead"];
const POST_TYPES  = ["Remote", "Hybrid", "On-site"];
const POST_LEVELS = ["Junior", "Mid", "Senior", "Lead"];

const STATUS_CONFIG = {
  pending:     { label: "Under Review",  cls: "bg-muted text-muted-foreground border-border" },
  reviewed:    { label: "Reviewed",      cls: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  shortlisted: { label: "Shortlisted!",  cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
  rejected:    { label: "Not Selected",  cls: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-800" },
};

const timeAgo = (d) => {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 60)   return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
};

const EMPTY_FORM = { title:"", company:"", location:"", type:"Remote", level:"Junior", salary:"", description:"", skills:"", requirements:"", perks:"" };

// ── Apply Modal ───────────────────────────────────────────────────────
const ApplyModal = ({ job, onClose, onApplied }) => {
  const [resume,    setResume]    = useState(null);
  const [coverNote, setCoverNote] = useState("");
  const [applying,  setApplying]  = useState(false);
  const [error,     setError]     = useState("");
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { setError("Only PDF files are allowed."); return; }
    if (file.size > 2 * 1024 * 1024)    { setError("File size must be under 2MB."); return; }
    setError(""); setResume(file);
  };

  const handleApply = async () => {
    if (!resume) { setError("Please upload your resume (PDF, max 2MB)."); return; }
    setApplying(true); setError("");
    try {
      const fd = new FormData();
      fd.append("resume", resume);
      if (coverNote.trim()) fd.append("coverNote", coverNote.trim());
      await applyJob(job._id, fd);
      onApplied(job._id);
      onClose();
    } catch(e) { setError(e.message || "Failed to apply. Please try again."); }
    setApplying(false);
  };
 
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h3 className="text-base font-semibold text-foreground">Apply for this Role</h3>
            <p className="text-xs text-muted-foreground">{job.title} · {job.company}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"><X size={16}/></button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Resume upload */}
          <div>
            <label className="text-xs font-medium text-foreground mb-2 block">
              Resume <span className="text-destructive">*</span>
              <span className="text-muted-foreground font-normal ml-1">(PDF, max 2MB)</span>
            </label>
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange}/>
            <button onClick={() => fileRef.current?.click()}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl border-2 border-dashed transition-colors text-left
                ${resume ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/50"}`}>
              {resume ? (
                <>
                  <FileText size={20} className="text-primary shrink-0"/>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{resume.name}</p>
                    <p className="text-xs text-muted-foreground">{(resume.size / 1024).toFixed(0)} KB · PDF · Click to change</p>
                  </div>
                </>
              ) : (
                <>
                  <Upload size={20} className="text-muted-foreground shrink-0"/>
                  <div>
                    <p className="text-sm font-medium text-foreground">Click to upload resume</p>
                    <p className="text-xs text-muted-foreground">PDF only, max 2MB</p>
                  </div>
                </>
              )}
            </button>
          </div>

          {/* Cover note */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">
              Cover Note <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              placeholder="Why are you a great fit? Any relevant experience or projects…"
              value={coverNote}
              onChange={e => setCoverNote(e.target.value.slice(0, 500))}
              rows={4}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-input bg-transparent outline-none resize-none focus:ring-1 focus:ring-ring transition-colors"
            />
            <p className="text-[10px] text-muted-foreground text-right mt-0.5">{coverNote.length}/500</p>
          </div>

          {error && <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={applying}>Cancel</Button>
          <Button className="flex-1 gap-1.5" onClick={handleApply} disabled={applying}>
            {applying ? <><Loader2 size={14} className="animate-spin"/>Submitting…</> : <><CheckCircle2 size={14}/>Submit Application</>}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Post Job Modal ────────────────────────────────────────────────────
const PostJobModal = ({ onClose, onPosted }) => {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [error, setError]   = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.title || !form.company || !form.location) { setError("Job title, company and location are required."); return; }
    setSaving(true); setError("");
    try {
      await createJob({
        ...form,
        skills:       form.skills.split(",").map(s => s.trim()).filter(Boolean),
        requirements: form.requirements.split("\n").map(s => s.trim()).filter(Boolean),
        perks:        form.perks.split(",").map(s => s.trim()).filter(Boolean),
      });
      onPosted(); onClose();
    } catch(err) { setError(err.message || "Failed to post the job. Please try again."); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl border border-border w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h3 className="text-base font-semibold text-foreground">Post a New Job</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"><X size={16}/></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-foreground mb-1 block">Job Title *</label><Input placeholder="e.g. Senior React Developer" value={form.title} onChange={e => set("title", e.target.value)}/></div>
            <div><label className="text-xs font-medium text-foreground mb-1 block">Company *</label><Input placeholder="Company name" value={form.company} onChange={e => set("company", e.target.value)}/></div>
            <div><label className="text-xs font-medium text-foreground mb-1 block">Location *</label><Input placeholder="e.g. Bengaluru / Remote" value={form.location} onChange={e => set("location", e.target.value)}/></div>
            <div><label className="text-xs font-medium text-foreground mb-1 block">Salary</label><Input placeholder="e.g. ₹8–12 LPA" value={form.salary} onChange={e => set("salary", e.target.value)}/></div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Job Type</label>
              <select value={form.type} onChange={e => set("type", e.target.value)} className="w-full h-9 text-sm px-3 rounded-lg border border-input bg-transparent text-foreground outline-none focus:ring-1 focus:ring-ring">
                {POST_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Experience Level</label>
              <select value={form.level} onChange={e => set("level", e.target.value)} className="w-full h-9 text-sm px-3 rounded-lg border border-input bg-transparent text-foreground outline-none focus:ring-1 focus:ring-ring">
                {POST_LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div><label className="text-xs font-medium text-foreground mb-1 block">Job Description</label><textarea placeholder="Describe the role, responsibilities, and team…" value={form.description} onChange={e => set("description", e.target.value)} rows={3} className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-transparent outline-none resize-none focus:ring-1 focus:ring-ring transition-colors"/></div>
          <div><label className="text-xs font-medium text-foreground mb-1 block">Required Skills <span className="text-muted-foreground font-normal">(comma separated)</span></label><Input placeholder="React, Node.js, MongoDB" value={form.skills} onChange={e => set("skills", e.target.value)}/></div>
          <div><label className="text-xs font-medium text-foreground mb-1 block">Requirements <span className="text-muted-foreground font-normal">(one per line)</span></label><textarea placeholder={"3+ years of experience\nB.Tech in CS or related field"} value={form.requirements} onChange={e => set("requirements", e.target.value)} rows={3} className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-transparent outline-none resize-none focus:ring-1 focus:ring-ring transition-colors"/></div>
          <div><label className="text-xs font-medium text-foreground mb-1 block">Perks <span className="text-muted-foreground font-normal">(comma separated)</span></label><Input placeholder="Health Insurance, Flexible Hours, Stock Options" value={form.perks} onChange={e => set("perks", e.target.value)}/></div>
          {error && <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={saving}>
            {saving ? <><Loader2 size={14} className="animate-spin mr-1.5"/>Posting…</> : "Post Job"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Applicants Panel ──────────────────────────────────────────────────
// ── Applicants Panel ──────────────────────────────────────────────────
const ApplicantsPanel = ({ job, onBack }) => {
  const navigate = useNavigate();
  const [applicants,   setApplicants]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [scheduleFor,  setScheduleFor]  = useState(null);

  useEffect(() => {
    getApplicants(job._id)
      .then(d => setApplicants(d.applicants || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [job._id]);

  const handleStatusChange = async (applicant, status) => {
    if (status === "shortlisted") {
      setScheduleFor(applicant);
      return;
    }
    try {
      await updateApplicationStatus(job._id, applicant.user?._id, status);
      setApplicants(prev => prev.map(a => a.user?._id === applicant.user?._id ? { ...a, status } : a));
    } catch {}
  };

  const handleScheduled = (userId) => {
    setApplicants(prev => prev.map(a => a.user?._id === userId ? { ...a, status: "shortlisted" } : a));
  };

  return (
    <>
      {scheduleFor && (
        <ScheduleInterviewModal
          job={job}
          applicant={scheduleFor}
          onClose={() => setScheduleFor(null)}
          onScheduled={handleScheduled}
        />
      )}
      <div className="rounded-xl border border-border bg-card overflow-hidden sticky top-20">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <button onClick={onBack} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors"><ArrowLeft size={15}/></button>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Applicants — {job.title}</h3>
            <p className="text-xs text-muted-foreground">{job.applicants?.length || 0} total</p>
          </div>
        </div>
        <div className="divide-y divide-border max-h-[540px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-muted-foreground"/></div>
          ) : applicants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users size={32} className="opacity-20 mb-2"/>
              <p className="text-sm">No applicants yet</p>
            </div>
          ) : applicants.map((a, i) => {
            const u = a.user || {};
            const status = a.status || "pending";
            const sc = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
            return (
              <div key={u._id || i} className="px-4 py-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 overflow-hidden">
                    {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover" alt=""/> : u.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">{u.name}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sc.cls}`}>{sc.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{u.headline || u.location}</p>
                    {a.coverNote && (
                      <p className="text-xs text-muted-foreground/80 italic mt-1.5 line-clamp-2 bg-muted/50 px-2.5 py-1.5 rounded-lg border border-border/50">
                        "{a.coverNote}"
                      </p>
                    )}
                    {a.interview?.date && status === "shortlisted" && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg w-fit">
                        <Calendar size={10}/>
                        {a.interview.date} · {a.interview.time}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <select
                        value={status}
                        onChange={e => handleStatusChange(a, e.target.value)}
                        className="text-xs h-7 px-2 rounded-lg border border-input bg-background text-foreground outline-none cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      {a.resumeUrl && (
                        <a href={a.resumeUrl} download={`${u.name?.replace(/\s+/g,"-") || "resume"}.pdf`}
                          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                          <Download size={11}/> Resume
                        </a>
                      )}
                      <Button size="sm" variant="outline" className="h-7 text-xs px-3" onClick={() => navigate(`/profile/${u.username}`)}>
                        Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};


// ── Schedule Interview Modal ──────────────────────────────────────────
const ScheduleInterviewModal = ({ job, applicant, onClose, onScheduled }) => {
  const [form, setForm]     = useState({ date: "", time: "", meetLink: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.date || !form.time || !form.meetLink.trim()) {
      setError("Please fill in all fields."); return;
    }
    setSaving(true); setError("");
    try {
      await scheduleInterview(job._id, applicant.user?._id, form);
      onScheduled(applicant.user?._id);
      onClose();
    } catch (e) {
      setError(e.message || "Failed to schedule interview. Try again.");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h3 className="text-base font-semibold text-foreground">Schedule Interview</h3>
            <p className="text-xs text-muted-foreground">{applicant.user?.name} · {job.title}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground">
            <X size={16}/>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <p className="text-xs text-muted-foreground bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">
            An email with the interview details and Google Meet link will be sent automatically to{" "}
            <span className="font-medium text-foreground">{applicant.user?.name}</span>.
          </p>

          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Interview Date *</label>
            <Input
              type="date"
              value={form.date}
              min={new Date().toISOString().split("T")[0]}
              onChange={e => set("date", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Interview Time *</label>
            <Input
              type="time"
              value={form.time}
              onChange={e => set("time", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Google Meet Link *</label>
            <Input
              type="url"
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              value={form.meetLink}
              onChange={e => set("meetLink", e.target.value)}
            />
          </div>

          {error && <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button className="flex-1 gap-1.5" onClick={handleSubmit} disabled={saving}>
            {saving
              ? <><Loader2 size={14} className="animate-spin"/>Scheduling…</>
              : <><Calendar size={14}/>Schedule & Notify</>}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Job Detail Panel ──────────────────────────────────────────────────
const JobDetail = ({ job, isRecruiter, appliedStatus, saved, onApply, onSave, onViewApplicants }) => {
  const isApplied = appliedStatus !== undefined;
  const sc = isApplied ? (STATUS_CONFIG[appliedStatus] || STATUS_CONFIG.pending) : null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden sticky top-20">
      <div className="p-5 border-b border-border">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-lg font-bold text-foreground shrink-0">
            {job.company?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-foreground">{job.title}</h2>
            <p className="text-sm text-muted-foreground">{job.company}</p>
            <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin size={11}/>{job.location}</span>
              <span className="flex items-center gap-1"><Briefcase size={11}/>{job.type} · {job.level}</span>
              {job.salary && <span className="flex items-center gap-1"><IndianRupee size={11}/>{job.salary}</span>}
            </div>
          </div>
        </div>

        {/* Candidate actions */}
        {!isRecruiter && (
          <div className="flex items-center gap-2 mt-4">
            {isApplied ? (
              <div className={`flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl border ${sc.cls}`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14}/>
                  <span className="text-sm font-medium">Applied</span>
                </div>
                <span className="text-xs font-semibold opacity-80">{sc.label}</span>
              </div>
            ) : (
              <Button className="flex-1 gap-1.5" onClick={onApply}>
                <CheckCircle2 size={14}/> Easy Apply
              </Button>
            )}
            <Button variant="outline" size="icon" onClick={onSave} className={saved ? "text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950" : ""}>
              {saved ? <BookmarkCheck size={16}/> : <Bookmark size={16}/>}
            </Button>
          </div>
        )}

        {/* Recruiter actions */}
        {isRecruiter && (
          <button onClick={onViewApplicants}
            className="mt-4 w-full flex items-center justify-between px-4 py-3 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-primary"/>
              <span className="text-sm font-medium text-foreground">{job.applicants?.length || 0} applicants</span>
            </div>
            <span className="text-xs text-primary font-medium">View all →</span>
          </button>
        )}
      </div>

      <div className="p-5 flex flex-col gap-4 max-h-[480px] overflow-y-auto">
        {job.skills?.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Skills Required</h3>
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map(s => <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">{s}</span>)}
            </div>
          </div>
        )}
        {job.description && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">About the Role</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">{job.description}</p>
          </div>
        )}
        {job.requirements?.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Requirements</h3>
            <ul className="flex flex-col gap-1.5">
              {job.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <ChevronRight size={14} className="text-muted-foreground mt-0.5 shrink-0"/>{r}
                </li>
              ))}
            </ul>
          </div>
        )}
        {job.perks?.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Perks & Benefits</h3>
            <div className="flex flex-wrap gap-2">
              {job.perks.map((p, i) => <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">{p}</span>)}
            </div>
          </div>
        )}
        {!job.description && !job.requirements?.length && (
          <p className="text-sm text-muted-foreground text-center py-4">No additional details for this job.</p>
        )}
      </div>
    </div>
  );
};

// ── Job Card ──────────────────────────────────────────────────────────
const JobCard = ({ job, active, onClick, appliedStatus, saved, isRecruiter, onDelete, onToggle }) => {
  const isApplied = appliedStatus !== undefined;
  const sc = isApplied ? (STATUS_CONFIG[appliedStatus] || STATUS_CONFIG.pending) : null;

  return (
    <button onClick={onClick} className={`w-full text-left rounded-xl border p-4 transition-all hover:shadow-sm ${active ? "border-primary bg-primary/5" : "border-border bg-card hover:border-foreground/20"}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-foreground shrink-0">
          {job.company?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-foreground leading-tight truncate">{job.title}</p>
            {!isRecruiter && isApplied && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0 ${sc.cls}`}>{sc.label}</span>
            )}
            {!isRecruiter && !isApplied && saved && <Bookmark size={14} className="text-amber-500 shrink-0"/>}
            {isRecruiter && (
              <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                <button onClick={() => onToggle(job._id)}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${job.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                  {job.active ? "Active" : "Closed"}
                </button>
                <button onClick={() => onDelete(job._id)}
                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 size={11}/>
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{job.company}</p>
          <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin size={10}/>{job.location}</span>
            <span className="flex items-center gap-1"><Briefcase size={10}/>{job.type}</span>
            {job.salary && <span className="flex items-center gap-1"><IndianRupee size={10}/>{job.salary}</span>}
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-muted-foreground">{timeAgo(job.createdAt)}</span>
            <span className="text-[10px] text-muted-foreground">{job.applicants?.length || 0} applicants</span>
          </div>
        </div>
      </div>
    </button>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────
const Jobs = () => {
  const { user } = useAuth();
  const isRecruiter = user?.role === "recruiter";

  const [tab,            setTab]           = useState(isRecruiter ? "posted" : "all");
  const [jobs,           setJobs]          = useState([]);
  const [savedJobs,      setSavedJobs]     = useState([]);
  const [postedJobs,     setPostedJobs]    = useState([]);
  const [selected,       setSelected]      = useState(null);
  const [loading,        setLoading]       = useState(true);
  const [search,         setSearch]        = useState("");
  const [typeFilter,     setTypeFilter]    = useState("All Types");
  const [levelFilter,    setLevelFilter]   = useState("All Levels");
  const [showFilters,    setShowFilters]   = useState(false);
  const [appliedData,    setAppliedData]   = useState({});
  const [saved,          setSaved]         = useState({});
  const [applyingJob,    setApplyingJob]   = useState(null);
  const [showPost,       setShowPost]      = useState(false);
  const [viewApplicants, setViewApplicants]= useState(null);

  useEffect(() => { fetchAll(); }, [typeFilter, levelFilter]);
  useEffect(() => { if (tab === "saved")  fetchSaved();  }, [tab]);
  useEffect(() => { if (tab === "posted") fetchPosted(); }, [tab]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)                       params.search = search;
      if (typeFilter  !== "All Types")  params.type   = typeFilter;
      if (levelFilter !== "All Levels") params.level  = levelFilter;
      const data = await getJobs(params);
      setJobs(data.jobs || []);
      const sm = {};
      (data.savedIds || []).forEach(id => sm[id] = true);
      setSaved(sm);
      setAppliedData(data.appliedData || {});
      if (data.jobs?.length > 0) setSelected(data.jobs[0]);
    } catch {}
    setLoading(false);
  };

  const fetchSaved = async () => {
    setLoading(true);
    try { const d = await getSavedJobs(); setSavedJobs(d.jobs || []); if (d.jobs?.length) setSelected(d.jobs[0]); } catch {}
    setLoading(false);
  };

  const fetchPosted = async () => {
    setLoading(true);
    try { const d = await getMyPostedJobs(); setPostedJobs(d.jobs || []); if (d.jobs?.length) setSelected(d.jobs[0]); } catch {}
    setLoading(false);
  };

  const handleApplied = (jobId) => {
    setAppliedData(p => ({ ...p, [jobId]: "pending" }));
  };

  const handleSave = async (id) => {
    try { const d = await saveJob(id); setSaved(p => ({ ...p, [id]: d.saved })); } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job posting? This cannot be undone.")) return;
    try {
      await deleteJob(id);
      setPostedJobs(p => p.filter(j => j._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch {}
  };

  const handleToggle = async (id) => {
    try {
      const d = await toggleJobStatus(id);
      setPostedJobs(p => p.map(j => j._id === id ? { ...j, active: d.active } : j));
    } catch {}
  };

  const displayJobs = tab === "saved" ? savedJobs : tab === "posted" ? postedJobs : jobs;

  const TABS = isRecruiter
    ? [{ id:"posted", label:"My Posted Jobs" }, { id:"all", label:"Browse Jobs" }]
    : [{ id:"all", label:"All Jobs" }, { id:"saved", label:`Saved (${savedJobs.length || ""})` }];

  return (
    <MainLayout>
      {showPost   && <PostJobModal onClose={() => setShowPost(false)} onPosted={fetchPosted}/>}
      {applyingJob && <ApplyModal job={applyingJob} onClose={() => setApplyingJob(null)} onApplied={handleApplied}/>}

      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Jobs</h1>
            <p className="text-sm text-muted-foreground">{isRecruiter ? "Manage your job postings" : "Find your next opportunity"}</p>
          </div>
          {isRecruiter && (
            <Button size="sm" className="gap-1.5" onClick={() => setShowPost(true)}>
              <Plus size={13}/> Post a Job
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSelected(null); setViewApplicants(null); }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        {tab === "all" && (
          <div className="rounded-xl border border-border bg-card p-3 flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"/>
                <Input placeholder="Job title, company, or skill…" className="pl-8 h-8 text-sm" value={search}
                  onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchAll()}/>
                {search && <button onClick={() => { setSearch(""); fetchAll(); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"><X size={13}/></button>}
              </div>
              <Button variant={showFilters ? "default" : "outline"} size="sm" className="gap-1.5 shrink-0" onClick={() => setShowFilters(f => !f)}>
                <SlidersHorizontal size={13}/> Filters
              </Button>
              <Button size="sm" onClick={fetchAll}>Search</Button>
            </div>
            {showFilters && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                <select value={typeFilter}  onChange={e => setTypeFilter(e.target.value)}  className="h-7 text-xs px-2 rounded-lg border border-input bg-transparent text-foreground outline-none">
                  {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className="h-7 text-xs px-2 rounded-lg border border-input bg-transparent text-foreground outline-none">
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-muted-foreground"/></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Job list */}
            <div className="lg:col-span-2 flex flex-col gap-2">
              <p className="text-xs text-muted-foreground px-1">
                {displayJobs.length} job{displayJobs.length !== 1 ? "s" : ""} {tab === "saved" ? "saved" : tab === "posted" ? "posted" : "found"}
              </p>
              {displayJobs.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-10 text-center">
                  <Briefcase size={28} className="text-muted-foreground mx-auto mb-2 opacity-40"/>
                  <p className="text-sm text-muted-foreground">
                    {tab === "posted" ? "You haven't posted any jobs yet. Click 'Post a Job' above to get started."
                    : tab === "saved"  ? "No saved jobs yet. Bookmark jobs to find them here."
                    : "No jobs found. Try different filters."}
                  </p>
                </div>
              ) : displayJobs.map(job => (
                <JobCard
                  key={job._id}
                  job={job}
                  active={selected?._id === job._id}
                  onClick={() => { setSelected(job); setViewApplicants(null); }}
                  appliedStatus={appliedData[job._id]}
                  saved={saved[job._id]}
                  isRecruiter={isRecruiter && tab === "posted"}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              ))}
            </div>

            {/* Detail / Applicants panel */}
            <div className="lg:col-span-3">
              {viewApplicants ? (
                <ApplicantsPanel job={viewApplicants} onBack={() => setViewApplicants(null)}/>
              ) : selected ? (
                <JobDetail
                  job={selected}
                  isRecruiter={isRecruiter && tab === "posted"}
                  appliedStatus={appliedData[selected._id]}
                  saved={saved[selected._id]}
                  onApply={() => setApplyingJob(selected)}
                  onSave={() => handleSave(selected._id)}
                  onViewApplicants={() => setViewApplicants(selected)}
                />
              ) : (
                <div className="rounded-xl border border-border bg-card flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <Briefcase size={32} className="text-muted-foreground mx-auto mb-2 opacity-40"/>
                    <p className="text-sm text-muted-foreground">Select a job to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Jobs;
