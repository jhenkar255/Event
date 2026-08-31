import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { IEvent } from '@shared/types';
import { EventCard } from '../components/events/EventCard';
import { EventBookingModal } from '../components/events/EventBookingModal';
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
  Ticket,
  CheckCircle2,
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
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<'ALL' | 'FREE' | 'PAID' | 'UNDER_500' | '500_1000' | 'ABOVE_1000'>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [activeBookingEvent, setActiveBookingEvent] = useState<IEvent | null>(null);

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
      const price = ev.price || ev.ticketPrice || 0;

      if (selectedPriceFilter === 'FREE') {
        matchesPrice = isFree;
      } else if (selectedPriceFilter === 'PAID') {
        matchesPrice = !isFree;
      } else if (selectedPriceFilter === 'UNDER_500') {
        matchesPrice = !isFree && price < 500;
      } else if (selectedPriceFilter === '500_1000') {
        matchesPrice = !isFree && price >= 500 && price <= 1000;
      } else if (selectedPriceFilter === 'ABOVE_1000') {
        matchesPrice = !isFree && price > 1000;
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

  // Section Groupings
  const isSearchOrFilterActive = search !== '' || selectedCategory !== 'All' || selectedCity !== 'All' || selectedPriceFilter !== 'ALL' || selectedFormat !== 'ALL';

  // 1. Featured Events
  const featuredEvents = useMemo(() => {
    return events.filter((ev) => ev.isFeatured || ev.guestCount >= 500).slice(0, 3);
  }, [events]);

  // 2. Events to Book (Bookable events with active registration)
  const eventsToBook = useMemo(() => {
    return events.filter((ev) => ev.status !== 'COMPLETED' && ev.status !== 'CANCELLED' && !ev.isSoldOut).slice(0, 6);
  }, [events]);

  // 3. Events Near You (Location-based, e.g. Bengaluru / Karnataka hubs)
  const eventsNearYou = useMemo(() => {
    const targetCity = selectedCity === 'All' ? 'Bengaluru' : selectedCity;
    return events.filter((ev) => (ev.location?.city || '').toLowerCase().includes(targetCity.toLowerCase()) || (ev.location?.address || '').toLowerCase().includes(targetCity.toLowerCase())).slice(0, 3);
  }, [events, selectedCity]);

  // 4. Education & College Events
  const educationEvents = useMemo(() => {
    return events.filter((ev) => (ev.category || '').includes('Education') || ev.institutionName || ((ev as any).type || '').toLowerCase().includes('fest') || ((ev as any).type || '').toLowerCase().includes('hackathon')).slice(0, 3);
  }, [events]);

  // 5. Corporate Events
  const corporateEvents = useMemo(() => {
    return events.filter((ev) => (ev.category || '').includes('Corporate') || ((ev as any).type || '').toLowerCase().includes('corporate') || ((ev as any).type || '').toLowerCase().includes('startup')).slice(0, 3);
  }, [events]);

  // 6. Cultural & Entertainment Events
  const culturalEvents = useMemo(() => {
    return events.filter((ev) => (ev.category || '').includes('Cultural') || ((ev as any).type || '').toLowerCase().includes('cultural') || ((ev as any).type || '').toLowerCase().includes('festival')).slice(0, 3);
  }, [events]);

  // 7. Sports Events
  const sportsEvents = useMemo(() => {
    return events.filter((ev) => (ev.category || '').includes('Sports') || ((ev as any).type || '').toLowerCase().includes('cricket') || ((ev as any).type || '').toLowerCase().includes('sports')).slice(0, 3);
  }, [events]);

  // 8. Wedding & Family Events
  const weddingEvents = useMemo(() => {
    return events.filter((ev) => (ev.category || '').includes('Wedding') || ((ev as any).type || '').toLowerCase().includes('wedding') || ((ev as any).type || '').toLowerCase().includes('sangeet')).slice(0, 3);
  }, [events]);

  // 9. Community & Social Events
  const communityEvents = useMemo(() => {
    return events.filter((ev) => (ev.category || '').includes('Community') || ((ev as any).type || '').toLowerCase().includes('health') || ((ev as any).type || '').toLowerCase().includes('donation')).slice(0, 3);
  }, [events]);

  // 10. Religious & Traditional Events
  const religiousEvents = useMemo(() => {
    return events.filter((ev) => (ev.category || '').includes('Religious') || (ev.culturalTradition && ev.culturalTradition !== 'Custom') || (ev.name || '').toLowerCase().includes('garba')).slice(0, 3);
  }, [events]);

  // 11. Online & Hybrid Events
  const onlineHybridEvents = useMemo(() => {
    return events.filter((ev) => ev.eventFormat === 'ONLINE' || ev.eventFormat === 'HYBRID' || (ev.category || '').includes('Online')).slice(0, 3);
  }, [events]);

  // AI Picks based on popular / educational / cultural tags
  const aiRecommendations = useMemo(() => {
    return events.filter((ev) => ev.category === 'Education & College' || ev.eventFormat === 'ONLINE' || ev.status === 'ONGOING').slice(0, 3);
  }, [events]);

  const handleOpenBooking = (ev: IEvent) => {
    setActiveBookingEvent(ev);
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
      
      {/* Booking Modal */}
      <EventBookingModal
        isOpen={!!activeBookingEvent}
        onClose={() => setActiveBookingEvent(null)}
        event={activeBookingEvent}
        onBookingSuccess={() => {
          // Refresh list or state if needed
        }}
      />

      {/* 1. DISCOVER EVENTS HERO HEADER & SEARCH BAR */}
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
                Cultural & Multi-Domain Discovery & Booking
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-utsav-gold drop-shadow-md">
                DISCOVER EVENTS
              </h1>
              <p className="text-xs sm:text-sm text-utsav-ivory-300 font-medium max-w-2xl leading-relaxed">
                Find, create and experience unforgettable events with UtsavMitra. Discover real-world events, reserve seats, make payments, receive digital tickets with cryptographically signed QR entry passes.
              </p>
            </div>

            {/* Action Buttons */}
            {!isAdmin && (
              <div className="flex items-center space-x-3 shrink-0">
                <button
                  onClick={() => setIsAiModalOpen(true)}
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

          {/* Search & Location Bar */}
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
                  className="absolute right-3 top-3 text-gray-400 hover:text-utsav-gold cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* City Dropdown */}
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

            {/* Price Filter */}
            <div className="relative md:col-span-3">
              <Tag className="w-4 h-4 text-utsav-gold absolute left-3.5 top-3.5" />
              <select
                value={selectedPriceFilter}
                onChange={(e) => setSelectedPriceFilter(e.target.value as any)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/90 dark:bg-utsav-maroon-900 border border-utsav-gold/50 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none focus:border-utsav-gold cursor-pointer"
              >
                <option value="ALL">🎟️ All Prices</option>
                <option value="FREE">✨ Free Events Only</option>
                <option value="UNDER_500">Under ₹500</option>
                <option value="500_1000">₹500 – ₹1,000</option>
                <option value="ABOVE_1000">₹1,000+</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Horizontal Category Filter Pills (Scrollable) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-widest flex items-center space-x-1.5">
              <Compass className="w-4 h-4 text-utsav-saffron" />
              <span>Browse Categories</span>
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

        {/* DYNAMIC SEARCH / FILTER RESULTS VIEW (If searching) */}
        {isSearchOrFilterActive ? (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-utsav-gold/30 pb-3">
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                  Search & Filtered Results
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {filteredEvents.length} events match your query
                </p>
              </div>

              <button
                onClick={handleClearFilters}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-96 rounded-3xl bg-utsav-beige-200 dark:bg-utsav-maroon-900 border border-utsav-gold/30" />
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="p-12 text-center bg-white/40 dark:bg-utsav-maroon-900/60 rounded-3xl border border-utsav-gold/30 space-y-4">
                <Calendar className="w-12 h-12 text-utsav-gold mx-auto opacity-70" />
                <div className="space-y-1">
                  <h3 className="font-heading text-lg font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                    No Events Match Your Filters
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Try broadening your search or creating your own event on UtsavMitra.
                  </p>
                </div>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 rounded-xl bg-utsav-gold/20 text-utsav-maroon-900 dark:text-utsav-gold border border-utsav-gold font-bold text-xs hover:bg-utsav-gold hover:text-utsav-maroon-950 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event._id} event={event} onBookNow={handleOpenBooking} />
                ))}
              </div>
            )}
          </section>
        ) : (
          /* DEFAULT FULL CATALOG SECTION BY SECTION */
          <div className="space-y-14">
            {/* 1. 🔥 FEATURED EVENTS */}
            {featuredEvents.length > 0 && (
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
                        Handpicked flagship celebrations and collegiate fests
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {featuredEvents.map((event) => (
                    <EventCard key={`feat-${event._id}`} event={event} onBookNow={handleOpenBooking} />
                  ))}
                </div>
              </section>
            )}

            {/* 2. 🎟️ EVENTS TO BOOK (Prominent Section) */}
            <section className="space-y-4 p-6 rounded-3xl bg-gradient-to-r from-utsav-maroon-950 via-utsav-maroon-900 to-utsav-maroon-950 border-2 border-utsav-gold/60 shadow-2xl text-white">
              <div className="flex items-center justify-between border-b border-utsav-gold/40 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-utsav-gold text-utsav-maroon-950 flex items-center justify-center font-bold shadow-lg">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-utsav-gold">
                      🔥 EVENTS TO BOOK
                    </h2>
                    <p className="text-xs text-gray-300">
                      Discover exciting events and reserve your spot with instant digital QR pass.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {eventsToBook.map((event) => (
                  <EventCard key={`book-${event._id}`} event={event} onBookNow={handleOpenBooking} />
                ))}
              </div>
            </section>

            {/* 3. 📍 EVENTS NEAR YOU */}
            {eventsNearYou.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-utsav-gold/30 pb-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-utsav-saffron" />
                    <div>
                      <h2 className="font-heading text-lg sm:text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                        📍 EVENTS NEAR YOU
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Happenings near {selectedCity === 'All' ? 'Bengaluru & Karnataka' : selectedCity}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {eventsNearYou.map((event) => (
                    <EventCard key={`near-${event._id}`} event={event} onBookNow={handleOpenBooking} />
                  ))}
                </div>
              </section>
            )}

            {/* 4. ✨ AI RECOMMENDED EVENTS */}
            <section className="rounded-3xl bg-gradient-to-r from-utsav-maroon-900 to-black border border-utsav-gold/50 p-6 shadow-xl text-utsav-ivory space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-utsav-gold/30 pb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-utsav-gold" />
                  <div>
                    <h2 className="font-heading text-lg sm:text-xl font-bold text-utsav-gold">
                      ✨ AI RECOMMENDED FOR YOU
                    </h2>
                    <p className="text-xs text-gray-300">
                      Based on your interests in collegiate innovation, cultural galas & live events
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-utsav-gold font-mono bg-utsav-gold/10 px-2.5 py-1 rounded-full border border-utsav-gold/30">
                  AI Context Match: 98%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {aiRecommendations.map((event) => (
                  <EventCard key={`ai-${event._id}`} event={event} onBookNow={handleOpenBooking} />
                ))}
              </div>
            </section>

            {/* 5. 🎓 EDUCATION & COLLEGE EVENTS */}
            {educationEvents.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-utsav-gold/30 pb-2">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h2 className="font-heading text-lg sm:text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                        🎓 EDUCATION & COLLEGE EVENTS
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Tech fests, hackathons, annual days, graduation convocation & symposiums
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {educationEvents.map((event) => (
                    <EventCard key={`edu-${event._id}`} event={event} onBookNow={handleOpenBooking} />
                  ))}
                </div>
              </section>
            )}

            {/* 6. 💼 CORPORATE EVENTS */}
            {corporateEvents.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-utsav-gold/30 pb-2">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <h2 className="font-heading text-lg sm:text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                        💼 CORPORATE & BUSINESS EVENTS
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Leadership summits, product launches, demo days & executive conclaves
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {corporateEvents.map((event) => (
                    <EventCard key={`corp-${event._id}`} event={event} onBookNow={handleOpenBooking} />
                  ))}
                </div>
              </section>
            )}

            {/* 7. 🎭 CULTURAL & ENTERTAINMENT */}
            {culturalEvents.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-utsav-gold/30 pb-2">
                  <div className="flex items-center space-x-2">
                    <Music className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <h2 className="font-heading text-lg sm:text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                        🎭 CULTURAL & ENTERTAINMENT
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Heritage music festivals, classical dance, concerts & comedy galas
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {culturalEvents.map((event) => (
                    <EventCard key={`cult-${event._id}`} event={event} onBookNow={handleOpenBooking} />
                  ))}
                </div>
              </section>
            )}

            {/* 8. 🏏 SPORTS EVENTS */}
            {sportsEvents.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-utsav-gold/30 pb-2">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <h2 className="font-heading text-lg sm:text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                        🏏 SPORTS TOURNAMENTS & MEETS
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Inter-college cricket championships, football leagues & athletic meets
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {sportsEvents.map((event) => (
                    <EventCard key={`sport-${event._id}`} event={event} onBookNow={handleOpenBooking} />
                  ))}
                </div>
              </section>
            )}

            {/* 9. 💍 WEDDING & FAMILY EVENTS */}
            {weddingEvents.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-utsav-gold/30 pb-2">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-utsav-saffron" />
                    <div>
                      <h2 className="font-heading text-lg sm:text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                        💍 WEDDING & FAMILY CELEBRATIONS
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Royal palace vivaahs, Sangeet galas, Haldi & family reunions
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {weddingEvents.map((event) => (
                    <EventCard key={`wed-${event._id}`} event={event} onBookNow={handleOpenBooking} />
                  ))}
                </div>
              </section>
            )}

            {/* 10. 🤝 COMMUNITY & SOCIAL */}
            {communityEvents.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-utsav-gold/30 pb-2">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-utsav-saffron" />
                    <div>
                      <h2 className="font-heading text-lg sm:text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                        🤝 COMMUNITY & SOCIAL INITIATIVES
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Blood donation camps, free health checks & civic welfare programs
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {communityEvents.map((event) => (
                    <EventCard key={`comm-${event._id}`} event={event} onBookNow={handleOpenBooking} />
                  ))}
                </div>
              </section>
            )}

            {/* 11. 🛕 RELIGIOUS & TRADITIONAL */}
            {religiousEvents.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-utsav-gold/30 pb-2">
                  <div className="flex items-center space-x-2">
                    <Flame className="w-5 h-5 text-utsav-saffron" />
                    <div>
                      <h2 className="font-heading text-lg sm:text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                        🛕 RELIGIOUS & TRADITIONAL FESTIVALS
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Maha Navratri Garba, Temple Utsavs, Rath Yatras & Diwali Mahotsavs
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {religiousEvents.map((event) => (
                    <EventCard key={`rel-${event._id}`} event={event} onBookNow={handleOpenBooking} />
                  ))}
                </div>
              </section>
            )}

            {/* 12. 🌐 ONLINE & HYBRID */}
            {onlineHybridEvents.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-utsav-gold/30 pb-2">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-cyan-500" />
                    <div>
                      <h2 className="font-heading text-lg sm:text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                        🌐 ONLINE & HYBRID EVENTS
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Virtual AI hackathons, global webinars & live broadcast conferences
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {onlineHybridEvents.map((event) => (
                    <EventCard key={`onl-${event._id}`} event={event} onBookNow={handleOpenBooking} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
