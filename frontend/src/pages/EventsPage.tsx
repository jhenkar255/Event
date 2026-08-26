import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { IEvent } from '@shared/types';
import { EventCard } from '../components/events/EventCard';
import { Search, Filter, PlusCircle, Sparkles, Calendar, Radio } from 'lucide-react';
import { INDIAN_TRADITIONS, INDIAN_EVENT_TYPES } from '@shared/constants';
import { AIEventWizardModal } from '../components/ai/AIEventWizardModal';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTradition, setSelectedTradition] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    api
      .get<{ success: boolean; events: IEvent[] }>('/events')
      .then((res) => {
        if (res.success && res.events) {
          setEvents(res.events);
        }
      })
      .catch((err) => console.error('Failed to load events:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.name.toLowerCase().includes(search.toLowerCase()) ||
      ev.eventType.toLowerCase().includes(search.toLowerCase()) ||
      (ev.location?.city || '').toLowerCase().includes(search.toLowerCase());

    const matchesTradition =
      selectedTradition === 'All' || ev.culturalTradition === selectedTradition;

    const matchesStatus =
      selectedStatus === 'All' || ev.status === selectedStatus;

    return matchesSearch && matchesTradition && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <AIEventWizardModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-utsav-gold/30 pb-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
            Auspicious Celebrations Hub
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Browse, manage, and monitor all your ongoing, upcoming, and past cultural events.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-4 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold shadow-md flex items-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4 text-utsav-maroon-950" />
            <span>Plan with AI</span>
          </button>

          <Link
            to="/events/create"
            className="px-4 py-2.5 rounded-xl maroon-gradient-btn text-xs font-bold shadow-md flex items-center space-x-1.5 text-utsav-gold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Create Event</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Strip */}
      <div className="p-4 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-md flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-utsav-gold absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event title, tradition, city (e.g. Jaipur, Wedding, Sangeet)..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory placeholder-gray-400 focus:outline-none focus:border-utsav-gold"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={selectedTradition}
            onChange={(e) => setSelectedTradition(e.target.value)}
            className="flex-1 md:flex-initial px-3 py-2 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs text-utsav-brown dark:text-utsav-ivory focus:outline-none"
          >
            <option value="All">All Traditions (12)</option>
            {INDIAN_TRADITIONS.map((trad) => (
              <option key={trad.id} value={trad.name}>
                {trad.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex-1 md:flex-initial px-3 py-2 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs text-utsav-brown dark:text-utsav-ivory focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="PLANNING">Planning</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="ONGOING">🔴 Live / Ongoing</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="p-16 text-center text-gray-400">Loading events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white/40 dark:bg-utsav-maroon-950/40 rounded-3xl border border-utsav-gold/30 space-y-3">
          <Calendar className="w-10 h-10 text-utsav-gold mx-auto" />
          <p className="font-semibold text-sm">No celebrations matched your filter criteria.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedTradition('All');
              setSelectedStatus('All');
            }}
            className="text-xs text-utsav-maroon-800 dark:text-utsav-gold font-bold hover:underline"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};
