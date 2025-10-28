import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, Mic, LogOut, Calendar, MapPin, Clock } from 'lucide-react';
import { eventsAPI, artistsAPI } from '../services/api';

const TopBar = ({ onSearch }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  // Load notifications on component mount
  useEffect(() => {
    loadNotifications();
    
    // Refresh notifications every 5 minutes
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      // Get upcoming events
      // try endpoint for upcoming events first
      let eventsResponse;
      try {
        eventsResponse = await eventsAPI.getUpcomingEvents();
      } catch (err) {
        // fallback to generic list
        eventsResponse = await eventsAPI.getAllEvents();
      }
      const upcomingEvents = (eventsResponse.data || []).filter(event => {
        const eventDate = new Date(event.date);
        const now = new Date();
        const daysDiff = (eventDate - now) / (1000 * 60 * 60 * 24);
        return daysDiff >= 0 && daysDiff <= 7; // Events in next 7 days
      });

      // Create notifications for upcoming events
      const eventNotifications = upcomingEvents.map(event => ({
        id: event._id,
        type: 'event',
        title: `Upcoming Event: ${event.title}`,
        message: `Your favorite artist has an event coming up!`,
        artist: event.artist,
        date: event.date,
        location: event.location,
        isRead: false,
        createdAt: new Date()
      }));

      setNotifications(eventNotifications);
      setUnreadCount(eventNotifications.filter(n => !n.isRead).length);
      // If there are no upcoming events, create a fallback notification for a followed artist
      if (eventNotifications.length === 0) {
        try {
          const followedRes = await artistsAPI.getFollowedArtists();
          const followed = followedRes.data || [];
          if (followed.length > 0) {
            const artist = followed[0];
            const sampleDate = new Date();
            sampleDate.setDate(sampleDate.getDate() + 3);
            const sampleNotif = {
              id: `sample-${artist._id || artist.id || artist.name}`,
              type: 'event',
              title: `Upcoming: ${artist.name || artist.artistName || 'Your favorite artist'}`,
              message: `${artist.name || artist.artistName || 'Your favorite artist'} has a new show coming up.`,
              artist: artist,
              date: sampleDate.toISOString(),
              location: artist.location || 'TBA',
              isRead: false,
              createdAt: new Date()
            };
            setNotifications([sampleNotif]);
            setUnreadCount(1);
          }
        } catch (err) {
          // ignore errors and keep notifications empty
        }
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
  };

  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const daysDiff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) return 'Today';
    if (daysDiff === 1) return 'Tomorrow';
    if (daysDiff <= 7) return `In ${daysDiff} days`;
    return date.toLocaleDateString();
  };

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
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={async () => {
                // when opening notifications, if empty create 2-3 default items from followed artists
                const opening = !showNotifications;
                if (opening && notifications.length === 0) {
                  try {
                    const followedRes = await artistsAPI.getFollowedArtists();
                    const followed = followedRes.data || [];
                    // allow per-artist custom messages stored in localStorage as JSON
                    let customMap = {};
                    try {
                      const raw = localStorage.getItem('artistNotificationMessages');
                      if (raw) customMap = JSON.parse(raw);
                    } catch (e) {
                      console.warn('Invalid artistNotificationMessages in localStorage');
                    }

                    const defaults = (followed.length ? followed : [{ name: 'Your favorite artist' }]).slice(0,3).map((artist, i) => {
                      const key = artist._id || artist.id || artist.name || `idx-${i}`;
                      const customMsg = customMap[key] || artist.notificationMessage || artist.defaultNotificationMessage;
                      const message = customMsg || `Here is your favorite artist upcoming event`;
                      return {
                        id: `default-${i}-${key}`,
                        type: 'event',
                        title: `Upcoming: ${artist.name || artist.artistName || 'Favorite Artist'}`,
                        message,
                        artist: artist,
                        // no date/location provided per request
                        isRead: false,
                        createdAt: new Date()
                      };
                    });

                    setNotifications(defaults);
                    setUnreadCount(defaults.length);
                  } catch (err) {
                    // fallback to a single generic default
                    const single = [{
                      id: 'default-generic',
                      type: 'event',
                      title: 'Upcoming: Your favorite artist',
                      message: 'Here is your favorite artist upcoming event',
                      isRead: false,
                      createdAt: new Date()
                    }];
                    setNotifications(single);
                    setUnreadCount(1);
                  }
                }
                setShowNotifications(!showNotifications);
              }}
              className="relative text-slate-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-slate-700/50"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                  <h3 className="text-white font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-400">No notifications yet</p>
                      <p className="text-slate-500 text-sm">We'll notify you about upcoming events</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={`px-4 py-3 border-b border-slate-700/50 cursor-pointer hover:bg-slate-700/30 transition-colors ${
                          !notification.isRead ? 'bg-blue-900/20 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${!notification.isRead ? 'text-white' : 'text-slate-300'}`}>
                              {notification.title}
                            </p>
                            <p className="text-slate-400 text-xs mt-1">
                              {notification.message}
                            </p>
                            {(notification.location || notification.date) && (
                              <div className="flex items-center mt-2 space-x-4 text-xs text-slate-400">
                                {notification.location && (
                                  <div className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    <span>{notification.location}</span>
                                  </div>
                                )}
                                {notification.date && (
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{formatEventDate(notification.date)}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          {!notification.isRead && (
                            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="px-4 py-3 border-t border-slate-700 bg-slate-700/30">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/events');
                      }}
                      className="w-full text-center text-blue-400 hover:text-blue-300 text-sm transition-colors"
                    >
                      View all events →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

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