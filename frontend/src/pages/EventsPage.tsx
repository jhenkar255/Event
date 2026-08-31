import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { IEvent } from '@shared/types';
import { EventCard } from '../components/events/EventCard';
import {
  Search,
  Filter,
  PlusCircle,
  Sparkles,
  Calendar,
  Radio,
  ArrowLeft,
  ShieldCheck,
  MapPin,
  GraduationCap,
  Heart,
  Briefcase,
  Music,
  Trophy,
  Users,
  Flame,
  Landmark,
  Globe,
  Tag,
  Clock,
  X,
  Compass,
  Building2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { INDIAN_CITIES, EVENT_MAIN_CATEGORIES, EVENT_CATEGORY_HIERARCHY } from '@shared/constants';
import { AIEventWizardModal } from '../components/ai/AIEventWizardModal';
import { MandalaCorner, DiyaIcon } from '../components/layout/IndianMotifs';

export const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialCity = searchParams.get('city') || 'All';

  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('ALL');
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [customAiPrompt, setCustomAiPrompt] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  // Sync state with URL search params
  useEffect(() => {
    if (initialSearch) setSearch(initialSearch);
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialCity) setSelectedCity(initialCity);
  }, [initialSearch, initialCategory, initialCity]);

  // Fetch events from API
  useEffect(() => {
    setLoading(true);
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

  // Category Icon Mapping
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Education & College':
        return GraduationCap;
      case 'Wedding & Family':
        return Heart;
      case 'Corporate & Business':
        return Briefcase;
      case 'Cultural & Entertainment':
        return Music;
      case 'Sports':
        return Trophy;
      case 'Community & Social':
        return Users;
      case 'Religious & Traditional':
        return Flame;
      case 'Government & Public':
        return Landmark;
      case 'Online & Hybrid':
        return Globe;
      default:
        return Compass;
    }
  };

  // Filter Logic
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const q = (search || '').toLowerCase().trim();
      const eventName = (ev.name || '').toLowerCase();
      const eventType = ((ev as any).type || (ev as any).eventType || '').toLowerCase();
      const category = (ev.category || '').toLowerCase();
      const subcategory = (ev.subcategory || '').toLowerCase();
      const tradition = (ev.culturalTradition || '').toLowerCase();
      const city = (ev.location?.city || '').toLowerCase();
      const address = (ev.location?.address || '').toLowerCase();
      const institution = (ev.institutionName || (ev as any).collegeName || '').toLowerCase();
      const organizer = (ev.organizerName || '').toLowerCase();
      const desc = (ev.description || '').toLowerCase();

      // 1. Search filter
      const matchesSearch =
        !q ||
        eventName.includes(q) ||
        eventType.includes(q) ||
        category.includes(q) ||
        subcategory.includes(q) ||
        tradition.includes(q) ||
        city.includes(q) ||
        address.includes(q) ||
        institution.includes(q) ||
        organizer.includes(q) ||
        desc.includes(q);

      // 2. Category filter
      let matchesCategory = true;
      if (selectedCategory !== 'All') {
        const catLower = selectedCategory.toLowerCase();
        matchesCategory =
          category.includes(catLower) ||
          subcategory.includes(catLower) ||
          eventType.includes(catLower) ||
          (selectedCategory === 'Education & College' && (institution || eventType.includes('tech') || eventType.includes('college') || eventType.includes('hackathon')));
      }

      // 3. City filter
      const matchesCity =
        selectedCity === 'All' ||
        city.includes(selectedCity.toLowerCase()) ||
        address.includes(selectedCity.toLowerCase());

      // 4. Price filter
      let matchesPrice = true;
      const isFree = ev.isFree || ev.price === 0 || ev.ticketPrice === 0;
      if (selectedPriceFilter === 'FREE') {
        matchesPrice = isFree;
      } else if (selectedPriceFilter === 'PAID') {
        matchesPrice = !isFree;
      }

      // 5. Format filter (In-Person, Online, Hybrid)
      let matchesFormat = true;
      if (selectedFormat !== 'ALL') {
        matchesFormat = (ev.eventFormat || 'IN_PERSON') === selectedFormat;
      }

      // 6. Status filter
      let matchesStatus = true;
      if (selectedStatus !== 'ALL') {
        matchesStatus = ev.status === selectedStatus || (selectedStatus === 'ONGOING' && ev.isLive);
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCity &&
        matchesPrice &&
        matchesFormat &&
        matchesStatus
      );
    });
  }, [events, search, selectedCategory, selectedCity, selectedPriceFilter, selectedFormat, selectedStatus]);

  // Featured events subset
  const featuredEvents = useMemo(() => {
    return events.filter((ev) => ev.isFeatured || ev.guestCount >= 500).slice(0, 3);
  }, [events]);

  // AI Picks based on popular / educational / cultural tags
  const aiRecommendations = useMemo(() => {
    return events.filter((ev) => ev.category === 'Education & College' || ev.eventFormat === 'ONLINE' || ev.status === 'ONGOING').slice(0, 3);
  }, [events]);

  const handleLaunchAiPlanner = (promptText?: string) => {
    setCustomAiPrompt(promptText || 'I want to organize a grand college festival & technical hackathon in Bengaluru with 500 participants.');
    setIsAiModalOpen(true);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedCity('All');
    setSelectedDateFilter('ALL');
    setSelectedPriceFilter('ALL');
    setSelectedFormat('ALL');
    setSelectedStatus('ALL');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-utsav-ivory dark:bg-utsav-maroon-950 text-utsav-brown dark:text-utsav-ivory transition-colors duration-200">
      <AIEventWizardModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />

      {/* Hero Header Strip */}
      <section className="relative overflow-hidden bg-gradient-to-b from-utsav-maroon-900 via-utsav-maroon-950 to-utsav-maroon-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b-2 border-utsav-gold/40 shadow-xl">
        <div className="absolute top-0 right-0 pointer-events-none opacity-20">
          <MandalaCorner className="w-48 h-48" />
        </div>
        <div className="absolute bottom-0 left-0 pointer-events-none opacity-15 rotate-180">
          <MandalaCorner className="w-48 h-48" />
        </div>

        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          {/* Top Admin / Back Nav */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/dashboard'))}
              className="flex items-center space-x-1.5 text-xs font-bold text-utsav-gold hover:underline cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Dashboard</span>
            </button>

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-utsav-maroon-950 border border-amber-300 shadow-md"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Governance Console</span>
              </Link>
            )}
          </div>

          {/* Main Title & Tagline */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <span className="text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full bg-utsav-saffron text-utsav-maroon-950 inline-block font-sans shadow">
                Cultural & Multi-Domain Discovery
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-utsav-gold drop-shadow-md">
                DISCOVER EVENTS
              </h1>
              <p className="text-xs sm:text-sm text-utsav-ivory-300 font-medium max-w-2xl leading-relaxed">
                Find, create and experience unforgettable events with UtsavMitra – from Royal Weddings & Sangeets to College Tech Fests, Hackathons, Corporate Summits, and Sports Championships.
              </p>
            </div>

            {/* Action Buttons */}
            {!isAdmin && (
              <div className="flex items-center space-x-3 shrink-0">
                <button
                  onClick={() => handleLaunchAiPlanner()}
                  className="px-4 py-2.5 rounded-xl gold-gradient-btn text-xs sm:text-sm font-bold shadow-lg flex items-center space-x-2 text-utsav-maroon-950 hover:scale-105 transition-transform cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Plan with AI</span>
                </button>

                <Link
                  to="/events/create"
                  className="px-4 py-2.5 rounded-xl maroon-gradient-btn text-xs sm:text-sm font-bold shadow-lg flex items-center space-x-2 text-utsav-gold hover:scale-105 transition-transform"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Create Event</span>
                </Link>
              </div>
            )}
          </div>

          {/* Search & Location Bar (Integrated in Hero) */}
          <div className="p-3 sm:p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-utsav-gold/40 shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="relative md:col-span-6">
              <Search className="w-4 h-4 text-utsav-gold absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by event title, college, hackathon, venue, speaker..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white/90 dark:bg-utsav-maroon-900 border border-utsav-gold/50 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory placeholder-gray-500 focus:outline-none focus:border-utsav-gold shadow-inner"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-utsav-gold"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* City / Location Dropdown */}
            <div className="relative md:col-span-3">
              <MapPin className="w-4 h-4 text-utsav-gold absolute left-3.5 top-3.5" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/90 dark:bg-utsav-maroon-900 border border-utsav-gold/50 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none focus:border-utsav-gold cursor-pointer"
              >
                <option value="All">📍 All Cities Across India</option>
                {INDIAN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter (Free / Paid) */}
            <div className="relative md:col-span-3">
              <Tag className="w-4 h-4 text-utsav-gold absolute left-3.5 top-3.5" />
              <select
                value={selectedPriceFilter}
                onChange={(e) => setSelectedPriceFilter(e.target.value as any)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/90 dark:bg-utsav-maroon-900 border border-utsav-gold/50 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none focus:border-utsav-gold cursor-pointer"
              >
                <option value="ALL">🎟️ All Prices (Free & Paid)</option>
                <option value="FREE">✨ Free Entry Only</option>
                <option value="PAID">💳 Ticketed / Paid Events</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Discovery Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Horizontal Category Filter Pills (Scrollable) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-widest flex items-center space-x-1.5">
              <Compass className="w-4 h-4 text-utsav-saffron" />
              <span>Browse by Category</span>
            </h2>
            <span className="text-[11px] text-gray-500 font-medium">
              Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
            </span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-utsav-gold/40 scrollbar-track-transparent">
            {EVENT_MAIN_CATEGORIES.map((catName) => {
              const isSelected = selectedCategory === catName;
              const Icon = getCategoryIcon(catName);
              return (
                <button
                  key={catName}
                  onClick={() => setSelectedCategory(catName)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-sm ${
                    isSelected
                      ? 'bg-utsav-maroon-800 text-utsav-gold border-2 border-utsav-gold shadow-md scale-105'
                      : 'bg-white dark:bg-utsav-maroon-900/80 text-utsav-brown dark:text-utsav-ivory border border-utsav-gold/30 hover:border-utsav-gold hover:bg-utsav-beige-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-utsav-gold' : 'text-utsav-saffron'}`} />
                  <span>{catName}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Quick Format & Location Pills Strip */}
        <section className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-900/60 border border-utsav-gold/30 text-xs">
          {/* Format Selector */}
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-utsav-maroon-800 dark:text-utsav-gold">Format:</span>
            {['ALL', 'IN_PERSON', 'ONLINE', 'HYBRID'].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer ${
                  selectedFormat === fmt
                    ? 'bg-utsav-maroon-800 text-utsav-gold font-bold shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:text-utsav-gold'
                }`}
              >
                {fmt === 'ALL' ? 'All' : fmt.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Popular City Quick Clicks */}
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            <span className="font-bold text-utsav-maroon-800 dark:text-utsav-gold">Events Near:</span>
            {['Bengaluru', 'Mysuru', 'Mangaluru', 'Mumbai', 'Delhi', 'Jaipur', 'Pune'].map((cityName) => (
              <button
                key={cityName}
                onClick={() => setSelectedCity(cityName)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                  selectedCity === cityName
                    ? 'bg-utsav-gold text-utsav-maroon-950 border-utsav-gold font-extrabold'
                    : 'bg-white/60 dark:bg-utsav-maroon-950/60 border-utsav-gold/30 hover:border-utsav-gold text-gray-700 dark:text-gray-300'
                }`}
              >
                {cityName}
              </button>
            ))}
            {selectedCity !== 'All' && (
              <button
                onClick={() => setSelectedCity('All')}
                className="text-[10px] text-red-500 font-bold underline ml-1 cursor-pointer"
              >
                Clear City
              </button>
            )}
          </div>
        </section>

        {/* 🌟 FEATURED EVENTS SECTION (Shows when on 'All' or no deep search) */}
        {selectedCategory === 'All' && !search && featuredEvents.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-utsav-gold/30 pb-2">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-xl bg-amber-400 text-utsav-maroon-950 shadow">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="font-heading text-lg sm:text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                    FEATURED EVENTS
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Handpicked premier collegiate fests, cultural galas, and tournaments
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <EventCard key={`featured-${event._id}`} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* ✨ AI RECOMMENDED PICKS BANNER */}
        <section className="rounded-3xl bg-gradient-to-r from-utsav-maroon-950 via-utsav-maroon-900 to-black border-2 border-utsav-gold/60 p-6 shadow-2xl text-utsav-ivory relative overflow-hidden">
          <div className="absolute top-0 right-0 pointer-events-none opacity-20">
            <MandalaCorner className="w-40 h-40" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-utsav-gold/20 text-utsav-gold text-xs font-bold border border-utsav-gold/40">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Recommendation Engine</span>
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-utsav-gold">
                Plan Your College Function or Auspicious Celebration with AI
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Tell our AI wizard your celebration goal (e.g. "College Farewell for 300 students" or "Royal Palace Wedding in Jaipur"). Get instant budgeting, vendor recommendations, checklists, and QR ticketing structures in seconds.
              </p>
            </div>

            <button
              onClick={() => handleLaunchAiPlanner()}
              className="px-6 py-3.5 rounded-2xl gold-gradient-btn text-xs sm:text-sm font-bold shadow-xl flex items-center space-x-2 text-utsav-maroon-950 hover:scale-105 transition-transform cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch AI Event Wizard →</span>
            </button>
          </div>
        </section>

        {/* ALL FILTERED EVENTS GRID */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-utsav-gold/30 pb-3">
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                {selectedCategory === 'All' ? 'All Upcoming Celebrations & Events' : `${selectedCategory} Events`}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {filteredEvents.length} events match your active filters
              </p>
            </div>

            {(search || selectedCategory !== 'All' || selectedCity !== 'All' || selectedPriceFilter !== 'ALL' || selectedFormat !== 'ALL') && (
              <button
                onClick={handleClearFilters}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Loading Skeleton Loader */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/30 shadow-lg overflow-hidden flex flex-col h-[420px]"
                >
                  <div className="h-48 w-full bg-utsav-beige-200 dark:bg-utsav-maroon-950/80 relative overflow-hidden">
                    <div className="absolute top-3 left-3 w-20 h-6 rounded-full bg-utsav-gold/30" />
                    <div className="absolute bottom-3 left-3 w-28 h-5 rounded-lg bg-utsav-gold/20" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="h-5 w-3/4 bg-utsav-beige-200 dark:bg-utsav-maroon-950 rounded-md" />
                      <div className="h-3.5 w-1/2 bg-utsav-beige-200/70 dark:bg-utsav-maroon-950/60 rounded-md" />
                    </div>
                    <div className="h-14 w-full rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-950/60 border border-utsav-gold/20" />
                    <div className="h-3 w-full rounded-full bg-utsav-beige-200 dark:bg-utsav-maroon-950" />
                    <div className="flex justify-between pt-2">
                      <div className="h-7 w-20 rounded-xl bg-utsav-beige-200 dark:bg-utsav-maroon-950" />
                      <div className="h-7 w-20 rounded-xl bg-utsav-beige-200 dark:bg-utsav-maroon-950" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            /* Empty Filter State */
            <div className="p-12 text-center bg-white/40 dark:bg-utsav-maroon-900/60 rounded-3xl border border-utsav-gold/30 space-y-4">
              <Calendar className="w-12 h-12 text-utsav-gold mx-auto opacity-70" />
              <div className="space-y-1">
                <h3 className="font-heading text-lg font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                  No Events Match Your Filters
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  We couldn't find any events matching "{search || selectedCategory || selectedCity}". Try broadening your search or creating your own celebration.
                </p>
              </div>
              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 rounded-xl bg-utsav-gold/20 text-utsav-maroon-900 dark:text-utsav-gold border border-utsav-gold font-bold text-xs hover:bg-utsav-gold hover:text-utsav-maroon-950 transition-colors"
                >
                  Clear All Filters
                </button>
                <Link
                  to="/events/create"
                  className="px-4 py-2 rounded-xl maroon-gradient-btn text-xs font-bold text-utsav-gold shadow"
                >
                  + Create This Event
                </Link>
              </div>
            </div>
          ) : (
            /* Events Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
