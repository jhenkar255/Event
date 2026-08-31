import React from 'react';
import { Link } from 'react-router-dom';
import { IEvent } from '@shared/types';
import {
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  Sparkles,
  Radio,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Trophy,
  Heart,
  Music,
  Globe,
  Tag,
  Building2,
  Award,
} from 'lucide-react';
import { MandalaCorner } from '../layout/IndianMotifs';

interface EventCardProps {
  event: IEvent;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const isOngoing = event.status === 'ONGOING' || event.isLive;
  const isFree = event.isFree || event.price === 0 || event.ticketPrice === 0;
  const priceDisplay = isFree ? 'Free' : `₹${event.price || event.ticketPrice || 0}`;
  const category = event.category || 'Wedding & Family';
  const subcategory = event.subcategory || event.type;
  const institution = event.institutionName || (event as any).collegeName;

  // Category Icon & Color Mapping
  const getCategoryTheme = (cat: string) => {
    if (cat.includes('Education') || cat.includes('College')) {
      return { icon: GraduationCap, bg: 'bg-blue-600', text: 'text-blue-100', border: 'border-blue-400' };
    }
    if (cat.includes('Sports')) {
      return { icon: Trophy, bg: 'bg-emerald-600', text: 'text-emerald-100', border: 'border-emerald-400' };
    }
    if (cat.includes('Corporate') || cat.includes('Business')) {
      return { icon: Briefcase, bg: 'bg-indigo-700', text: 'text-indigo-100', border: 'border-indigo-400' };
    }
    if (cat.includes('Cultural') || cat.includes('Entertainment')) {
      return { icon: Music, bg: 'bg-purple-700', text: 'text-purple-100', border: 'border-purple-400' };
    }
    if (cat.includes('Online') || cat.includes('Hybrid')) {
      return { icon: Globe, bg: 'bg-cyan-700', text: 'text-cyan-100', border: 'border-cyan-400' };
    }
    return { icon: Heart, bg: 'bg-utsav-maroon-900', text: 'text-utsav-gold', border: 'border-utsav-gold' };
  };

  const catTheme = getCategoryTheme(category);
  const CatIcon = catTheme.icon;

  // Compute countdown in days
  const eventDateObj = new Date(event.date);
  const today = new Date();
  const diffTime = eventDateObj.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="group relative rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-xl overflow-hidden hover:border-utsav-gold transition-all duration-300 hover:shadow-2xl flex flex-col justify-between">
      {/* Decorative Corner Motif */}
      <div className="absolute top-0 right-0 pointer-events-none z-10 opacity-40">
        <MandalaCorner className="w-12 h-12" />
      </div>

      <div>
        {/* Banner Image & Status Badges */}
        <div className="relative h-48 w-full overflow-hidden bg-utsav-maroon-950">
          <img
            src={
              event.bannerImage ||
              'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
            }
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

          {/* Top Pill Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
              {isOngoing ? (
                <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-extrabold tracking-wider animate-pulse uppercase shadow">
                  <Radio className="w-3 h-3" />
                  <span>LIVE</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-utsav-maroon-900/90 text-utsav-gold text-[10px] font-bold tracking-wider uppercase border border-utsav-gold/60 shadow backdrop-blur-md">
                  {event.status || 'CONFIRMED'}
                </span>
              )}

              <span className={`flex items-center space-x-1 px-2 py-0.5 rounded-full ${catTheme.bg} ${catTheme.text} text-[10px] font-bold uppercase shadow border border-white/20`}>
                <CatIcon className="w-2.5 h-2.5" />
                <span>{subcategory}</span>
              </span>
            </div>

            {/* Price Pill */}
            <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-xs shadow-md border ${
              isFree
                ? 'bg-emerald-600 text-white border-emerald-400'
                : 'bg-amber-400 text-utsav-maroon-950 border-amber-300'
            }`}>
              {priceDisplay}
            </span>
          </div>

          {/* Bottom Banner Info */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <span className="text-xs font-semibold drop-shadow flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-utsav-saffron" />
              <span>{event.date} {event.startTime ? `• ${event.startTime}` : ''}</span>
            </span>

            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-utsav-gold border border-utsav-gold/40">
              {diffDays > 0 ? `In ${diffDays} days` : diffDays === 0 ? 'Today!' : 'Completed'}
            </span>
          </div>
        </div>

        {/* Body Details */}
        <div className="p-5 space-y-3">
          <div>
            <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold line-clamp-2 group-hover:text-utsav-saffron transition-colors">
              {event.name}
            </h3>

            {/* Institution or Organizer Tag */}
            {institution && (
              <p className="text-xs font-bold text-utsav-saffron-600 dark:text-utsav-gold flex items-center space-x-1 mt-1">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{institution}</span>
              </p>
            )}

            <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center space-x-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-utsav-saffron shrink-0" />
              <span className="truncate">
                {event.location?.address || event.location?.city}
              </span>
            </p>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-950 border border-utsav-gold/30 text-xs">
            <div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-medium">Format</span>
              <span className="font-bold text-utsav-brown dark:text-utsav-ivory capitalize">
                {event.eventFormat ? event.eventFormat.replace('_', ' ').toLowerCase() : 'In Person'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-medium">Capacity / Seats</span>
              <div className="flex items-center space-x-1 font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                <Users className="w-3 h-3 text-utsav-saffron" />
                <span>{event.availableSeats || event.guestCount} Available</span>
              </div>
            </div>
          </div>

          {/* Description snippet */}
          {event.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          )}
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="p-4 pt-2 border-t border-utsav-gold/20 flex items-center justify-between gap-2">
        <a
          href={
            event.streamUrl ||
            (() => {
              const type = ((event as any).type || (event as any).eventType || '').toLowerCase();
              const name = (event.name || '').toLowerCase();
              if (type.includes('tech') || name.includes('tech') || name.includes('hackathon')) return 'https://www.youtube.com/watch?v=M7lc1UVf-VE';
              if (type.includes('fest') || type.includes('college')) return 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ';
              if (type.includes('sports') || name.includes('cricket')) return 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ';
              return 'https://www.youtube.com/watch?v=09R8_2nJtjg';
            })()
          }
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white border border-red-500/30 text-xs font-bold transition-all"
          title="Watch Stream / Video"
        >
          <span>▶ Stream</span>
        </a>

        <Link
          to={`/events/${event._id}/qr`}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-utsav-gold/15 hover:bg-utsav-gold text-utsav-maroon-950 dark:text-utsav-gold dark:hover:text-utsav-maroon-950 border border-utsav-gold/40 text-xs font-bold transition-all shadow-xs"
          title="View Entry Ticket"
        >
          <span>🎟️ Pass</span>
        </Link>

        <Link
          to={`/events/${event._id}`}
          className="px-3.5 py-1.5 rounded-xl maroon-gradient-btn text-xs font-bold text-utsav-gold shadow-sm flex items-center space-x-1 hover:scale-105 transition-transform"
        >
          <span>View Details</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

