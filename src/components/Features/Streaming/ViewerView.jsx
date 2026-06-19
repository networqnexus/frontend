// import { useEffect, useRef, useState } from "react";
// import {
//   LiveKitRoom, useTracks, VideoTrack, RoomAudioRenderer,
// } from "@livekit/components-react";
// import { Track } from "livekit-client";
// import { io } from "socket.io-client";
// import { ArrowLeft, Eye, Video } from "lucide-react";
// import LiveChat from "./LiveChat";

// const ViewerPlayer = ({ stream, socket }) => {
//   const tracks = useTracks([
//     { source: Track.Source.Camera },
//     { source: Track.Source.ScreenShare },
//   ]);
//   const [viewers, setViewers] = useState(stream.viewerCount || 0);

//   useEffect(() => {
//     if (!socket) return;
//     socket.on("viewer_count", ({ count }) => setViewers(count));
//     return () => socket.off("viewer_count");
//   }, [socket]);

//   const remoteTracks = tracks.filter(t => !t.participant?.isLocal);
//   const primary = remoteTracks[0];

//   return (
//     <div className="flex gap-4 h-[calc(100vh-140px)]">
//       <div className="flex-1 flex flex-col gap-3">
//         <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
//           {primary ? (
//             <VideoTrack trackRef={primary} className="w-full h-full object-contain" />
//           ) : (
//             <div className="w-full h-full flex items-center justify-center flex-col gap-2">
//               <Video size={40} className="text-white/20" />
//               <p className="text-white/40 text-sm">Waiting for host video…</p>
//             </div>
//           )}
//           <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
//             <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />LIVE
//           </div>
//           <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
//             <Eye size={12} className="mr-0.5" />{viewers} watching
//           </div>
//           <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
//             <p className="text-white font-semibold text-sm">{stream.title}</p>
//             <p className="text-white/60 text-xs">{stream.host?.name}</p>
//           </div>
//         </div>
//       </div>
//       <LiveChat streamId={stream._id} socket={socket} />
//     </div>
//   );
// };

// const ViewerView = ({ stream, token, onBack }) => {
//   const socketRef = useRef(null);

//   useEffect(() => {
//     const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");
//     socketRef.current = socket;
//     socket.emit("join_stream", stream._id);
//     return () => {
//       socket.emit("leave_stream", stream._id);
//       socket.disconnect();
//     };
//   }, [stream._id]);

//   return (
//     <div className="flex flex-col gap-4">
//       <button
//         onClick={onBack}
//         className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
//       >
//         <ArrowLeft size={16} />Back to streams
//       </button>
//       <LiveKitRoom
//         serverUrl={import.meta.env.VITE_LIVEKIT_URL}
//         token={token}
//         connect
//         video={false}
//         audio={false}
//       >
//         <RoomAudioRenderer />
//         <ViewerPlayer stream={stream} socket={socketRef.current} />
//       </LiveKitRoom>
//     </div>
//   );
// };

// export default ViewerView;

import { useEffect, useRef, useState } from "react";
import {
  LiveKitRoom, useTracks, VideoTrack, RoomAudioRenderer,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { io } from "socket.io-client";
import { ArrowLeft, Eye, Video, Maximize, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import LiveChat from "./LiveChat";

const ViewerPlayer = ({ stream, socket, onLeave }) => {
  const tracks = useTracks([
    { source: Track.Source.Camera },
    { source: Track.Source.ScreenShare },
  ]);
  const [viewers, setViewers] = useState(stream.viewerCount || 0);
  const videoWrapRef          = useRef(null);
  const hostId                = stream.host?._id;

  useEffect(() => {
    if (!socket) return;
    socket.on("viewer_count", ({ count }) => setViewers(count));
    return () => socket.off("viewer_count");
  }, [socket]);

  const toggleFullscreen = () => {
    if (!videoWrapRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else videoWrapRef.current.requestFullscreen();
  };

  const remoteTracks = tracks.filter(t => !t.participant?.isLocal);
  const primary      = remoteTracks[0];

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)]">
      <div className="flex-1 flex flex-col gap-3">

        {/* Video */}
        <div
          ref={videoWrapRef}
          onClick={toggleFullscreen}
          className="relative rounded-xl overflow-hidden bg-black aspect-video cursor-pointer group"
        >
          {primary ? (
            <VideoTrack trackRef={primary} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center flex-col gap-2">
              <Video size={40} className="text-white/20" />
              <p className="text-white/40 text-sm">Waiting for host video…</p>
            </div>
          )}

          {/* Fullscreen hover hint */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Maximize size={36} className="text-white opacity-0 group-hover:opacity-50 transition-opacity drop-shadow-lg" />
          </div>

          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />LIVE
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10">
            <Eye size={12} className="mr-0.5" />{viewers} watching
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent z-10">
            <p className="text-white font-semibold text-sm">{stream.title}</p>
            <p className="text-white/60 text-xs">{stream.host?.name}</p>
          </div>
        </div>

        {/* Leave bar */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            {stream.host?.avatarUrl ? (
              <img src={stream.host.avatarUrl} className="w-7 h-7 rounded-full object-cover" alt="" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">
                  {stream.host?.name?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-foreground leading-none">{stream.host?.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">is hosting this stream</p>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={onLeave}
            className="gap-1.5"
          >
            <LogOut size={14} />Leave Stream
          </Button>
        </div>

      </div>

      <LiveChat streamId={stream._id} socket={socket} hostId={hostId} />
    </div>
  );
};

const ViewerView = ({ stream, token, onBack }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");
    setSocket(s);
    s.emit("join_stream", stream._id);
    return () => {
      s.emit("leave_stream", stream._id);
      s.disconnect();
    };
  }, [stream._id]);

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft size={16} />Back to streams
      </button>
      <LiveKitRoom
        serverUrl={import.meta.env.VITE_LIVEKIT_URL}
        token={token}
        connect
        video={false}
        audio={false}
      >
        <RoomAudioRenderer />
        <ViewerPlayer stream={stream} socket={socket} onLeave={onBack} />
      </LiveKitRoom>
    </div>
  );
};

export default ViewerView;


