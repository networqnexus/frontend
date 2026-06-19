// import { useEffect, useRef, useState } from "react";
// import {
//   LiveKitRoom, useLocalParticipant, useTracks,
//   VideoTrack, RoomAudioRenderer,
// } from "@livekit/components-react";
// import { Track } from "livekit-client";
// import { io } from "socket.io-client";
// import { Button } from "@/components/ui/button";
// import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, StopCircle, Eye } from "lucide-react";
// import LiveChat from "./LiveChat";

// const HostControls = ({ stream, onEnd, socket }) => {
//   const { localParticipant } = useLocalParticipant();
//   const cameraTracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);
//   const screenTracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }]);
//   const [micOn, setMicOn]       = useState(true);
//   const [camOn, setCamOn]       = useState(true);
//   const [screenOn, setScreenOn] = useState(false);
//   const [viewers, setViewers]   = useState(0);

//   useEffect(() => {
//     if (!socket) return;
//     socket.on("viewer_count", ({ count }) => setViewers(count));
//     return () => socket.off("viewer_count");
//   }, [socket]);

//   const toggleMic = async () => {
//     await localParticipant.setMicrophoneEnabled(!micOn);
//     setMicOn(v => !v);
//   };
//   const toggleCam = async () => {
//     await localParticipant.setCameraEnabled(!camOn);
//     setCamOn(v => !v);
//   };
//   const toggleScreen = async () => {
//     await localParticipant.setScreenShareEnabled(!screenOn);
//     setScreenOn(v => !v);
//   };

//   const camTrack   = cameraTracks.find(t => t.participant?.isLocal);
//   const scrTrack   = screenTracks.find(t => t.participant?.isLocal);

//   return (
//     <div className="flex gap-4 h-[calc(100vh-140px)]">
//       <div className="flex-1 flex flex-col gap-3">
//         <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
//           {scrTrack?.publication ? (
//             <VideoTrack trackRef={scrTrack} className="w-full h-full object-contain" />
//           ) : camTrack?.publication ? (
//             <VideoTrack trackRef={camTrack} className="w-full h-full object-cover" />
//           ) : (
//             <div className="w-full h-full flex items-center justify-center">
//               <Video size={48} className="text-white/20" />
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
//           </div>
//         </div>

//         <div className="flex items-center justify-center gap-3">
//           <Button variant={micOn ? "outline" : "destructive"} size="icon" onClick={toggleMic} title="Toggle mic">
//             {micOn ? <Mic size={18} /> : <MicOff size={18} />}
//           </Button>
//           <Button variant={camOn ? "outline" : "destructive"} size="icon" onClick={toggleCam} title="Toggle camera">
//             {camOn ? <Video size={18} /> : <VideoOff size={18} />}
//           </Button>
//           <Button variant={screenOn ? "secondary" : "outline"} size="icon" onClick={toggleScreen} title="Toggle screen share">
//             {screenOn ? <MonitorOff size={18} /> : <Monitor size={18} />}
//           </Button>
//           <Button variant="destructive" size="sm" onClick={onEnd} className="gap-1.5 ml-4">
//             <StopCircle size={16} />End Stream
//           </Button>
//         </div>
//       </div>

//       <LiveChat streamId={stream._id} socket={socket} />
//     </div>
//   );
// };

// const HostView = ({ stream, token, onEnd }) => {
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
//     <LiveKitRoom
//       serverUrl={import.meta.env.VITE_LIVEKIT_URL}
//       token={token}
//       connect
//       video
//       audio
//     >
//       <RoomAudioRenderer />
//       <HostControls stream={stream} onEnd={onEnd} socket={socketRef.current} />
//     </LiveKitRoom>
//   );
// };

// export default HostView;


import { useEffect, useRef, useState } from "react";
import {
  LiveKitRoom, useLocalParticipant, useTracks,
  VideoTrack, RoomAudioRenderer,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, StopCircle, Eye, Maximize } from "lucide-react";
import LiveChat from "./LiveChat";

const HostControls = ({ stream, onEnd, socket }) => {
  const { localParticipant } = useLocalParticipant();
  const cameraTracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);
  const screenTracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }]);
  const [micOn,    setMicOn]    = useState(true);
  const [camOn,    setCamOn]    = useState(true);
  const [screenOn, setScreenOn] = useState(false);
  const [viewers,  setViewers]  = useState(0);
  const videoWrapRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    socket.on("viewer_count", ({ count }) => setViewers(count));
    return () => socket.off("viewer_count");
  }, [socket]);

  useEffect(() => {
    const handler = () => {};
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleMic    = async () => { await localParticipant.setMicrophoneEnabled(!micOn);    setMicOn(v => !v); };
  const toggleCam    = async () => { await localParticipant.setCameraEnabled(!camOn);         setCamOn(v => !v); };
  const toggleScreen = async () => { await localParticipant.setScreenShareEnabled(!screenOn); setScreenOn(v => !v); };

  const toggleFullscreen = () => {
    if (!videoWrapRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else videoWrapRef.current.requestFullscreen();
  };

  const camTrack = cameraTracks.find(t => t.participant?.isLocal);
  const scrTrack = screenTracks.find(t => t.participant?.isLocal);

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)]">
      <div className="flex-1 flex flex-col gap-3">
        <div
          ref={videoWrapRef}
          onClick={toggleFullscreen}
          className="relative rounded-xl overflow-hidden bg-black aspect-video cursor-pointer group"
        >
          {scrTrack?.publication ? (
            <VideoTrack trackRef={scrTrack} className="w-full h-full object-contain" />
          ) : camTrack?.publication ? (
            <VideoTrack trackRef={camTrack} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video size={48} className="text-white/20" />
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
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            variant={micOn ? "outline" : "destructive"}
            size="icon"
            onClick={e => { e.stopPropagation(); toggleMic(); }}
            title="Toggle mic"
          >
            {micOn ? <Mic size={18} /> : <MicOff size={18} />}
          </Button>
          <Button
            variant={camOn ? "outline" : "destructive"}
            size="icon"
            onClick={e => { e.stopPropagation(); toggleCam(); }}
            title="Toggle camera"
          >
            {camOn ? <Video size={18} /> : <VideoOff size={18} />}
          </Button>
          <Button
            variant={screenOn ? "secondary" : "outline"}
            size="icon"
            onClick={e => { e.stopPropagation(); toggleScreen(); }}
            title="Screen share"
          >
            {screenOn ? <MonitorOff size={18} /> : <Monitor size={18} />}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={e => { e.stopPropagation(); onEnd(); }}
            className="gap-1.5 ml-4"
          >
            <StopCircle size={16} />End Stream
          </Button>
        </div>
      </div>

      <LiveChat streamId={stream._id} socket={socket} hostId={stream.host?._id || stream.host} />

    </div>
  );
};

const HostView = ({ stream, token, onEnd }) => {
  const [socket, setSocket] = useState(null); // useState so children re-render when socket is ready

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
    <LiveKitRoom serverUrl={import.meta.env.VITE_LIVEKIT_URL} token={token} connect video audio>
      <RoomAudioRenderer />
      <HostControls stream={stream} onEnd={onEnd} socket={socket} />
    </LiveKitRoom>
  );
};

export default HostView;
