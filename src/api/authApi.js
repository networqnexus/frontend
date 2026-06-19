const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const request = async (method, endpoint, body = null, token = null) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);
  let res;
  try { res = await fetch(`${BASE_URL}${endpoint}`, config); }
  catch { throw new Error("Backend se connect nahi ho pa raha."); }
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) throw new Error("Server error.");
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
};

export const googleLogin        = (p)       => request("POST", "/auth/google", p);
export const signup             = (p)       => request("POST", "/auth/signup", p);
export const login              = (p)       => request("POST", "/auth/login", p);
export const completeOnboarding = (t, body) => request("PUT",  "/auth/complete-onboarding", body, t);
export const verifyEmail        = (token)   => request("GET",  `/auth/verify-email?token=${token}`);
export const resendVerification = (p)       => request("POST", "/auth/resend-verification", p);
export const forgotPassword     = (p)       => request("POST", "/auth/forgot-password", p);
export const resetPassword      = (p)       => request("POST", "/auth/reset-password", p);
