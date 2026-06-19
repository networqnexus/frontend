import { apiRequest } from "./config";
export const getSuggestions   = ()   => apiRequest("GET",    "/network/suggestions");
export const getConnections   = ()   => apiRequest("GET",    "/network/connections");
export const getRequests      = ()   => apiRequest("GET",    "/network/requests");
export const sendRequest      = (id) => apiRequest("POST",   `/network/connect/${id}`);
export const acceptRequest    = (id) => apiRequest("PUT",    `/network/request/${id}/accept`);
export const rejectRequest    = (id) => apiRequest("PUT",    `/network/request/${id}/reject`);
export const removeConnection = (id) => apiRequest("DELETE", `/network/remove/${id}`);
