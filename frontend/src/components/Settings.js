import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import { 
  Shield, 
  Bell, 
  Eye, 
  EyeOff, 
  Save, 
  Check,
  AlertCircle,
  Lock,
  Trash2
} from 'lucide-react';

const Settings = () => {
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState('preferences');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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

  const loadUserPreferences = async () => {
    try {
      const response = await usersAPI.getProfile();
      if (response.data?.preferences) {
        setPreferences(prevPreferences => ({
          ...prevPreferences,
          ...response.data.preferences
        }));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  useEffect(() => {
    loadUserPreferences();
  }, []);

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

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your preferences and security settings</p>
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
                onClick={() => setActiveSection('preferences')}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                  activeSection === 'preferences'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Bell className="h-4 w-4 mr-3" />
                Preferences
              </button>
              
              <button
                onClick={() => setActiveSection('security')}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                  activeSection === 'security'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Shield className="h-4 w-4 mr-3" />
                Security
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeSection === 'preferences' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Preferences</h2>
                <Bell className="h-5 w-5 text-gray-400" />
              </div>

              <div className="space-y-6">
                {/* Notifications */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-gray-300 font-medium">Email Notifications</label>
                        <p className="text-gray-400 text-sm">Receive updates via email</p>
                      </div>
                      <button
                        onClick={() => setPreferences({ ...preferences, emailNotifications: !preferences.emailNotifications })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences.emailNotifications ? 'bg-purple-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-gray-300 font-medium">Push Notifications</label>
                        <p className="text-gray-400 text-sm">Receive browser notifications</p>
                      </div>
                      <button
                        onClick={() => setPreferences({ ...preferences, pushNotifications: !preferences.pushNotifications })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences.pushNotifications ? 'bg-purple-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Playback */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Playback</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-gray-300 font-medium">Auto Play</label>
                        <p className="text-gray-400 text-sm">Automatically play next song</p>
                      </div>
                      <button
                        onClick={() => setPreferences({ ...preferences, autoPlay: !preferences.autoPlay })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences.autoPlay ? 'bg-purple-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.autoPlay ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <label className="block text-gray-300 font-medium mb-2">Default Volume</label>
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-400 text-sm">0%</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={preferences.defaultVolume}
                          onChange={(e) => setPreferences({ ...preferences, defaultVolume: parseInt(e.target.value) })}
                          className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <span className="text-gray-400 text-sm">100%</span>
                        <span className="text-white font-medium w-12 text-right">{preferences.defaultVolume}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Privacy */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Privacy</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-gray-300 font-medium">Private Profile</label>
                        <p className="text-gray-400 text-sm">Hide your profile from other users</p>
                      </div>
                      <button
                        onClick={() => setPreferences({ ...preferences, privateProfile: !preferences.privateProfile })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences.privateProfile ? 'bg-purple-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.privateProfile ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-gray-300 font-medium">Show Activity</label>
                        <p className="text-gray-400 text-sm">Show your listening activity to friends</p>
                      </div>
                      <button
                        onClick={() => setPreferences({ ...preferences, showActivity: !preferences.showActivity })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences.showActivity ? 'bg-purple-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.showActivity ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePreferencesUpdate}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors duration-200"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Save Preferences
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Security Settings</h2>
                <Shield className="h-5 w-5 text-gray-400" />
              </div>

              {/* Password Change */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white pr-12"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-9 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white pr-12"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-9 text-gray-400 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white pr-12"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-9 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors duration-200"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Changing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5 mr-2" />
                        Change Password
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Danger Zone */}
              <div className="border-t border-gray-700 pt-8">
                <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
                <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                  <h4 className="font-medium text-red-300 mb-2">Delete Account</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;