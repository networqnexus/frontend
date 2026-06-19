import { apiRequest } from "./config";
export const getAnalytics = () => apiRequest("GET", "/analytics");
