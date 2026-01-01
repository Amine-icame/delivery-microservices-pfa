import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');

  // 1. Si pas de token, retour au Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. On décode le token pour vérifier le rôle
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userRole = payload.role;

    // 3. Si le rôle de l'user n'est pas dans la liste autorisée
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      // Redirection intelligente : on le renvoie vers son propre espace
      if (userRole === 'DRIVER') return <Navigate to="/driver/dashboard" replace />;
      if (userRole === 'CUSTOMER') return <Navigate to="/client/dashboard" replace />;
      if (userRole === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
      return <Navigate to="/" replace />;
    }

    // 4. Tout est bon, on affiche la page
    return children;

  } catch (error) {
    // Si token corrompu
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;