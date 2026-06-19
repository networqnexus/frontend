import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Image, FileText, Video, Calendar, ThumbsUp, MessageCircle,
  Share2, Bookmark, MoreHorizontal, TrendingUp, Users,
  Briefcase, Bell, ChevronRight, Repeat2, Globe, Sparkles
} from "lucide-react";

// ---------- mock data ----------
const stats = [
  { label: "Profile views",   value: "248",  change: "+12%",  up: true,  icon: Users },
  { label: "Post impressions",value: "1.4k", change: "+34%",  up: true,  icon: TrendingUp },
  { label: "Search appearances",value:"93",  change: "-5%",   up: false, icon: Globe },
  { label: "New connections", value: "17",   change: "+8%",   up: true,  icon: Sparkles },
];

const posts = [
  {
    id: 1,
    author: "Priya Sharma",
    initials: "PS",
    title: "Product Manager @ Google",
    time: "2h ago",
    content: "Just wrapped up our Q2 design sprint — biggest takeaway: constraint breeds creativity. When you give a team 3 days instead of 3 weeks, the ideas that survive are the ones that truly matter. 🚀",
    likes: 148,
    comments: 23,
    shares: 12,
    tag: "Design Thinking",
  },
  {
    id: 2,
    author: "Rahul Mehta",
    initials: "RM",
    title: "Frontend Engineer @ Swiggy",
    time: "5h ago",
    content: "Hot take: the best engineers I've worked with are those who can explain complex systems in simple terms. Technical depth matters, but communication is the force multiplier. Who do you think is more valuable on a team?",
    likes: 312,
    comments: 67,
    shares: 44,
    tag: "Engineering Culture",
  },
  {
    id: 3,
    author: "Neha Kapoor",
    initials: "NK",
    title: "Data Scientist @ Flipkart",
    time: "1d ago",
    content: "We reduced recommendation latency by 60% using a two-stage retrieval model. Sharing the architecture breakdown in a blog soon. Drop a 🔔 if you'd like to be notified when it's live!",
    likes: 529,
    comments: 91,
    shares: 78,
    tag: "Machine Learning",
  },
];

const activities = [
  { text: "Priya Sharma commented on your post", time: "10m ago", type: "comment" },
  { text: "Your application at Razorpay was viewed", time: "1h ago",  type: "job" },
  { text: "15 people viewed your profile today",   time: "3h ago",  type: "view" },
  { text: "Vikram Joshi sent you a connection request", time: "5h ago", type: "connect" },
];

// ---------- sub-components ----------
const StatCard = ({ label, value, change, up, icon: Icon }) => (
  <Card className="flex-1 min-w-0">
    <CardContent className="flex items-center gap-3 py-3">
      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon size={16} className="text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-foreground leading-none">{value}</p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{label}</p>
      </div>
      <span className={`ml-auto text-xs font-semibold shrink-0 ${up ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
        {change}
      </span>
    </CardContent>
  </Card>
);

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  return (
    <Card>
      <CardContent className="pt-4">
        {/* Author row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
              {post.initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">{post.author}</p>
              <p className="text-xs text-muted-foreground">{post.title}</p>
              <p className="text-xs text-muted-foreground">{post.time} · <Globe size={10} className="inline" /></p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="xs">Follow</Button>
            <Button variant="ghost" size="icon-xs">
              <MoreHorizontal size={14} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-foreground leading-relaxed mb-3">{post.content}</p>

        {/* Tag */}
        <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground mb-3">
          #{post.tag.replace(" ", "")}
        </span>

        <Separator className="mb-3" />

        {/* Actions */}
        <div className="flex items-center gap-0.5 -mx-1">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1.5 text-xs ${liked ? "text-primary" : "text-muted-foreground"}`}
            onClick={handleLike}
          >
            <ThumbsUp size={14} className={liked ? "fill-primary" : ""} />
            {likes}
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
            <MessageCircle size={14} />
            {post.comments}
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
            <Repeat2 size={14} />
            {post.shares}
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
            <Share2 size={14} />
            Share
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className={`ml-auto ${saved ? "text-primary" : "text-muted-foreground"}`}
            onClick={() => setSaved(!saved)}
          >
            <Bookmark size={14} className={saved ? "fill-primary" : ""} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ---------- main Dashboard ----------
const Dashboard = () => {
  const navigate = useNavigate();
  const [postText, setPostText] = useState("");
  const [posting, setPosting] = useState(false);

  const handlePost = () => {
    if (!postText.trim()) return;
    setPosting(true);
    setTimeout(() => { setPosting(false); setPostText(""); }, 1200);
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-4">

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Create post */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
                A
              </div>
              <Textarea
                placeholder="Share an update, idea, or article..."
                className="resize-none text-sm bg-muted/30 border-transparent focus:bg-background min-h-[72px]"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1 justify-between">
              <div className="flex gap-1">
                {[
                  { icon: Image,    label: "Photo" },
                  { icon: Video,    label: "Video" },
                  { icon: FileText, label: "Article" },
                  { icon: Calendar, label: "Event" },
                ].map(({ icon: Icon, label }) => (
                  <Button key={label} variant="ghost" size="xs" className="gap-1.5 text-muted-foreground">
                    <Icon size={14} />
                    <span className="hidden sm:inline">{label}</span>
                  </Button>
                ))}
              </div>
              <Button
                size="sm"
                disabled={!postText.trim() || posting}
                onClick={handlePost}
              >
                {posting ? "Posting..." : "Post"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feed */}
        <div className="flex flex-col gap-4">
          {posts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>

        {/* Load more */}
        <Button variant="outline" className="w-full text-sm text-muted-foreground">
          Load more posts
        </Button>

      </div>
    </MainLayout>
  );
};

export default Dashboard;
