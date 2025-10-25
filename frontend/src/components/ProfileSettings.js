import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Bell, 
  Eye, 
  EyeOff, 
  Save, 
  Upload, 
  Camera, 
  Edit3,
  Check,
  X,
  AlertCircle,
  Lock,
  Trash2,
  Download,
  Music,
  Mic,
  Heart,
  BarChart3
} from 'lucide-react';

const ProfileSettings = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Profile data
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    dateOfBirth: user?.dateOfBirth || '',
    location: user?.location || '',
    website: user?.website || '',
    avatar: user?.avatar || ''
  });
  
  // Password change data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Preferences
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    autoPlay: true,
    privateProfile: false,
    showActivity: true,
    defaultVolume: 70,
    theme: 'dark'
  });
  
  // Stats
  const [userStats, setUserStats] = useState({
    totalSongs: 0,
    totalPlays: 0,
    totalRecordings: 0,
    favoriteGenre: 'Not specified',
    joinDate: user?.createdAt || new Date().toISOString()
  });

  useEffect(() => {
    loadUserProfile();
    loadUserStats();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await usersAPI.getProfile();
      if (response.data) {
        setProfileData({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          bio: response.data.bio || '',
          dateOfBirth: response.data.dateOfBirth || '',
          location: response.data.location || '',
          website: response.data.website || '',
          avatar: response.data.avatar || ''
        });
        
        if (response.data.preferences) {
          setPreferences({
            ...preferences,
            ...response.data.preferences
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage('Failed to load profile data');
    }
  };

  const loadUserStats = async () => {
    try {
      // This would be an actual API call in a real app
      // For now, we'll use mock data
      setUserStats({
        totalSongs: 42,
        totalPlays: 1337,
        totalRecordings: 15,
        favoriteGenre: 'Hindi',
        joinDate: user?.createdAt || new Date().toISOString()
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      await usersAPI.updateProfile(profileData);
      setMessage('✅ Profile updated successfully!');
    } catch (error) {
      setMessage('❌ Failed to update profile: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('❌ New passwords do not match');
      setLoading(false);
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage('❌ New password must be at least 6 characters long');
      setLoading(false);
      return;
    }
    
    try {
      await usersAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage('✅ Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage('❌ Failed to change password: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await usersAPI.updatePreferences(preferences);
      setMessage('✅ Preferences updated successfully!');
    } catch (error) {
      setMessage('❌ Failed to update preferences: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await usersAPI.uploadAvatar(formData);
      setProfileData({ ...profileData, avatar: response.data.url });
      setMessage('✅ Avatar updated successfully!');
    } catch (error) {
      setMessage('❌ Failed to upload avatar: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation !== 'DELETE') {
      setMessage('❌ Account deletion cancelled');
      return;
    }
    
    setLoading(true);
    
    try {
      await usersAPI.deleteAccount();
      setMessage('Account deleted successfully. You will be logged out.');
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (error) {
      setMessage('❌ Failed to delete account: ' + (error.response?.data?.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Profile & Settings</h1>
        <p className="text-gray-400">Manage your account, preferences, and privacy settings</p>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.includes('❌') 
            ? 'bg-red-900/20 border-red-500 text-red-200'
            : 'bg-green-900/20 border-green-500 text-green-200'
        }`}>
          <div className="flex items-center">
            {message.includes('❌') ? (
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            ) : (
              <Check className="h-5 w-5 mr-2 flex-shrink-0" />
            )}
            {message}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg p-4 sticky top-6">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('profile')}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                  activeSection === 'profile'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <User className="h-4 w-4 mr-3" />
                Profile Info
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeSection === 'profile' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Profile Information</h2>
                <Edit3 className="h-5 w-5 text-gray-400" />
              </div>

              {/* Avatar Section */}
              <div className="mb-8 text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                    {profileData.avatar ? (
                      <img
                        src={profileData.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-white" />
                    )}
                  </div>
                  <label className="absolute bottom-4 right-0 bg-purple-600 hover:bg-purple-700 rounded-full p-2 cursor-pointer transition-colors duration-200">
                    <Camera className="h-4 w-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <h3 className="text-lg font-semibold text-white">{profileData.firstName} {profileData.lastName}</h3>
                <p className="text-gray-400">{user?.role === 'admin' ? '👑 Admin' : user?.role === 'artist' ? '🎵 Artist' : '🎧 Music Lover'}</p>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      placeholder="Your first name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      placeholder="Your last name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors duration-200"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;