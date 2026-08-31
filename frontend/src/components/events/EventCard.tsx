import React, { useState } from 'react';
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
  Lock,
  Ticket,
  Clock,
  Compass,
} from 'lucide-react';
import { MandalaCorner } from '../layout/IndianMotifs';
import { EventBookingModal } from './EventBookingModal';

interface EventCardProps {
  event: IEvent;
  onBookNow?: (event: IEvent) => void;
  showDistance?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onBookNow, showDistance = true }) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const isOngoing = event.status === 'ONGOING' || event.isLive;
  const isCompleted = event.status === 'COMPLETED';
  const isSoldOut = event.isSoldOut || (event.availableSeats !== undefined && event.availableSeats <= 0);
  const isClosed = event.isRegistrationClosed;
  const isFree = event.isFree || event.price === 0 || event.ticketPrice === 0;
  const priceDisplay = isFree ? 'Free' : `₹${event.price || event.ticketPrice || 0}`;
  const category = event.category || 'Wedding & Family';
  const subcategory = event.subcategory || event.type;
  const institution = event.institutionName || (event as any).collegeName;
  const seatsAvailable = event.availableSeats !== undefined ? event.availableSeats : Math.max(12, event.guestCount || 100);

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

  // Determine Booking Button State
  const renderBookingButton = () => {
    if (isCompleted) {
      return (
        <button
          disabled
          className="px-3.5 py-1.5 rounded-xl bg-gray-300 dark:bg-gray-800 text-gray-500 text-xs font-bold cursor-not-allowed shadow-inner"
        >
          [ EVENT ENDED ]
        </button>
      );
    }
    if (isClosed) {
      return (
        <button
          disabled
          className="px-3.5 py-1.5 rounded-xl bg-gray-300 dark:bg-gray-800 text-gray-500 text-xs font-bold cursor-not-allowed shadow-inner"
        >
          [ REGISTRATION CLOSED ]
        </button>
      );
    }
    if (isSoldOut) {
      return (
        <button
          disabled
          className="px-3.5 py-1.5 rounded-xl bg-red-800/60 text-red-200 text-xs font-extrabold cursor-not-allowed shadow-inner"
        >
          [ SOLD OUT ]
        </button>
      );
    }
    if (event.visibility === 'INVITATION_ONLY') {
      return (
        <button
          onClick={() => (onBookNow ? onBookNow(event) : setIsBookingModalOpen(true))}
          className="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold shadow-md hover:scale-105 transition-transform cursor-pointer"
        >
          [ RSVP / ACCEPT ]
        </button>
      );
    }
    if (isFree) {
      return (
        <button
          onClick={() => (onBookNow ? onBookNow(event) : setIsBookingModalOpen(true))}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md hover:scale-105 transition-transform cursor-pointer"
        >
          [ REGISTER NOW ]
        </button>
      );
    }
    return (
      <button
        onClick={() => (onBookNow ? onBookNow(event) : setIsBookingModalOpen(true))}
        className="px-3.5 py-1.5 rounded-xl gold-gradient-btn text-xs font-extrabold shadow-md text-utsav-maroon-950 hover:scale-105 transition-transform cursor-pointer"
      >
        [ BOOK NOW ]
      </button>
    );
  };

  return (
    <>
      <EventBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        event={event}
      />

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

                <span
                  className={`flex items-center space-x-1 px-2 py-0.5 rounded-full ${catTheme.bg} ${catTheme.text} text-[10px] font-bold uppercase shadow border border-white/20`}
                >
                  <CatIcon className="w-2.5 h-2.5" />
                  <span>{subcategory}</span>
                </span>
              </div>

              {/* Price Pill */}
              <span
                className={`px-2.5 py-0.5 rounded-full font-extrabold text-xs shadow-md border ${
                  isFree
                    ? 'bg-emerald-600 text-white border-emerald-400'
                    : 'bg-amber-400 text-utsav-maroon-950 border-amber-300'
                }`}
              >
                {priceDisplay}
              </span>
            </div>

            {/* Bottom Banner Info */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
              <span className="text-xs font-semibold drop-shadow flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-utsav-saffron" />
                <span>
                  {event.date} {event.startTime ? `• ${event.startTime}` : ''}
                </span>
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
              {institution ? (
                <p className="text-xs font-bold text-utsav-saffron-600 dark:text-utsav-gold flex items-center space-x-1 mt-1">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{institution}</span>
                </p>
              ) : (
                event.organizerName && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1 mt-1">
                    <span className="font-medium">By: {event.organizerName}</span>
                  </p>
                )
              )}

              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mt-1">
                <p className="flex items-center space-x-1 truncate max-w-[200px]">
                  <MapPin className="w-3.5 h-3.5 text-utsav-saffron shrink-0" />
                  <span className="truncate">
                    {event.location?.address || event.location?.city}
                  </span>
                </p>
                {showDistance && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-utsav-gold/20 text-utsav-maroon-900 dark:text-utsav-gold border border-utsav-gold/30 shrink-0">
                    {event.distanceKm ? `${event.distanceKm} km away` : '2.4 km away'}
                  </span>
                )}
              </div>
            </div>

            {/* Key Availability & Seats Strip */}
            <div className="p-2.5 rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-950 border border-utsav-gold/30 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                <Users className="w-3.5 h-3.5 text-utsav-saffron" />
                <span>
                  {isSoldOut ? (
                    <span className="text-red-500 font-extrabold">0 / 500 (Sold Out)</span>
                  ) : (
                    <span>{seatsAvailable} seats available</span>
                  )}
                </span>
              </div>

              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 capitalize">
                {event.eventFormat ? event.eventFormat.replace('_', ' ').toLowerCase() : 'In Person'}
              </span>
            </div>

            {/* Description snippet */}
            {event.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {event.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons Strip */}
        <div className="p-4 pt-2 border-t border-utsav-gold/20 flex items-center justify-between gap-2">
          <Link
            to={`/events/${event._id}`}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-utsav-maroon-950/80 text-utsav-maroon-900 dark:text-utsav-gold border border-utsav-gold/40 text-xs font-bold hover:bg-utsav-gold hover:text-utsav-maroon-950 transition-colors shadow-xs"
          >
            [ VIEW DETAILS ]
          </Link>

          <div className="flex items-center space-x-1.5">
            {renderBookingButton()}
          </div>
        </div>
      </div>
    </>
  );
};


