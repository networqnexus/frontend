import { apiRequest } from "./config";
export const getJobs      = (params = {}) => apiRequest("GET",  `/jobs?${new URLSearchParams(params)}`);
export const getSavedJobs = ()            => apiRequest("GET",  "/jobs/saved");
export const createJob    = (data)        => apiRequest("POST", "/jobs", data);
export const applyJob     = (id)          => apiRequest("PUT",  `/jobs/${id}/apply`);
export const saveJob      = (id)          => apiRequest("PUT",  `/jobs/${id}/save`);
