// import { useState, useEffect, useRef } from "react";
// import { Button } from "@/components/ui/button";
// import { Send } from "lucide-react";
// import useAuth from "@/hooks/useAuth";

// const LiveChat = ({ streamId, socket }) => {
//   const { user } = useAuth();
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const bottomRef = useRef(null);

//   useEffect(() => {
//     if (!socket) return;
//     const handler = (msg) => setMessages(prev => [...prev.slice(-99), msg]);
//     socket.on("stream_chat", handler);
//     return () => socket.off("stream_chat", handler);
//   }, [socket]);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const send = () => {
//     if (!input.trim() || !socket) return;
//     socket.emit("stream_chat", {
//       streamId,
//       text: input.trim(),
//       senderName: user?.name || "Viewer",
//       senderId: user?._id,
//     });
//     setInput("");
//   };

//   return (
//     <div className="flex flex-col h-full border border-border rounded-xl bg-card overflow-hidden w-72 shrink-0">
//       <div className="p-3 border-b border-border">
//         <p className="text-sm font-semibold text-foreground">Live Chat</p>
//       </div>
//       <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-0">
//         {messages.length === 0 && (
//           <p className="text-xs text-muted-foreground text-center py-8">No messages yet. Say hello!</p>
//         )}
//         {messages.map((msg, i) => (
//           <div key={i} className="text-sm break-words">
//             <span className="font-semibold text-primary">{msg.senderName}: </span>
//             <span className="text-foreground">{msg.text}</span>
//           </div>
//         ))}
//         <div ref={bottomRef} />
//       </div>
//       <div className="p-3 border-t border-border flex gap-2">
//         <input
//           value={input}
//           onChange={e => setInput(e.target.value)}
//           onKeyDown={e => e.key === "Enter" && send()}
//           placeholder="Say something..."
//           className="flex-1 text-sm bg-muted rounded-lg px-3 py-2 outline-none placeholder:text-muted-foreground"
//         />
//         <Button size="icon" variant="ghost" onClick={send}>
//           <Send size={16} />
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default LiveChat;

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import useAuth from "@/hooks/useAuth";

const LiveChat = ({ streamId, socket, hostId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const bottomRef               = useRef(null);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => setMessages(prev => [...prev.slice(-99), msg]);
    socket.on("stream_chat", handler);
    return () => socket.off("stream_chat", handler);
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim() || !socket) return;
    socket.emit("stream_chat", {
      streamId,
      text:       input.trim(),
      senderName: user?.name || "Viewer",
      senderId:   user?._id,
    });
    setInput("");
  };

  const isHost = (senderId) =>
    hostId && senderId && String(senderId) === String(hostId);

  return (
    <div className="flex flex-col h-full border border-border rounded-xl bg-card overflow-hidden w-72 shrink-0">
      <div className="p-3 border-b border-border">
        <p className="text-sm font-semibold text-foreground">Live Chat</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-0">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className="text-sm break-words">
            {isHost(msg.senderId) ? (
              <>
                <span className="font-bold text-amber-400">{msg.senderName}</span>
                <span className="inline-flex items-center mx-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-black uppercase tracking-wide leading-none">
                  HOST
                </span>
                <span className="text-foreground">{msg.text}</span>
              </>
            ) : (
              <>
                <span className="font-semibold text-primary">{msg.senderName}: </span>
                <span className="text-foreground">{msg.text}</span>
              </>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-border flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Say something…"
          className="flex-1 text-sm bg-muted rounded-lg px-3 py-2 outline-none placeholder:text-muted-foreground"
        />
        <Button size="icon" variant="ghost" onClick={send}>
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
};

export default LiveChat;
