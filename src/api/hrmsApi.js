import { apiRequest } from "./config";
export const getEmployees       = (params={})    => apiRequest("GET",  `/hrms/employees?${new URLSearchParams(params)}`);
export const getHrmsStats       = ()             => apiRequest("GET",  "/hrms/stats");
export const addEmployee        = (data)         => apiRequest("POST", "/hrms/employees", data);
export const updateEmployee     = (id,data)      => apiRequest("PUT",  `/hrms/employees/${id}`, data);
export const deleteEmployee     = (id)           => apiRequest("DELETE",`/hrms/employees/${id}`);
export const getLeaveRequests   = ()             => apiRequest("GET",  "/hrms/leave");
export const addLeaveRequest    = (data)         => apiRequest("POST", "/hrms/leave", data);
export const updateLeaveStatus  = (id,status)    => apiRequest("PUT",  `/hrms/leave/${id}/status`, { status });
