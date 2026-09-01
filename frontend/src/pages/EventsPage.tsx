import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { IEvent } from '@shared/types';
import { EventCard } from '../components/events/EventCard';
import { EventSection } from '../components/events/EventSection';
import { EventBookingModal } from '../components/events/EventBookingModal';
import {
  Search,
  PlusCircle,
  Sparkles,
  Calendar,
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
  Globe,
  Tag,
  X,
  Compass,
  Ticket,
} from 'lucide-react';
import { INDIAN_CITIES, EVENT_MAIN_CATEGORIES } from '@shared/constants';
import { SAMPLE_SHOWCASE_EVENTS } from '../data/mockEventsCatalog';
import { AIEventWizardModal } from '../components/ai/AIEventWizardModal';
import { MandalaCorner } from '../components/layout/IndianMotifs';

export const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialCity = searchParams.get('city') || 'All';

  const [events, setEvents] = useState<IEvent[]>(SAMPLE_SHOWCASE_EVENTS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
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

  // Fetch events from API with fallback to rich 50+ showcase events
  useEffect(() => {
    setLoading(true);
    api
      .get<{ success: boolean; events: IEvent[] }>('/events')
      .then((res) => {
        if (res.success && res.events && res.events.length > 0) {
          setEvents(res.events);
        } else {
          setEvents(SAMPLE_SHOWCASE_EVENTS);
        }
      })
      .catch((err) => {
        console.warn('Using local showcase catalog:', err);
        setEvents(SAMPLE_SHOWCASE_EVENTS);
      })
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
      case 'Online & Hybrid':
        return Globe;
      default:
        return Compass;
    }
  };

  // Strict Category Classification Helpers (Prevent category cross-contamination)
  const isEducationEvent = (ev: IEvent) => {
    const cat = (ev.category || '').toLowerCase();
    const subcat = (ev.subcategory || '').toLowerCase();
    return (
      cat.includes('education') ||
      subcat.includes('technical fest') ||
      subcat.includes('workshop') ||
      subcat.includes('hackathon') ||
      subcat.includes('graduation') ||
      subcat.includes('placement drive') ||
      subcat.includes('annual day')
    );
  };

  const isCorporateEvent = (ev: IEvent) => {
    const cat = (ev.category || '').toLowerCase();
    const subcat = (ev.subcategory || '').toLowerCase();
    return (
      cat.includes('corporate') ||
      cat.includes('business') ||
      subcat.includes('leadership') ||
      subcat.includes('investor') ||
      subcat.includes('product launch') ||
      subcat.includes('conference') ||
      subcat.includes('summit')
    );
  };

  const isCulturalEvent = (ev: IEvent) => {
    const cat = (ev.category || '').toLowerCase();
    const subcat = (ev.subcategory || '').toLowerCase();
    return (
      (cat.includes('cultural') || cat.includes('entertainment')) &&
      !cat.includes('religious') &&
      !cat.includes('wedding') &&
      !subcat.includes('wedding') &&
      !subcat.includes('navratri') &&
      !subcat.includes('diwali') &&
      !subcat.includes('ganesh')
    );
  };

  const isSportsEvent = (ev: IEvent) => {
    const cat = (ev.category || '').toLowerCase();
    const subcat = (ev.subcategory || '').toLowerCase();
    return (
      cat.includes('sport') ||
      subcat.includes('cricket') ||
      subcat.includes('marathon') ||
      subcat.includes('badminton') ||
      subcat.includes('kabaddi') ||
      subcat.includes('esport') ||
      subcat.includes('tournament')
    );
  };

  const isWeddingEvent = (ev: IEvent) => {
    const cat = (ev.category || '').toLowerCase();
    const subcat = (ev.subcategory || '').toLowerCase();
    const typ = ((ev as any).type || '').toLowerCase();
    return (
      cat.includes('wedding') ||
      cat.includes('family') ||
      subcat.includes('wedding') ||
      subcat.includes('sangeet') ||
      subcat.includes('anniversary') ||
      subcat.includes('reception') ||
      subcat.includes('kalyanam') ||
      typ === 'wedding' ||
      typ === 'anniversary'
    );
  };

  const isCommunityEvent = (ev: IEvent) => {
    const cat = (ev.category || '').toLowerCase();
    const subcat = (ev.subcategory || '').toLowerCase();
    return (
      (cat.includes('community') || cat.includes('social')) &&
      !cat.includes('wedding') &&
      !cat.includes('religious')
    );
  };

  const isReligiousEvent = (ev: IEvent) => {
    const cat = (ev.category || '').toLowerCase();
    const subcat = (ev.subcategory || '').toLowerCase();
    return (
      (cat.includes('religious') || cat.includes('traditional')) &&
      !cat.includes('wedding') &&
      !cat.includes('family') &&
      !subcat.includes('wedding') &&
      !subcat.includes('anniversary')
    );
  };

  const isOnlineOrHybridEvent = (ev: IEvent) => {
    const cat = (ev.category || '').toLowerCase();
    const fmt = (ev.eventFormat || '').toUpperCase();
    const typ = ((ev as any).eventType || '').toUpperCase();
    return (
      cat.includes('online') ||
      cat.includes('hybrid') ||
      fmt === 'ONLINE' ||
      fmt === 'HYBRID' ||
      typ === 'ONLINE' ||
      typ === 'HYBRID'
    );
  };

  // Filter Logic for User Search / Filtering
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
        if (selectedCategory === 'Education & College') {
          matchesCategory = isEducationEvent(ev);
        } else if (selectedCategory === 'Corporate & Business') {
          matchesCategory = isCorporateEvent(ev);
        } else if (selectedCategory === 'Cultural & Entertainment') {
          matchesCategory = isCulturalEvent(ev);
        } else if (selectedCategory === 'Sports') {
          matchesCategory = isSportsEvent(ev);
        } else if (selectedCategory === 'Wedding & Family') {
          matchesCategory = isWeddingEvent(ev);
        } else if (selectedCategory === 'Community & Social') {
          matchesCategory = isCommunityEvent(ev);
        } else if (selectedCategory === 'Religious & Traditional') {
          matchesCategory = isReligiousEvent(ev);
        } else if (selectedCategory === 'Online & Hybrid') {
          matchesCategory = isOnlineOrHybridEvent(ev);
        } else {
          matchesCategory = category.includes(catLower) || subcategory.includes(catLower);
        }
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
  const isSearchOrFilterActive =
    search !== '' ||
    selectedCategory !== 'All' ||
    selectedCity !== 'All' ||
    selectedPriceFilter !== 'ALL' ||
    selectedFormat !== 'ALL';

  // 1. 🔥 Events to Book (All currently bookable/registrable events across categories)
  const eventsToBook = useMemo(() => {
    return events
      .filter((ev) => ev.status !== 'COMPLETED' && ev.status !== 'CANCELLED' && !ev.isSoldOut)
      .slice(0, 6);
  }, [events]);

  // 2. 📍 Events Near You (Location/city-based e.g. Bengaluru / Karnataka)
  const eventsNearYou = useMemo(() => {
    const targetCity = selectedCity === 'All' ? 'Bengaluru' : selectedCity;
    return events
      .filter(
        (ev) =>
          (ev.location?.city || '').toLowerCase().includes(targetCity.toLowerCase()) ||
          (ev.location?.address || '').toLowerCase().includes(targetCity.toLowerCase())
      )
      .slice(0, 3);
  }, [events, selectedCity]);

  // 3. 🎓 Education & College Events (STRICT: Education only)
  const educationEvents = useMemo(() => {
    return events.filter(isEducationEvent).slice(0, 3);
  }, [events]);

  // 4. 💼 Corporate Events (STRICT: Corporate only)
  const corporateEvents = useMemo(() => {
    return events.filter(isCorporateEvent).slice(0, 3);
  }, [events]);

  // 5. 🎭 Cultural & Entertainment Events (STRICT: Cultural only)
  const culturalEvents = useMemo(() => {
    return events.filter(isCulturalEvent).slice(0, 3);
  }, [events]);

  // 6. 🏏 Sports Events (STRICT: Sports only)
  const sportsEvents = useMemo(() => {
    return events.filter(isSportsEvent).slice(0, 3);
  }, [events]);

  // 7. 💍 Wedding & Family Events (STRICT: Wedding only)
  const weddingEvents = useMemo(() => {
    return events.filter(isWeddingEvent).slice(0, 3);
  }, [events]);

  // 8. 🤝 Community Events (STRICT: Community only)
  const communityEvents = useMemo(() => {
    return events.filter(isCommunityEvent).slice(0, 3);
  }, [events]);

  // 9. 🛕 Religious & Traditional Events (STRICT: Religious only)
  const religiousEvents = useMemo(() => {
    return events.filter(isReligiousEvent).slice(0, 3);
  }, [events]);

  // 10. 🌐 Online & Hybrid Events (STRICT: Online / Hybrid only)
  const onlineHybridEvents = useMemo(() => {
    return events.filter(isOnlineOrHybridEvent).slice(0, 3);
  }, [events]);

  // 11. ✨ AI Recommended For You
  const aiRecommendations = useMemo(() => {
    return events
      .filter((ev) => isEducationEvent(ev) || isOnlineOrHybridEvent(ev) || isCulturalEvent(ev))
      .slice(0, 3);
  }, [events]);

  const handleOpenBooking = (ev: IEvent) => {
    setActiveBookingEvent(ev);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedCity('All');
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
          // Booking confirmed successfully
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
          {/* Top Back Nav / Admin Console */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/dashboard'))}
              className="flex items-center space-x-1.5 text-xs font-bold text-utsav-gold hover:underline cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Dashboard</span>
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
                Cultural & Multi-Category Event Discovery
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-utsav-gold drop-shadow-md">
                DISCOVER & BOOK EVENTS
              </h1>
              <p className="text-xs sm:text-sm text-utsav-ivory-300 font-medium max-w-2xl leading-relaxed">
                Discover collegiate hackathons, corporate summits, cultural festivals, sports tournaments, royal weddings, community camps, and online webinars across India.
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
                placeholder="Search by event title, college, company, sport, venue..."
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
        {/* Horizontal Category Filter Pills */}
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
                  className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-xs ${
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
            {['Bengaluru', 'Mysuru', 'Mangaluru', 'Mumbai', 'Delhi', 'Jaipur', 'Ahmedabad'].map((cityName) => (
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
                  {filteredEvents.length} events match your criteria
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
                    Try broadening your search or exploring our category sections below.
                  </p>
                </div>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 rounded-xl bg-utsav-gold/20 text-utsav-maroon-900 dark:text-utsav-gold border border-utsav-gold font-bold text-xs hover:bg-utsav-gold hover:text-utsav-maroon-950 transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event._id || event.eventId} event={event} onBookNow={handleOpenBooking} />
                ))}
              </div>
            )}
          </section>
        ) : (
          /* =================================================================
             11 REQUIRED CATEGORY SECTIONS IN ORDER
             ================================================================= */
          <div className="space-y-14">
            {/* 1. 🔥 EVENTS TO BOOK (Bookable events across categories) */}
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
                      Top trending events open for instant booking, seat selection, and QR digital passes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {eventsToBook.map((event) => (
                  <EventCard key={`book-${event._id || event.eventId}`} event={event} onBookNow={handleOpenBooking} />
                ))}
              </div>
            </section>

            {/* 2. 📍 EVENTS NEAR YOU */}
            <EventSection
              title="📍 EVENTS NEAR YOU"
              subtitle={`Happenings near ${selectedCity === 'All' ? 'Bengaluru & Karnataka' : selectedCity}`}
              icon={MapPin}
              events={eventsNearYou}
              loading={loading}
              emptyMessage={`No events found near ${selectedCity}. Check out our featured events!`}
              onBookNow={handleOpenBooking}
            />

            {/* 3. 🎓 EDUCATION & COLLEGE EVENTS */}
            <EventSection
              title="🎓 EDUCATION & COLLEGE EVENTS"
              subtitle="Technical fests, AI hackathons, graduation convocations & campus career drives"
              icon={GraduationCap}
              badge="Collegiate"
              category="Education & College"
              events={educationEvents}
              loading={loading}
              emptyMessage="No education & college events available right now."
              onBookNow={handleOpenBooking}
            />

            {/* 4. 💼 CORPORATE EVENTS */}
            <EventSection
              title="💼 CORPORATE & BUSINESS EVENTS"
              subtitle="Executive leadership summits, VC investor meets, tech product launches & business expos"
              icon={Briefcase}
              badge="Corporate"
              category="Corporate & Business"
              events={corporateEvents}
              loading={loading}
              emptyMessage="No corporate & business events available right now."
              onBookNow={handleOpenBooking}
            />

            {/* 5. 🎭 CULTURAL & ENTERTAINMENT */}
            <EventSection
              title="🎭 CULTURAL & ENTERTAINMENT"
              subtitle="Heritage sangeet utsavs, classical dance recitals, Bollywood concerts & stand-up comedy"
              icon={Music}
              badge="Cultural"
              category="Cultural & Entertainment"
              events={culturalEvents}
              loading={loading}
              emptyMessage="No cultural & entertainment events available right now."
              onBookNow={handleOpenBooking}
            />

            {/* 6. 🏏 SPORTS EVENTS */}
            <EventSection
              title="🏏 SPORTS EVENTS & TOURNAMENTS"
              subtitle="Inter-college cricket championships, city 10K marathons, badminton opens & esports"
              icon={Trophy}
              badge="Sports"
              category="Sports"
              events={sportsEvents}
              loading={loading}
              emptyMessage="No sports events available right now."
              onBookNow={handleOpenBooking}
            />

            {/* 7. 💍 WEDDING & FAMILY EVENTS */}
            <EventSection
              title="💍 WEDDING & FAMILY CELEBRATIONS"
              subtitle="Grand bridal expos, royal palace vivaahs, traditional Kalyanam & family anniversaries"
              icon={Heart}
              badge="Wedding"
              category="Wedding & Family"
              events={weddingEvents}
              loading={loading}
              emptyMessage="No wedding & family events available right now."
              onBookNow={handleOpenBooking}
            />

            {/* 8. 🤝 COMMUNITY EVENTS */}
            <EventSection
              title="🤝 COMMUNITY & SOCIAL INITIATIVES"
              subtitle="Voluntary blood donation camps, green tree plantation drives & civic welfare programs"
              icon={Users}
              badge="Community"
              category="Community & Social"
              events={communityEvents}
              loading={loading}
              emptyMessage="No community & social events available right now."
              onBookNow={handleOpenBooking}
            />

            {/* 9. 🛕 RELIGIOUS & TRADITIONAL EVENTS */}
            <EventSection
              title="🛕 RELIGIOUS & TRADITIONAL FESTIVALS"
              subtitle="Maha Navratri Garba Mahotsav, Ganesh Chaturthi, Diwali Deepotsav & Temple Utsavs"
              icon={Flame}
              badge="Tradition"
              category="Religious & Traditional"
              events={religiousEvents}
              loading={loading}
              emptyMessage="No religious & traditional events available right now."
              onBookNow={handleOpenBooking}
            />

            {/* 10. 🌐 ONLINE & HYBRID EVENTS */}
            <EventSection
              title="🌐 ONLINE & HYBRID EVENTS"
              subtitle="Virtual cloud masterclasses, global Web3 hackathons & live interactive streams"
              icon={Globe}
              badge="Virtual"
              category="Online & Hybrid"
              events={onlineHybridEvents}
              loading={loading}
              emptyMessage="No online & hybrid events available right now."
              onBookNow={handleOpenBooking}
            />

            {/* 11. ✨ AI RECOMMENDED FOR YOU */}
            <EventSection
              title="✨ AI RECOMMENDED FOR YOU"
              subtitle="Curated according to collegiate innovation, cultural galas & upcoming tournaments"
              icon={Sparkles}
              badge="AI Curated"
              category="AI Recommended"
              events={aiRecommendations}
              loading={loading}
              emptyMessage="No AI recommendations available right now."
              onBookNow={handleOpenBooking}
            />
          </div>
        )}
      </main>
    </div>
  );
};
