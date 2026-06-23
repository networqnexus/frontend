import { useState, useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import PremiumGate from "@/components/Features/Premium/PremiumGate";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCandidates, getAtsStats, addCandidate, updateStage, deleteCandidate } from "@/api/atsApi";
import { Plus, Search, Users, Calendar, CheckCircle2, TrendingUp, Star, Clock, Mail, Trash2, Loader2, X } from "lucide-react";

const STAGES = [
  { id:"applied",   label:"Applied",   color:"border-t-blue-400",    badge:"bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"    },
  { id:"screening", label:"Screening", color:"border-t-violet-400",  badge:"bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400" },
  { id:"interview", label:"Interview", color:"border-t-amber-400",   badge:"bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"   },
  { id:"offer",     label:"Offer",     color:"border-t-emerald-400", badge:"bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"},
  { id:"hired",     label:"Hired",     color:"border-t-green-500",   badge:"bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"   },
];

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">{[1,2,3,4,5].map(i=><Star key={i} size={10} className={i<=rating?"fill-amber-400 text-amber-400":"text-muted-foreground/30"}/>)}</div>
);

const AddCandidateModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ name:"",email:"",phone:"",role:"",company:"",experience:"",skills:"",stage:"applied",rating:3 });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.role) return;
    setSaving(true);
    try {
      const data = await addCandidate({...form, skills: form.skills.split(",").map(s=>s.trim()).filter(Boolean)});
      onAdd(data.candidate);
      onClose();
    } catch {}
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">Add Candidate</h3>
          <Button variant="ghost" size="icon-sm" onClick={onClose}><X size={16}/></Button>
        </div>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-foreground">Name *</label><Input className="mt-1" value={form.name} onChange={e=>set("name",e.target.value)}/></div>
            <div><label className="text-xs font-medium text-foreground">Email *</label><Input className="mt-1" type="email" value={form.email} onChange={e=>set("email",e.target.value)}/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-foreground">Role *</label><Input className="mt-1" value={form.role} onChange={e=>set("role",e.target.value)}/></div>
            <div><label className="text-xs font-medium text-foreground">Company</label><Input className="mt-1" value={form.company} onChange={e=>set("company",e.target.value)}/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-foreground">Experience</label><Input className="mt-1" placeholder="e.g. 3 yrs" value={form.experience} onChange={e=>set("experience",e.target.value)}/></div>
            <div><label className="text-xs font-medium text-foreground">Phone</label><Input className="mt-1" value={form.phone} onChange={e=>set("phone",e.target.value)}/></div>
          </div>
          <div><label className="text-xs font-medium text-foreground">Skills (comma separated)</label><Input className="mt-1" placeholder="React, Node.js" value={form.skills} onChange={e=>set("skills",e.target.value)}/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-foreground">Stage</label>
              <select className="w-full mt-1 h-9 text-sm px-3 rounded-lg border border-input bg-transparent text-foreground outline-none focus:border-ring" value={form.stage} onChange={e=>set("stage",e.target.value)}>
                {STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-medium text-foreground">Rating</label>
              <select className="w-full mt-1 h-9 text-sm px-3 rounded-lg border border-input bg-transparent text-foreground outline-none" value={form.rating} onChange={e=>set("rating",Number(e.target.value))}>
                {[1,2,3,4,5].map(n=><option key={n} value={n}>{"⭐".repeat(n)}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={saving||!form.name||!form.email||!form.role}>
              {saving?<><Loader2 size={14} className="animate-spin mr-1"/>Adding…</>:"Add Candidate"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ATS = () => {
  const { user } = useAuth();
  if (!user?.isPremium) return <MainLayout><PremiumGate feature="ATS (Applicant Tracking System)" /></MainLayout>;

  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [dragging, setDragging] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cData, sData] = await Promise.all([getCandidates(), getAtsStats()]);
      setCandidates(cData.candidates||[]);
      setStats(sData);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleStageChange = async (id, newStage) => {
    try {
      await updateStage(id, newStage);
      setCandidates(prev => prev.map(c => c._id===id ? {...c,stage:newStage} : c));
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete candidate?")) return;
    try {
      await deleteCandidate(id);
      setCandidates(prev => prev.filter(c => c._id !== id));
    } catch {}
  };

  const filtered = candidates.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase()));

  const statCards = [
    { label:"Total",     value:candidates.length,                                         icon:Users       },
    { label:"Interviews",value:candidates.filter(c=>c.stage==="interview").length,         icon:Calendar    },
    { label:"Offers",    value:candidates.filter(c=>c.stage==="offer").length,             icon:CheckCircle2},
    { label:"Hired",     value:candidates.filter(c=>c.stage==="hired").length,             icon:TrendingUp  },
  ];

  return (
    <MainLayout>
      {showModal && <AddCandidateModal onClose={()=>setShowModal(false)} onAdd={c=>setCandidates(prev=>[c,...prev])}/>}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-lg font-bold text-foreground">Applicant Tracking</h1><p className="text-xs text-muted-foreground">Manage your hiring pipeline</p></div>
          <Button size="sm" className="gap-1.5" onClick={()=>setShowModal(true)}><Plus size={14}/>Add Candidate</Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map(({label,value,icon:Icon})=>(
            <div key={label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center"><Icon size={16} className="text-muted-foreground"/></div>
              <div><p className="text-xl font-bold text-foreground">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
            </div>
          ))}
        </div>

        <div className="relative max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"/>
          <Input placeholder="Search candidates…" className="pl-8 h-8 text-sm" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-muted-foreground"/></div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {STAGES.map(stage=>{
              const stageCandidates = filtered.filter(c=>c.stage===stage.id);
              return (
                <div key={stage.id} className={`shrink-0 w-60 rounded-xl border-t-4 border border-border bg-muted/20 ${stage.color} flex flex-col`}
                  onDragOver={e=>e.preventDefault()}
                  onDrop={e=>{e.preventDefault();if(dragging)handleStageChange(dragging,stage.id);setDragging(null);}}>
                  <div className="px-3 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{stage.label}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${stage.badge}`}>{stageCandidates.length}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 p-2 flex-1 min-h-[200px]">
                    {stageCandidates.map(c=>(
                      <div key={c._id} draggable onDragStart={()=>setDragging(c._id)} className="rounded-lg border border-border bg-card p-3 hover:shadow-sm transition-shadow group cursor-grab active:cursor-grabbing">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{c.name[0].toUpperCase()}</div>
                            <div>
                              <p className="text-xs font-semibold text-foreground leading-tight">{c.name}</p>
                              <p className="text-[10px] text-muted-foreground">{c.experience} exp</p>
                            </div>
                          </div>
                          <button onClick={()=>handleDelete(c._id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"><Trash2 size={12}/></button>
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-1.5">{c.role}</p>
                        <StarRating rating={c.rating}/>
                        <div className="flex flex-wrap gap-1 mt-2">{c.skills?.slice(0,2).map(s=><span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s}</span>)}</div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock size={9}/>{new Date(c.appliedDate).toLocaleDateString()}</span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a href={`mailto:${c.email}`} className="text-muted-foreground hover:text-primary"><Mail size={11}/></a>
                          </div>
                        </div>
                      </div>
                    ))}
                    {stageCandidates.length===0 && <div className="flex-1 flex items-center justify-center"><p className="text-[10px] text-muted-foreground">No candidates</p></div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ATS;
