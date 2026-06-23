import { useState, useEffect, useRef } from "react";
import MainLayout from "@/layouts/MainLayout";
import PremiumGate from "@/components/Features/Premium/PremiumGate";
import { Button } from "@/components/ui/button";
import { Radio, Play, Eye, Video, Crown, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import HostView   from "./HostView";
import ViewerView from "./ViewerView";
import ScheduleStreamModal from "./ScheduleStreamModal";
import ScheduledStreamCard from "./ScheduledStreamCard";
import {
  startStream, endStream, getLiveStreams,
  getViewerToken, getHostRejoinToken,
  getScheduledStreams, cancelScheduledStream, launchScheduledStream,
} from "@/api/streamApi";
import useAuth from "@/hooks/useAuth";

const CATEGORIES = ["Tech", "Career", "Business", "Design", "Education", "Other"];

/* ─── Mini Calendar ─────────────────────────────────── */
const MiniCalendar = ({ streams, selectedDate, onSelectDate }) => {
  const [viewMonth, setViewMonth] = useState(new Date());
  const year  = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const streamDays = new Set(
    streams.map(s => {
      const d = new Date(s.scheduledAt);
      return d.getFullYear() === year && d.getMonth() === month ? d.getDate() : null;
    }).filter(Boolean)
  );

  const today = new Date();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const prev = () => setViewMonth(new Date(year, month - 1, 1));
  const next = () => setViewMonth(new Date(year, month + 1, 1));

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <ChevronLeft size={15} />
        </button>
        <span className="text-sm font-semibold text-foreground">
          {viewMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </span>
        <button onClick={next} className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const isToday    = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
          const hasStream  = streamDays.has(day);
          const cellDate   = new Date(year, month, day);
          const isPast     = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const isSelected = selectedDate?.getFullYear() === year &&
                             selectedDate?.getMonth()    === month &&
                             selectedDate?.getDate()     === day;

          return (
            <button
              key={day}
              onClick={() => onSelectDate(isSelected ? null : cellDate)}
              className={`relative flex flex-col items-center justify-center h-8 w-full rounded-lg text-xs transition-colors ${
                isSelected ? "bg-primary text-primary-foreground font-bold" :
                isToday    ? "bg-primary/10 text-primary font-bold" :
                isPast     ? "text-muted-foreground/40 cursor-default" :
                             "hover:bg-muted text-foreground"
              }`}
            >
              {day}
              {hasStream && (
                <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-primary"}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Stream Due Alert Popup ─────────────────────────── */
const StreamDueAlert = ({ stream, onGoLive, onDismiss }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div className="bg-card border border-red-500/50 rounded-xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center flex-shrink-0">
          <div className="w-5 h-5 bg-red-500 rounded-full animate-ping" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Stream Starting Now!</p>
          <p className="text-xs text-muted-foreground mt-0.5">Your scheduled stream is ready to go live.</p>
        </div>
      </div>
      <div className="bg-muted rounded-lg px-4 py-3">
        <p className="text-sm font-semibold text-foreground">{stream.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{stream.category}</p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onDismiss} className="flex-1 h-9">Baad mein</Button>
        <Button onClick={() => onGoLive(stream)} className="flex-1 h-9 bg-red-500 hover:bg-red-600 gap-1.5 font-semibold">
          <Play size={13} fill="currentColor" /> Go Live Now!
        </Button>
      </div>
    </div>
  </div>
);

/* ─── Go Live Dialog ─────────────────────────────────── */
const GoLiveDialog = ({ onStart, onClose }) => {
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [category,    setCategory]    = useState("Tech");
  const [loading,     setLoading]     = useState(false);

  const handleStart = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try { await onStart({ title, description, category }); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md flex flex-col gap-4">
        <h2 className="text-lg font-bold text-foreground">Start a Live Stream</h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What are you streaming?"
              className="w-full text-sm bg-muted rounded-lg px-3 py-2 outline-none border border-border focus:border-primary placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Tell viewers what to expect..."
              rows={3}
              className="w-full text-sm bg-muted rounded-lg px-3 py-2 outline-none border border-border focus:border-primary placeholder:text-muted-foreground resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full text-sm bg-muted rounded-lg px-3 py-2 outline-none border border-border"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            onClick={handleStart}
            disabled={!title.trim() || loading}
            className="flex-1 bg-red-500 hover:bg-red-600"
          >
            {loading ? "Starting…" : "Go Live"}
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ─── Stream Card ────────────────────────────────────── */
const StreamCard = ({ stream, isOwner, onClick }) => (
  <div
    onClick={onClick}
    className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-sm transition-shadow cursor-pointer group relative"
  >
    {isOwner && (
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
        <Crown size={9} />Your Stream
      </div>
    )}
    <div className="relative aspect-video bg-muted">
      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center">
        <Video size={28} className="text-muted-foreground" />
      </div>
      <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />LIVE
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
        <Eye size={10} />{stream.viewerCount}
      </div>
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <Play size={20} className="text-white fill-white" />
        </div>
      </div>
    </div>
    <div className="p-3">
      <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">{stream.title}</p>
      <p className="text-xs text-muted-foreground mt-1">{stream.host?.name}</p>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground mt-2 inline-block">
        {stream.category}
      </span>
    </div>
  </div>
);

/* ─── Main Component ─────────────────────────────────── */
const Streaming = () => {
  const { user } = useAuth();
  const canHost = !!user?.isPremium;

  const [view,             setView]            = useState("list");
  const [activeTab,        setActiveTab]       = useState("live");
  const [streams,          setStreams]          = useState([]);
  const [scheduledStreams, setScheduledStreams] = useState([]);
  const [activeStream,     setActiveStream]    = useState(null);
  const [token,            setToken]           = useState(null);
  const [showGoLive,       setShowGoLive]      = useState(false);
  const [showSchedule,     setShowSchedule]    = useState(false);
  const [streamToEdit,     setStreamToEdit]    = useState(null);
  const [selectedDate,     setSelectedDate]    = useState(null);
  const [loading,          setLoading]         = useState(true);
  const [schedLoading,     setSchedLoading]    = useState(false);
  const [error,            setError]           = useState("");
  const [dueStream,        setDueStream]       = useState(null);
  const dismissed = useRef(new Set());

  useEffect(() => {
    if (view === "list") {
      fetchStreams();
      fetchScheduledStreams();
    }
  }, [view]);

  // Auto-check for due streams every 15 seconds
  useEffect(() => {
    if (scheduledStreams.length === 0) return;
    const check = () => {
      scheduledStreams.forEach(s => {
        if (String(s.host?._id) !== String(user?._id)) return;
        if (dismissed.current.has(s._id)) return;
        const diff = new Date(s.scheduledAt) - new Date();
        if (diff <= 0 && diff > -5 * 60 * 1000) {
          setDueStream(s);
        }
      });
    };
    check();
    const id = setInterval(check, 15000);
    return () => clearInterval(id);
  }, [scheduledStreams, user]);

  const fetchStreams = async () => {
    setLoading(true);
    try {
      const data = await getLiveStreams();
      setStreams(data.streams || []);
    } catch { setStreams([]); }
    finally { setLoading(false); }
  };

  const fetchScheduledStreams = async () => {
    setSchedLoading(true);
    try {
      const data = await getScheduledStreams();
      setScheduledStreams(data.streams || []);
    } catch { setScheduledStreams([]); }
    finally { setSchedLoading(false); }
  };

  const handleGoLive = async (payload) => {
    try {
      const data = await startStream(payload);
      setActiveStream(data.stream);
      setToken(data.token);
      setShowGoLive(false);
      setView("host");
    } catch (err) { setError(err.message); }
  };

  const handleEndStream = async () => {
    if (activeStream) await endStream(activeStream._id).catch(() => {});
    setView("list");
    setActiveStream(null);
    setToken(null);
  };

  const handleWatch = async (stream) => {
    setError("");
    try {
      const isOwner = user?._id && String(user._id) === String(stream.host?._id);
      if (isOwner) {
        const data = await getHostRejoinToken(stream._id);
        setActiveStream(data.stream || stream);
        setToken(data.token);
        setView("host");
      } else {
        const data = await getViewerToken(stream.roomName);
        setActiveStream(stream);
        setToken(data.token);
        setView("viewer");
      }
    } catch (err) { setError(err.message); }
  };

  const handleScheduled = (newStream) => {
    setScheduledStreams(prev => {
      const idx = prev.findIndex(s => s._id === newStream._id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = newStream;
        return updated.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
      }
      return [...prev, newStream].sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
    });
    setShowSchedule(false);
    setStreamToEdit(null);
    setActiveTab("scheduled");
  };

  const handleLaunch = async (stream) => {
    setError("");
    try {
      const data = await launchScheduledStream(stream._id);
      setScheduledStreams(prev => prev.filter(s => s._id !== stream._id));
      setActiveStream(data.stream);
      setToken(data.token);
      setView("host");
    } catch (err) { setError(err.message); }
  };

  const handleCancelScheduled = async (stream) => {
    if (!window.confirm(`"${stream.title}" stream cancel karna chahte ho?`)) return;
    try {
      await cancelScheduledStream(stream._id);
      setScheduledStreams(prev => prev.filter(s => s._id !== stream._id));
    } catch (err) { setError(err.message); }
  };

  const handleEditStream = (stream) => {
    setStreamToEdit(stream);
    setShowSchedule(true);
  };

  const filteredScheduled = selectedDate
    ? scheduledStreams.filter(s => {
        const d = new Date(s.scheduledAt);
        return d.getFullYear() === selectedDate.getFullYear() &&
               d.getMonth()    === selectedDate.getMonth()    &&
               d.getDate()     === selectedDate.getDate();
      })
    : scheduledStreams;

  /* ── Views ── */
  if (view === "host" && activeStream && token) return (
    <MainLayout><HostView stream={activeStream} token={token} onEnd={handleEndStream} /></MainLayout>
  );
  if (view === "viewer" && activeStream && token) return (
    <MainLayout><ViewerView stream={activeStream} token={token} onBack={() => setView("list")} /></MainLayout>
  );

  return (
    <MainLayout>
      {/* Due stream popup */}
      {dueStream && (
        <StreamDueAlert
          stream={dueStream}
          onGoLive={(s) => { setDueStream(null); handleLaunch(s); }}
          onDismiss={() => { dismissed.current.add(dueStream._id); setDueStream(null); }}
        />
      )}

      {showGoLive && <GoLiveDialog onStart={handleGoLive} onClose={() => setShowGoLive(false)} />}
      {showSchedule && (
        <ScheduleStreamModal
          streamToEdit={streamToEdit}
          onScheduled={handleScheduled}
          onClose={() => { setShowSchedule(false); setStreamToEdit(null); }}
        />
      )}

      <div className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Live Streaming</h1>
            <p className="text-sm text-muted-foreground">Watch, host, and schedule live sessions</p>
          </div>
          <div className="flex items-center gap-2">
            {canHost ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => { setStreamToEdit(null); setShowSchedule(true); }}
                >
                  <Calendar size={14} /> Schedule
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 bg-red-500 hover:bg-red-600"
                  onClick={() => setShowGoLive(true)}
                >
                  <Radio size={14} /> Go Live
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="gap-1.5 bg-yellow-500 hover:bg-yellow-400 text-yellow-950"
                onClick={() => window.location.href = "/premium"}
              >
                <Crown size={14} /> Upgrade to Host
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("live")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "live"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            Live Now
            {streams.length > 0 && (
              <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                {streams.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "scheduled"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar size={13} />
            Scheduled
            {scheduledStreams.length > 0 && (
              <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold">
                {scheduledStreams.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Live Tab ── */}
        {activeTab === "live" && (
          loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : streams.length === 0 ? (
            <div className="text-center py-16">
              <Video size={40} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">No live streams right now</p>
              <p className="text-xs text-muted-foreground mt-1">Be the first to go live!</p>
            </div>
          ) : (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Live Now ({streams.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {streams.map(s => (
                  <StreamCard
                    key={s._id}
                    stream={s}
                    isOwner={user?._id && String(user._id) === String(s.host?._id)}
                    onClick={() => handleWatch(s)}
                  />
                ))}
              </div>
            </div>
          )
        )}

        {/* ── Scheduled Tab ── */}
        {activeTab === "scheduled" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-1">
              <MiniCalendar
                streams={scheduledStreams}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate(null)}
                  className="mt-2 text-xs text-primary hover:underline w-full text-center"
                >
                  Clear filter — show all
                </button>
              )}
            </div>

            <div className="lg:col-span-2">
              {schedLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : filteredScheduled.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-border rounded-xl">
                  <Calendar size={36} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">
                    {selectedDate ? "No streams on this day" : "No upcoming streams"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    Schedule a stream to let others know when you'll go live
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => { setStreamToEdit(null); setShowSchedule(true); }}
                  >
                    <Calendar size={13} /> Schedule a Stream
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    {selectedDate
                      ? `Streams on ${selectedDate.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}`
                      : `Upcoming Streams (${filteredScheduled.length})`
                    }
                  </p>
                  {filteredScheduled.map(s => (
                    <ScheduledStreamCard
                      key={s._id}
                      stream={s}
                      currentUserId={user?._id}
                      onLaunch={handleLaunch}
                      onEdit={handleEditStream}
                      onCancel={handleCancelScheduled}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default Streaming;
