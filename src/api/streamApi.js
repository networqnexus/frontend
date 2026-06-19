import { apiRequest } from "./config";

// --- Live stream ---
export const startStream        = (body)     => apiRequest("POST", "/streams/start", body);
export const endStream          = (id)       => apiRequest("PUT",  `/streams/${id}/end`);
export const getLiveStreams      = ()         => apiRequest("GET",  "/streams");
export const getStream          = (id)       => apiRequest("GET",  `/streams/${id}`);
export const getViewerToken     = (roomName) => apiRequest("POST", "/streams/token", { roomName });
export const getHostRejoinToken = (streamId) => apiRequest("POST", `/streams/${streamId}/host-token`);

// --- Scheduled stream ---
export const scheduleStream        = (body)     => apiRequest("POST",   "/streams/schedule", body);
export const getScheduledStreams    = ()         => apiRequest("GET",    "/streams/scheduled");
export const updateScheduledStream = (id, body) => apiRequest("PUT",    `/streams/${id}/schedule`, body);
export const cancelScheduledStream = (id)       => apiRequest("DELETE", `/streams/${id}/schedule`);
export const inviteToStream        = (id, body) => apiRequest("POST",   `/streams/${id}/invite`, body);
export const launchScheduledStream = (id)       => apiRequest("POST",   `/streams/${id}/launch`);
