import { useState, useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getJobs, applyJob, saveJob, createJob } from "@/api/jobApi";
import useAuth from "@/hooks/useAuth";
import { Search, MapPin, Briefcase, DollarSign, Bookmark, BookmarkCheck, CheckCircle2, SlidersHorizontal, X, Loader2, ChevronRight, Plus, Users } from "lucide-react";

const JOB_TYPES   = ["All Types",  "Remote", "Hybrid", "On-site"];
const LEVELS      = ["All Levels", "Junior", "Mid",    "Senior", "Lead"];
const POST_TYPES  = ["Remote", "Hybrid", "On-site"];
const POST_LEVELS = ["Junior", "Mid", "Senior", "Lead"];

const Jobs = () => {
  const { user } = useAuth();
  const isRecruiter = user?.role === "recruiter";

  const [jobs,        setJobs]        = useState([]);
  const [selected,    setSelected]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [typeFilter,  setTypeFilter]  = useState("All Types");
  const [levelFilter, setLevelFilter] = useState("All Levels");
  const [showFilters, setShowFilters] = useState(false);
  const [applied,     setApplied]     = useState({});
  const [saved,       setSaved]       = useState({});
  const [applying,    setApplying]    = useState(false);

  const [showPostForm, setShowPostForm] = useState(false);
  const [posting,      setPosting]      = useState(false);
  const [postError,    setPostError]    = useState("");
  const [form, setForm] = useState({
    title: "", company: "", location: "", type: "Remote", level: "Junior",
    salary: "", description: "", skills: "", requirements: "", perks: "",
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (typeFilter  !== "All Types")   params.type  = typeFilter;
      if (levelFilter !== "All Levels")  params.level = levelFilter;
      const data = await getJobs(params);
      setJobs(data.jobs || []);
      const am = {}, sm = {};
      (data.appliedIds || []).forEach(id => am[id] = true);
      (data.savedIds   || []).forEach(id => sm[id] = true);
      setApplied(am); setSaved(sm);
      if (data.jobs?.length > 0) setSelected(data.jobs[0]);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, [typeFilter, levelFilter]);

  const handleApply = async (id) => {
    if (applied[id]) return;
    setApplying(true);
    try { await applyJob(id); setApplied(p => ({ ...p, [id]: true })); } catch {}
    setApplying(false);
  };

  const handleSave = async (id) => {
    try { const data = await saveJob(id); setSaved(p => ({ ...p, [id]: data.saved })); } catch {}
  };

  const handlePost = async (e) => {
    e.preventDefault();
    setPostError("");
    if (!form.title || !form.company || !form.location) {
      setPostError("Title, company aur location zaroori hai");
      return;
    }
    setPosting(true);
    try {
      await createJob({
        ...form,
        skills:       form.skills.split(",").map(s => s.trim()).filter(Boolean),
        requirements: form.requirements.split("\n").map(s => s.trim()).filter(Boolean),
        perks:        form.perks.split(",").map(s => s.trim()).filter(Boolean),
      });
      setShowPostForm(false);
      setForm({ title: "", company: "", location: "", type: "Remote", level: "Junior", salary: "", description: "", skills: "", requirements: "", perks: "" });
      fetchJobs();
    } catch (err) { setPostError(err.message || "Job post nahi ho saki"); }
    setPosting(false);
  };

  const timeAgo = (date) => {
    const m = Math.floor((Date.now() - new Date(date)) / 60000);
    if (m < 60) return `${m}m ago`;
    if (m < 1440) return `${Math.floor(m / 60)}h ago`;
    return `${Math.floor(m / 1440)}d ago`;
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-4">

        {/* Search + filter bar */}
        <div className="rounded-xl border border-border bg-card p-3 flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"/>
              <Input placeholder="Job title, company, or skill…" className="pl-8 h-8 text-sm" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchJobs()}/>
              {search && <button onClick={() => { setSearch(""); fetchJobs(); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"><X size={13}/></button>}
            </div>
            <Button variant={showFilters ? "default" : "outline"} size="sm" className="gap-1.5 shrink-0" onClick={() => setShowFilters(f => !f)}><SlidersHorizontal size={13}/>Filters</Button>
            <Button size="sm" onClick={fetchJobs}>Search</Button>
            {isRecruiter && (
              <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setShowPostForm(f => !f)}>
                <Plus size={13}/> Post Job
              </Button>
            )}
          </div>
          {showFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              <select value={typeFilter}  onChange={e => setTypeFilter(e.target.value)}  className="h-7 text-xs px-2 rounded-lg border border-input bg-transparent text-foreground outline-none">{JOB_TYPES.map(t => <option key={t}>{t}</option>)}</select>
              <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className="h-7 text-xs px-2 rounded-lg border border-input bg-transparent text-foreground outline-none">{LEVELS.map(l => <option key={l}>{l}</option>)}</select>
            </div>
          )}
        </div>

        {/* Recruiter - Post Job Form */}
        {isRecruiter && showPostForm && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Nayi Job Post Karo</h3>
            <form onSubmit={handlePost} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input placeholder="Job Title *"  value={form.title}    onChange={e => setForm(p => ({...p, title:    e.target.value}))} className="text-sm h-8"/>
                <Input placeholder="Company *"    value={form.company}  onChange={e => setForm(p => ({...p, company:  e.target.value}))} className="text-sm h-8"/>
                <Input placeholder="Location *"   value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))} className="text-sm h-8"/>
                <Input placeholder="Salary (e.g. ₹8–12 LPA)" value={form.salary} onChange={e => setForm(p => ({...p, salary: e.target.value}))} className="text-sm h-8"/>
                <select value={form.type}  onChange={e => setForm(p => ({...p, type:  e.target.value}))} className="h-8 text-xs px-2 rounded-lg border border-input bg-transparent text-foreground outline-none">{POST_TYPES.map(t  => <option key={t}>{t}</option>)}</select>
                <select value={form.level} onChange={e => setForm(p => ({...p, level: e.target.value}))} className="h-8 text-xs px-2 rounded-lg border border-input bg-transparent text-foreground outline-none">{POST_LEVELS.map(l => <option key={l}>{l}</option>)}</select>
              </div>
              <textarea placeholder="Job description..." value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} rows={3} className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-transparent outline-none resize-none placeholder:text-muted-foreground focus-visible:border-ring transition-colors"/>
              <Input placeholder="Skills (comma separated): React, Node.js, MongoDB" value={form.skills} onChange={e => setForm(p => ({...p, skills: e.target.value}))} className="text-sm h-8"/>
              <textarea placeholder={"Requirements (ek line mein ek):\n3+ years experience\nB.Tech CS ya related"} value={form.requirements} onChange={e => setForm(p => ({...p, requirements: e.target.value}))} rows={3} className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-transparent outline-none resize-none placeholder:text-muted-foreground focus-visible:border-ring transition-colors"/>
              <Input placeholder="Perks (comma separated): Health Insurance, Flexible Hours" value={form.perks} onChange={e => setForm(p => ({...p, perks: e.target.value}))} className="text-sm h-8"/>
              {postError && <p className="text-xs text-destructive">{postError}</p>}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={posting} className="gap-1.5">
                  {posting ? <><Loader2 size={13} className="animate-spin"/>Posting...</> : "Job Post Karo"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowPostForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-muted-foreground"/></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 flex flex-col gap-2">
              <p className="text-xs text-muted-foreground px-1">{jobs.length} job{jobs.length !== 1 ? "s" : ""} found</p>
              {jobs.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center">
                  <Briefcase size={28} className="text-muted-foreground mx-auto mb-2"/>
                  <p className="text-sm text-muted-foreground">
                    {isRecruiter ? "Abhi koi job post nahi ki. Upar 'Post Job' dabao." : "No jobs found. Try different filters."}
                  </p>
                </div>
              ) : jobs.map(job => (
                <button key={job._id} onClick={() => setSelected(job)} className={`w-full text-left rounded-xl border p-4 transition-all hover:shadow-sm ${selected?._id === job._id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-foreground/20"}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-foreground shrink-0">{job.company?.[0]?.toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground leading-tight">{job.title}</p>
                        {!isRecruiter && applied[job._id] && <CheckCircle2 size={14} className="text-emerald-600 shrink-0"/>}
                      </div>
                      <p className="text-xs text-muted-foreground">{job.company}</p>
                      <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin size={10}/>{job.location}</span>
                        <span className="flex items-center gap-1"><Briefcase size={10}/>{job.type}</span>
                        {job.salary && <span className="flex items-center gap-1"><DollarSign size={10}/>{job.salary}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-muted-foreground">{timeAgo(job.createdAt)}</span>
                        <span className="text-[10px] text-muted-foreground">{job.applicants?.length || 0} applicants</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="lg:col-span-3">
              {selected ? (
                <div className="rounded-xl border border-border bg-card overflow-hidden sticky top-20">
                  <div className="p-5 border-b border-border">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-lg font-bold text-foreground shrink-0">{selected.company?.[0]?.toUpperCase()}</div>
                      <div className="flex-1">
                        <h2 className="text-base font-bold text-foreground">{selected.title}</h2>
                        <p className="text-sm text-muted-foreground">{selected.company}</p>
                        <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin size={11}/>{selected.location}</span>
                          <span className="flex items-center gap-1"><Briefcase size={11}/>{selected.type} · {selected.level}</span>
                          {selected.salary && <span className="flex items-center gap-1"><DollarSign size={11}/>{selected.salary}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Candidate - apply/save */}
                    {!isRecruiter && (
                      <div className="flex items-center gap-2 mt-4">
                        {applied[selected._id] ? (
                          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 size={14} className="text-emerald-600"/>
                            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Applied!</span>
                          </div>
                        ) : (
                          <Button className="flex-1 gap-1.5" onClick={() => handleApply(selected._id)} disabled={applying}>
                            {applying ? <><Loader2 size={14} className="animate-spin"/>Applying…</> : <><CheckCircle2 size={14}/>Easy Apply</>}
                          </Button>
                        )}
                        <Button variant="outline" size="icon" onClick={() => handleSave(selected._id)} className={saved[selected._id] ? "text-amber-600 border-amber-200 bg-amber-50" : ""}>
                          {saved[selected._id] ? <BookmarkCheck size={16}/> : <Bookmark size={16}/>}
                        </Button>
                      </div>
                    )}

                    {/* Recruiter - applicants count */}
                    {isRecruiter && (
                      <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
                        <Users size={14} className="text-muted-foreground"/>
                        <span className="text-sm text-foreground">{selected.applicants?.length || 0} log ne apply kiya hai</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col gap-4 max-h-[500px] overflow-y-auto">
                    {selected.skills?.length > 0 && (<div><h3 className="text-sm font-semibold text-foreground mb-2">Skills Required</h3><div className="flex flex-wrap gap-1.5">{selected.skills.map(s => <span key={s} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">{s}</span>)}</div></div>)}
                    {selected.description && (<div><h3 className="text-sm font-semibold text-foreground mb-2">About the Role</h3><p className="text-sm text-foreground/80 leading-relaxed">{selected.description}</p></div>)}
                    {selected.requirements?.length > 0 && (<div><h3 className="text-sm font-semibold text-foreground mb-2">Requirements</h3><ul className="flex flex-col gap-1.5">{selected.requirements.map((r, i) => <li key={i} className="flex items-start gap-2 text-sm text-foreground/80"><ChevronRight size={14} className="text-muted-foreground mt-0.5 shrink-0"/>{r}</li>)}</ul></div>)}
                    {selected.perks?.length > 0 && (<div><h3 className="text-sm font-semibold text-foreground mb-2">Perks</h3><div className="flex flex-wrap gap-2">{selected.perks.map((p, i) => <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">{p}</span>)}</div></div>)}
                    {!selected.description && !selected.requirements?.length && <p className="text-sm text-muted-foreground text-center py-4">No details available for this job yet.</p>}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card flex items-center justify-center min-h-[400px]">
                  <div className="text-center"><Briefcase size={32} className="text-muted-foreground mx-auto mb-2"/><p className="text-sm text-muted-foreground">Select a job to view details</p></div>
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