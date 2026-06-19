import { useState, useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import { getAnalytics } from "@/api/analyticsApi";
import { getMyPosts } from "@/api/postApi";
import { Eye, Users, ThumbsUp, FileText, TrendingUp, MessageCircle, Loader2, BarChart2 } from "lucide-react";

const StatCard = ({ label, value, icon: Icon, change, color }) => (
  <div className="rounded-xl border border-border bg-card p-5">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}><Icon size={18}/></div>
      {change !== undefined && (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${change>=0?"bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400":"bg-red-100 text-red-700"}`}>
          {change>=0?"+":""}{change}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
    <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
  </div>
);

const SimpleBar = ({ data, label, color="bg-primary" }) => {
  const max = Math.max(...data.map(d=>d.value), 1);
  return (
    <div>
      <p className="text-sm font-semibold text-foreground mb-3">{label}</p>
      <div className="flex items-end gap-2 h-32">
        {data.map((d,i)=>(
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full rounded-t-sm transition-all" style={{height:`${(d.value/max)*100}%`,backgroundColor:`hsl(var(--primary)/${0.4+i*0.1})`,minHeight:d.value?"4px":"0"}}/>
            <span className="text-[9px] text-muted-foreground truncate w-full text-center">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [aData, pData] = await Promise.all([getAnalytics(), getMyPosts()]);
        setStats(aData.stats);
        setPosts(pData.posts||[]);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <MainLayout><div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-muted-foreground"/></div></MainLayout>;

  const postsByDay = stats?.recentActivity || [];
  const last7Days = Array.from({length:7},(_,i)=>{
    const d = new Date(Date.now()-(6-i)*86400000);
    const key = d.toISOString().slice(0,10);
    const found = postsByDay.find(p=>p._id===key);
    return { label: d.toLocaleDateString("en",{weekday:"short"}), value: found?.count||0, likes: found?.likes||0 };
  });

  const topPosts = [...posts].sort((a,b)=>b.likes?.length-a.likes?.length).slice(0,5);
  const totalReach = posts.reduce((s,p)=>s+(p.likes?.length||0)+(p.comments?.length||0),0);

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">Your profile and content performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard label="Profile Views" value={stats?.profileViews||0} icon={Eye} color="text-blue-600 bg-blue-50 dark:bg-blue-950" change={12}/>
          <StatCard label="Connections" value={stats?.connections||0} icon={Users} color="text-violet-600 bg-violet-50 dark:bg-violet-950" change={5}/>
          <StatCard label="Total Posts" value={stats?.posts||0} icon={FileText} color="text-amber-600 bg-amber-50 dark:bg-amber-950"/>
          <StatCard label="Total Likes" value={stats?.totalLikes||0} icon={ThumbsUp} color="text-rose-600 bg-rose-50 dark:bg-rose-950" change={23}/>
          <StatCard label="Total Comments" value={stats?.totalComments||0} icon={MessageCircle} color="text-emerald-600 bg-emerald-50 dark:bg-emerald-950" change={8}/>
          <StatCard label="Total Reach" value={totalReach} icon={TrendingUp} color="text-indigo-600 bg-indigo-50 dark:bg-indigo-950" change={15}/>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Post activity */}
          <div className="rounded-xl border border-border bg-card p-5">
            <SimpleBar data={last7Days} label="Posts This Week"/>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="text-center"><p className="text-lg font-bold text-foreground">{last7Days.reduce((s,d)=>s+d.value,0)}</p><p className="text-xs text-muted-foreground">Total posts</p></div>
              <div className="text-center"><p className="text-lg font-bold text-foreground">{last7Days.reduce((s,d)=>s+d.likes,0)}</p><p className="text-xs text-muted-foreground">Total likes</p></div>
              <div className="text-center"><p className="text-lg font-bold text-foreground">{last7Days.filter(d=>d.value>0).length}</p><p className="text-xs text-muted-foreground">Active days</p></div>
            </div>
          </div>

          {/* Engagement breakdown */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground mb-4">Engagement Breakdown</p>
            {stats?.totalLikes===0 && stats?.totalComments===0 ? (
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">Post something to see engagement data!</div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Likes</span>
                      <span className="text-xs font-semibold text-foreground">{stats?.totalLikes||0}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{width:`${stats?.totalLikes?100:0}%`}}/>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Comments</span>
                      <span className="text-xs font-semibold text-foreground">{stats?.totalComments||0}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{width:`${stats?.totalComments?(stats.totalComments/(stats.totalLikes+stats.totalComments))*100:0}%`}}/>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">Engagement rate</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats?.posts?((totalReach/stats.posts).toFixed(1)):"0"} <span className="text-sm font-normal text-muted-foreground">per post</span></p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top performing posts */}
        {topPosts.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground mb-4">Top Performing Posts</p>
            <div className="flex flex-col gap-3">
              {topPosts.map((post,i)=>(
                <div key={post._id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">#{i+1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{post.content?.slice(0,80)}{post.content?.length>80?"…":""}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center"><p className="text-sm font-bold text-foreground">{post.likes?.length||0}</p><p className="text-[10px] text-muted-foreground">likes</p></div>
                    <div className="text-center"><p className="text-sm font-bold text-foreground">{post.comments?.length||0}</p><p className="text-[10px] text-muted-foreground">comments</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {posts.length===0 && (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <BarChart2 size={32} className="text-muted-foreground mx-auto mb-3"/>
            <p className="text-sm font-medium text-foreground">No data yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start posting to see your analytics</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Analytics;
