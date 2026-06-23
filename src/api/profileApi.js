import { apiRequest } from "./config";
export const getMe          = ()         => apiRequest("GET", "/profile/me");
export const getProfile     = (username) => apiRequest("GET", `/profile/${username}`);
export const getStats       = ()         => apiRequest("GET", "/profile/stats");
export const updateProfile  = (data)     => apiRequest("PUT", "/profile/update", data, data instanceof FormData);
export const changePassword = (data)     => apiRequest("PUT", "/profile/change-password", data);
export const endorseSkill   = (username, skill) => apiRequest("POST", `/profile/${username}/endorse`, { skill });
