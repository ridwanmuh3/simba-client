import axios from "axios";
import camelcaseKeys from "camelcase-keys";
import snakecaseKeys from "snakecase-keys";
import { isPlainObject } from "./utils";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
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

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => {
    const contentType = response.headers["content-type"];

    if (response.data && contentType?.includes("application/json")) {
      response.data = camelcaseKeys(response.data, { deep: true });
    }

    return response;
  },
  (error) => Promise.reject(error),
);
