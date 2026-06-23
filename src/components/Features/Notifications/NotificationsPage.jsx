import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Trash2, X } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { getNotifications, markAllRead, deleteNotification, clearAllNotifications } from "@/api/notificationApi";

const timeAgo = (d) => {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1)    return "just now";
  if (m < 60)   return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  if (m < 10080)return `${Math.floor(m / 1440)}d ago`;
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const TYPE_COLORS = {
  like:       "bg-pink-500/10 text-pink-500",
  comment:    "bg-blue-500/10 text-blue-500",
  connection: "bg-emerald-500/10 text-emerald-500",
  default:    "bg-primary/10 text-primary",
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]               = useState(0);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState("all"); // all | unread

  useEffect(() => {
    getNotifications()
      .then(d => {
        setNotifications(d.notifications || []);
        setUnread(d.unreadCount || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications(n => n.map(x => ({ ...x, read: true })));
      setUnread(0);
    } catch {}
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications(n => n.filter(x => x._id !== id));
    } catch {}
  };

  const handleClearAll = async () => {
    if (!window.confirm("Clear all notifications? This cannot be undone.")) return;
    try {
      await clearAllNotifications();
      setNotifications([]);
      setUnread(0);
    } catch {}
  };

  const handleClick = (n) => {
    navigate(n.link || "/feed");
  };

  const displayed = filter === "unread"
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell size={18} className="text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Notifications</h1>
              <p className="text-xs text-muted-foreground">
                {unread > 0 ? `${unread} unread` : "All caught up"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 border border-primary/20 hover:border-primary/40 px-3 py-1.5 rounded-lg transition-colors"
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive border border-border hover:border-destructive/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 size={13} /> Clear all
              </button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-4 bg-muted/50 p-1 rounded-lg w-fit">
          {["all", "unread"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize
                ${filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {f === "unread" ? `Unread (${unread})` : "All"}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Bell size={40} className="opacity-20" />
              <p className="text-sm font-medium">
                {filter === "unread" ? "No unread notifications" : "No notifications yet"}
              </p>
              <p className="text-xs opacity-60 text-center max-w-xs">
                Notifications appear when someone likes your post, comments, or sends you a connection request.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {displayed.map(n => (
                <div
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={`group flex items-start gap-4 px-5 py-4 hover:bg-muted/40 cursor-pointer transition-colors
                    ${!n.read ? "bg-primary/5" : ""}`}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0 overflow-hidden">
                    {n.sender?.avatarUrl
                      ? <img src={n.sender.avatarUrl} className="w-full h-full object-cover" alt="" />
                      : n.sender?.name?.[0]?.toUpperCase() || "N"}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">
                      <span className="font-semibold">{n.sender?.name}</span>{" "}
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                      {n.type && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize ${TYPE_COLORS[n.type] || TYPE_COLORS.default}`}>
                          {n.type}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!n.read && <div className="w-2 h-2 bg-primary rounded-full" />}
                    <button
                      onClick={(e) => handleDelete(e, n._id)}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </MainLayout>
  );
}
