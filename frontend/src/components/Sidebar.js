import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Home, Music, List, Search, Settings, LogOut, User, Heart, Users, Clock, Calendar, Mic } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { logout } = useAuth();

  const menuItems = [
    { id: 'discover', label: 'Discover', icon: Home },
    { id: 'recently-played', label: 'Recently Played', icon: Clock },
    { id: 'karaoke-library', label: 'Karaoke Library', icon: Mic },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Your Library', icon: Music },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'artists', label: 'Browse Artists', icon: Users },
    { id: 'following', label: 'Following', icon: Heart },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-64 bg-gray-800 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center">
          <Music className="h-8 w-8 text-purple-400" />
          <span className="ml-2 text-xl font-bold text-white">All Music</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                    activeTab === item.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-700">
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
              activeTab === 'profile'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <User className="h-5 w-5 mr-3" />
            Profile
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
              activeTab === 'settings'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-300 hover:bg-red-600 hover:text-white transition-colors duration-200"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;