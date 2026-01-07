import { useState } from "react";
import api from "../../api/axios";
import { API } from "../../api/routes";

export default function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      await api.post(API.AUTH.LOGIN, { username, password });
      return true;
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      await api.post(API.AUTH.REGISTER, { username, password });
      return true;
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
  try {
    await api.post(API.AUTH.LOGOUT);
  } finally {
    window.location.href = "/login"; 
  }
}

  return { login, register, logout, loading, error };
}
