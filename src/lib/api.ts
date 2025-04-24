import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: "https://koink-backend-production.up.railway.app",
});

type QueueItem = {
    resolve: (value?: string) => void;
    reject: (error: unknown) => void;
  };
  
  let isRefreshing = false;
  let failedQueue: QueueItem[] = [];
  
  const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
      if (token) {
        prom.resolve(token);
      } else {
        prom.reject(error);
      }
    });
  
    failedQueue = [];
  };
  

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers)
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem("refreshToken");

      try {
        const response = await axios.post(
          "https://koink-backend-production.up.railway.app/api/auth/refresh-token",
          { refreshToken }
        );

        const newAccessToken = response.data.accessToken;
        localStorage.setItem("token", newAccessToken);
        processQueue(null, newAccessToken);

        if (originalRequest.headers)
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
