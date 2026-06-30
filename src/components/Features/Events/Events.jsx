import { useState, useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getEvents, getPastEvents, getMyEvents, createEvent, attendEvent, deleteEvent } from "@/api/eventApi";
import useAuth from "@/hooks/useAuth";
import {
  Calendar, Clock, MapPin, Users, Plus, X, Wifi,
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

const EventCard = ({ event, currentUserId, onAttend, onDelete, onClick }) => {
  const [loading, setLoading] = useState(false);
  const isHost = event.host?._id === currentUserId || event.host?._id?.toString() === currentUserId;
  const attending = event.attendees?.some(a => (a._id||a)?.toString() === currentUserId);
  const CatIcon = CATEGORIES.find(c=>c.value===event.category)?.icon || Calendar;
  const upcoming = isUpcoming(event.date);

  const handleAttend = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try { await onAttend(event._id); } finally { setLoading(false); }
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-md cursor-pointer ${!upcoming?"opacity-70":""}`}
    >
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
            <button onClick={(e)=>{e.stopPropagation();onDelete(event._id);}} className="text-muted-foreground hover:text-destructive transition-colors ml-auto">
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
            <a href={event.link} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}>
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

const HERO_GRADIENTS = {
  networking: "from-blue-700 via-blue-600 to-blue-400",
  webinar:    "from-purple-700 via-purple-600 to-violet-400",
  workshop:   "from-amber-600 via-orange-500 to-yellow-400",
  hiring:     "from-emerald-700 via-green-600 to-teal-400",
  conference: "from-rose-700 via-rose-600 to-pink-400",
  other:      "from-slate-700 via-slate-600 to-slate-400",
};

const EventDetailModal = ({ event, currentUserId, onAttend, onDelete, onClose }) => {
  const [loading, setLoading] = useState(false);
  const isHost = event.host?._id?.toString() === currentUserId || event.host?._id === currentUserId;
  const attending = event.attendees?.some(a => (a._id||a)?.toString() === currentUserId);
  const upcoming = isUpcoming(event.date);
  const CatIcon = CATEGORIES.find(c=>c.value===event.category)?.icon || Calendar;
  const catLabel = CATEGORIES.find(c=>c.value===event.category)?.label;
  const heroGradient = HERO_GRADIENTS[event.category] || HERO_GRADIENTS.other;

  const handleAttend = async () => {
    setLoading(true);
    try { await onAttend(event._id); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl border border-border"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Hero Banner ── */}
        <div className={`relative bg-gradient-to-br ${heroGradient} px-6 pt-6 pb-10 overflow-hidden`}>
          {/* decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none"/>
          <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none"/>

          {/* top row: badge + close */}
          <div className="relative flex items-center justify-between mb-5">
            <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              <CatIcon size={12}/> {catLabel}
            </span>
            <div className="flex items-center gap-2">
              {!upcoming && (
                <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-medium">Past</span>
              )}
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
                <X size={14}/>
              </button>
            </div>
          </div>

          {/* title */}
          <h2 className="relative text-2xl font-bold text-white leading-tight mb-4">{event.title}</h2>

          {/* date/time/location chips */}
          <div className="relative flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
              <Calendar size={11}/> {formatDate(event.date)}
            </span>
            <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
              <Clock size={11}/> {formatTime(event.date)}{event.endDate ? ` – ${formatTime(event.endDate)}` : ""}
            </span>
            <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
              {event.isOnline ? <Wifi size={11}/> : <MapPin size={11}/>} {event.location || "Online"}
            </span>
          </div>
        </div>

        {/* ── Host strip ── */}
        <div className="-mt-5 mx-5 relative z-10 bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary overflow-hidden shrink-0 ring-2 ring-border">
            {event.host?.avatarUrl
              ? <img src={event.host.avatarUrl} className="w-full h-full object-cover" alt=""/>
              : event.host?.name?.[0]?.toUpperCase()||"H"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Organized by</p>
            <p className="text-sm font-semibold text-foreground leading-tight">{event.host?.name}</p>
            {event.host?.headline && <p className="text-xs text-muted-foreground truncate">{event.host.headline}</p>}
          </div>
          <span className="shrink-0 text-[11px] font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">Host</span>
        </div>

        {/* ── Body ── */}
        <div className="px-5 pt-5 pb-4 space-y-5">

          {/* Description */}
          {event.description ? (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">About this event</p>
              <p className="text-sm text-foreground leading-relaxed">{event.description}</p>
            </div>
          ) : null}

          {/* Meeting link */}
          {event.link && (
            <a href={event.link} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                <ExternalLink size={14} className="text-primary"/>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Meeting Link</p>
                <p className="text-sm font-medium text-primary truncate group-hover:underline">{event.link}</p>
              </div>
            </a>
          )}

          {/* Attendees */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Attendees{event.maxAttendees
                  ? ` (${event.attendees?.length||0} / ${event.maxAttendees})`
                  : ` (${event.attendees?.length||0})`}
              </p>
              {event.maxAttendees && (
                <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width:`${Math.min(100,((event.attendees?.length||0)/event.maxAttendees)*100)}%` }}
                  />
                </div>
              )}
            </div>

            {event.attendees?.length > 0 ? (
              <div className="space-y-2">
                {/* stacked avatar row */}
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-2">
                    {event.attendees.slice(0,6).map(a=>(
                      <div key={a._id||a} className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary overflow-hidden shrink-0 ring-2 ring-card">
                        {a.avatarUrl
                          ? <img src={a.avatarUrl} className="w-full h-full object-cover" alt=""/>
                          : a.name?.[0]?.toUpperCase()||"?"}
                      </div>
                    ))}
                  </div>
                  {event.attendees.length > 6 && (
                    <span className="text-xs text-muted-foreground">+{event.attendees.length-6} more</span>
                  )}
                </div>
                {/* name pills */}
                <div className="flex flex-wrap gap-1.5">
                  {event.attendees.slice(0,8).map(a=>(
                    <span key={a._id||a} className="text-xs bg-muted text-foreground px-2.5 py-1 rounded-full">
                      {a.name}
                    </span>
                  ))}
                  {event.attendees.length > 8 && (
                    <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">
                      +{event.attendees.length-8} more
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-5 border border-dashed border-border rounded-xl">
                <Users size={24} className="mx-auto mb-2 text-muted-foreground/40"/>
                <p className="text-sm text-muted-foreground">No attendees yet</p>
                <p className="text-xs text-muted-foreground/60">Be the first to attend!</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer CTA ── */}
        <div className="px-5 py-4 border-t border-border bg-muted/20">
          {isHost ? (
            <div className="flex gap-3">
              <div className="flex-1 text-center text-sm py-2.5 rounded-xl bg-primary/10 text-primary font-semibold">
                You're hosting this event
              </div>
              <Button variant="ghost" size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5 px-3 shrink-0"
                onClick={() => { onDelete(event._id); onClose(); }}>
                <Trash2 size={14}/> Delete
              </Button>
            </div>
          ) : upcoming ? (
            <Button
              className="w-full h-11 text-sm font-semibold gap-2"
              variant={attending ? "outline" : "default"}
              onClick={handleAttend}
              disabled={loading}
            >
              {loading
                ? <Loader2 size={16} className="animate-spin"/>
                : attending
                  ? <><CalendarCheck size={16}/> You're attending · Click to leave</>
                  : <><Plus size={16}/> Register / Attend Event</>}
            </Button>
          ) : (
            <div className="w-full text-center text-sm py-2.5 rounded-xl bg-muted text-muted-foreground font-medium">
              This event has ended
            </div>
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
  const [error, setError] = useState("");
  const [tab, setTab] = useState("upcoming");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const fetchEvents = async () => {
    setError("");
    try {
      const fn = tab==="mine" ? getMyEvents : tab==="past" ? getPastEvents : getEvents;
      const data = await fn();
      setEvents(data.events||[]);
    } catch(e) { setError(e.message||"Failed to load events"); }
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
      const uid = user?.id;
      const updater = e => {
        if (e._id!==id) return e;
        return {
          ...e,
          attendees: data.attending
            ? [...(e.attendees||[]),{_id:uid,name:user?.name,avatarUrl:user?.avatarUrl}]
            : (e.attendees||[]).filter(a=>(a._id||a)?.toString()!==uid)
        };
      };
      setEvents(prev=>prev.map(updater));
      setSelectedEvent(prev=>prev?._id===id ? updater(prev) : prev);
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
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          currentUserId={user?.id}
          onAttend={handleAttend}
          onDelete={handleDelete}
          onClose={()=>setSelectedEvent(null)}
        />
      )}

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
        ) : error ? (
          <div className="bg-card border border-destructive/30 rounded-xl p-8 text-center">
            <p className="text-destructive text-sm font-medium mb-1">Failed to load events</p>
            <p className="text-muted-foreground text-xs mb-4">{error}</p>
            <Button size="sm" variant="outline" onClick={()=>{ setLoading(true); fetchEvents().finally(()=>setLoading(false)); }}>
              Retry
            </Button>
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
                onClick={()=>setSelectedEvent(event)}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Events;
