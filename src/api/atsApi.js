import { apiRequest } from "./config";
export const getCandidates  = (params={}) => apiRequest("GET",  `/ats?${new URLSearchParams(params)}`);
export const getAtsStats    = ()          => apiRequest("GET",  "/ats/stats");
export const addCandidate   = (data)      => apiRequest("POST", "/ats", data);
export const updateStage    = (id,stage)  => apiRequest("PUT",  `/ats/${id}/stage`, { stage });
export const updateRating   = (id,rating) => apiRequest("PUT",  `/ats/${id}/rating`, { rating });
export const deleteCandidate= (id)        => apiRequest("DELETE",`/ats/${id}`);
