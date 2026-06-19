import { useState, useEffect, useRef } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getConversations, getMessages, sendMessage } from "@/api/messageApi";
import useAuth from "@/hooks/useAuth";
import { Search, Send, Phone, Video, MoreHorizontal, Check, CheckCheck, Circle, X, Loader2 } from "lucide-react";
import { io } from "socket.io-client";

let socket;

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState(false);
  const [mobileView, setMobileView] = useState("list");
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    // Connect socket
    socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");
    if (user?.id) socket.emit("user_online", user.id);

    socket.on("online_users", (users) => setOnlineUsers(users));
    socket.on("receive_message", (msg) => {
      setMessages(prev => [...prev, msg]);
      setConversations(prev => prev.map(c =>
        c.user._id === msg.sender?._id ? { ...c, lastMessage: msg, unread: (c.unread || 0) + 1 } : c
      ));
    });
    socket.on("typing", () => setTyping(true));
    socket.on("stop_typing", () => setTyping(false));

    loadConversations();

    return () => { socket.disconnect(); };
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await getConversations();
      setConversations(data.conversations || []);
    } catch {}
    setLoading(false);
  };

  const handleSelectConv = async (conv) => {
    setActiveConv(conv);
    setMobileView("chat");
    setMsgLoading(true);
    setConversations(prev => prev.map(c => c.user._id === conv.user._id ? { ...c, unread: 0 } : c));
    try {
      const data = await getMessages(conv.user._id);
      setMessages(data.messages || []);
    } catch {}
    setMsgLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim() || !activeConv) return;
    setSending(true);
    const text = input.trim();
    setInput("");
    socket.emit("stop_typing", { receiverId: activeConv.user._id });

    try {
      const data = await sendMessage(activeConv.user._id, text);
      setMessages(prev => [...prev, data.message]);
      setConversations(prev => prev.map(c =>
        c.user._id === activeConv.user._id ? { ...c, lastMessage: data.message } : c
      ));
      socket.emit("send_message", { receiverId: activeConv.user._id, ...data.message });
    } catch {}
    setSending(false);
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!activeConv) return;
    socket.emit("typing", { receiverId: activeConv.user._id });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stop_typing", { receiverId: activeConv.user._id });
    }, 1500);
  };

  const timeAgo = (date) => {
    if (!date) return "";
    const m = Math.floor((Date.now() - new Date(date)) / 60000);
    if (m < 1) return "now"; if (m < 60) return `${m}m`; if (m < 1440) return `${Math.floor(m/60)}h`; return `${Math.floor(m/1440)}d`;
  };

  const getInitials = (name) => name?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) || "U";

  const filteredConvs = conversations.filter(c => !search || c.user?.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <MainLayout>
      <div className="rounded-xl border border-border bg-card overflow-hidden flex h-[calc(100vh-7rem)] min-h-[500px]">

        {/* Conversation List */}
        <div className={`w-full lg:w-72 xl:w-80 shrink-0 border-r border-border flex flex-col ${mobileView === "chat" ? "hidden lg:flex" : "flex"}`}>
          <div className="p-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground mb-2">Messages</h2>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"/>
              <Input placeholder="Search conversations…" className="pl-8 h-7 text-xs" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10"><Loader2 size={20} className="animate-spin text-muted-foreground"/></div>
            ) : filteredConvs.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground">No conversations yet.<br/>Connect with people to start chatting!</div>
            ) : filteredConvs.map(conv => (
              <button key={conv.user._id} onClick={() => handleSelectConv(conv)}
                className={`w-full flex items-start gap-3 px-3 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 ${activeConv?.user._id === conv.user._id ? "bg-muted/60" : ""}`}>
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary overflow-hidden">
                    {conv.user?.avatarUrl ? <img src={conv.user.avatarUrl} className="w-full h-full object-cover" alt=""/> : getInitials(conv.user?.name)}
                  </div>
                  {onlineUsers.includes(conv.user._id) && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-card"/>}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${conv.unread > 0 ? "font-semibold" : "font-medium"} text-foreground leading-tight`}>{conv.user?.name}</p>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(conv.lastMessage?.createdAt)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{conv.user?.headline}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className={`text-xs truncate ${conv.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {conv.lastMessage ? conv.lastMessage.text : "Start a conversation"}
                    </p>
                    {conv.unread > 0 && <span className="ml-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[9px] font-bold text-primary-foreground shrink-0">{conv.unread}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Panel */}
        <div className={`flex-1 flex flex-col min-w-0 ${mobileView === "list" ? "hidden lg:flex" : "flex"}`}>
          {activeConv ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
                <button onClick={() => setMobileView("list")} className="lg:hidden text-muted-foreground"><X size={16}/></button>
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary overflow-hidden">
                    {activeConv.user?.avatarUrl ? <img src={activeConv.user.avatarUrl} className="w-full h-full object-cover" alt=""/> : getInitials(activeConv.user?.name)}
                  </div>
                  {onlineUsers.includes(activeConv.user._id) && <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-card"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{activeConv.user?.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {typing ? "typing..." : onlineUsers.includes(activeConv.user._id) ? <><Circle size={8} className="fill-emerald-500 text-emerald-500"/>Active now</> : activeConv.user?.headline}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm"><Phone size={15}/></Button>
                  <Button variant="ghost" size="icon-sm"><Video size={15}/></Button>
                  <Button variant="ghost" size="icon-sm"><MoreHorizontal size={15}/></Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {msgLoading ? (
                  <div className="flex items-center justify-center py-10"><Loader2 size={20} className="animate-spin text-muted-foreground"/></div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-10 text-xs text-muted-foreground">No messages yet. Say hello! 👋</div>
                ) : messages.map((msg, i) => {
                  const isMe = msg.sender?._id === user?.id || msg.sender === user?.id;
                  return (
                    <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                          {msg.text}
                        </div>
                        <div className="flex items-center gap-1 px-1">
                          <span className="text-[10px] text-muted-foreground">{timeAgo(msg.createdAt)}</span>
                          {isMe && <CheckCheck size={11} className="text-primary"/>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef}/>
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-border flex items-center gap-2 shrink-0">
                <Input placeholder="Write a message…" className="flex-1 h-9 text-sm" value={input} onChange={handleTyping}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}/>
                <Button size="icon-sm" disabled={!input.trim() || sending} onClick={handleSend}>
                  {sending ? <Loader2 size={14} className="animate-spin"/> : <Send size={14}/>}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center"><Send size={24} className="text-muted-foreground"/></div>
              <p className="text-sm font-medium text-foreground">Your Messages</p>
              <p className="text-xs text-muted-foreground">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
