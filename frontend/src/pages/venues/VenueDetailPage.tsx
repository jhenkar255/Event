import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { IVenue } from '@shared/types';
import { VenueMap } from '../../components/maps/VenueMap';
import { RazorpayCheckoutModal } from '../../components/payments/RazorpayCheckoutModal';
import { DiyaIcon, MandalaCorner } from '../../components/layout/IndianMotifs';
import {
  MapPin,
  Users,
  Star,
  CheckCircle2,
  Calendar,
  Building,
  ShieldCheck,
  CreditCard,
  Utensils,
  Flame,
  Music,
  Car,
  Wind,
  ArrowLeft,
} from 'lucide-react';

export const VenueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<IVenue | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  useEffect(() => {
    if (id) {
      api
        .get<{ success: boolean; venue: IVenue }>(`/venues/${id}`)
        .then((res) => {
          if (res.success && res.venue) {
            setVenue(res.venue);
          }
        })
        .catch((err) => console.error('Failed to load venue details:', err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <div className="p-16 text-center text-gray-400">Loading venue details...</div>;
  }

  if (!venue) {
    return (
      <div className="max-w-md mx-auto p-12 text-center space-y-4">
        <h2 className="font-heading text-lg font-bold">Venue Not Found</h2>
        <Link to="/venues" className="text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold underline">
          Return to Venues Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/venues'))}
          className="flex items-center space-x-2 text-xs font-bold text-utsav-maroon-900 dark:text-utsav-gold hover:underline cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>← Back to Royal Venues Catalog</span>
        </button>

        <span className="text-[11px] font-semibold text-gray-500">
          UtsavMitra Heritage Collection
        </span>
      </div>

      {/* Razorpay Escrow Modal */}
      <RazorpayCheckoutModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        amount={venue.pricePerDay}
        purpose={`Venue Booking Escrow: ${venue.name}`}
        onPaymentSuccess={() => {
          setBookingConfirmed(true);
        }}
      />

      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-utsav-gold/30 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-utsav-saffron text-utsav-maroon-950">
              {venue.venueType}
            </span>
            <div className="flex items-center space-x-1 text-xs font-bold text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span>{venue.rating} ({venue.reviewCount} reviews)</span>
            </div>
          </div>

          <h1 className="font-heading text-2xl sm:text-4xl font-bold text-utsav-maroon-800 dark:text-utsav-gold mt-1">
            {venue.name}
          </h1>

          <p className="text-xs text-gray-500 flex items-center space-x-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-utsav-saffron shrink-0" />
            <span>{venue.address}, {venue.city}, {venue.state} - {venue.pincode}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-xs text-gray-500 block">Tariff per Day</span>
            <span className="font-heading text-xl sm:text-2xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
              ₹{(venue.pricePerDay / 100000).toFixed(1)} Lakhs
            </span>
          </div>

          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="px-6 py-3 rounded-2xl maroon-gradient-btn font-bold text-xs sm:text-sm shadow-xl text-utsav-gold flex items-center space-x-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Reserve via Razorpay Escrow</span>
          </button>
        </div>
      </div>

      {bookingConfirmed && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500 flex items-center space-x-3 text-xs text-emerald-800 dark:text-emerald-300 font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Your booking is secured! Escrow invoice generated and dates blocked on venue calendar.</span>
        </div>
      )}

      {/* Photo Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 h-80 rounded-3xl overflow-hidden border-2 border-utsav-gold/40 shadow-xl">
          <img
            src={venue.photos?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80'}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="grid grid-rows-2 gap-4 h-80">
          <div className="rounded-2xl overflow-hidden border border-utsav-gold/40 shadow-md">
            <img
              src={venue.photos?.[1] || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80'}
              alt="Venue interior"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="rounded-2xl overflow-hidden border border-utsav-gold/40 shadow-md">
            <img
              src={venue.photos?.[2] || 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80'}
              alt="Venue lawn"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Main Content Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description & Overview */}
          <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-xl space-y-4">
            <h2 className="font-heading text-lg font-bold text-utsav-maroon-800 dark:text-utsav-gold border-b border-utsav-gold/20 pb-2">
              About This Heritage Estate
            </h2>
            <p className="text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory leading-relaxed">
              {venue.description}
            </p>
          </div>

          {/* Key Amenities & Cultural Permissions */}
          <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-xl space-y-4">
            <h2 className="font-heading text-lg font-bold text-utsav-maroon-800 dark:text-utsav-gold border-b border-utsav-gold/20 pb-2">
              Indian Wedding Amenities & Ritual Features
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 flex items-center space-x-2">
                <Flame className="w-4 h-4 text-utsav-saffron" />
                <span className="font-semibold">Havan Kund Permitted</span>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 flex items-center space-x-2">
                <Utensils className="w-4 h-4 text-utsav-gold" />
                <span className="font-semibold">{venue.cateringPolicy?.pureVegOnly ? 'Pure Veg Kitchen' : 'Multi-Cuisine'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 flex items-center space-x-2">
                <Music className="w-4 h-4 text-utsav-maroon-800 dark:text-utsav-gold" />
                <span className="font-semibold">Baraat & Dhol Allowed</span>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 flex items-center space-x-2">
                <Car className="w-4 h-4 text-utsav-saffron" />
                <span className="font-semibold">Valet Parking (200+ Cars)</span>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 flex items-center space-x-2">
                <Wind className="w-4 h-4 text-utsav-gold" />
                <span className="font-semibold">AC Banquet & Lawn</span>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 flex items-center space-x-2">
                <Users className="w-4 h-4 text-utsav-maroon-800 dark:text-utsav-gold" />
                <span className="font-semibold">Bridal Dressing Suites</span>
              </div>
            </div>
          </div>

          {/* Interactive Leaflet Map on Venue Location */}
          <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-xl space-y-4">
            <h2 className="font-heading text-lg font-bold text-utsav-maroon-800 dark:text-utsav-gold border-b border-utsav-gold/20 pb-2">
              Venue Location & Directions
            </h2>
            <VenueMap venues={[venue]} className="h-[320px] w-full" />
          </div>
        </div>

        {/* Right Sidebar Booking Summary */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/50 shadow-2xl space-y-4 sticky top-24">
            <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
              Quick Reservation Box
            </h3>

            <div className="p-4 rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-950 border border-utsav-gold/30 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Guest Capacity:</span>
                <span className="font-bold">{venue.capacity?.min} - {venue.capacity?.max} Pax</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Rooms Included:</span>
                <span className="font-bold">{venue.roomsAvailable || 12} Heritage Suites</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Escrow Security:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Guaranteed</span>
              </div>
            </div>

            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="w-full py-3.5 rounded-2xl maroon-gradient-btn font-bold text-xs sm:text-sm shadow-xl text-utsav-gold flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Book Venue Now</span>
            </button>

            <p className="text-[11px] text-gray-500 text-center">
              Razorpay escrow releases payment to venue owner only upon milestone approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
