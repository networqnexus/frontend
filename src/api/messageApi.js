import { apiRequest } from "./config";
export const getConversations = ()            => apiRequest("GET",  "/messages/conversations");
export const getMessages      = (userId)      => apiRequest("GET",  `/messages/${userId}`);
export const sendMessage      = (userId, text) => apiRequest("POST", `/messages/${userId}`, { text });
