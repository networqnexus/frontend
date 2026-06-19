import { apiRequest } from "./config";
export const getNotifications = () => apiRequest("GET", "/notifications");
export const markAllRead      = () => apiRequest("PUT", "/notifications/read-all");
