import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { getPost, likePost, savePost, commentPost, getSavedPosts, createPost } from "@/api/postApi";
import useAuth from "@/hooks/useAuth";
import {
  ArrowLeft, ThumbsUp, MessageCircle, Repeat2, Share2, Bookmark,
  BookmarkCheck, Globe, Users, Lock, Send, Loader2, Link2, Check,
  MoreHorizontal, Edit3
} from "lucide-react";

const REACTIONS = [
  { emoji: "👍", label: "Like" },
  { emoji: "❤️", label: "Love" },
  { emoji: "🎉", label: "Celebrate" },
  { emoji: "💡", label: "Insightful" },
  { emoji: "👏", label: "Appreciate" },
  { emoji: "🤝", label: "Support" },
];

const timeAgo = (d) => {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
};

const VisIcon = ({ v }) => {
  if (v === "connections") return <Users size={11} className="inline text-muted-foreground"/>;
  if (v === "private") return <Lock size={11} className="inline text-muted-foreground"/>;
  return <Globe size={11} className="inline text-muted-foreground"/>;
};

const PostDetailPage = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const [post,           setPost]           = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [commentText,    setCommentText]    = useState("");
  const [submitting,     setSubmitting]     = useState(false);
  const [isSaved,        setIsSaved]        = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [showReactions,  setShowReactions]  = useState(false);
  const [showRepostMenu, setShowRepostMenu] = useState(false);
  const [showShareMenu,  setShowShareMenu]  = useState(false);
  const [reposting,      setReposting]      = useState(false);
  const [linkCopied,     setLinkCopied]     = useState(false);

  const myReaction = post?.reactions?.find(r => (r.user?._id || r.user)?.toString() === user?.id);
  const liked      = !!myReaction;

  const topReactions = (() => {
    if (!post?.reactions?.length) return [];
    const counts = {};
    post.reactions.forEach(r => { counts[r.type] = (counts[r.type] || 0) + 1; });
    return Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,3).map(([emoji]) => emoji);
  })();

  const initials = post?.author?.name?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) || "U";

  useEffect(() => {
    setLoading(true);
    getPost(id)
      .then(d => setPost(d.post))
      .catch(() => navigate("/feed"))
      .finally(() => setLoading(false));

    getSavedPosts()
      .then(d => setIsSaved((d.posts||[]).some(p => p._id === id)))
      .catch(() => {});
  }, [id]);

  const handleReact = async (type = "like") => {
    setShowReactions(false);
    try {
      const data = await likePost(post._id, type);
      setPost(p => ({ ...p, reactions: data.reactions }));
    } catch {}
  };

  const handleSave = async () => {
    setSavingBookmark(true);
    try {
      await savePost(post._id);
      setIsSaved(s => !s);
    } catch {}
    setSavingBookmark(false);
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const data = await commentPost(post._id, commentText.trim());
      setPost(p => ({ ...p, comments: [...(p.comments||[]), data.comment] }));
      setCommentText("");
    } catch {}
    setSubmitting(false);
  };

  const handleInstantRepost = async () => {
    setShowRepostMenu(false);
    setReposting(true);
    try {
      const quoted = `📢 ${post.author?.name}:\n\n${(post.content||"").slice(0,300)}${(post.content?.length||0)>300?"…":""}`;
      if (post.media?.data) {
        const res = await fetch(post.media.data);
        const blob = await res.blob();
        const file = new File([blob], "repost-media", { type: blob.type });
        const fd = new FormData();
        fd.append("content", quoted);
        fd.append("visibility", "public");
        fd.append("media", file);
        await createPost(fd);
      } else {
        await createPost({ content: quoted, visibility: "public" });
      }
    } catch {}
    setReposting(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${id}`).catch(()=>{});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  if (loading) return (
    <MainLayout>
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-muted-foreground"/>
      </div>
    </MainLayout>
  );

  if (!post) return null;

  const myInitials = user?.name?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) || "U";

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto flex flex-col gap-4">

        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeft size={16}/> Back
        </button>

        {/* Post card */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-5">

            {/* Author row */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0 overflow-hidden cursor-pointer"
                  onClick={() => post.author?.username && navigate(`/profile/${post.author.username}`)}>
                  {post.author?.avatarUrl
                    ? <img src={post.author.avatarUrl} className="w-full h-full object-cover" alt=""/>
                    : initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground hover:underline cursor-pointer"
                    onClick={() => post.author?.username && navigate(`/profile/${post.author.username}`)}>
                    {post.author?.name}
                  </p>
                  {post.author?.headline && (
                    <p className="text-xs text-muted-foreground">{post.author.headline}</p>
                  )}
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {timeAgo(post.createdAt)} · <VisIcon v={post.visibility}/>
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon-xs">
                <MoreHorizontal size={14}/>
              </Button>
            </div>

            {/* Full content — no truncation */}
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line mb-4">
              {post.content}
            </p>

            {/* Media */}
            {post.media?.data && (
              <div className="mb-4 rounded-xl overflow-hidden border border-border">
                {post.media.type === "image"
                  ? <img src={post.media.data} alt="" className="w-full max-h-[500px] object-cover"/>
                  : <video src={post.media.data} controls controlsList="nodownload" playsInline className="w-full"/>
                }
              </div>
            )}

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {post.tags.map(tag => (
                  <span key={tag} className="text-xs text-primary cursor-pointer hover:underline">#{tag}</span>
                ))}
              </div>
            )}

            {/* Engagement counts */}
            {(post.reactions?.length > 0 || post.comments?.length > 0) && (
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 pb-3 border-b border-border/50">
                {post.reactions?.length > 0 && (
                  <span className="flex items-center gap-1">
                    {topReactions.map(e => <span key={e}>{e}</span>)}
                    {post.reactions.length}
                  </span>
                )}
                {post.comments?.length > 0 && (
                  <span>{post.comments.length} comment{post.comments.length !== 1 ? "s" : ""}</span>
                )}
              </div>
            )}

            {/* Action bar */}
            <div className="flex items-center gap-0.5 -mx-1 border-b border-border/50 pb-3">
              {/* Like with reaction picker */}
              <div className="relative"
                onMouseEnter={() => setShowReactions(true)}
                onMouseLeave={() => setShowReactions(false)}>
                {showReactions && (
                  <div className="absolute bottom-full left-0 mb-1 bg-card border border-border rounded-full px-2 py-1 flex gap-0.5 shadow-lg z-10">
                    {REACTIONS.map(r => (
                      <button key={r.emoji} onClick={() => handleReact(r.emoji)} title={r.label}
                        className="text-xl hover:scale-125 transition-transform leading-none p-0.5">
                        {r.emoji}
                      </button>
                    ))}
                  </div>
                )}
                <button onClick={() => handleReact(myReaction?.type || "like")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${liked ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-muted"}`}>
                  {liked && myReaction?.type && myReaction.type !== "like"
                    ? <span className="text-sm leading-none">{myReaction.type}</span>
                    : <ThumbsUp size={14} className={liked ? "fill-primary" : ""}/>}
                  {liked
                    ? (myReaction?.type && myReaction.type !== "like" ? REACTIONS.find(r=>r.emoji===myReaction.type)?.label||"Like" : "Like")
                    : "Like"}
                </button>
              </div>

              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                <MessageCircle size={14}/> Comment
              </button>

              {/* Repost dropdown */}
              <div className="relative">
                <button onClick={() => { setShowRepostMenu(m => !m); setShowShareMenu(false); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                  <Repeat2 size={14}/> {reposting ? "Reposting…" : "Repost"}
                </button>
                {showRepostMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowRepostMenu(false)}/>
                    <div className="absolute bottom-full left-0 mb-1 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden py-1 min-w-[190px]">
                      <button onClick={handleInstantRepost}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                        <Repeat2 size={13}/> Instant Repost
                      </button>
                      <button onClick={() => { setShowRepostMenu(false); setCommentText(`📢 Reposting from ${post.author?.name}: `); document.getElementById("comment-input")?.focus(); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                        <Edit3 size={13}/> Repost with thoughts
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Share dropdown */}
              <div className="relative">
                <button onClick={() => { setShowShareMenu(m => !m); setShowRepostMenu(false); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                  <Share2 size={14}/> Share
                </button>
                {showShareMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowShareMenu(false)}/>
                    <div className="absolute bottom-full left-0 mb-1 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden min-w-[240px]">
                      {/* Visible, clickable link */}
                      <div className="px-3 pt-2.5 pb-2 border-b border-border/60">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Post link</p>
                        <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-2.5 py-1.5">
                          <button type="button"
                            onClick={() => { setShowShareMenu(false); navigate(`/post/${id}`); }}
                            className="flex-1 text-xs text-primary hover:underline truncate text-left break-all">
                            {window.location.origin}/post/{id}
                          </button>
                          <button onClick={handleCopyLink} title={linkCopied ? "Copied!" : "Copy link"}
                            className={`shrink-0 transition-colors ${linkCopied ? "text-emerald-500" : "text-muted-foreground hover:text-foreground"}`}>
                            {linkCopied ? <Check size={13}/> : <Link2 size={13}/>}
                          </button>
                        </div>
                      </div>
                      <div className="py-1">
                        <button onClick={() => { setShowShareMenu(false); navigate("/messages", { state: { sharePost: { id, authorName: post.author?.name, authorAvatar: post.author?.avatarUrl, content: (post.content||"").slice(0,200), link: `${window.location.origin}/post/${id}` } } }); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                          <Send size={13}/> Send in message
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Save */}
              <button onClick={handleSave} disabled={savingBookmark}
                className={`ml-auto flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isSaved ? "text-amber-500" : "text-muted-foreground hover:bg-muted"}`}>
                {isSaved ? <BookmarkCheck size={14} className="fill-amber-500"/> : <Bookmark size={14}/>}
              </button>
            </div>

            {/* Comments */}
            <div className="mt-4 flex flex-col gap-3">
              {post.comments?.length > 0 && post.comments.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden cursor-pointer"
                    onClick={() => c.user?.username && navigate(`/profile/${c.user.username}`)}>
                    {c.user?.avatarUrl
                      ? <img src={c.user.avatarUrl} className="w-full h-full object-cover" alt=""/>
                      : c.user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 bg-muted/50 rounded-2xl px-3 py-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-foreground cursor-pointer hover:underline"
                        onClick={() => c.user?.username && navigate(`/profile/${c.user.username}`)}>
                        {c.user?.name}
                      </span>
                      {c.createdAt && (
                        <span className="text-[10px] text-muted-foreground">{timeAgo(c.createdAt)}</span>
                      )}
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}

              {/* Comment input */}
              <div className="flex items-center gap-2 mt-1">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0 overflow-hidden">
                  {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt=""/> : myInitials}
                </div>
                <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-full px-3 py-2 border border-transparent focus-within:border-border focus-within:bg-background transition-all">
                  <input
                    id="comment-input"
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    placeholder="Add a comment…"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
                  />
                  {commentText.trim() && (
                    <button onClick={handleComment} disabled={submitting} className="text-primary shrink-0">
                      {submitting ? <Loader2 size={14} className="animate-spin"/> : <Send size={14}/>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PostDetailPage;
