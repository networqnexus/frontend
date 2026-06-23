import { apiRequest } from "./config";

export const getJobs                 = (params = {}) => apiRequest("GET",  `/jobs?${new URLSearchParams(params)}`);
export const getSavedJobs            = ()             => apiRequest("GET",  "/jobs/saved");
export const getMyPostedJobs         = ()             => apiRequest("GET",  "/jobs/my-posted");
export const getApplicants           = (id)           => apiRequest("GET",  `/jobs/${id}/applicants`);
export const createJob               = (data)         => apiRequest("POST", "/jobs", data);
export const applyJob                = (id, data)     => apiRequest("PUT",  `/jobs/${id}/apply`, data, data instanceof FormData);
export const saveJob                 = (id)           => apiRequest("PUT",  `/jobs/${id}/save`);
export const toggleJobStatus         = (id)           => apiRequest("PUT",  `/jobs/${id}/toggle`);
export const deleteJob               = (id)           => apiRequest("DELETE", `/jobs/${id}`);
export const updateApplicationStatus = (jobId, userId, status) => apiRequest("PUT", `/jobs/${jobId}/applicant/${userId}/status`, { status });
export const scheduleInterview = (jobId, userId, data) =>
  apiRequest("POST", `/jobs/${jobId}/applicant/${userId}/schedule-interview`, data);
