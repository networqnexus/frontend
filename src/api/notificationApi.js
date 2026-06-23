import { apiRequest } from "./config";
export const getNotifications    = ()   => apiRequest("GET",    "/notifications");
export const markAllRead         = ()   => apiRequest("PUT",    "/notifications/read-all");
export const deleteNotification  = (id) => apiRequest("DELETE", `/notifications/${id}`);
export const clearAllNotifications = () => apiRequest("DELETE", "/notifications/clear");
