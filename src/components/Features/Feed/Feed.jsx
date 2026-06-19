import { useState, useEffect, useCallback, useRef } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { getPosts, createPost, likePost, commentPost, deletePost, editPost } from "@/api/postApi";
import useAuth from "@/hooks/useAuth";
import {
  Image, Video, ThumbsUp, MessageCircle, Share2, Bookmark,
  MoreHorizontal, Globe, Repeat2, Send, ChevronDown, ChevronUp,
  Loader2, Trash2, Sparkles, Flame, RefreshCw, Users, X, Edit3, Check
} from "lucide-react";

const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${type==="error"?"bg-destructive text-destructive-foreground":"bg-foreground text-background"}`}>
    {message}<button onClick={onClose}><X size={14}/></button>
  </div>
);

const CreatePost = ({ user, onPost, onError }) => {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);
  const MAX = 1300;
  const initials = user?.name?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)||"U";

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setPreview({ url: URL.createObjectURL(file), type: file.type.startsWith("video")?"video":"image" });
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      let data;
      if (mediaFile) {
        const formData = new FormData();
        formData.append("content", text.trim());
        formData.append("media", mediaFile);
        data = await createPost(formData);
      } else {
        data = await createPost({ content: text.trim(), visibility: "public" });
      }
      onPost(data.post);
      setText(""); setMediaFile(null); setPreview(null); setExpanded(false);
    } catch (e) { onError(e.message); }
    setPosting(false);
  };

  if (!expanded) return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">{initials}</div>
        <button onClick={() => setExpanded(true)} className="flex-1 h-10 text-left px-4 rounded-full border border-border bg-muted/30 text-sm text-muted-foreground hover:bg-muted/60 transition-all">
          Share an update...
        </button>
      </div>
      <div className="flex gap-1 pt-3 border-t border-border">
        {[{icon:Image,label:"Photo",color:"text-emerald-600"},{icon:Video,label:"Video",color:"text-rose-600"}].map(({icon:Icon,label,color})=>(
          <button key={label} onClick={()=>{setExpanded(true);setTimeout(()=>fileRef.current?.click(),100);}}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted/70 ${color}`}>
            <Icon size={15}/><span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">{initials}</div>
          <div><p className="text-sm font-semibold text-foreground">{user?.name}</p><p className="text-xs text-muted-foreground flex items-center gap-1"><Globe size={11}/> Everyone</p></div>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={()=>{setExpanded(false);setText("");setPreview(null);setMediaFile(null);}}><X size={16}/></Button>
      </div>
      <div className="px-4 pt-3">
        <Textarea autoFocus placeholder="What do you want to talk about?" className="min-h-[120px] resize-none border-transparent bg-transparent focus-visible:ring-0 text-sm p-0" value={text} onChange={e=>setText(e.target.value.slice(0,MAX))}/>
      </div>
      {preview && (
        <div className="mx-4 mb-3 relative rounded-lg overflow-hidden border border-border">
          {preview.type==="image"?<img src={preview.url} alt="" className="w-full max-h-64 object-cover"/>:<video src={preview.url} controls className="w-full max-h-64"/>}
          <button onClick={()=>{setPreview(null);setMediaFile(null);}} className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white"><X size={14}/></button>
        </div>
      )}
      <div className="flex items-center justify-between px-4 pb-4 pt-2 border-t border-border mt-2">
        <div className="flex items-center gap-1">
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile}/>
          <Button variant="ghost" size="icon-sm" className="text-emerald-600" onClick={()=>fileRef.current?.click()}><Image size={16}/></Button>
          <Button variant="ghost" size="icon-sm" className="text-rose-600" onClick={()=>fileRef.current?.click()}><Video size={16}/></Button>
        </div>
        <div className="flex items-center gap-3">
          {text.length>0&&<span className={`text-xs tabular-nums ${MAX-text.length<100?"text-destructive":"text-muted-foreground"}`}>{MAX-text.length}</span>}
          <Button size="sm" disabled={!text.trim()||posting} onClick={handleSubmit} className="px-5">
            {posting?<><Loader2 size={14} className="animate-spin mr-1"/>Posting…</>:"Post"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const PostCard = ({ post, currentUserId, onUpdate, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.content);
  const [saving, setSaving] = useState(false);

  const LIMIT = 250;
  const isLong = post.content?.length > LIMIT;
  const isOwn = post.author?._id === currentUserId || post.author?._id?.toString() === currentUserId;
  const liked = post.likes?.includes(currentUserId);
  const initials = post.author?.name?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)||"U";

  const timeAgo = (d) => {
    const m=Math.floor((Date.now()-new Date(d))/60000);
    if(m<1)return"Just now";if(m<60)return`${m}m ago`;if(m<1440)return`${Math.floor(m/60)}h ago`;return`${Math.floor(m/1440)}d ago`;
  };

  const handleLike = async () => {
    try {
      const data = await likePost(post._id);
      onUpdate(post._id, { likes: data.liked ? [...(post.likes||[]), currentUserId] : (post.likes||[]).filter(id=>id!==currentUserId) });
    } catch {}
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const data = await commentPost(post._id, commentText.trim());
      onUpdate(post._id, { comments: [...(post.comments||[]), data.comment] });
      setCommentText("");
    } catch {}
    setSubmitting(false);
  };

  const handleDelete = async () => {
    setShowMenu(false);
    if (!window.confirm("Delete this post?")) return;
    try { await deletePost(post._id); onDelete(post._id); } catch {}
  };

  const handleEdit = async () => {
    if (!editText.trim() || editText === post.content) { setEditing(false); return; }
    setSaving(true);
    try {
      const data = await editPost(post._id, editText.trim());
      onUpdate(post._id, { content: data.post.content });
      setEditing(false);
    } catch {}
    setSaving(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-4">
        {/* Author row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0 overflow-hidden">
              {post.author?.avatarUrl?<img src={post.author.avatarUrl} className="w-full h-full object-cover" alt=""/>:initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{post.author?.name}</p>
              <p className="text-xs text-muted-foreground">{post.author?.headline}</p>
              <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)} · <Globe size={10} className="inline"/></p>
            </div>
          </div>

          {/* 3-dot menu */}
          <div className="relative">
            <Button variant="ghost" size="icon-xs" onClick={()=>setShowMenu(m=>!m)}><MoreHorizontal size={14}/></Button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={()=>setShowMenu(false)}/>
                <div className="absolute right-0 top-full mt-1 w-36 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden py-1">
                  {isOwn && (
                    <>
                      <button onClick={()=>{setEditing(true);setEditText(post.content);setShowMenu(false);}}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                        <Edit3 size={13}/>Edit post
                      </button>
                      <button onClick={handleDelete} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors">
                        <Trash2 size={13}/>Delete post
                      </button>
                    </>
                  )}
                  {!isOwn && (
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                      Report post
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content / Edit mode */}
        {editing ? (
          <div className="mb-3">
            <Textarea
              value={editText}
              onChange={e=>setEditText(e.target.value)}
              className="min-h-[100px] resize-none text-sm mb-2"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="xs" onClick={handleEdit} disabled={saving||!editText.trim()} className="gap-1">
                {saving?<><Loader2 size={12} className="animate-spin"/>Saving…</>:<><Check size={12}/>Save</>}
              </Button>
              <Button size="xs" variant="outline" onClick={()=>{setEditing(false);setEditText(post.content);}}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
              {isLong&&!expanded?post.content.slice(0,LIMIT)+"…":post.content}
            </p>
            {isLong&&<button onClick={()=>setExpanded(!expanded)} className="text-xs text-muted-foreground hover:text-foreground mt-1 flex items-center gap-1">{expanded?<><ChevronUp size={12}/>Show less</>:<><ChevronDown size={12}/>See more</>}</button>}
          </div>
        )}

        {post.media?.data && (
          <div className="mb-3 rounded-lg overflow-hidden border border-border">
            {post.media.type==="image"?<img src={post.media.data} alt="" className="w-full max-h-80 object-cover"/>:<video src={post.media.data} controls className="w-full max-h-80"/>}
          </div>
        )}

        {post.tags?.length>0&&<div className="flex flex-wrap gap-1.5 mb-3">{post.tags.map(tag=><span key={tag} className="text-xs text-primary cursor-pointer hover:underline">#{tag}</span>)}</div>}

        {(post.likes?.length>0||post.comments?.length>0)&&(
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            {post.likes?.length>0&&<span>👍 {post.likes.length}</span>}
            {post.comments?.length>0&&<button onClick={()=>setShowComments(!showComments)} className="hover:underline">{post.comments.length} comments</button>}
          </div>
        )}

        <Separator className="mb-2"/>

        <div className="flex items-center gap-0.5 -mx-1">
          <button onClick={handleLike} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${liked?"text-primary bg-primary/5":"text-muted-foreground hover:bg-muted"}`}>
            <ThumbsUp size={14} className={liked?"fill-primary":""}/> Like
          </button>
          <button onClick={()=>setShowComments(!showComments)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${showComments?"text-foreground bg-muted":"text-muted-foreground hover:bg-muted"}`}>
            <MessageCircle size={14}/> Comment
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted"><Repeat2 size={14}/> Repost</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted"><Share2 size={14}/> Share</button>
          <button className="ml-auto flex items-center px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted"><Bookmark size={14}/></button>
        </div>

        {showComments&&(
          <div className="mt-3 pt-3 border-t border-border">
            {post.comments?.map((c,i)=>(
              <div key={i} className="flex items-start gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                  {c.user?.avatarUrl?<img src={c.user.avatarUrl} className="w-full h-full object-cover" alt=""/>:c.user?.name?.[0]?.toUpperCase()||"U"}
                </div>
                <div className="flex-1 bg-muted/50 rounded-2xl px-3 py-2">
                  <span className="text-xs font-semibold text-foreground">{c.user?.name} </span>
                  <span className="text-xs text-foreground">{c.text}</span>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">U</div>
              <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5 border border-transparent focus-within:border-border">
                <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Add a comment…" value={commentText} onChange={e=>setCommentText(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleComment();}}}/>
                {commentText.trim()&&<button onClick={handleComment} disabled={submitting} className="text-primary">{submitting?<Loader2 size={14} className="animate-spin"/>:<Send size={14}/>}</button>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("foryou");
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type="success") => { setToast({message:msg,type}); setTimeout(()=>setToast(null),3000); };

  const fetchPosts = useCallback(async (p=1, replace=false) => {
    try {
      const data = await getPosts(p);
      if (replace) setPosts(data.posts||[]);
      else setPosts(prev=>[...prev,...(data.posts||[])]);
      setHasMore(data.hasMore||false);
      setPage(p);
    } catch(e) { showToast(e.message,"error"); }
  }, []);

  useEffect(() => { setLoading(true); fetchPosts(1,true).finally(()=>setLoading(false)); }, []);

  const handleRefresh = async () => { setRefreshing(true); await fetchPosts(1,true); setRefreshing(false); showToast("Feed refreshed!"); };
  const handleLoadMore = async () => { setLoadingMore(true); await fetchPosts(page+1); setLoadingMore(false); };
  const handleNewPost = (post) => { if(post) setPosts(prev=>[post,...prev]); showToast("Post shared!"); };
  const handleUpdate = (id, changes) => setPosts(prev=>prev.map(p=>p._id===id?{...p,...changes}:p));
  const handleDelete = (id) => { setPosts(prev=>prev.filter(p=>p._id!==id)); showToast("Post deleted"); };

  const displayPosts = filter==="trending"
    ? [...posts].sort((a,b)=>((b.likes?.length||0)+(b.comments?.length||0)*2)-((a.likes?.length||0)+(a.comments?.length||0)*2))
    : posts;

  return (
    <MainLayout>
      {toast&&<Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)}/>}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2">
          <div className="flex items-center gap-0.5">
            {[{key:"foryou",label:"For You",icon:Sparkles},{key:"following",label:"Following",icon:Users},{key:"trending",label:"Trending",icon:Flame}].map(({key,label,icon:Icon})=>(
              <button key={key} onClick={()=>setFilter(key)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter===key?"bg-muted text-foreground":"text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
                <Icon size={14}/>{label}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleRefresh} className={`text-muted-foreground ${refreshing?"animate-spin":""}`}><RefreshCw size={14}/></Button>
        </div>

        <CreatePost user={user} onPost={handleNewPost} onError={(msg)=>showToast(msg,"error")}/>

        {loading?(
          <div className="flex items-center justify-center py-12"><Loader2 size={28} className="animate-spin text-muted-foreground"/></div>
        ):displayPosts.length===0?(
          <div className="rounded-xl border border-border bg-card p-12 text-center"><p className="text-muted-foreground text-sm">No posts yet. Be the first to share!</p></div>
        ):(
          <div className="flex flex-col gap-4">
            {displayPosts.map(post=><PostCard key={post._id} post={post} currentUserId={user?.id} onUpdate={handleUpdate} onDelete={handleDelete}/>)}
          </div>
        )}

        {!loading&&hasMore&&(
          <Button variant="outline" className="w-full text-sm text-muted-foreground" onClick={handleLoadMore} disabled={loadingMore}>
            {loadingMore?<><Loader2 size={14} className="animate-spin mr-2"/>Loading…</>:"Load more posts"}
          </Button>
        )}
        {!loading&&!hasMore&&posts.length>0&&<p className="text-center text-xs text-muted-foreground py-4">You've reached the end 🎉</p>}
      </div>
    </MainLayout>
  );
};

export default Feed;