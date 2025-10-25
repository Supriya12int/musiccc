import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ArtistRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  console.log('ArtistRoute - isAuthenticated:', isAuthenticated);
  console.log('ArtistRoute - user:', user);
  console.log('ArtistRoute - user role:', user?.role);
  console.log('ArtistRoute - loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to artist login');
    return <Navigate to="/artist/auth" replace />;
  }

  // Allow all authenticated users to access artist features
  console.log('User is authenticated, showing artist dashboard');
  return children;
};

export default ArtistRoute;