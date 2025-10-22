import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../services/api';
import EventCard from './EventCard';
import { Calendar, Star, Users, Filter } from 'lucide-react';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [followedEvents, setFollowedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [eventType, setEventType] = useState('');

  const filters = [
    { id: 'all', label: 'All Events', icon: Calendar },
    { id: 'following', label: 'Following', icon: Star },
    { id: 'upcoming', label: 'Upcoming', icon: Users }
  ];

  const eventTypes = [
    { value: '', label: 'All Types' },
    { value: 'concert', label: '🎤 Concerts' },
    { value: 'virtual-concert', label: '💻 Virtual' },
    { value: 'album-release', label: '💿 Album Launch' },
    { value: 'festival', label: '🎪 Festivals' },
    { value: 'meet-greet', label: '🤝 Meet & Greet' },
    { value: 'online-live', label: '📺 Online Live' }
  ];

  useEffect(() => {
    loadEvents();
  }, [activeFilter, eventType]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      let response;

      switch (activeFilter) {
        case 'following':
          response = await eventsAPI.getFollowedArtistsEvents();
          setEvents(response.data.events || []);
          break;
        case 'upcoming':
          response = await eventsAPI.getUpcomingEvents();
          setEvents(response.data.events || []);
          break;
        default:
          const params = eventType ? { type: eventType } : {};
          response = await eventsAPI.getAllEvents(params);
          setEvents(response.data.events || []);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestChange = (eventId, isInterested) => {
    // Update local state if needed
    console.log(`Event ${eventId} interest changed to ${isInterested}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">Events & Concerts</h1>
          </div>
          
          {/* Event Type Filter */}
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
            >
              {eventTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-gray-400">
          Discover concerts and events from your favorite artists
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 mb-8 w-fit">
        {filters.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                activeFilter === filter.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md mx-auto">
            <Calendar className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {activeFilter === 'following' 
                ? 'No events from followed artists'
                : 'No events available'
              }
            </h3>
            <p className="text-gray-500 mb-6">
              {activeFilter === 'following'
                ? 'Follow more artists to get notifications about their events'
                : 'Check back later for new events and concerts'
              }
            </p>
            {activeFilter === 'following' && (
              <button
                onClick={() => setActiveFilter('all')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Browse All Events
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Events Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-400">
              Showing {events.length} {events.length === 1 ? 'event' : 'events'}
            </p>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                isInterested={false} // TODO: Get from user data
                onInterestChange={handleInterestChange}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Events;