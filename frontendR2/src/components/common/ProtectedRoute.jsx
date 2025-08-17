<<<<<<< HEAD
import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import api from "../../api/intercepteur"; // Importez votre instance axios configurée

=======
import React from "react";
import { Navigate } from "react-router-dom";
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
const ProtectedRoute = ({ role, children }) => {
  const userRole = localStorage.getItem("role");
  const token = localStorage.getItem("token");

<<<<<<< HEAD
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
=======
  if (!token || !userRole) {
    return <Navigate to="/login" />;
  }
  if (userRole != role) {
    return <Navigate to="/login" />;
  }
  return children;
};

export default ProtectedRoute;
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
