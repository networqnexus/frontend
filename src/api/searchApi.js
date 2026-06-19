import { apiRequest } from "./config";
export const search = (q, type) => apiRequest("GET", `/search?q=${encodeURIComponent(q)}${type ? `&type=${type}` : ""}`);
