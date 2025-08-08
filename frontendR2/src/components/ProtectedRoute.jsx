// import React from "react";
// import { Navigate } from "react-router-dom";
// const ProtectedRoute = ({ role, children }) => {
//   const userData = localStorage.getItem("user");
//   const token = localStorage.getItem("token");
//   if (!token || !userData) {
//     return <Navigate to="/api/auth/login" />;
//   }
//   const user = JSON.parse(userData);
//   if (user.role != role) {
//     return <Navigate to="/api/auth/login" />;
//   }
//   return children;
// };

// export default ProtectedRoute;
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ role, children }) => {
  const userData = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  if (!token || !userData) {
    return <Navigate to="/api/auth/login" />;
  }

  const user = JSON.parse(userData);

  // Si "role" est fourni
  if (role) {
    // Vérifie si "role" est un tableau ou une seule chaîne
    const rolesArray = Array.isArray(role) ? role : [role];

    if (!rolesArray.includes(user.role)) {
      return <Navigate to="/api/auth/login" />;
    }
  }

  return children;
};

export default ProtectedRoute;
