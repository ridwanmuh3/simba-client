import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import camelcaseKeys from "camelcase-keys";
import snakecaseKeys from "snakecase-keys";
import { isPlainObject } from "@/lib/utils";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const CSRF_COOKIE_NAME = "csrf_";
const CSRF_HEADER_NAME = "X-Csrf-Token";
const UNSAFE_METHODS = new Set(["post", "put", "patch", "delete"]);

let csrfTokenPromise: Promise<string> | null = null;

const isUnsafeMethod = (method?: string) =>
  UNSAFE_METHODS.has((method ?? "get").toLowerCase());

const readCookie = (name: string) => {
  if (typeof document === "undefined") return "";
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
};

const fetchCsrfToken = async () => {
  if (!csrfTokenPromise) {
    csrfTokenPromise = axios
      .get("/auth/csrf", {
        baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
        withCredentials: true,
      })
      .then(() => readCookie(CSRF_COOKIE_NAME))
      .finally(() => {
        csrfTokenPromise = null;
      });
  }
  return csrfTokenPromise;
};

const ensureCsrfToken = async () => {
  const existing = readCookie(CSRF_COOKIE_NAME);
  if (existing) return existing;
  return fetchCsrfToken();
};

axiosInstance.interceptors.request.use(
  async (config) => {
    if (
      config.data &&
      isPlainObject(config.data) &&
      !(config.data instanceof FormData)
    ) {
      config.data = snakecaseKeys(config.data, { deep: true });
    }

    if (config.params && isPlainObject(config.params)) {
      config.params = snakecaseKeys(config.params, { deep: true });
    }

    if (isUnsafeMethod(config.method) && config.url !== "/auth/csrf") {
      const token = await ensureCsrfToken();
      if (token) {
        config.headers.set(CSRF_HEADER_NAME, token);
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _csrfRetry?: boolean;
};

interface FailedQueuePromise {
  resolve: () => void;
  reject: (reason?: unknown) => void;
}

let failedQueue: FailedQueuePromise[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    const contentType = response.headers["content-type"];
    if (response.data && contentType?.includes("application/json")) {
      response.data = camelcaseKeys(response.data, { deep: true });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status === 403 &&
      originalRequest &&
      isUnsafeMethod(originalRequest.method) &&
      !originalRequest._csrfRetry &&
      originalRequest.url !== "/auth/csrf"
    ) {
      originalRequest._csrfRetry = true;
      const token = await fetchCsrfToken();
      if (token) {
        originalRequest.headers.set(CSRF_HEADER_NAME, token);
      }
      return axiosInstance(originalRequest);
    }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/login" &&
      originalRequest.url !== "/auth/refresh" &&
      originalRequest.url !== "/auth/logout"
    ) {
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.post("/auth/refresh");
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError: unknown) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
