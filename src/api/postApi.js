import { apiRequest } from "./config";

export const getPosts           = (page = 1) => apiRequest("GET",    `/posts?page=${page}`);
export const getTrendingHashtags = ()        => apiRequest("GET",    "/posts/trending");
export const getMyPosts     = ()         => apiRequest("GET",    "/posts/my");
export const getSavedPosts  = ()         => apiRequest("GET",    "/posts/saved");
export const likePost       = (id, type = "like") => apiRequest("PUT", `/posts/${id}/like`, { type });
export const savePost       = (id)       => apiRequest("PUT",    `/posts/${id}/save`);
export const editPost       = (id, content) => apiRequest("PUT", `/posts/${id}/edit`, { content });
export const commentPost    = (id, text) => apiRequest("POST",   `/posts/${id}/comment`, { text });
export const deletePost     = (id)       => apiRequest("DELETE", `/posts/${id}`);

// Text post → JSON, Image post → FormData
export const createPost = async (data) => {
  const token = localStorage.getItem("nexus_token");
  const isFormData = data instanceof FormData;
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch("http://localhost:5000/api/posts", {
      method: "POST", headers,
      body: isFormData ? data : JSON.stringify(data),
    });
  } catch { throw new Error("Unable to connect to the server. Please make sure the backend is running."); }

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) throw new Error(`Server error (${res.status})`);
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Post failed");
  return result;
};