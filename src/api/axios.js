import axios from "axios";

const api = axios.create({
  baseURL: "/api",              // 🔥 SAME-SITE
  withCredentials: true,
});

export default api;
