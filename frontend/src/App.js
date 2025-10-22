import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MusicProvider } from './context/MusicContext';
import ProtectedRoute from './components/ProtectedRoute';
import ArtistRoute from './components/ArtistRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ArtistLogin from './pages/ArtistLogin';
import Dashboard from './pages/Dashboard';
import ArtistDashboard from './pages/ArtistDashboard';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <MusicProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/artist/login" element={<ArtistLogin />} />
              <Route path="/artist/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
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