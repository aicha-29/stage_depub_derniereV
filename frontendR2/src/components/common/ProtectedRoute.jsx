import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import api from "../../api/intercepteur"; // Importez votre instance axios configurée

const ProtectedRoute = ({ role, children }) => {
  const userRole = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const checkToken = async () => {
      try {
        // Vérifier la validité du token
        await api.get('/auth/verify-token');
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    };

    if (token) {
      checkToken();
    }
  }, [token]);

  if (!token || !userRole) {
    return <Navigate to="/login" />;
  }

  if (userRole !== role) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;