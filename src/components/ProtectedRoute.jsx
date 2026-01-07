import { Navigate } from "react-router-dom";
import api from "../api/axios";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    api
      .get("/users/me/customer", { withCredentials: true })
      .then(() => setAllowed(true))
      .catch(() => setAllowed(false))
      .finally(() => setChecking(false));
  }, []);

  if (checking) return null; // or spinner
  if (!allowed) return <Navigate to="/login" replace />;

  return children;
}
