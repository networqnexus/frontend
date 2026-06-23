import { useState, useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getEvents, getMyEvents, createEvent, attendEvent, deleteEvent } from "@/api/eventApi";
import useAuth from "@/hooks/useAuth";
import {
  Calendar, Clock, MapPin, Users, Plus, X, Globe, Wifi,
  Loader2, Trash2, ExternalLink, CalendarCheck, Briefcase,
  Mic, Network, Building2, BookOpen
} from "lucide-react";

const CATEGORIES = [
  { value:"networking",  label:"Networking",  icon:Network },
  { value:"webinar",     label:"Webinar",     icon:Mic },
  { value:"workshop",    label:"Workshop",    icon:BookOpen },
  { value:"hiring",      label:"Hiring",      icon:Briefcase },
  { value:"conference",  label:"Conference",  icon:Building2 },
  { value:"other",       label:"Other",       icon:Calendar },
];

const CATEGORY_COLORS = {
  networking: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  webinar:    "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  workshop:   "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  hiring:     "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  conference: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
  other:      "bg-muted text-muted-foreground",
};

const formatDate = (d) => {
  const date = new Date(d);
  return date.toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short", year:"numeric" });
};
const formatTime = (d) => new Date(d).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
const isUpcoming = (d) => new Date(d) > new Date();

const EventCard = ({ event, currentUserId, onAttend, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const isHost = event.host?._id === currentUserId || event.host?._id?.toString() === currentUserId;
  const attending = event.attendees?.some(a => (a._id||a)?.toString() === currentUserId);
  const CatIcon = CATEGORIES.find(c=>c.value===event.category)?.icon || Calendar;
  const upcoming = isUpcoming(event.date);

  const handleAttend = async () => {
    setLoading(true);
    try { await onAttend(event._id); } finally { setLoading(false); }
  };

  return (
    <div className={`rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-md ${!upcoming?"opacity-70":""}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${CATEGORY_COLORS[event.category]}`}>
              <CatIcon size={15}/>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[event.category]}`}>
              {CATEGORIES.find(c=>c.value===event.category)?.label}
            </span>
          </div>
          {!upcoming && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Past</span>}
          {isHost && (
            <button onClick={()=>onDelete(event._id)} className="text-muted-foreground hover:text-destructive transition-colors ml-auto">
              <Trash2 size={14}/>
            </button>
          )}
        </div>

        <h3 className="font-semibold text-foreground text-sm mb-1 leading-snug">{event.title}</h3>
        {event.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{event.description}</p>}

        <div className="flex flex-col gap-1.5 mb-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar size={12} className="shrink-0"/>
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock size={12} className="shrink-0"/>
            <span>{formatTime(event.date)}{event.endDate ? ` – ${formatTime(event.endDate)}` : ""}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {event.isOnline ? <Wifi size={12} className="shrink-0"/> : <MapPin size={12} className="shrink-0"/>}
            <span>{event.location || "Online"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary overflow-hidden shrink-0">
            {event.host?.avatarUrl
              ? <img src={event.host.avatarUrl} className="w-full h-full object-cover" alt=""/>
              : event.host?.name?.[0]?.toUpperCase()||"H"}
          </div>
          <span className="text-xs text-muted-foreground">
            by <span className="text-foreground font-medium">{event.host?.name}</span>
          </span>
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Users size={11}/> {event.attendees?.length||0}
            {event.maxAttendees ? `/${event.maxAttendees}` : ""}
          </span>
        </div>

        <div className="flex gap-2">
          {isHost ? (
            <div className="flex-1 text-center text-xs py-2 rounded-lg bg-muted text-muted-foreground font-medium">
              You're hosting
            </div>
          ) : upcoming ? (
            <Button size="sm" className="flex-1 gap-1.5" variant={attending?"outline":"default"} onClick={handleAttend} disabled={loading}>
              {loading ? <Loader2 size={13} className="animate-spin"/> : attending ? <><CalendarCheck size={13}/>Attending</> : <><Plus size={13}/>Attend</>}
            </Button>
          ) : null}
          {event.link && (
            <a href={event.link} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="gap-1">
                <ExternalLink size={13}/> Link
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const CreateEventModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    title:"", description:"", category:"networking",
    date:"", endDate:"", isOnline:true, location:"Online", link:"",
    maxAttendees:"", isPublic:true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) return setError("Title is required");
    if (!form.date) return setError("Date is required");
    setLoading(true);
    try {
      const data = await createEvent({
        ...form,
        maxAttendees: form.maxAttendees ? parseInt(form.maxAttendees) : undefined,
      });
      onCreated(data.event);
    } catch(e) { setError(e.message||"Failed to create event"); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Create Event</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Event Title *</label>
            <Input placeholder="e.g. Frontend Dev Networking Meetup" value={form.title} onChange={e=>set("title",e.target.value)} required/>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <Textarea placeholder="What's this event about?" value={form.description} onChange={e=>set("description",e.target.value)} className="resize-none min-h-[80px]"/>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c=>(
                <button key={c.value} type="button" onClick={()=>set("category",c.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.category===c.value?"border-primary bg-primary/5 text-primary":"border-border text-muted-foreground hover:border-foreground/30"}`}>
                  <c.icon size={12}/>{c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Start Date & Time *</label>
              <Input type="datetime-local" value={form.date} onChange={e=>set("date",e.target.value)} required/>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">End Time</label>
              <Input type="datetime-local" value={form.endDate} onChange={e=>set("endDate",e.target.value)}/>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={()=>set("isOnline",true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${form.isOnline?"border-primary bg-primary/5 text-primary":"border-border text-muted-foreground"}`}>
              <Wifi size={14}/> Online
            </button>
            <button type="button" onClick={()=>set("isOnline",false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${!form.isOnline?"border-primary bg-primary/5 text-primary":"border-border text-muted-foreground"}`}>
              <MapPin size={14}/> In-Person
            </button>
          </div>

          {!form.isOnline && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Location</label>
              <Input placeholder="Delhi, India / Venue name" value={form.location} onChange={e=>set("location",e.target.value)}/>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Meeting Link <span className="text-muted-foreground font-normal">(optional)</span></label>
            <Input placeholder="https://meet.google.com/..." value={form.link} onChange={e=>set("link",e.target.value)}/>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Max Attendees <span className="text-muted-foreground font-normal">(optional)</span></label>
            <Input type="number" placeholder="Leave blank for unlimited" value={form.maxAttendees} onChange={e=>set("maxAttendees",e.target.value)} min="1"/>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading?<><Loader2 size={14} className="animate-spin mr-1.5"/>Creating…</>:"Create Event"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const fetchEvents = async () => {
    try {
      const fn = tab==="mine" ? getMyEvents : getEvents;
      const data = await fn();
      setEvents(data.events||[]);
    } catch {}
  };

  useEffect(() => { setLoading(true); fetchEvents().finally(()=>setLoading(false)); }, [tab]);

  const handleCreated = (event) => {
    setEvents(prev=>[event,...prev]);
    setShowCreate(false);
    showToast("Event created!");
  };

  const handleAttend = async (id) => {
    try {
      const data = await attendEvent(id);
      setEvents(prev=>prev.map(e=>{
        if (e._id!==id) return e;
        const uid = user?.id;
        return {
          ...e,
          attendees: data.attending
            ? [...(e.attendees||[]),{_id:uid,name:user?.name}]
            : (e.attendees||[]).filter(a=>(a._id||a)?.toString()!==uid)
        };
      }));
      showToast(data.attending?"You're attending!":"Removed from event");
    } catch(e) { showToast(e.message||"Failed","error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await deleteEvent(id);
      setEvents(prev=>prev.filter(e=>e._id!==id));
      showToast("Event deleted");
    } catch(e) { showToast(e.message||"Failed","error"); }
  };

  const upcoming = events.filter(e=>isUpcoming(e.date));
  const past     = events.filter(e=>!isUpcoming(e.date));
  const display  = tab==="past" ? past : tab==="mine" ? events : upcoming;

  return (
    <MainLayout>
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${toast.type==="error"?"bg-destructive text-destructive-foreground":"bg-foreground text-background"}`}>
          {toast.msg}
          <button onClick={()=>setToast(null)}><X size={14}/></button>
        </div>
      )}

      {showCreate && <CreateEventModal onClose={()=>setShowCreate(false)} onCreated={handleCreated}/>}

      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
          <div className="flex items-center gap-0.5">
            {[
              {key:"upcoming",label:"Upcoming"},
              {key:"past",label:"Past"},
              {key:"mine",label:"My Events"},
            ].map(({key,label})=>(
              <button key={key} onClick={()=>setTab(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab===key?"bg-muted text-foreground":"text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
                {label}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={()=>setShowCreate(true)} className="gap-1.5">
            <Plus size={14}/> Create Event
          </Button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {label:"Total Events", value:events.length},
            {label:"Upcoming",     value:upcoming.length},
            {label:"My Events",    value:events.filter(e=>e.host?._id?.toString()===user?.id||e.attendees?.some(a=>(a._id||a)?.toString()===user?.id)).length},
          ].map(({label,value})=>(
            <div key={label} className="bg-card border border-border rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Events grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-muted-foreground"/>
          </div>
        ) : display.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Calendar size={40} className="mx-auto mb-3 text-muted-foreground opacity-40"/>
            <p className="text-muted-foreground text-sm">
              {tab==="upcoming" ? "No upcoming events. Create one!" : tab==="past" ? "No past events yet." : "You haven't created or attended any events yet."}
            </p>
            {tab==="upcoming" && (
              <Button size="sm" className="mt-4 gap-1.5" onClick={()=>setShowCreate(true)}>
                <Plus size={14}/> Create Event
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {display.map(event=>(
              <EventCard
                key={event._id}
                event={event}
                currentUserId={user?.id}
                onAttend={handleAttend}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Events;
