import { useState } from "react";
import {
  ThumbsUp, MessageCircle, Repeat2, Share2, Bookmark,
  MoreHorizontal, Globe, Users, Lock, ChevronDown, ChevronUp, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const REACTIONS = ["👍", "❤️", "🎉", "💡", "👏", "🤝"];

const VisibilityIcon = ({ v }) => {
  if (v === "connections") return <Users size={11} className="inline text-muted-foreground" />;
  if (v === "private") return <Lock size={11} className="inline text-muted-foreground" />;
  return <Globe size={11} className="inline text-muted-foreground" />;
};

const CommentInput = ({ onSubmit }) => {
  const [val, setVal] = useState("");
  return (
    <div className="flex items-center gap-2 mt-3">
      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
        AS
      </div>
      <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5 border border-transparent focus-within:border-border focus-within:bg-background transition-all">
        <input
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Add a comment…"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && val.trim()) {
              onSubmit(val.trim());
              setVal("");
            }
          }}
        />
        {val.trim() && (
          <button
            onClick={() => { onSubmit(val.trim()); setVal(""); }}
            className="text-primary hover:opacity-70 transition-opacity"
          >
            <Send size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

const PostCard = ({ post, onUpdate }) => {
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const CONTENT_LIMIT = 220;
  const isLong = post.content.length > CONTENT_LIMIT;
  const displayContent = isLong && !expanded
    ? post.content.slice(0, CONTENT_LIMIT) + "…"
    : post.content;

  const handleLike = () => {
    onUpdate(post.id, {
      liked: !post.liked,
      likes: post.liked ? post.likes - 1 : post.likes + 1,
    });
  };

  const handleSave = () => onUpdate(post.id, { saved: !post.saved });

  const handleRepost = () => {
    onUpdate(post.id, {
      reposted: !post.reposted,
      shares: post.reposted ? post.shares - 1 : post.shares + 1,
    });
  };

  const handleComment = (text) => {
    onUpdate(post.id, {
      commentList: [
        ...post.commentList,
        { author: "Arjun Singh", initials: "AS", text, time: "Just now" },
      ],
      comments: post.comments + 1,
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-4">
        {/* Author row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${post.avatarColor}`}>
              {post.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground leading-tight hover:underline cursor-pointer">
                  {post.author}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">{post.title}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {post.time} · <VisibilityIcon v={post.visibility} />
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="xs">
              + Follow
            </Button>
            <Button variant="ghost" size="icon-xs">
              <MoreHorizontal size={14} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="mb-3">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{displayContent}</p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-1 transition-colors"
            >
              {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> See more</>}
            </button>
          )}
        </div>

        {/* Media */}
        {post.media && (
          <div className="mb-3 rounded-lg overflow-hidden border border-border">
            {post.media.type === "image"
              ? <img src={post.media.url} alt="" className="w-full max-h-80 object-cover" />
              : <video src={post.media.url} controls className="w-full max-h-80" />
            }
          </div>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs text-primary hover:underline cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Engagement counts */}
        {(post.likes > 0 || post.comments > 0 || post.shares > 0) && (
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              {post.likes > 0 && (
                <span className="flex items-center gap-1 hover:underline cursor-pointer">
                  <span>👍</span>
                  {post.likes.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {post.comments > 0 && (
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="hover:underline"
                >
                  {post.comments} comments
                </button>
              )}
              {post.shares > 0 && (
                <span>{post.shares} reposts</span>
              )}
            </div>
          </div>
        )}

        <Separator className="mb-2" />

        {/* Action buttons */}
        <div className="relative flex items-center gap-0.5 -mx-1">
          {/* Like with reaction picker */}
          <div className="relative">
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                ${post.liked ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              onClick={handleLike}
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
            >
              <ThumbsUp size={14} className={post.liked ? "fill-primary" : ""} />
              Like
            </button>
            {showReactions && (
              <div
                className="absolute bottom-full left-0 mb-1 bg-card border border-border rounded-full px-2 py-1 flex gap-1 shadow-md z-10"
                onMouseEnter={() => setShowReactions(true)}
                onMouseLeave={() => setShowReactions(false)}
              >
                {REACTIONS.map(r => (
                  <button
                    key={r}
                    onClick={() => { handleLike(); setShowReactions(false); }}
                    className="text-lg hover:scale-125 transition-transform leading-none"
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${showComments ? "text-foreground bg-muted" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            <MessageCircle size={14} />
            Comment
          </button>

          <button
            onClick={handleRepost}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${post.reposted ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            <Repeat2 size={14} />
            Repost
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Share2 size={14} />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={handleSave}
            className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${post.saved ? "text-amber-600 bg-amber-50 dark:bg-amber-950" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            <Bookmark size={14} className={post.saved ? "fill-amber-600" : ""} />
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-3 pt-3 border-t border-border">
            {post.commentList.length > 0 && (
              <div className="flex flex-col gap-3 mb-2">
                {post.commentList.map((c, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                      {c.initials}
                    </div>
                    <div className="flex-1 bg-muted/50 rounded-2xl px-3 py-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-foreground">{c.author}</span>
                        <span className="text-[10px] text-muted-foreground">{c.time}</span>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <CommentInput onSubmit={handleComment} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
