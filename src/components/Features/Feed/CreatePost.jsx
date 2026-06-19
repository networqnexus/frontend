import { useState, useRef } from "react";
import { Image, Video, FileText, Calendar, Globe, Users, Lock, X, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CURRENT_USER } from "./feedData";

const VISIBILITY_OPTIONS = [
  { value: "public",      label: "Everyone",    icon: Globe  },
  { value: "connections", label: "Connections", icon: Users  },
  { value: "private",     label: "Only me",     icon: Lock   },
];

const POST_TYPES = [
  { key: "photo",   label: "Photo",   icon: Image,    accept: "image/*",  color: "text-emerald-600" },
  { key: "video",   label: "Video",   icon: Video,    accept: "video/*",  color: "text-rose-600"    },
  { key: "article", label: "Article", icon: FileText, accept: null,       color: "text-amber-600"   },
  { key: "event",   label: "Event",   icon: Calendar, accept: null,       color: "text-blue-600"    },
];

const MAX_CHARS = 1300;

const CreatePost = ({ onPost }) => {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [posting, setPosting] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);
  const fileRef = useRef(null);

  const VisIcon = VISIBILITY_OPTIONS.find(o => o.value === visibility)?.icon || Globe;
  const remaining = MAX_CHARS - text.length;
  const nearLimit = remaining < 100;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMediaPreview({ url, type: file.type.startsWith("video") ? "video" : "image", name: file.name });
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    setPosting(true);
    setTimeout(() => {
      onPost?.({
        id: Date.now(),
        author: CURRENT_USER.name,
        initials: CURRENT_USER.initials,
        avatarColor: "bg-primary/10 text-primary",
        title: CURRENT_USER.title,
        time: "Just now",
        visibility,
        content: text.trim(),
        tags: [],
        likes: 0,
        comments: 0,
        shares: 0,
        liked: false,
        saved: false,
        reposted: false,
        commentList: [],
        media: mediaPreview,
      });
      setText("");
      setMediaPreview(null);
      setExpanded(false);
      setPosting(false);
    }, 800);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Collapsed trigger */}
      {!expanded && (
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
              {CURRENT_USER.initials}
            </div>
            <button
              onClick={() => setExpanded(true)}
              className="flex-1 h-10 text-left px-4 rounded-full border border-border bg-muted/30 text-sm text-muted-foreground hover:bg-muted/60 hover:border-foreground/20 transition-all"
            >
              Share an update, idea, or article...
            </button>
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border -mx-4 px-4">
            {POST_TYPES.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => {
                  setExpanded(true);
                  if (key === "photo" || key === "video") {
                    setTimeout(() => fileRef.current?.click(), 100);
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted/70 transition-colors ${color}`}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Expanded composer */}
      {expanded && (
        <div>
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
                {CURRENT_USER.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{CURRENT_USER.name}</p>
                {/* Visibility picker */}
                <div className="flex items-center gap-1 mt-0.5">
                  <VisIcon size={11} className="text-muted-foreground" />
                  <select
                    value={visibility}
                    onChange={e => setVisibility(e.target.value)}
                    className="text-xs text-muted-foreground bg-transparent border-none outline-none cursor-pointer"
                  >
                    {VISIBILITY_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => { setExpanded(false); setText(""); setMediaPreview(null); }}
            >
              <X size={16} />
            </Button>
          </div>

          {/* Textarea */}
          <div className="px-4 pt-3">
            <Textarea
              autoFocus
              placeholder="What do you want to talk about?"
              className="min-h-[120px] resize-none border-transparent bg-transparent focus-visible:ring-0 focus-visible:border-transparent text-sm p-0"
              value={text}
              onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
            />
          </div>

          {/* Media preview */}
          {mediaPreview && (
            <div className="mx-4 mb-3 relative rounded-lg overflow-hidden border border-border">
              {mediaPreview.type === "image" ? (
                <img src={mediaPreview.url} alt="preview" className="w-full max-h-64 object-cover" />
              ) : (
                <video src={mediaPreview.url} controls className="w-full max-h-64" />
              )}
              <button
                onClick={() => setMediaPreview(null)}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Tag suggestions */}
          {text.length > 20 && (
            <div className="px-4 mb-2 flex flex-wrap gap-1.5">
              {["Tip", "Question", "Announcement", "Hiring"].map(tag => (
                <button
                  key={tag}
                  onClick={() => setText(t => t + ` #${tag}`)}
                  className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Footer toolbar */}
          <div className="flex items-center justify-between px-4 pb-4 pt-2 border-t border-border mt-2">
            <div className="flex items-center gap-0.5">
              {/* hidden file input */}
              <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
              {POST_TYPES.map(({ key, label, icon: Icon, color, accept }) => (
                <Button
                  key={key}
                  variant="ghost"
                  size="icon-sm"
                  title={label}
                  className={`${color} hover:bg-muted`}
                  onClick={() => { if (accept) fileRef.current?.click(); }}
                >
                  <Icon size={16} />
                </Button>
              ))}
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                <Smile size={16} />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {text.length > 0 && (
                <span className={`text-xs tabular-nums ${nearLimit ? "text-destructive" : "text-muted-foreground"}`}>
                  {remaining}
                </span>
              )}
              <Button
                size="sm"
                disabled={!text.trim() || posting}
                onClick={handleSubmit}
                className="px-5"
              >
                {posting ? "Posting…" : "Post"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePost;
