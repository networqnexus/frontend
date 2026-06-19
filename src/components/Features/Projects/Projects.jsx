import { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, ExternalLink, Star, GitFork, Users, Code2, Layers, X } from "lucide-react";

const STATUS_BADGE = {
  active:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  paused:    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
};

const SAMPLE_PROJECTS = [
  { id:1, name:"Networq Nexus", desc:"A LinkedIn clone with ATS, CRM, HRMS and real-time features.", tech:["React","Node.js","MongoDB","Socket.io"], stars:24, forks:8, members:3, status:"active",    github:"#", live:"#" },
  { id:2, name:"TaskFlow",      desc:"Project management tool with Kanban boards and team collaboration.", tech:["React","Tailwind","Redux","Express"], stars:12, forks:4, members:2, status:"active",    github:"#", live:"#" },
  { id:3, name:"ShopAI",        desc:"E-commerce platform with AI-powered product recommendations.", tech:["Next.js","Python","FastAPI","PostgreSQL"], stars:31, forks:11, members:4, status:"completed", github:"#", live:"#" },
];

const Projects = () => {
  const [projects, setProjects] = useState(SAMPLE_PROJECTS);
  const [search,   setSearch]   = useState("");
  const [showAdd,  setShowAdd]  = useState(false);
  const [form, setForm] = useState({ name:"", desc:"", tech:"", github:"", live:"" });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const filtered = projects.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.name) return;
    setProjects(prev => [...prev, {
      id: Date.now(), name: form.name, desc: form.desc,
      tech: form.tech.split(",").map(t => t.trim()).filter(Boolean),
      stars:0, forks:0, members:1, status:"active",
      github: form.github, live: form.live,
    }]);
    setForm({ name:"", desc:"", tech:"", github:"", live:"" });
    setShowAdd(false);
  };

  return (
    <MainLayout>
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground">Add Project</h3>
              <Button variant="ghost" size="icon-sm" onClick={() => setShowAdd(false)}><X size={16}/></Button>
            </div>
            <div className="flex flex-col gap-3">
              <div><label className="text-xs font-medium text-foreground">Project Name *</label><Input className="mt-1" value={form.name} onChange={e => set("name", e.target.value)}/></div>
              <div><label className="text-xs font-medium text-foreground">Description</label>
                <textarea className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-input bg-transparent outline-none resize-none min-h-[70px] focus-visible:border-ring" value={form.desc} onChange={e => set("desc", e.target.value)}/>
              </div>
              <div><label className="text-xs font-medium text-foreground">Tech Stack (comma separated)</label><Input className="mt-1" placeholder="React, Node.js, MongoDB" value={form.tech} onChange={e => set("tech", e.target.value)}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-foreground">GitHub URL</label><Input className="mt-1" placeholder="https://github.com/..." value={form.github} onChange={e => set("github", e.target.value)}/></div>
                <div><label className="text-xs font-medium text-foreground">Live URL</label><Input className="mt-1" placeholder="https://..." value={form.live} onChange={e => set("live", e.target.value)}/></div>
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleAdd} disabled={!form.name}>Add Project</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold text-foreground">Projects</h1><p className="text-sm text-muted-foreground">Showcase and collaborate on projects</p></div>
          <Button size="sm" className="gap-1.5" onClick={() => setShowAdd(true)}><Plus size={14}/>New Project</Button>
        </div>

        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"/>
          <Input placeholder="Search projects…" className="pl-8" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="rounded-xl border border-border bg-card p-5 flex flex-col hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Code2 size={18} className="text-primary"/></div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[p.status]}`}>{p.status}</span>
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1">{p.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">{p.desc}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {p.tech.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>)}
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Star size={11}/>{p.stars}</span>
                <span className="flex items-center gap-1"><GitFork size={11}/>{p.forks}</span>
                <span className="flex items-center gap-1"><Users size={11}/>{p.members}</span>
                <div className="ml-auto flex gap-3">
                  {p.github && <a href={p.github} className="hover:text-foreground transition-colors text-xs flex items-center gap-1"><Code2 size={13}/>Code</a>}
                  {p.live   && <a href={p.live}   className="hover:text-foreground transition-colors text-xs flex items-center gap-1"><ExternalLink size={13}/>Live</a>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Layers size={32} className="text-muted-foreground mx-auto mb-3"/>
            <p className="text-sm font-medium text-foreground">No projects found</p>
            <p className="text-xs text-muted-foreground mt-1">Add your first project to showcase your work</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Projects;