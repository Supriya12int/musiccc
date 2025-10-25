import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, Mic, LogOut } from 'lucide-react';

const TopBar = ({ onSearch }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleArtistClick = () => {
    console.log('Artist button clicked - going to artist auth page');
    navigate('/artist/auth');
  };

  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                className="block w-full pl-10 pr-3 py-3 border border-slate-600/50 rounded-xl bg-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                placeholder="Search for songs, artists, albums..."
              />
            </div>
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Artist & Admin Portal Button */}
          <button 
            onClick={handleArtistClick}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Mic className="h-4 w-4 mr-2" />
            Artist Portal
          </button>

          {/* Notifications */}
          <button className="text-slate-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-slate-700/50">
            <Bell className="h-5 w-5" />
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-md">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-white" />
              )}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400">@{user?.username}</p>
            </div>
          </div>
        </div>
      </div>


    </header>
  );
};

export default TopBar;