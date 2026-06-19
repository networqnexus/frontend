const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiRequest = async (method, endpoint, body = null, isFormData = false) => {
  const token = localStorage.getItem("nexus_token");
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData) headers["Content-Type"] = "application/json";

  const config = { method, headers };
  if (body) config.body = isFormData ? body : JSON.stringify(body);

  let res;
  try {
    res = await fetch(`${BASE_URL}${endpoint}`, config);
  } catch {
    throw new Error("Server se connect nahi ho pa raha. Backend chalao.");
  }

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) throw new Error(`Server error (${res.status})`);

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
};
