import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Music, Eye, EyeOff, Mail, Lock, Mic } from 'lucide-react';

const ArtistLogin = () => {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Attempting artist/admin login with:', formData.login);
      const result = await login(formData);
      
      console.log('Login result:', result);
      
      if (result.success) {
        const userRole = result.user?.role;
        console.log('User role:', userRole);
        console.log('User data:', result.user);
        
        if (userRole === 'artist' || userRole === 'admin') {
          console.log('Redirecting to artist dashboard');
          navigate('/artist/dashboard', { replace: true });
        } else {
          console.log('User role is not artist/admin, redirecting to regular dashboard');
          alert('This login is for artists and admins only. Redirecting to user dashboard.');
          navigate('/dashboard', { replace: true });
        }
      } else {
        console.error('Login failed:', result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Mic className="h-12 w-12 text-white" />
            <span className="ml-2 text-2xl font-bold text-white">Artist & Admin Portal</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-300">
            Sign in to manage music, upload content, and access admin features
          </p>
        </div>

        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-8 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-100 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login" className="sr-only">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="login"
                  name="login"
                  type="text"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 border-opacity-30 placeholder-gray-400 text-white rounded-lg bg-white bg-opacity-10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:z-10 sm:text-sm"
                  placeholder="Email or Username"
                  value={formData.login}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 border-opacity-30 placeholder-gray-400 text-white rounded-lg bg-white bg-opacity-10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? 'Signing in...' : 'Sign in as Artist'}
              </button>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-300">
                Don't have an account?{' '}
                <Link
                  to="/artist/register"
                  className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-200"
                >
                  Sign up as Artist
                </Link>
              </p>
              <p className="text-sm text-gray-300">
                Regular user?{' '}
                <Link
                  to="/login"
                  className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-200"
                >
                  User Login
                </Link>
              </p>
              <div className="bg-purple-900/30 rounded-lg p-3 mt-4 border border-purple-500/20">
                <p className="text-xs text-purple-300 mb-2">🔐 Demo Credentials:</p>
                <p className="text-xs text-gray-300">🎤 Artist: artist@musiccc.com / artist123</p>
                <p className="text-xs text-gray-300">👑 Admin: admin@musiccc.com / admin123</p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ArtistLogin;