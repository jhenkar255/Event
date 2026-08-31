import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { IEvent } from '@shared/types';
import { EventCard } from '../components/events/EventCard';
import { Search, Filter, PlusCircle, Sparkles, Calendar, Radio, ArrowLeft, ShieldCheck } from 'lucide-react';
import { INDIAN_TRADITIONS, INDIAN_EVENT_TYPES } from '@shared/constants';
import { AIEventWizardModal } from '../components/ai/AIEventWizardModal';

export const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [selectedTradition, setSelectedTradition] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (initialSearch) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

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
    const q = (search || '').toLowerCase().trim();
    const eventName = (ev.name || '').toLowerCase();
    const eventType = ((ev as any).type || (ev as any).eventType || '').toLowerCase();
    const tradition = (ev.culturalTradition || '').toLowerCase();
    const city = (ev.location?.city || '').toLowerCase();
    const address = (ev.location?.address || '').toLowerCase();

    const matchesSearch =
      !q ||
      eventName.includes(q) ||
      eventType.includes(q) ||
      tradition.includes(q) ||
      city.includes(q) ||
      address.includes(q);

    const matchesTradition =
      selectedTradition === 'All' || ev.culturalTradition === selectedTradition;

    const matchesStatus =
      selectedStatus === 'All' || ev.status === selectedStatus;

    return matchesSearch && matchesTradition && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      <AIEventWizardModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />

      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/dashboard'))}
          className="flex items-center space-x-2 text-xs font-bold text-utsav-maroon-900 dark:text-utsav-gold hover:underline cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>← Back to Dashboard</span>
        </button>

        {isAdmin && (
          <Link
            to="/admin/dashboard"
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-500/40"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Governance Console</span>
          </Link>
        )}
      </div>

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

        {/* Action Controls - Hidden for Admin as Admin does not create personal events */}
        {!isAdmin && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="px-4 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold shadow-md flex items-center space-x-1.5 cursor-pointer"
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
        )}
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
