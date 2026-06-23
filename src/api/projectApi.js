import { apiRequest } from "./config";

export const getMyProjects    = ()         => apiRequest("GET",    "/projects");
export const exploreProjects  = (params)   => apiRequest("GET",    `/projects/explore?${new URLSearchParams(params)}`);
export const createProject    = (data)     => apiRequest("POST",   "/projects", data);
export const updateProject    = (id, data) => apiRequest("PUT",    `/projects/${id}`, data);
export const deleteProject    = (id)       => apiRequest("DELETE", `/projects/${id}`);
