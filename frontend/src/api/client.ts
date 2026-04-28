import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error Full Response:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      url: error.config?.url,
      method: error.config?.method,
    });
    const message =
      error.response?.data?.message ?? error.message ?? "Network error";
    return Promise.reject(new Error(message));
  },
);

export default apiClient;
