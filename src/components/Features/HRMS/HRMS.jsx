import { useState, useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import PremiumGate from "@/components/Features/Premium/PremiumGate";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getEmployees, getHrmsStats, addEmployee, deleteEmployee, getLeaveRequests, updateLeaveStatus } from "@/api/hrmsApi";
import { Plus, Search, Users, Calendar, AlertCircle, DollarSign, Check, X, Loader2, Trash2 } from "lucide-react";

const DEPTS = ["All Departments","Engineering","Product","Design","Data","DevOps","Marketing","Operations"];

const StatusBadge = ({ status }) => {
  const styles = { active:"bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400", on_leave:"bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400", approved:"bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400", pending:"bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400", rejected:"bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" };
  const labels = { active:"Active", on_leave:"On Leave", approved:"Approved", pending:"Pending", rejected:"Rejected" };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles[status]||"bg-muted text-muted-foreground"}`}>{labels[status]||status}</span>;
};

const AddEmployeeModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ name:"",email:"",phone:"",department:"Engineering",role:"",salary:0,joinDate:new Date().toISOString().slice(0,10) });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async () => {
    if (!form.name||!form.email||!form.role) return;
    setSaving(true);
    try { const data=await addEmployee(form); onAdd(data.employee); onClose(); } catch {}
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">Add Employee</h3>
          <Button variant="ghost" size="icon-sm" onClick={onClose}><X size={16}/></Button>
        </div>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-foreground">Name *</label><Input className="mt-1" value={form.name} onChange={e=>set("name",e.target.value)}/></div>
            <div><label className="text-xs font-medium text-foreground">Email *</label><Input className="mt-1" type="email" value={form.email} onChange={e=>set("email",e.target.value)}/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-foreground">Role *</label><Input className="mt-1" value={form.role} onChange={e=>set("role",e.target.value)}/></div>
            <div><label className="text-xs font-medium text-foreground">Phone</label><Input className="mt-1" value={form.phone} onChange={e=>set("phone",e.target.value)}/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-foreground">Department</label>
              <select className="w-full mt-1 h-9 text-sm px-3 rounded-lg border border-input bg-background text-foreground outline-none" value={form.department} onChange={e=>set("department",e.target.value)}>
                {DEPTS.slice(1).map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-medium text-foreground">Salary (₹/yr)</label><Input className="mt-1" type="number" value={form.salary} onChange={e=>set("salary",Number(e.target.value))}/></div>
          </div>
          <div><label className="text-xs font-medium text-foreground">Join Date</label><Input className="mt-1" type="date" value={form.joinDate} onChange={e=>set("joinDate",e.target.value)}/></div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={saving||!form.name||!form.email||!form.role}>
              {saving?<><Loader2 size={14} className="animate-spin mr-1"/>Adding…</>:"Add Employee"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const HRMS = () => {
  const { user } = useAuth();
  if (!user?.isPremium) return <MainLayout><PremiumGate feature="HRMS (Human Resource Management System)" /></MainLayout>;

  const [employees, setEmployees] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("employees");
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All Departments");
  const [showModal, setShowModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eData, lData, sData] = await Promise.all([getEmployees(), getLeaveRequests(), getHrmsStats()]);
      setEmployees(eData.employees||[]);
      setLeaveRequests(lData.requests||[]);
      setStats(sData.stats);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleLeaveAction = async (id, status) => {
    try {
      const data = await updateLeaveStatus(id, status);
      setLeaveRequests(prev => prev.map(r => r._id===id ? data.request : r));
    } catch {}
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Delete employee?")) return;
    try { await deleteEmployee(id); setEmployees(prev=>prev.filter(e=>e._id!==id)); } catch {}
  };

  const filtered = employees.filter(e => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.role.toLowerCase().includes(search.toLowerCase());
    const matchDept = dept==="All Departments" || e.department===dept;
    return matchSearch && matchDept;
  });

  const fmtSalary = (s) => s>=100000?`₹${(s/100000).toFixed(1)}L`:`₹${s.toLocaleString()}`;

  return (
    <MainLayout>
      {showModal && <AddEmployeeModal onClose={()=>setShowModal(false)} onAdd={e=>setEmployees(prev=>[e,...prev])}/>}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-lg font-bold text-foreground">HRMS</h1><p className="text-xs text-muted-foreground">Human Resource Management</p></div>
          <Button size="sm" className="gap-1.5" onClick={()=>setShowModal(true)}><Plus size={14}/>Add Employee</Button>
        </div>

        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[{label:"Total Employees",value:stats.total||0,icon:Users,color:"text-blue-600 bg-blue-50 dark:bg-blue-950"},
              {label:"On Leave",value:stats.onLeave||0,icon:Calendar,color:"text-amber-600 bg-amber-50 dark:bg-amber-950"},
              {label:"Pending Requests",value:stats.pending||0,icon:AlertCircle,color:"text-rose-600 bg-rose-50 dark:bg-rose-950"},
              {label:"Total Payroll",value:fmtSalary(stats.totalPayroll||0),icon:DollarSign,color:"text-emerald-600 bg-emerald-50 dark:bg-emerald-950"}
            ].map(({label,value,icon:Icon,color})=>(
              <div key={label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}><Icon size={16}/></div>
                <div><p className="text-xl font-bold text-foreground">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
              </div>
            ))}
          </div>
        )}

        <Tabs value={tab} onValueChange={setTab}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <TabsList>
              <TabsTrigger value="employees" className="text-xs">Employees ({employees.length})</TabsTrigger>
              <TabsTrigger value="leave" className="text-xs">Leave ({leaveRequests.filter(r=>r.status==="pending").length} pending)</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"/>
                <Input placeholder="Search…" className="pl-8 h-8 text-sm w-40" value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
              {tab==="employees" && (
                <select value={dept} onChange={e=>setDept(e.target.value)} className="h-8 text-xs px-2 rounded-lg border border-input bg-background text-foreground outline-none">
                  {DEPTS.map(d=><option key={d}>{d}</option>)}
                </select>
              )}
            </div>
          </div>

          <TabsContent value="employees" className="mt-4">
            {loading ? <div className="flex items-center justify-center py-10"><Loader2 size={24} className="animate-spin text-muted-foreground"/></div> : (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-muted/30">
                      {["Employee","Department","Role","Salary","Leave Balance","Joined","Status",""].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>)}
                    </tr></thead>
                    <tbody className="divide-y divide-border">
                      {filtered.map(emp=>(
                        <tr key={emp._id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 overflow-hidden">
                                {emp.avatarUrl?<img src={emp.avatarUrl} className="w-full h-full object-cover" alt=""/>:emp.name[0].toUpperCase()}
                              </div>
                              <div><p className="text-xs font-medium text-foreground">{emp.name}</p><p className="text-[10px] text-muted-foreground">{emp.email}</p></div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{emp.department}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{emp.role}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-foreground">{fmtSalary(emp.salary||0)}</td>
                          <td className="px-4 py-3"><span className={`text-xs font-medium ${(emp.leaveBalance||0)<=3?"text-rose-600":(emp.leaveBalance||0)<=7?"text-amber-600":"text-foreground"}`}>{emp.leaveBalance||20} days</span></td>
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(emp.joinDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3"><StatusBadge status={emp.status}/></td>
                          <td className="px-4 py-3"><button onClick={()=>handleDeleteEmployee(emp._id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={13}/></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filtered.length===0 && <div className="text-center py-10 text-sm text-muted-foreground">No employees found</div>}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="leave" className="mt-4">
            {loading ? <div className="flex items-center justify-center py-10"><Loader2 size={24} className="animate-spin text-muted-foreground"/></div> : (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Leave Requests</h3>
                  <span className="text-xs text-muted-foreground">{leaveRequests.filter(r=>r.status==="pending").length} pending</span>
                </div>
                {leaveRequests.length===0 ? (
                  <div className="text-center py-10 text-sm text-muted-foreground">No leave requests</div>
                ) : (
                  <div className="divide-y divide-border">
                    {leaveRequests.map(req=>(
                      <div key={req._id} className="px-4 py-4 flex items-start gap-4">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 overflow-hidden">
                          {req.employee?.avatarUrl?<img src={req.employee.avatarUrl} className="w-full h-full object-cover" alt=""/>:req.employee?.name?.[0]?.toUpperCase()||"E"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{req.employee?.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{req.type?.replace("_"," ")} · {new Date(req.fromDate).toLocaleDateString()} – {new Date(req.toDate).toLocaleDateString()} ({req.days} days)</p>
                              {req.reason && <p className="text-xs text-muted-foreground italic mt-0.5">"{req.reason}"</p>}
                            </div>
                            <StatusBadge status={req.status}/>
                          </div>
                          {req.status==="pending" && (
                            <div className="flex gap-2 mt-2">
                              <Button size="xs" className="gap-1" onClick={()=>handleLeaveAction(req._id,"approved")}><Check size={11}/>Approve</Button>
                              <Button variant="destructive" size="xs" onClick={()=>handleLeaveAction(req._id,"rejected")}>Reject</Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default HRMS;
