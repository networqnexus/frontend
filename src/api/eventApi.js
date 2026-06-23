import { apiRequest } from "./config";

export const getEvents      = ()        => apiRequest("GET",    "/events");
export const getPastEvents  = ()        => apiRequest("GET",    "/events/past");
export const getMyEvents    = ()        => apiRequest("GET",    "/events/mine");
export const createEvent    = (data)    => apiRequest("POST",   "/events", data);
export const attendEvent    = (id)      => apiRequest("PUT",    `/events/${id}/attend`);
export const deleteEvent    = (id)      => apiRequest("DELETE", `/events/${id}`);
