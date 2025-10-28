import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MusicProvider } from './context/MusicContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthRedirect from './components/AuthRedirect';
import ArtistRoute from './components/ArtistRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ArtistLogin from './pages/ArtistLogin';
import ArtistAuth from './pages/ArtistAuth';
import ArtistUpload from './pages/ArtistUpload';
import Dashboard from './pages/Dashboard';
import ArtistDashboard from './pages/ArtistDashboard';
import PlaylistsPage from './pages/PlaylistsPage';
import Podcasts from './pages/Podcasts';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <MusicProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route 
                path="/login" 
                element={
                  <AuthRedirect>
                    <Login />
                  </AuthRedirect>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <AuthRedirect>
                    <Register />
                  </AuthRedirect>
                } 
              />
              <Route 
                path="/artist/login" 
                element={
                  <AuthRedirect>
                    <ArtistLogin />
                  </AuthRedirect>
                } 
              />
              <Route 
                path="/artist/auth" 
                element={<ArtistAuth />}
              />
              <Route 
                path="/artist/register" 
                element={
                  <AuthRedirect>
                    <Register />
                  </AuthRedirect>
                } 
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/playlists"
                element={
                  <ProtectedRoute>
                    <PlaylistsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/podcasts"
                element={
                  <ProtectedRoute>
                    <Podcasts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/artist/upload"
                element={
                  <ArtistRoute>
                    <ArtistUpload />
                  </ArtistRoute>
                }
              />
              <Route
                path="/artist/dashboard"
                element={
                  <ArtistRoute>
                    <ArtistDashboard />
                  </ArtistRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </MusicProvider>
    </AuthProvider>
  );
}

export default App;