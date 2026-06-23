import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Search, ExternalLink, Code2, Layers, X,
  Pencil, Trash2, Globe, Loader2, Calendar
} from "lucide-react";
import { getMyProjects, exploreProjects, createProject, updateProject, deleteProject } from "@/api/projectApi";
import useAuth from "@/hooks/useAuth";

const STATUS_BADGE = {
  active:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  paused:    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
};

const STATUS_OPTIONS = ["active", "completed", "paused"];

const TECH_COLORS = [
  "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
];

const timeAgo = (d) => {
  const days = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30)  return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};

const EMPTY_FORM = { name: "", description: "", tech: "", status: "active", githubUrl: "", liveUrl: "" };

// ── Project Form Modal ────────────────────────────────────────────────
const ProjectModal = ({ initial, onSave, onClose, saving }) => {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const isEdit = !!initial;

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const techStack = form.tech
      ? form.tech.split(",").map(t => t.trim()).filter(Boolean)
      : (form.techStack || []);
    onSave({ ...form, techStack });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">
            {isEdit ? "Edit Project" : "Add New Project"}
          </h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <X size={16}/>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Project Name *</label>
            <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. My Awesome App"/>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Description</label>
            <textarea
              className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-transparent outline-none resize-none min-h-[80px] focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring transition-colors"
              placeholder="What does this project do?"
              value={form.description}
              onChange={e => set("description", e.target.value)}
            />
          </div>

          {/* Tech Stack */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Tech Stack <span className="text-muted-foreground font-normal">(comma separated)</span></label>
            <Input
              value={form.tech || (form.techStack || []).join(", ")}
              onChange={e => set("tech", e.target.value)}
              placeholder="React, Node.js, MongoDB, Tailwind"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Status</label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => set("status", s)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-colors
                    ${form.status === s
                      ? STATUS_BADGE[s] + " border-current"
                      : "border-border text-muted-foreground hover:bg-muted"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* URLs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block flex items-center gap-1"><Code2 size={11}/> GitHub URL</label>
              <Input value={form.githubUrl} onChange={e => set("githubUrl", e.target.value)} placeholder="https://github.com/..."/>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block flex items-center gap-1"><Globe size={11}/> Live URL</label>
              <Input value={form.liveUrl} onChange={e => set("liveUrl", e.target.value)} placeholder="https://..."/>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-border">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={!form.name.trim() || saving}>
            {saving ? <><Loader2 size={14} className="animate-spin mr-1.5"/>{isEdit ? "Saving…" : "Adding…"}</> : isEdit ? "Save Changes" : "Add Project"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Project Card ──────────────────────────────────────────────────────
const ProjectCard = ({ project, isOwner, onEdit, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col hover:shadow-md transition-shadow group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Code2 size={18} className="text-primary"/>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[project.status]}`}>
            {project.status}
          </span>
          {isOwner && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit(project)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <Pencil size={12}/>
              </button>
              <button onClick={() => onDelete(project._id)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 size={12}/>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Name + desc */}
      <h3 className="text-sm font-bold text-foreground mb-1 leading-snug">{project.name}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed flex-1 line-clamp-2">
        {project.description || "No description provided."}
      </p>

      {/* Tech stack */}
      {project.techStack?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {project.techStack.slice(0, 4).map((t, i) => (
            <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TECH_COLORS[i % TECH_COLORS.length]}`}>
              {t}
            </span>
          ))}
          {project.techStack.length > 4 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              +{project.techStack.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        {/* Owner (shown in explore tab) */}
        {!isOwner && project.owner && (
          <button
            onClick={() => navigate(`/profile/${project.owner.username}`)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary overflow-hidden">
              {project.owner.avatarUrl
                ? <img src={project.owner.avatarUrl} className="w-full h-full object-cover" alt=""/>
                : project.owner.name?.[0]?.toUpperCase()}
            </div>
            {project.owner.name}
          </button>
        )}
        {isOwner && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Calendar size={10}/> {timeAgo(project.createdAt)}
          </span>
        )}

        {/* Links */}
        <div className="flex gap-3 ml-auto">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={e => e.stopPropagation()}>
              <Code2 size={12}/> Code
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={e => e.stopPropagation()}>
              <ExternalLink size={12}/> Live
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────
const Projects = () => {
  const { user } = useAuth();
  const [tab,          setTab]          = useState("mine");
  const [myProjects,   setMyProjects]   = useState([]);
  const [allProjects,  setAllProjects]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal,    setShowModal]    = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [saving,       setSaving]       = useState(false);

  useEffect(() => { loadMine(); }, []);
  useEffect(() => { if (tab === "explore") loadAll(); }, [tab]);

  const loadMine = async () => {
    setLoading(true);
    try { const d = await getMyProjects(); setMyProjects(d.projects || []); } catch {}
    setLoading(false);
  };

  const loadAll = async () => {
    setLoading(true);
    try { const d = await exploreProjects({}); setAllProjects(d.projects || []); } catch {}
    setLoading(false);
  };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editTarget) {
        const d = await updateProject(editTarget._id, form);
        setMyProjects(p => p.map(x => x._id === editTarget._id ? d.project : x));
      } else {
        const d = await createProject(form);
        setMyProjects(p => [d.project, ...p]);
      }
      setShowModal(false);
      setEditTarget(null);
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    try {
      await deleteProject(id);
      setMyProjects(p => p.filter(x => x._id !== id));
    } catch {}
  };

  const openEdit = (project) => { setEditTarget(project); setShowModal(true); };
  const openAdd  = ()        => { setEditTarget(null);    setShowModal(true); };

  const filterList = (list) => list.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q)
      || p.description?.toLowerCase().includes(q)
      || p.techStack?.some(t => t.toLowerCase().includes(q));
    const matchS = !statusFilter || p.status === statusFilter;
    return matchQ && matchS;
  });

  const displayed = filterList(tab === "mine" ? myProjects : allProjects);

  return (
    <MainLayout>
      {(showModal) && (
        <ProjectModal
          initial={editTarget ? {
            ...editTarget,
            tech: editTarget.techStack?.join(", ") || "",
          } : null}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
          saving={saving}
        />
      )}

      <div className="flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Projects</h1>
            <p className="text-sm text-muted-foreground">Showcase and discover projects</p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={openAdd}>
            <Plus size={14}/> New Project
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
          {[
            { id: "mine",    label: `My Projects (${myProjects.length})` },
            { id: "explore", label: "Explore" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors
                ${tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"/>
            <Input
              placeholder="Search projects, tech…"
              className="pl-8"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5">
            {["", ...STATUS_OPTIONS].map(s => (
              <button key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors border
                  ${statusFilter === s
                    ? s ? STATUS_BADGE[s] + " border-current" : "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:bg-muted"}`}>
                {s || "All"}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-muted-foreground"/>
          </div>
        ) : displayed.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-14 text-center">
            <Layers size={36} className="text-muted-foreground mx-auto mb-3 opacity-40"/>
            <p className="text-sm font-semibold text-foreground">
              {tab === "mine" ? "No projects yet" : "No projects found"}
            </p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              {tab === "mine"
                ? "Add your first project to showcase your work"
                : "Try a different search or filter"}
            </p>
            {tab === "mine" && (
              <Button size="sm" onClick={openAdd} className="gap-1.5">
                <Plus size={14}/> Add Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map(p => (
              <ProjectCard
                key={p._id}
                project={p}
                isOwner={p.owner?._id === user?.id || p.owner === user?.id}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Projects;
