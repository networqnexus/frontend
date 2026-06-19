import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Search, Plus, Globe, Lock, Calendar } from "lucide-react";
import { scheduleStream, updateScheduledStream } from "@/api/streamApi";
import { apiRequest } from "@/api/config";

const CATEGORIES = ["Tech", "Career", "Business", "Design", "Education", "Other"];

const toLocalInput = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const ScheduleStreamModal = ({ onScheduled, onClose, streamToEdit = null }) => {
  const isEdit = !!streamToEdit;

  const [title,        setTitle]        = useState(streamToEdit?.title        || "");
  const [description,  setDescription]  = useState(streamToEdit?.description  || "");
  const [category,     setCategory]     = useState(streamToEdit?.category     || "Tech");
  const [scheduledAt,  setScheduledAt]  = useState(toLocalInput(streamToEdit?.scheduledAt));
  const [isPublic,     setIsPublic]     = useState(streamToEdit ? streamToEdit.isPublic : true);
  const [invitedUsers, setInvitedUsers] = useState(streamToEdit?.invitedUsers || []);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [searchResults,setSearchResults]= useState([]);
  const [searching,    setSearching]    = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const timer = useRef(null);

  const minDateTime = new Date(Date.now() + 5 * 60 * 1000)
    .toISOString().slice(0, 16);

  const handleSearch = (q) => {
    setSearchQuery(q);
    clearTimeout(timer.current);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    timer.current = setTimeout(async () => {
      try {
        const data = await apiRequest("GET", `/search?q=${encodeURIComponent(q)}&type=people`);
        const alreadyAdded = invitedUsers.map(u => u._id);
        setSearchResults((data.results?.people || []).filter(u => !alreadyAdded.includes(u._id)));
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 400);
  };

  const addUser = (user) => {
    setInvitedUsers(prev => [...prev, user]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeUser = (uid) => setInvitedUsers(prev => prev.filter(u => u._id !== uid));

  const handleSubmit = async () => {
    if (!title.trim() || !scheduledAt) return;
    setLoading(true);
    setError("");
    try {
      const payload = {
        title, description, category,
        scheduledAt: new Date(scheduledAt).toISOString(),
        isPublic,
        invitedUserIds: invitedUsers.map(u => u._id),
      };
      const data = isEdit
        ? await updateScheduledStream(streamToEdit._id, payload)
        : await scheduleStream(payload);
      onScheduled(data.stream);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md flex flex-col gap-4 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            {isEdit ? "Edit Scheduled Stream" : "Schedule a Stream"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What will you stream?"
              className="w-full text-sm bg-muted rounded-lg px-3 py-2 outline-none border border-border focus:border-primary placeholder:text-muted-foreground"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Tell viewers what to expect..."
              rows={2}
              className="w-full text-sm bg-muted rounded-lg px-3 py-2 outline-none border border-border focus:border-primary placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* Category */}
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

          {/* Date & Time */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Date & Time *</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              min={minDateTime}
              onChange={e => setScheduledAt(e.target.value)}
              className="w-full text-sm bg-muted rounded-lg px-3 py-2 outline-none border border-border focus:border-primary text-foreground"
            />
          </div>

          {/* Public / Private */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Visibility</label>
            <div className="flex gap-2">
              <button
                onClick={() => setIsPublic(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  isPublic
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted text-muted-foreground hover:border-primary/50"
                }`}
              >
                <Globe size={14} /> Public
              </button>
              <button
                onClick={() => setIsPublic(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  !isPublic
                    ? "border-amber-500 bg-amber-500/10 text-amber-500"
                    : "border-border bg-muted text-muted-foreground hover:border-amber-500/50"
                }`}
              >
                <Lock size={14} /> Private
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              {isPublic
                ? "Anyone on the platform can see and join this stream."
                : "Only people you invite can join this stream."}
            </p>
          </div>

          {/* Invite Users */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              {isPublic ? "Invite people (optional)" : "Invite people"}
            </label>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search by name or username..."
                className="w-full text-sm bg-muted rounded-lg pl-8 pr-3 py-2 outline-none border border-border focus:border-primary placeholder:text-muted-foreground"
              />
            </div>

            {/* Search Dropdown */}
            {(searchResults.length > 0 || searching) && (
              <div className="mt-1 border border-border rounded-lg bg-card overflow-hidden shadow-lg">
                {searching ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground">Searching...</div>
                ) : (
                  searchResults.slice(0, 5).map(user => (
                    <button
                      key={user._id}
                      onClick={() => addUser(user)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-left transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {user.avatarUrl
                          ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                          : <span className="text-[10px] font-bold text-primary">{user.name?.[0]}</span>
                        }
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate">{user.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{user.headline || user.username}</p>
                      </div>
                      <Plus size={13} className="text-primary flex-shrink-0" />
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Invited chips */}
            {invitedUsers.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {invitedUsers.map(user => (
                  <div key={user._id} className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full border border-primary/20">
                    <span className="max-w-[100px] truncate">{user.name}</span>
                    <button onClick={() => removeUser(user._id)} className="hover:text-red-400 transition-colors">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-1">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !scheduledAt || loading}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {loading ? (isEdit ? "Saving…" : "Scheduling…") : (isEdit ? "Save Changes" : "Schedule Stream")}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default ScheduleStreamModal;
