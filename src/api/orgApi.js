import { apiRequest } from "./config";

const B = "/organizations";

export const createOrg    = (data) => apiRequest("POST", B, data, data instanceof FormData);
export const getMyOrg     = ()     => apiRequest("GET",  `${B}/mine`);
export const searchOrgs   = (q)    => apiRequest("GET",  `${B}/search?q=${encodeURIComponent(q || "")}`);
export const getOrg       = (slug) => apiRequest("GET",  `${B}/${slug}`);
export const updateOrg    = (id, data) => apiRequest("PUT",    `${B}/${id}`, data, data instanceof FormData);
export const deleteOrg    = (id)       => apiRequest("DELETE", `${B}/${id}`);
export const followOrg    = (id)   => apiRequest("PUT",  `${B}/${id}/follow`);
export const leaveOrg     = (id)   => apiRequest("DELETE", `${B}/${id}/leave`);
export const addAdmin     = (id, username) => apiRequest("POST",   `${B}/${id}/admins`, { username });
export const removeAdmin  = (id, userId)   => apiRequest("DELETE", `${B}/${id}/admins/${userId}`);

// Workspace — ATS
export const getOrgCandidates    = (orgId, p={}) => apiRequest("GET",    `${B}/${orgId}/ats/candidates?${new URLSearchParams(p)}`);
export const addOrgCandidate     = (orgId, d)    => apiRequest("POST",   `${B}/${orgId}/ats/candidates`, d);
export const updateOrgCandStage  = (orgId, id, stage)  => apiRequest("PUT", `${B}/${orgId}/ats/candidates/${id}/stage`, { stage });
export const updateOrgCandRating = (orgId, id, rating) => apiRequest("PUT", `${B}/${orgId}/ats/candidates/${id}/rating`, { rating });
export const updateOrgCandNotes  = (orgId, id, notes)  => apiRequest("PUT", `${B}/${orgId}/ats/candidates/${id}/notes`, { notes });
export const deleteOrgCandidate  = (orgId, id)  => apiRequest("DELETE",  `${B}/${orgId}/ats/candidates/${id}`);

// Workspace — CRM
export const getOrgLeads    = (orgId, p={}) => apiRequest("GET",    `${B}/${orgId}/crm/leads?${new URLSearchParams(p)}`);
export const addOrgLead     = (orgId, d)    => apiRequest("POST",   `${B}/${orgId}/crm/leads`, d);
export const updateOrgLead  = (orgId, id, d) => apiRequest("PUT",   `${B}/${orgId}/crm/leads/${id}`, d);
export const deleteOrgLead  = (orgId, id)   => apiRequest("DELETE", `${B}/${orgId}/crm/leads/${id}`);
export const getOrgCrmStats = (orgId)       => apiRequest("GET",    `${B}/${orgId}/crm/stats`);

// Workspace — HRMS
export const getOrgEmployees    = (orgId, p={}) => apiRequest("GET",    `${B}/${orgId}/hrms/employees?${new URLSearchParams(p)}`);
export const addOrgEmployee     = (orgId, d)    => apiRequest("POST",   `${B}/${orgId}/hrms/employees`, d);
export const updateOrgEmployee  = (orgId, id, d) => apiRequest("PUT",   `${B}/${orgId}/hrms/employees/${id}`, d);
export const deleteOrgEmployee  = (orgId, id)   => apiRequest("DELETE", `${B}/${orgId}/hrms/employees/${id}`);
export const sendOrgLetter      = (orgId, empId, data)   => apiRequest("POST", `${B}/${orgId}/hrms/employees/${empId}/letter`, data);
export const confirmOrgOffer    = (orgId, empId, action) => apiRequest("PUT",  `${B}/${orgId}/hrms/employees/${empId}/offer`, { action });
export const getOrgLeaves       = (orgId)       => apiRequest("GET",    `${B}/${orgId}/hrms/leaves`);
export const updateOrgLeaveStatus = (orgId, id, status) => apiRequest("PUT", `${B}/${orgId}/hrms/leaves/${id}`, { status });
export const getOrgHrmsStats    = (orgId)       => apiRequest("GET",    `${B}/${orgId}/hrms/stats`);

// Workspace — Dashboard stats
export const getWorkspaceStats = (orgId) => apiRequest("GET", `${B}/${orgId}/workspace/stats`);

// Attendance
export const getAttendance        = (orgId, date)         => apiRequest("GET",  `${B}/${orgId}/attendance?date=${date}`);
export const markAttendance       = (orgId, data)         => apiRequest("POST", `${B}/${orgId}/attendance`, data);
export const bulkMarkAttendance   = (orgId, data)         => apiRequest("POST", `${B}/${orgId}/attendance/bulk`, data);
export const getAttendanceSummary = (orgId, month)        => apiRequest("GET",  `${B}/${orgId}/attendance/summary?month=${month}`);

// Invites
export const sendInvite       = (orgId, data)     => apiRequest("POST",   `${B}/${orgId}/invites`, data);
export const getInvites       = (orgId)            => apiRequest("GET",    `${B}/${orgId}/invites`);
export const cancelInvite     = (orgId, inviteId)  => apiRequest("DELETE", `${B}/${orgId}/invites/${inviteId}`);
export const getInviteByToken = (token)            => apiRequest("GET",    `${B}/invites/${token}`);
export const acceptInvite     = (token)            => apiRequest("POST",   `${B}/invites/${token}/accept`);
