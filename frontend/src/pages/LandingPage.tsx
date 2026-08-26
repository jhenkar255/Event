import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  MapPin,
  Users,
  ShieldCheck,
  Radio,
  ArrowRight,
  CheckCircle2,
  Heart,
  Star,
  Zap,
  TrendingUp,
  Compass,
} from 'lucide-react';
import { DiyaIcon, MandalaCorner, MarigoldGarland, KalashIcon } from '../components/layout/IndianMotifs';
import { INDIAN_EVENT_TYPES, INDIAN_TRADITIONS } from '@shared/constants';
import { api } from '../api/client';
import { IEvent, IVenue } from '@shared/types';
import { EventCard } from '../components/events/EventCard';
import { AIEventWizardModal } from '../components/ai/AIEventWizardModal';
import { FindVenuesNearMe } from '../components/maps/FindVenuesNearMe';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState<IEvent[]>([]);
  const [featuredVenues, setFeaturedVenues] = useState<IVenue[]>([]);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    // Fetch live showcase events and top venues
    api
      .get<{ success: boolean; events: IEvent[] }>('/events')
      .then((res) => {
        if (res.success && res.events) {
          setFeaturedEvents(res.events.slice(0, 3));
        }
      })
      .catch(() => {});

    api
      .get<{ success: boolean; venues: IVenue[] }>('/venues')
      .then((res) => {
        if (res.success && res.venues) {
          setFeaturedVenues(res.venues.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  const stats = [
    { label: 'Auspicious Events Managed', value: '12,500+' },
    { label: 'Verified Indian Venues', value: '1,200+' },
    { label: 'Gate Passes Verified', value: '450,000+' },
    { label: 'Customer Delight Rating', value: '4.9 / 5.0' },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* AI Wizard Modal */}
      <AIEventWizardModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />

      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-hero-pattern text-utsav-ivory pt-16 pb-20 sm:pt-24 sm:pb-32 border-b-4 border-utsav-gold/60 shadow-2xl">
        {/* Background Mandala Accents */}
        <div className="absolute top-0 right-0 pointer-events-none opacity-20">
          <MandalaCorner className="w-64 h-64" />
        </div>
        <div className="absolute bottom-0 left-0 pointer-events-none opacity-20 scale-y-[-1]">
          <MandalaCorner className="w-64 h-64" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          {/* Sanskrit Greeting Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-utsav-maroon-950/80 border border-utsav-gold/60 backdrop-blur-md shadow-lg">
            <DiyaIcon className="w-5 h-5 text-utsav-gold" />
            <span className="font-serif italic text-xs sm:text-sm text-utsav-gold tracking-widest">
              || श्री गणेशाय नमः ||
            </span>
            <span className="text-xs font-bold text-utsav-saffron px-2 py-0.5 rounded-full bg-utsav-gold/10">
              India's #1 Event Ecosystem
            </span>
          </div>

          {/* Main Hero Heading */}
          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Plan Your Perfect <span className="gold-gradient-text">Celebration</span>, The Indian Way.
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-utsav-ivory/90 max-w-2xl mx-auto font-light leading-relaxed">
            From royal heritage weddings and energetic sangeets to sacred housewarmings. AI-curated muhurtham schedules, 2D mandap blueprints, regional catering, signed QR gate passes, and live stream control rooms.
          </p>

          {/* Hero Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 relative z-30">
            <Link
              to="/ai-planner"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl gold-gradient-btn text-base font-bold shadow-2xl flex items-center justify-center space-x-2.5 group cursor-pointer hover:scale-105 hover:shadow-utsav-gold/40 active:scale-95 transition-all duration-200"
            >
              <Sparkles className="w-5 h-5 text-utsav-maroon-950 group-hover:rotate-12 transition-transform" />
              <span>Plan Event with AI</span>
            </Link>

            <Link
              to="/events/create"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-utsav-maroon-900/90 hover:bg-utsav-maroon-950 text-utsav-ivory font-bold text-base border-2 border-utsav-gold/60 shadow-xl flex items-center justify-center space-x-2 transition-all hover:scale-105 hover:border-utsav-gold active:scale-95 cursor-pointer duration-200"
            >
              <Calendar className="w-5 h-5 text-utsav-gold" />
              <span>Manual Custom Wizard</span>
            </Link>

            <Link
              to="/venues"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-black/40 hover:bg-black/60 text-utsav-gold font-bold text-base border border-utsav-gold/50 shadow-lg flex items-center justify-center space-x-2 transition-all hover:scale-105 hover:border-utsav-gold active:scale-95 cursor-pointer duration-200"
            >
              <MapPin className="w-5 h-5 text-utsav-saffron" />
              <span>Browse Venues</span>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-utsav-ivory/80">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>12 Indian Regional Traditions</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Razorpay Escrow Protected</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Cryptographic QR Passes</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. Stats Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-16 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/60 shadow-2xl">
          {stats.map((stat, i) => (
            <div key={i} className="text-center p-2">
              <p className="font-heading text-2xl sm:text-4xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-utsav-brown-600 dark:text-utsav-ivory-300 mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Indian Event Types Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <DiyaIcon className="w-6 h-6 text-utsav-gold" />
            <h2 className="font-heading text-2xl sm:text-4xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
              Celebrations We Bring to Life
            </h2>
            <DiyaIcon className="w-6 h-6 text-utsav-gold" />
          </div>
          <p className="text-xs sm:text-sm text-utsav-brown-600 dark:text-utsav-ivory-300 max-w-xl mx-auto">
            Custom-tailored checklist milestones, decor themes, and menus for every sacred Indian occasion.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {INDIAN_EVENT_TYPES.slice(0, 6).map((item) => (
            <Link
              key={item.type}
              to={`/events/create?type=${item.type}`}
              className="p-5 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-lg hover:border-utsav-gold hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-center space-y-3 group"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-950 border border-utsav-gold/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold line-clamp-1">
                {item.name}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Live Events / Flagship Showcase */}
      {featuredEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-utsav-gold/30 pb-3">
            <div className="flex items-center space-x-2">
              <Radio className="w-6 h-6 text-red-600 animate-pulse" />
              <h2 className="font-heading text-xl sm:text-3xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                Live & Featured Celebrations
              </h2>
            </div>
            <Link
              to="/events"
              className="text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold hover:underline flex items-center space-x-1"
            >
              <span>View All Celebrations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* 5. How UtsavMitra Works - 5 Step Flow */}
      <section className="bg-utsav-beige-100 dark:bg-utsav-maroon-950 py-16 border-y-2 border-utsav-gold/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-utsav-saffron uppercase tracking-widest">
              Unified Celebration Engine
            </span>
            <h2 className="font-heading text-2xl sm:text-4xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
              Everything Handled in 5 Effortless Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { step: '01', title: 'AI Cultural Planner', desc: 'Input your vision, budget, and tradition. AI builds your Muhurtham schedule & checklist.' },
              { step: '02', title: '2D Mandap Studio', desc: 'Drag-and-drop grand mandaps, varmala stages, rangolis, and royal entrances.' },
              { step: '03', title: 'Verified Bookings', desc: 'Book authentic regional catering, shehnai troupes, and heritage forts with Razorpay escrow.' },
              { step: '04', title: 'Digital E-Invites & QR', desc: 'Send Sanskrit digital invites. Guests receive signed QR entry passes with dietary RSVP.' },
              { step: '05', title: 'Live Command Center', desc: 'Real-time webcam gate check-in, attendance counter, and HD live broadcast room.' },
            ].map((st) => (
              <div
                key={st.step}
                className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-lg space-y-3 relative overflow-hidden flex flex-col justify-between"
              >
                <span className="font-heading text-4xl font-bold text-utsav-gold/30 dark:text-utsav-gold/20 block">
                  {st.step}
                </span>
                <div className="space-y-1">
                  <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                    {st.title}
                  </h3>
                  <p className="text-xs text-utsav-brown-600 dark:text-utsav-ivory-300 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Venues Near Me & Geolocation Discovery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <FindVenuesNearMe />
      </section>

      {/* 7. Call To Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-utsav-maroon-900 via-utsav-maroon-800 to-utsav-maroon-950 text-utsav-ivory border-4 border-utsav-gold shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <DiyaIcon className="w-6 h-6" />
              <span className="text-xs uppercase font-bold text-utsav-gold tracking-widest">
                Start Planning Today
              </span>
            </div>
            <h2 className="font-heading text-2xl sm:text-4xl font-bold leading-tight">
              Ready to Host an Unforgettable Celebration?
            </h2>
            <p className="text-xs sm:text-sm text-utsav-ivory/80 leading-relaxed">
              Experience the power of AI coupled with rich Indian hospitality. Create your first event in less than 2 minutes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/ai-planner"
              className="px-8 py-4 rounded-2xl gold-gradient-btn text-sm font-bold shadow-xl flex items-center justify-center space-x-2 cursor-pointer hover:scale-105 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch AI Planner</span>
            </Link>
            <Link
              to="/register"
              className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-utsav-gold/60 text-center cursor-pointer hover:scale-105 transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
