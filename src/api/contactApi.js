import { apiRequest } from "./config";
export const submitContact = (data) => apiRequest("POST", "/contact", data);
