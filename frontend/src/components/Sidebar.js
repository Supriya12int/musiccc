import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Music, List, Search, Settings, LogOut, User, Heart, Users, Clock, Calendar, Mic } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'discover', label: 'Discover', icon: Home },
    { id: 'recently-played', label: 'Recently Played', icon: Clock },
    { id: 'playlists', label: 'Playlists', icon: List, isRoute: true, route: '/playlists' },
    { id: 'karaoke-library', label: 'Karaoke Library', icon: Mic },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Your Library', icon: Music },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'artists', label: 'Browse Artists', icon: Users },
    { id: 'following', label: 'Following', icon: Heart },
  ];

  const handleMenuClick = (item) => {
    if (item.isRoute) {
      navigate(item.route);
    } else {
      setActiveTab(item.id);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-64 bg-slate-900/70 backdrop-blur-sm h-screen flex flex-col border-r border-slate-700/50">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
            <Music className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">MusicHub Pro</span>
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
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    (item.isRoute && location.pathname === item.route) || (!item.isRoute && activeTab === item.id)
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
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
            className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
            }`}
          >
            <User className="h-5 w-5 mr-3" />
            Profile
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
            }`}
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-lg text-left text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition-all duration-200"
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