import axios from "axios";

export const api = axios.create({
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const runtimeConfig = useRuntimeConfig();

  config.baseURL = runtimeConfig.public.apiBaseUrl;

  const token = useCookie<string | null>("auth_token").value;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
