import { apiRequest } from "./config";

export const getCandidates     = (params = {})     => apiRequest("GET",  `/ats?${new URLSearchParams(params)}`);
export const getCandidate      = (id)              => apiRequest("GET",  `/ats/${id}`);
export const getAtsStats       = ()                => apiRequest("GET",  "/ats/stats");
export const getAtsReport      = ()                => apiRequest("GET",  "/ats/report");
export const addCandidate      = (data)            => apiRequest("POST", "/ats", data);
export const parseResume       = (resumeText)      => apiRequest("POST", "/ats/parse-resume", { resumeText });
export const updateStage       = (id, stage, note) => apiRequest("PUT",  `/ats/${id}/stage`, { stage, note });
export const updateRating      = (id, rating)      => apiRequest("PUT",  `/ats/${id}/rating`, { rating });
export const updateNotes       = (id, notes)       => apiRequest("PUT",  `/ats/${id}/notes`, { notes });
export const updateOffer       = (id, data)        => apiRequest("PUT",  `/ats/${id}/offer`, data);
export const updateApproval    = (id, data)        => apiRequest("PUT",  `/ats/${id}/approval`, data);
export const triggerOnboarding = (id, data)        => apiRequest("POST", `/ats/${id}/onboard`, data);
export const scheduleInterview = (id, data)        => apiRequest("POST", `/ats/${id}/interviews`, data);
export const updateInterview   = (id, iid, status) => apiRequest("PUT",  `/ats/${id}/interviews/${iid}`, { status });
export const submitFeedback    = (id, iid, data)   => apiRequest("POST", `/ats/${id}/interviews/${iid}/feedback`, data);
export const deleteCandidate   = (id)              => apiRequest("DELETE",`/ats/${id}`);
