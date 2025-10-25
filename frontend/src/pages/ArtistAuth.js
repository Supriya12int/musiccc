import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Mic, UserPlus, LogIn, X, ArrowLeft } from 'lucide-react';

const ArtistAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    login: '',
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) clearError();
  };

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login logic - works for all user types
        console.log('Attempting login with:', formData.login);
        const result = await login({ 
          login: formData.login, 
          password: formData.password 
        });
        
        console.log('Login result:', result);
        
        if (result.success) {
          console.log('Login successful, redirecting to artist dashboard');
          navigate('/artist/dashboard', { replace: true });
        }
      } else {
        // Signup logic - creates regular users by default
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match');
          setIsLoading(false);
          return;
        }

        console.log('Attempting user registration');
        const result = await register({
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
          role: 'user' // Default to regular user
        });

        console.log('Registration result:', result);

        if (result.success) {
          console.log('User registered successfully, redirecting to upload page');
          navigate('/artist/upload', { replace: true });
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Modal Background
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Modal Content */}
      <div className="bg-slate-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-700/50 shadow-2xl">
        {/* Modal Header with Close Button */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <button
            onClick={handleClose}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <Mic className="h-6 w-6 text-blue-400" />
            <span className="text-lg font-bold text-white">MUSICCC</span>
          </div>

          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors duration-200 p-1 rounded-lg hover:bg-slate-700/50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isLogin ? 'Welcome to MUSICCC' : 'Join MUSICCC'}
            </h2>
            <p className="text-sm text-slate-300">
              {isLogin 
                ? 'Sign in to access music upload, streaming, and content management features'
                : 'Create your account to start your musical journey with us'
              }
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="bg-slate-700/30 rounded-xl p-1.5 border border-slate-600/50">
            <div className="flex">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 flex items-center justify-center py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isLogin
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                }`}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 flex items-center justify-center py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  !isLogin
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                }`}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </button>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Login Form */}
            {isLogin ? (
              <>
                <div>
                  <label htmlFor="login" className="block text-sm font-medium text-slate-300 mb-2">
                    Email or Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="login"
                      name="login"
                      type="text"
                      required
                      className="w-full pl-10 pr-3 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your email or username"
                      value={formData.login}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full pl-10 pr-10 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        className="text-slate-400 hover:text-white focus:outline-none"
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
              </>
            ) : (
              /* Signup Form */
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-300 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-slate-300 mb-2">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="w-full pl-10 pr-3 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full pl-10 pr-3 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full pl-10 pr-10 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Create password (min 6 characters)"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        className="text-slate-400 hover:text-white focus:outline-none"
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
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      className="w-full pl-10 pr-10 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        className="text-slate-400 hover:text-white focus:outline-none"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </div>

            {isLogin && (
              <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/20">
                <p className="text-xs text-blue-300 mb-2 font-medium">🔐 Demo Credentials:</p>
                <p className="text-xs text-slate-300">🎤 Artist: artist@musiccc.com / artist123</p>
                <p className="text-xs text-slate-300">👑 Admin: admin@musiccc.com / admin123</p>
              </div>
            )}

            <div className="text-center">
              <p className="text-xs text-slate-400">
                Need help?{' '}
                <Link
                  to="/help"
                  className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  Contact Support
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ArtistAuth;