import axios from "axios";

const api = axios.create({
  baseURL: "https://thesis-flask.onrender.com",
  withCredentials: true, // keep this if you are using cookies/sessions
});

export default api;
