import React, { useState } from 'react';
import { Calendar, MapPin, Users, Clock, ExternalLink, Heart, HeartOff, Ticket } from 'lucide-react';
import { eventsAPI } from '../services/api';

const EventCard = ({ event, isInterested = false, onInterestChange }) => {
  const [loading, setLoading] = useState(false);
  const [interested, setInterested] = useState(isInterested);

  const handleInterestToggle = async () => {
    try {
      setLoading(true);
      if (interested) {
        await eventsAPI.removeInterest(event._id);
        setInterested(false);
        if (onInterestChange) onInterestChange(event._id, false);
      } else {
        await eventsAPI.markInterested(event._id);
        setInterested(true);
        if (onInterestChange) onInterestChange(event._id, true);
      }
    } catch (error) {
      console.error('Error toggling interest:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeIcon = (type) => {
    const icons = {
      'concert': '🎤',
      'virtual-concert': '💻',
      'album-release': '💿',
      'festival': '🎪',
      'meet-greet': '🤝',
      'online-live': '📺'
    };
    return icons[type] || '🎵';
  };

  const getEventTypeColor = (type) => {
    const colors = {
      'concert': 'bg-purple-600',
      'virtual-concert': 'bg-blue-600',
      'album-release': 'bg-green-600',
      'festival': 'bg-pink-600',
      'meet-greet': 'bg-orange-600',
      'online-live': 'bg-red-600'
    };
    return colors[type] || 'bg-gray-600';
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-all duration-200 group">
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Event Type Badge */}
        <div className={`absolute top-3 left-3 ${getEventTypeColor(event.eventType)} text-white px-3 py-1 rounded-full text-xs font-medium`}>
          {getEventTypeIcon(event.eventType)} {event.eventType.replace('-', ' ')}
        </div>

        {/* Interest Button */}
        <button
          onClick={handleInterestToggle}
          disabled={loading}
          className="absolute top-3 right-3 w-8 h-8 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center transition-all duration-200"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : interested ? (
            <Heart className="h-4 w-4 text-red-500 fill-current" />
          ) : (
            <HeartOff className="h-4 w-4 text-white" />
          )}
        </button>

        {/* Popular Badge */}
        {event.isPopular && (
          <div className="absolute bottom-3 left-3 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
            🔥 Popular
          </div>
        )}
      </div>

      {/* Event Details */}
      <div className="p-4">
        {/* Title & Artist */}
        <div className="mb-3">
          <h3 className="font-semibold text-white text-lg mb-1 line-clamp-2">
            {event.title}
          </h3>
          <p className="text-purple-400 text-sm font-medium">
            {event.artist}
          </p>
        </div>

        {/* Date & Time */}
        <div className="flex items-center text-gray-400 text-sm mb-2">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{formatDate(event.date)}</span>
          <Clock className="h-4 w-4 ml-4 mr-2" />
          <span>{formatTime(event.date)}</span>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-400 text-sm mb-3">
          <MapPin className="h-4 w-4 mr-2" />
          <span>
            {event.isOnline ? 'Online Event' : `${event.venue.name}, ${event.venue.city}`}
          </span>
        </div>

        {/* Capacity & Price */}
        <div className="flex items-center justify-between text-sm mb-4">
          <div className="flex items-center text-gray-400">
            <Users className="h-4 w-4 mr-1" />
            <span>{event.capacity?.toLocaleString()} capacity</span>
          </div>
          <div className="text-green-400 font-medium">
            ₹{event.ticketPrice.min} - ₹{event.ticketPrice.max}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {event.ticketUrl && (
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center transition-colors duration-200"
            >
              <Ticket className="h-4 w-4 mr-2" />
              Get Tickets
            </a>
          )}
          
          {event.isOnline && event.onlineLink && (
            <a
              href={event.onlineLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center transition-colors duration-200"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Join Online
            </a>
          )}
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {event.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;