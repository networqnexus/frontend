import { useState, useEffect, useRef } from "react";
import { Plus, X, ChevronLeft, ChevronRight, Trash2, Loader2 } from "lucide-react";
import { getStories, createStory, viewStory, deleteStory } from "@/api/storyApi";
import useAuth from "@/hooks/useAuth";

const BG_GRADIENTS = [
  "from-violet-500 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-indigo-500 to-purple-500",
];

// ── Story Viewer Modal ─────────────────────────────────────────────────────
const StoryViewer = ({ groups, startGroupIdx, currentUserId, onClose, onDelete }) => {
  const [groupIdx, setGroupIdx]   = useState(startGroupIdx);
  const [storyIdx, setStoryIdx]   = useState(0);
  const [progress, setProgress]   = useState(0);
  const timerRef = useRef(null);

  const group   = groups[groupIdx];
  const story   = group?.stories[storyIdx];
  const isOwn   = group?.author._id === currentUserId || group?.author._id?.toString() === currentUserId;
  const DURATION = 5000;

  useEffect(() => {
    if (!story) return;
    viewStory(story._id).catch(() => {});
    setProgress(0);
    clearInterval(timerRef.current);
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);
      if (elapsed >= DURATION) goNext();
    }, 50);
    return () => clearInterval(timerRef.current);
  }, [groupIdx, storyIdx]);

  const goNext = () => {
    if (storyIdx < group.stories.length - 1) {
      setStoryIdx(s => s + 1);
    } else if (groupIdx < groups.length - 1) {
      setGroupIdx(g => g + 1);
      setStoryIdx(0);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (storyIdx > 0) setStoryIdx(s => s - 1);
    else if (groupIdx > 0) { setGroupIdx(g => g - 1); setStoryIdx(0); }
  };

  const handleDelete = async () => {
    await onDelete(story._id);
    goNext();
  };

  if (!story) return null;

  const initials = group.author.name?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)||"U";
  const timeAgo = (d) => { const m=Math.floor((Date.now()-new Date(d))/60000); if(m<60)return`${m}m ago`;return`${Math.floor(m/60)}h ago`; };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={onClose}>
      <div className="relative w-full max-w-sm h-[85vh] rounded-2xl overflow-hidden shadow-2xl" onClick={e=>e.stopPropagation()}>

        {/* Progress bars */}
        <div className="absolute top-3 left-3 right-3 z-10 flex gap-1">
          {group.stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-none"
                style={{ width: i < storyIdx ? "100%" : i === storyIdx ? `${progress}%` : "0%" }}/>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-7 left-3 right-3 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full ring-2 ring-white overflow-hidden bg-primary flex items-center justify-center text-xs font-bold text-white shrink-0">
              {group.author.avatarUrl ? <img src={group.author.avatarUrl} className="w-full h-full object-cover" alt=""/> : initials}
            </div>
            <div>
              <p className="text-white text-xs font-semibold leading-none">{group.author.name}</p>
              <p className="text-white/60 text-[10px] mt-0.5">{timeAgo(story.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isOwn && (
              <button onClick={handleDelete} className="w-7 h-7 flex items-center justify-center text-white/80 hover:text-white">
                <Trash2 size={14}/>
              </button>
            )}
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-white/80 hover:text-white">
              <X size={16}/>
            </button>
          </div>
        </div>

        {/* Story content */}
        {story.media?.data ? (
          story.media.type === "image"
            ? <img src={story.media.data} className="w-full h-full object-cover" alt=""/>
            : <video src={story.media.data} className="w-full h-full object-cover" autoPlay muted loop/>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${story.bgColor} flex items-center justify-center p-8`}>
            <p className="text-white text-xl font-semibold text-center leading-relaxed">{story.caption}</p>
          </div>
        )}

        {/* Caption overlay (when there's media + caption) */}
        {story.media?.data && story.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-white text-sm">{story.caption}</p>
          </div>
        )}

        {/* Nav areas */}
        <button onClick={goPrev} className="absolute left-0 top-0 w-1/3 h-full z-5 opacity-0"/>
        <button onClick={goNext} className="absolute right-0 top-0 w-2/3 h-full z-5 opacity-0"/>

        {/* Visible nav arrows */}
        {groupIdx > 0 && (
          <button onClick={e=>{e.stopPropagation();goPrev();}} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white">
            <ChevronLeft size={16}/>
          </button>
        )}
        {(groupIdx < groups.length-1 || storyIdx < group.stories.length-1) && (
          <button onClick={e=>{e.stopPropagation();goNext();}} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white">
            <ChevronRight size={16}/>
          </button>
        )}
      </div>
    </div>
  );
};

// ── Create Story Modal ─────────────────────────────────────────────────────
const CreateStoryModal = ({ onClose, onCreated }) => {
  const [caption,   setCaption]   = useState("");
  const [bgColor,   setBgColor]   = useState(BG_GRADIENTS[0]);
  const [mediaFile, setMediaFile] = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setPreview({ url: URL.createObjectURL(file), type: file.type.startsWith("video")?"video":"image" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption.trim() && !mediaFile) return setError("Add text or an image");
    setLoading(true); setError("");
    try {
      const data = await createStory({ caption, bgColor: mediaFile ? undefined : bgColor, mediaFile });
      onCreated(data.story);
    } catch(e) { setError(e.message||"Failed"); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground text-sm">Create Story</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={16}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Preview */}
          <div className={`h-40 rounded-xl overflow-hidden flex items-center justify-center relative ${!preview ? `bg-gradient-to-br ${bgColor}` : ""}`}>
            {preview ? (
              <>
                {preview.type==="image"
                  ? <img src={preview.url} className="w-full h-full object-cover" alt=""/>
                  : <video src={preview.url} className="w-full h-full object-cover" muted/>}
                <button type="button" onClick={()=>{setPreview(null);setMediaFile(null);}}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white">
                  <X size={12}/>
                </button>
              </>
            ) : (
              <p className="text-white font-medium text-center px-4 text-sm">{caption||"Your story text here..."}</p>
            )}
          </div>

          {!preview && (
            <div className="flex gap-2">
              {BG_GRADIENTS.map(g => (
                <button key={g} type="button" onClick={()=>setBgColor(g)}
                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${g} flex-shrink-0 transition-transform ${bgColor===g?"ring-2 ring-primary ring-offset-2 scale-110":""}`}/>
              ))}
            </div>
          )}

          <textarea
            value={caption} onChange={e=>setCaption(e.target.value)}
            placeholder="Write something on your story..."
            className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm resize-none outline-none focus:border-primary transition-colors min-h-[60px]"
          />

          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile}/>
            <button type="button" onClick={()=>fileRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <Plus size={14}/> Add Photo/Video
            </button>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={14} className="animate-spin"/>Posting…</> : "Share Story"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Main StoriesBar ────────────────────────────────────────────────────────
const StoriesBar = () => {
  const { user }         = useAuth();
  const [groups,         setGroups]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [viewerOpen,     setViewerOpen]     = useState(false);
  const [viewerGroupIdx, setViewerGroupIdx] = useState(0);
  const [createOpen,     setCreateOpen]     = useState(false);

  useEffect(() => {
    getStories()
      .then(d => setGroups(d.stories || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openViewer = (idx) => { setViewerGroupIdx(idx); setViewerOpen(true); };

  const handleCreated = (story) => {
    setCreateOpen(false);
    const myGroup = groups.find(g => g.author._id === user?.id || g.author._id?.toString() === user?.id);
    if (myGroup) {
      setGroups(prev => prev.map(g =>
        (g.author._id?.toString() === user?.id) ? {...g, stories:[story,...g.stories]} : g
      ));
    } else {
      setGroups(prev => [{ author:{ _id:user?.id, name:user?.name, avatarUrl:user?.avatarUrl }, stories:[story] }, ...prev]);
    }
  };

  const handleDelete = async (storyId) => {
    try {
      await deleteStory(storyId);
      setGroups(prev => prev.map(g => ({ ...g, stories: g.stories.filter(s=>s._id!==storyId) })).filter(g=>g.stories.length>0));
    } catch {}
  };

  const myGroup     = groups.find(g => g.author._id?.toString() === user?.id);
  const hasMyStory  = !!myGroup;
  const initials    = user?.name?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)||"U";

  return (
    <>
      {viewerOpen && (
        <StoryViewer
          groups={groups} startGroupIdx={viewerGroupIdx}
          currentUserId={user?.id}
          onClose={()=>setViewerOpen(false)}
          onDelete={handleDelete}
        />
      )}
      {createOpen && <CreateStoryModal onClose={()=>setCreateOpen(false)} onCreated={handleCreated}/>}

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">

          {/* Add / My story */}
          <div className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer"
            onClick={() => hasMyStory ? openViewer(groups.findIndex(g=>g.author._id?.toString()===user?.id)) : setCreateOpen(true)}>
            <div className={`w-14 h-14 rounded-full p-[2px] relative ${hasMyStory?"bg-gradient-to-tr from-violet-500 via-pink-500 to-amber-400":"border-2 border-dashed border-border bg-muted/30 flex items-center justify-center"}`}>
              {hasMyStory ? (
                <div className="w-full h-full rounded-full bg-card p-[2px]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt=""/> : initials}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Plus size={20} className="text-muted-foreground"/>
                </div>
              )}
              {!hasMyStory && (
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-card">
                  <Plus size={10} className="text-primary-foreground"/>
                </div>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{hasMyStory?"Your story":"Add story"}</span>
          </div>

          {/* Other users' stories */}
          {loading ? (
            [1,2,3,4].map(i => (
              <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="w-14 h-14 rounded-full bg-muted animate-pulse"/>
                <div className="w-10 h-2 rounded bg-muted animate-pulse"/>
              </div>
            ))
          ) : (
            groups
              .filter(g => g.author._id?.toString() !== user?.id)
              .map((g, relIdx) => {
                const gIdx = groups.findIndex(gr => gr.author._id?.toString() === g.author._id?.toString());
                const viewerIds = g.stories.flatMap(s=>s.viewers||[]).map(v=>v?.toString?.()??v);
                const allSeen   = g.stories.every(s=>(s.viewers||[]).some(v=>(v?._id||v)?.toString()===user?.id));
                const ini       = g.author.name?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)||"U";
                return (
                  <div key={g.author._id} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer" onClick={()=>openViewer(gIdx)}>
                    <div className={`w-14 h-14 rounded-full p-[2px] ${allSeen?"bg-muted":"bg-gradient-to-tr from-violet-500 via-pink-500 to-amber-400"}`}>
                      <div className="w-full h-full rounded-full bg-card p-[2px]">
                        <div className="w-full h-full rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {g.author.avatarUrl ? <img src={g.author.avatarUrl} className="w-full h-full object-cover" alt=""/> : ini}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] whitespace-nowrap truncate max-w-[56px] text-center ${allSeen?"text-muted-foreground":"text-foreground font-medium"}`}>
                      {g.author.name?.split(" ")[0]}
                    </span>
                  </div>
                );
              })
          )}

          {!loading && groups.filter(g=>g.author._id?.toString()!==user?.id).length===0 && (
            <p className="text-xs text-muted-foreground ml-2 whitespace-nowrap">No stories from your connections yet</p>
          )}
        </div>
      </div>
    </>
  );
};

export default StoriesBar;
