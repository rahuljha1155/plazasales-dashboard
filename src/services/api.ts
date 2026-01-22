import axios from "axios";

//for production
const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://app.plazasales.com.np/api/v1/plaza";
const API2_BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://app.plazasales.com.np/api/v1/plaza";

//for development
// const API_BASE_URL = "/api";
// const API2_BASE_URL = "/api";

let recaptchaTokenGetter: (() => Promise<string | null>) | null = null;

export const setRecaptchaTokenGetter = (
  getter: () => Promise<string | null>,
) => {
  recaptchaTokenGetter = getter;
};

async function injectRecaptchaToken(config: any) {
  if (!recaptchaTokenGetter) {
    return config;
  }

  try {
    const token = await recaptchaTokenGetter();

    if (token) {
      config.headers["X-Recaptcha-Token"] = token;
    }
  } catch (err) {}

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(injectRecaptchaToken);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 400 &&
      error.response?.data?.message?.toLowerCase().includes("recaptcha") &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (recaptchaTokenGetter) {
        try {
          const newToken = await recaptchaTokenGetter();
          if (newToken) {
            originalRequest.headers["X-Recaptcha-Token"] = newToken;
            return api(originalRequest);
          }
        } catch (retryError) {
          // Retry failed
        }
      }
    }

    if (
      error.response?.status === 401 &&
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/register"
    ) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      alert("Session expired. Please log in again.");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const api2 = axios.create({
  baseURL: API2_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api2.interceptors.request.use(injectRecaptchaToken);

api2.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 400 &&
      error.response?.data?.message?.toLowerCase().includes("recaptcha") &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (recaptchaTokenGetter) {
        try {
          const newToken = await recaptchaTokenGetter();
          if (newToken) {
            originalRequest.headers["X-Recaptcha-Token"] = newToken;
            return api2(originalRequest);
          }
        } catch (retryError) {
          // Retry failed
        }
      }
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      alert("Session expired. Please log in again.");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
