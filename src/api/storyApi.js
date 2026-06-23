import { apiRequest } from "./config";

export const getStories   = ()        => apiRequest("GET",    "/stories");
export const viewStory    = (id)      => apiRequest("PUT",    `/stories/${id}/view`);
export const deleteStory  = (id)      => apiRequest("DELETE", `/stories/${id}`);

export const createStory = async ({ caption, bgColor, mediaFile }) => {
  const token = localStorage.getItem("nexus_token");
  const formData = new FormData();
  if (caption)   formData.append("caption",  caption);
  if (bgColor)   formData.append("bgColor",  bgColor);
  if (mediaFile) formData.append("media",    mediaFile);

  const res = await fetch(`${import.meta.env.VITE_API_URL}/stories`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create story");
  return data;
};
