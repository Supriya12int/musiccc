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

    const result = await login(formData);
    if (result.success) {
      // Check if user is actually an artist using the response data
      console.log('Login result:', result);
      console.log('User role:', result.user?.role);
      
      if (result.user?.role === 'artist' || result.user?.role === 'admin') {
        console.log('Redirecting to artist dashboard');
        navigate('/artist/dashboard');
      } else {
        console.log('Redirecting to regular dashboard');
        navigate('/dashboard');
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Mic className="h-12 w-12 text-white" />
            <span className="ml-2 text-2xl font-bold text-white">Artist Portal</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">Welcome back, Artist</h2>
          <p className="mt-2 text-sm text-gray-300">
            Sign in to your artist account to manage your music
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

            <div className="text-center">
              <p className="text-sm text-gray-300">
                Don't have an artist account?{' '}
                <Link
                  to="/artist/register"
                  className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-200"
                >
                  Sign up as Artist
                </Link>
              </p>
              <p className="text-sm text-gray-300 mt-2">
                Regular user?{' '}
                <Link
                  to="/login"
                  className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-200"
                >
                  User Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ArtistLogin;