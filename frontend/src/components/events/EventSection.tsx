import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon, ArrowRight, Calendar, Sparkles } from 'lucide-react';
import { IEvent } from '@shared/types';
import { EventCard } from './EventCard';

interface EventSectionProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  category?: string;
  events: IEvent[];
  loading?: boolean;
  emptyMessage?: string;
  viewAllHref?: string;
  onBookNow: (event: IEvent) => void;
}

export const EventSection: React.FC<EventSectionProps> = ({
  title,
  subtitle,
  icon: Icon,
  badge,
  category,
  events,
  loading = false,
  emptyMessage,
  viewAllHref,
  onBookNow,
}) => {
  const defaultEmptyMessage = category
    ? `No ${category.toLowerCase()} events available right now.`
    : 'No events found in this category.';

  return (
    <section className="space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-utsav-gold/30 pb-3">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className="p-2 rounded-2xl bg-utsav-gold/15 dark:bg-utsav-maroon-800 text-utsav-gold border border-utsav-gold/30">
              <Icon className="w-5 h-5 text-utsav-saffron dark:text-utsav-gold" />
            </div>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-utsav-maroon-900 dark:text-utsav-gold tracking-tight">
                {title}
              </h2>
              {badge && (
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-utsav-gold text-utsav-maroon-950 shadow-xs">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {viewAllHref && events.length > 0 && (
          <Link
            to={viewAllHref}
            className="text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold hover:text-utsav-saffron flex items-center space-x-1 self-start sm:self-auto group cursor-pointer"
          >
            <span>View All ({events.length})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* Content State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-96 rounded-3xl bg-utsav-beige-200 dark:bg-utsav-maroon-900 border border-utsav-gold/30"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="p-8 text-center bg-white/40 dark:bg-utsav-maroon-900/40 rounded-3xl border border-utsav-gold/30 space-y-3">
          <Calendar className="w-10 h-10 text-utsav-gold/60 mx-auto" />
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
            {emptyMessage || defaultEmptyMessage}
          </p>
          <div>
            <Link
              to="/events"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-utsav-gold/20 text-utsav-maroon-900 dark:text-utsav-gold border border-utsav-gold text-xs font-bold hover:bg-utsav-gold hover:text-utsav-maroon-950 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore All Events</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event._id || event.eventId} event={event} onBookNow={onBookNow} />
          ))}
        </div>
      )}
    </section>
  );
};
