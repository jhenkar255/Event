import React from 'react';
import { Link } from 'react-router-dom';
import { IEvent } from '@shared/types';
import { Calendar, MapPin, Users, IndianRupee, Sparkles, Radio, ArrowRight, ShieldCheck } from 'lucide-react';
import { DiyaIcon, MandalaCorner } from '../layout/IndianMotifs';

interface EventCardProps {
  event: IEvent;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const isOngoing = event.status === 'ONGOING';
  const isConfirmed = event.status === 'CONFIRMED';
  const spent = event.spentBudget || 0;
  const budget = event.budget || 1;
  const budgetPercentage = Math.min(100, Math.round((spent / budget) * 100));

  // Compute countdown in days
  const eventDateObj = new Date(event.date);
  const today = new Date();
  const diffTime = eventDateObj.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="group relative rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-xl overflow-hidden hover:border-utsav-gold transition-all duration-300 hover:shadow-2xl flex flex-col">
      {/* Decorative Corner Motif */}
      <div className="absolute top-0 right-0 pointer-events-none z-10">
        <MandalaCorner className="w-14 h-14" />
      </div>

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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Status Pill */}
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          {isOngoing ? (
            <span className="flex items-center space-x-1 px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-bold tracking-wider animate-pulse uppercase shadow">
              <Radio className="w-3.5 h-3.5" />
              <span>🔴 LIVE NOW</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-utsav-maroon-900/90 text-utsav-gold text-[11px] font-bold tracking-wider uppercase border border-utsav-gold/60 shadow backdrop-blur-md">
              {event.status}
            </span>
          )}

          {event.culturalTradition && (
            <span className="px-2.5 py-0.5 rounded-full bg-utsav-saffron text-utsav-maroon-950 text-[10px] font-bold uppercase shadow">
              {event.culturalTradition}
            </span>
          )}
        </div>

        {/* Countdown Badge */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <span className="text-xs font-semibold drop-shadow flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-utsav-saffron" />
            <span>{event.date}</span>
          </span>

          <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-sm text-utsav-gold border border-utsav-gold/40">
            {diffDays > 0 ? `In ${diffDays} days` : diffDays === 0 ? 'Today!' : 'Completed'}
          </span>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold line-clamp-1 group-hover:text-utsav-saffron transition-colors">
            {event.name}
          </h3>

          <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center space-x-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-utsav-saffron shrink-0" />
            <span className="truncate">
              {event.location?.address}, {event.location?.city}
            </span>
          </p>
        </div>

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-950 border border-utsav-gold/30 text-xs">
          <div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-medium">Guest Headcount</span>
            <div className="flex items-center space-x-1 font-bold text-utsav-brown dark:text-utsav-ivory">
              <Users className="w-3.5 h-3.5 text-utsav-saffron" />
              <span>{event.guestCount} Guests</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-medium">Budget Allocated</span>
            <div className="flex items-center space-x-1 font-bold text-utsav-maroon-800 dark:text-utsav-gold">
              <span>₹{(event.budget / 100000).toFixed(1)} Lakhs</span>
            </div>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div>
          <div className="flex justify-between text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1">
            <span>Committed Budget</span>
            <span>{budgetPercentage}% (₹{(spent / 100000).toFixed(1)}L)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-utsav-maroon-950 overflow-hidden border border-utsav-gold/20">
            <div
              className={`h-full rounded-full ${
                budgetPercentage > 90 ? 'bg-red-500' : 'bg-gradient-to-r from-utsav-gold to-utsav-saffron'
              }`}
              style={{ width: `${budgetPercentage}%` }}
            />
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="pt-2 border-t border-utsav-gold/20 flex items-center justify-between gap-2">
          <Link
            to={`/events/${event._id}/qr`}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-utsav-gold/15 hover:bg-utsav-gold text-utsav-maroon-950 dark:text-utsav-gold dark:hover:text-utsav-maroon-950 border border-utsav-gold/40 text-xs font-bold transition-all shadow-xs"
            title="View personal digital entry pass"
          >
            <span>🎟️ My QR Pass</span>
          </Link>

          <Link
            to={`/events/${event._id}`}
            className="px-3.5 py-1.5 rounded-xl maroon-gradient-btn text-xs font-bold text-utsav-gold shadow-sm flex items-center space-x-1"
          >
            <span>Command Hub</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
