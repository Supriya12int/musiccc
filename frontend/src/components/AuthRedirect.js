import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthRedirect = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();

  // Prevent back button navigation to auth pages when logged in
  useEffect(() => {
    if (isAuthenticated) {
      // Replace current history entry to prevent back button access
      const targetPath = user?.role === 'artist' ? '/artist/dashboard' : '/dashboard';
      window.history.replaceState(null, '', targetPath);
    }
  }, [isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect based on user role
    if (user?.role === 'artist') {
      return <Navigate to="/artist/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default AuthRedirect;