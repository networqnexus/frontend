import { useState, useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import PremiumGate from "@/components/Features/Premium/PremiumGate";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getLeads, getCrmStats, addLead, updateLead, deleteLead } from "@/api/crmApi";
import { Plus, Search, DollarSign, Users, Target, TrendingUp, Clock, MoreHorizontal, Loader2, X, Trash2 } from "lucide-react";

const STAGES = [
  { id:"prospect",    label:"Prospect",    color:"bg-muted text-muted-foreground"                              },
  { id:"qualified",   label:"Qualified",   color:"bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"         },
  { id:"proposal",    label:"Proposal",    color:"bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400" },
  { id:"negotiation", label:"Negotiation", color:"bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"     },
  { id:"closed_won",  label:"Won ✓",       color:"bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  { id:"closed_lost", label:"Lost ✗",      color:"bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"             },
];

const PRIORITY_DOT = { urgent:"bg-red-500", high:"bg-amber-500", medium:"bg-blue-500", low:"bg-muted-foreground" };

const AddLeadModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ companyName:"",contactName:"",contactEmail:"",contactPhone:"",value:0,stage:"prospect",probability:20,priority:"medium",notes:"" });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async () => {
    if (!form.companyName||!form.contactName) return;
    setSaving(true);
    try { const data=await addLead(form); onAdd(data.lead); onClose(); } catch {}
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">Add Lead</h3>
          <Button variant="ghost" size="icon-sm" onClick={onClose}><X size={16}/></Button>
        </div>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-foreground">Company *</label><Input className="mt-1" value={form.companyName} onChange={e=>set("companyName",e.target.value)}/></div>
            <div><label className="text-xs font-medium text-foreground">Contact *</label><Input className="mt-1" value={form.contactName} onChange={e=>set("contactName",e.target.value)}/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-foreground">Email</label><Input className="mt-1" type="email" value={form.contactEmail} onChange={e=>set("contactEmail",e.target.value)}/></div>
            <div><label className="text-xs font-medium text-foreground">Phone</label><Input className="mt-1" value={form.contactPhone} onChange={e=>set("contactPhone",e.target.value)}/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-foreground">Value (₹)</label><Input className="mt-1" type="number" value={form.value} onChange={e=>set("value",Number(e.target.value))}/></div>
            <div><label className="text-xs font-medium text-foreground">Win Probability %</label><Input className="mt-1" type="number" min="0" max="100" value={form.probability} onChange={e=>set("probability",Number(e.target.value))}/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-foreground">Stage</label>
              <select className="w-full mt-1 h-9 text-sm px-3 rounded-lg border border-input bg-transparent text-foreground outline-none" value={form.stage} onChange={e=>set("stage",e.target.value)}>
                {STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-medium text-foreground">Priority</label>
              <select className="w-full mt-1 h-9 text-sm px-3 rounded-lg border border-input bg-transparent text-foreground outline-none" value={form.priority} onChange={e=>set("priority",e.target.value)}>
                {["low","medium","high","urgent"].map(p=><option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
          </div>
          <div><label className="text-xs font-medium text-foreground">Notes</label><textarea className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-input bg-transparent outline-none resize-none min-h-[60px]" value={form.notes} onChange={e=>set("notes",e.target.value)}/></div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={saving||!form.companyName||!form.contactName}>
              {saving?<><Loader2 size={14} className="animate-spin mr-1"/>Adding…</>:"Add Lead"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CRM = () => {
  const { user } = useAuth();
  if (!user?.isPremium) return <MainLayout><PremiumGate feature="CRM (Customer Relationship Manager)" /></MainLayout>;

  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pipeline");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [dragging, setDragging] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [lData, sData] = await Promise.all([getLeads(), getCrmStats()]);
      setLeads(lData.leads||[]);
      setStats(sData.stats);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleStageChange = async (id, stage) => {
    try { await updateLead(id,{stage}); setLeads(prev=>prev.map(l=>l._id===id?{...l,stage}:l)); } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete lead?")) return;
    try { await deleteLead(id); setLeads(prev=>prev.filter(l=>l._id!==id)); } catch {}
  };

  const filtered = leads.filter(l => !search || l.companyName.toLowerCase().includes(search.toLowerCase()) || l.contactName.toLowerCase().includes(search.toLowerCase()));
  const fmtValue = (v) => v>=100000?`₹${(v/100000).toFixed(1)}L`:`₹${v.toLocaleString()}`;

  return (
    <MainLayout>
      {showModal && <AddLeadModal onClose={()=>setShowModal(false)} onAdd={l=>setLeads(prev=>[l,...prev])}/>}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-lg font-bold text-foreground">CRM</h1><p className="text-xs text-muted-foreground">Manage your leads and deals</p></div>
          <Button size="sm" className="gap-1.5" onClick={()=>setShowModal(true)}><Plus size={14}/>Add Lead</Button>
        </div>

        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[{label:"Pipeline Value",value:fmtValue(stats.totalValue||0),icon:DollarSign,color:"text-emerald-600 bg-emerald-50 dark:bg-emerald-950"},
              {label:"Won Value",value:fmtValue(stats.wonValue||0),icon:Target,color:"text-blue-600 bg-blue-50 dark:bg-blue-950"},
              {label:"Active Leads",value:stats.activeLeads||0,icon:Users,color:"text-violet-600 bg-violet-50 dark:bg-violet-950"},
              {label:"Avg Win Prob",value:`${stats.avgProbability||0}%`,icon:TrendingUp,color:"text-amber-600 bg-amber-50 dark:bg-amber-950"}
            ].map(({label,value,icon:Icon,color})=>(
              <div key={label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}><Icon size={16}/></div>
                <div><p className="text-xl font-bold text-foreground">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList><TabsTrigger value="pipeline" className="text-xs">Pipeline</TabsTrigger><TabsTrigger value="table" className="text-xs">Table</TabsTrigger></TabsList>
          </Tabs>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"/>
            <Input placeholder="Search…" className="pl-8 h-8 text-sm w-48" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
        </div>

        {loading ? <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-muted-foreground"/></div> : (
          <>
            {tab==="pipeline" && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {STAGES.map(stage=>{
                  const stageLeads=filtered.filter(l=>l.stage===stage.id);
                  const stageVal=stageLeads.reduce((s,l)=>s+(l.value||0),0);
                  return (
                    <div key={stage.id} className="shrink-0 w-56 rounded-xl border border-border bg-muted/20 flex flex-col"
                      onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(dragging)handleStageChange(dragging,stage.id);setDragging(null);}}>
                      <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
                        <div><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stage.color}`}>{stage.label}</span><p className="text-[10px] text-muted-foreground mt-0.5">{fmtValue(stageVal)}</p></div>
                        <span className="text-xs font-bold text-foreground">{stageLeads.length}</span>
                      </div>
                      <div className="flex flex-col gap-2 p-2 min-h-[160px]">
                        {stageLeads.map(lead=>(
                          <div key={lead._id} draggable onDragStart={()=>setDragging(lead._id)} className="rounded-lg border border-border bg-card p-3 hover:shadow-sm transition-shadow group cursor-grab">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[lead.priority]}`}/>
                              <p className="text-xs font-semibold text-foreground flex-1 truncate">{lead.companyName}</p>
                              <button onClick={()=>handleDelete(lead._id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"><Trash2 size={11}/></button>
                            </div>
                            <p className="text-[10px] text-muted-foreground mb-2">{lead.contactName}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground">{fmtValue(lead.value||0)}</span>
                              <span className="text-[10px] text-muted-foreground">{lead.probability}% win</span>
                            </div>
                            <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary rounded-full" style={{width:`${lead.probability}%`}}/></div>
                          </div>
                        ))}
                        {stageLeads.length===0 && <div className="flex-1 flex items-center justify-center"><p className="text-[10px] text-muted-foreground">No leads</p></div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab==="table" && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-muted/30">
                      {["Company","Contact","Stage","Value","Probability","Priority",""].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>)}
                    </tr></thead>
                    <tbody className="divide-y divide-border">
                      {filtered.map(lead=>{
                        const stage=STAGES.find(s=>s.id===lead.stage);
                        return (
                          <tr key={lead._id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 text-xs font-medium text-foreground">{lead.companyName}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{lead.contactName}</td>
                            <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${stage?.color}`}>{stage?.label}</span></td>
                            <td className="px-4 py-3 text-xs font-semibold text-foreground">{fmtValue(lead.value||0)}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary rounded-full" style={{width:`${lead.probability}%`}}/></div>
                                <span className="text-xs text-muted-foreground">{lead.probability}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3"><div className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${PRIORITY_DOT[lead.priority]}`}/><span className="text-xs text-muted-foreground capitalize">{lead.priority}</span></div></td>
                            <td className="px-4 py-3"><button onClick={()=>handleDelete(lead._id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={13}/></button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filtered.length===0 && <div className="text-center py-10 text-sm text-muted-foreground">No leads found</div>}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default CRM;
