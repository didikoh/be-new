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
    const message =
      error.response?.data?.message ?? error.message ?? "Network error";
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
