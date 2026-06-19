import { apiRequest } from "./config";
export const getLeads    = (params={}) => apiRequest("GET",  `/crm?${new URLSearchParams(params)}`);
export const getCrmStats = ()          => apiRequest("GET",  "/crm/stats");
export const addLead     = (data)      => apiRequest("POST", "/crm", data);
export const updateLead  = (id,data)   => apiRequest("PUT",  `/crm/${id}`, data);
export const deleteLead  = (id)        => apiRequest("DELETE",`/crm/${id}`);
