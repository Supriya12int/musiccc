import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../services/api';
import EventCard from './EventCard';
import { Calendar, Star, Users, Filter, Clock, MapPin, Wifi } from 'lucide-react';

const Events = () => {
  const [events, setEvents] = useState({ online: [], offline: [], all: [] });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('following');
  const [timeframe, setTimeframe] = useState('upcoming');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [followedArtists, setFollowedArtists] = useState([]);

  const filters = [
    { id: 'following', label: 'Following', icon: Star },
    { id: 'all', label: 'All Events', icon: Calendar },
    { id: 'upcoming', label: 'Upcoming', icon: Users }
  ];

  const timeFrames = [
    { value: 'today', label: 'Today' },
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'upcoming', label: 'All Upcoming' }
  ];

  const eventTypes = [
    { value: 'all', label: 'All Events' },
    { value: 'online', label: '💻 Online Events' },
    { value: 'offline', label: '� Offline Events' }
  ];

  useEffect(() => {
    loadEvents();
  }, [activeFilter, timeframe, eventTypeFilter]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      let response;

      console.log('Loading events for filter:', activeFilter, 'timeframe:', timeframe);

      switch (activeFilter) {
        case 'following':
          console.log('Fetching followed artists events...');
          const params = { timeframe };
          if (eventTypeFilter !== 'all') {
            params.eventType = eventTypeFilter;
          }
          response = await eventsAPI.getFollowedArtistsEvents(params);
          console.log('Followed artists events response:', response.data);
          setEvents(response.data.events || { online: [], offline: [], all: [] });
          setFollowedArtists(response.data.followedArtists || []);
          break;
        case 'upcoming':
          console.log('Fetching upcoming events...');
          response = await eventsAPI.getUpcomingEvents();
          console.log('Upcoming events response:', response.data);
          const upcomingEvents = response.data.events || [];
          setEvents({
            online: upcomingEvents.filter(e => e.isOnline),
            offline: upcomingEvents.filter(e => !e.isOnline),
            all: upcomingEvents
          });
          break;
        default:
          console.log('Fetching all events...');
          const allParams = eventTypeFilter !== 'all' ? { type: eventTypeFilter } : {};
          response = await eventsAPI.getAllEvents(allParams);
          console.log('All events response:', response.data);
          const allEvents = response.data.events || [];
          setEvents({
            online: allEvents.filter(e => e.isOnline),
            offline: allEvents.filter(e => !e.isOnline),
            all: allEvents
          });
      }
    } catch (error) {
      console.error('Error loading events:', error);
      console.error('Error details:', error.response?.data);
      setEvents({ online: [], offline: [], all: [] });
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
            {/* Time Frame Filter */}
            {activeFilter === 'following' && (
              <>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
                  >
                    {timeFrames.map((tf) => (
                      <option key={tf.value} value={tf.value}>
                        {tf.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
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
        <div className="flex flex-col space-y-2">
          <p className="text-gray-400">
            {activeFilter === 'following' 
              ? `Events from artists you follow (${followedArtists.length} artists)`
              : 'Discover upcoming events and concerts'
            }
          </p>
          {activeFilter === 'following' && followedArtists.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {followedArtists.slice(0, 5).map((artist, index) => (
                <span key={index} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                  {artist}
                </span>
              ))}
              {followedArtists.length > 5 && (
                <span className="text-gray-500 text-sm">+{followedArtists.length - 5} more</span>
              )}
            </div>
          )}
        </div>
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

      {/* Events Display */}
      {(() => {
        const displayEvents = eventTypeFilter === 'all' ? events.all : 
                            eventTypeFilter === 'online' ? events.online : events.offline;
        
        if (displayEvents.length === 0) {
          return (
            <div className="text-center py-16">
              <div className="bg-gray-800 rounded-2xl p-8 max-w-md mx-auto">
                <Calendar className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  {activeFilter === 'following' 
                    ? 'No events from followed artists yet'
                    : 'No events available'
                  }
                </h3>
                <p className="text-gray-500 mb-6">
                  {activeFilter === 'following'
                    ? 'Your followed artists haven\'t announced any upcoming events. Follow more artists or check back later for new announcements.'
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
          );
        }

        return (
          <>
            {/* Events Count and Stats */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-6">
                <p className="text-gray-400">
                  Showing {displayEvents.length} {displayEvents.length === 1 ? 'event' : 'events'}
                </p>
                {activeFilter === 'following' && (
                  <div className="flex space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Wifi className="h-4 w-4 text-blue-400" />
                      <span className="text-gray-400">{events.online.length} Online</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-green-400" />
                      <span className="text-gray-400">{events.offline.length} Offline</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  isInterested={false} // TODO: Get from user data
                  onInterestChange={handleInterestChange}
                />
              ))}
            </div>
          </>
        );
      })()}
    </div>
  );
};

export default Events;