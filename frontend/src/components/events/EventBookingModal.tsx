import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IEvent, IBooking } from '@shared/types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import {
  X,
  Sparkles,
  Ticket,
  Calendar,
  MapPin,
  CheckCircle2,
  QrCode,
  Share2,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Building2,
  Users,
  Lock,
} from 'lucide-react';
import { MandalaCorner, DiyaIcon } from '../layout/IndianMotifs';

interface EventBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: IEvent | null;
  onBookingSuccess?: (booking: IBooking) => void;
}

export const EventBookingModal: React.FC<EventBookingModalProps> = ({
  isOpen,
  onClose,
  event,
  onBookingSuccess,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedTier, setSelectedTier] = useState<'General' | 'VIP' | 'Premium'>('General');
  const [quantity, setQuantity] = useState<number>(1);
  const [attendeeName, setAttendeeName] = useState(user?.name || '');
  const [attendeeEmail, setAttendeeEmail] = useState(user?.email || '');
  const [attendeePhone, setAttendeePhone] = useState(user?.phone || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  if (!isOpen || !event) return null;

  const isFree = event.isFree || event.price === 0 || event.ticketPrice === 0;

  // Compute tier price
  const getTierPrice = (tierName: string): number => {
    if (isFree) return 0;
    if (event.ticketTiers && event.ticketTiers.length > 0) {
      const tier = event.ticketTiers.find((t) => t.name.toLowerCase() === tierName.toLowerCase());
      if (tier) return tier.price;
    }
    const basePrice = event.ticketPrice || event.price || 299;
    if (tierName === 'VIP') return Math.round(basePrice * 2.5);
    if (tierName === 'Premium') return Math.round(basePrice * 4.5);
    return basePrice;
  };

  const unitPrice = getTierPrice(selectedTier);
  const subtotal = isFree ? 0 : unitPrice * quantity;
  const platformFee = isFree ? 0 : Math.round(subtotal * 0.02) + 20;
  const taxAmount = isFree ? 0 : Math.round(platformFee * 0.18);
  const totalAmount = isFree ? 0 : subtotal + platformFee + taxAmount;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate(`/login?redirect=/events/${event._id}`);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await api.post<{ success: boolean; message: string; booking: any; qrToken: string }>(
        '/bookings/reserve',
        {
          eventId: event._id,
          ticketTier: isFree ? 'Free Pass' : selectedTier,
          quantity,
          attendeeName: attendeeName || user.name,
          attendeeEmail: attendeeEmail || user.email,
          attendeePhone: attendeePhone || user.phone,
        }
      );

      if (res.success && res.booking) {
        setConfirmedBooking(res.booking);
        if (onBookingSuccess) onBookingSuccess(res.booking);
      } else {
        setError(res.message || 'Failed to complete booking.');
      }
    } catch (err: any) {
      console.error('Booking failed:', err);
      setError(err.response?.data?.message || err.message || 'Booking failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `I'm attending ${event.name}!`,
        text: `Book your tickets for ${event.name} on UtsavMitra.`,
        url: window.location.origin + `/events/${event._id}`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin + `/events/${event._id}`);
      alert('Event link copied to clipboard!');
    }
  };

  const handleAddToCalendar = () => {
    const title = encodeURIComponent(event.name);
    const details = encodeURIComponent(event.description || 'Cultural celebration organized via UtsavMitra');
    const location = encodeURIComponent(`${event.location?.address}, ${event.location?.city}`);
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-utsav-brown dark:text-utsav-ivory">
        {/* Decorative Motif */}
        <div className="absolute top-0 right-0 pointer-events-none opacity-30 z-0">
          <MandalaCorner className="w-24 h-24" />
        </div>

        {/* Modal Header */}
        <div className="relative z-10 p-5 border-b border-utsav-gold/30 flex items-center justify-between bg-utsav-maroon-950 text-white">
          <div className="flex items-center space-x-2">
            <Ticket className="w-5 h-5 text-utsav-gold" />
            <div>
              <h2 className="font-heading text-lg font-bold text-utsav-gold">
                {confirmedBooking ? 'Booking Confirmed' : isFree ? 'Free Event Registration' : 'Book Your Tickets'}
              </h2>
              <p className="text-[11px] text-gray-300 truncate max-w-xs">{event.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 relative z-10">
          {confirmedBooking ? (
            /* ============================================================ */
            /* 8. BOOKING CONFIRMATION SCREEN                                */
            /* ============================================================ */
            <div className="text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-500 mx-auto flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-[11px] uppercase font-extrabold tracking-widest px-3 py-1 rounded-full bg-emerald-600 text-white shadow-xs">
                  🎉 BOOKING CONFIRMED
                </span>
                <h3 className="font-heading text-xl font-bold text-utsav-maroon-800 dark:text-utsav-gold mt-2">
                  {event.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your official digital entry pass & QR ticket are active!
                </p>
              </div>

              {/* Confirmation Details Card */}
              <div className="p-4 rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-utsav-gold/20 pb-2">
                  <span className="text-gray-500 dark:text-gray-400">Booking ID:</span>
                  <span className="font-mono font-bold text-utsav-saffron">{confirmedBooking.bookingNumber}</span>
                </div>
                <div className="flex justify-between border-b border-utsav-gold/20 pb-2">
                  <span className="text-gray-500 dark:text-gray-400">Ticket Type:</span>
                  <span className="font-bold">{confirmedBooking.ticketTier || 'General'} Pass (×{confirmedBooking.quantity})</span>
                </div>
                <div className="flex justify-between border-b border-utsav-gold/20 pb-2">
                  <span className="text-gray-500 dark:text-gray-400">Event Date:</span>
                  <span className="font-bold">{event.date} {event.startTime ? `at ${event.startTime}` : ''}</span>
                </div>
                <div className="flex justify-between border-b border-utsav-gold/20 pb-2">
                  <span className="text-gray-500 dark:text-gray-400">Venue:</span>
                  <span className="font-bold truncate max-w-[200px]">{event.location?.address}, {event.location?.city}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-gray-500 dark:text-gray-400">Payment Status:</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">PAID ✓</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/events/${event._id}/qr`);
                  }}
                  className="px-4 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold shadow-md flex items-center justify-center space-x-1.5 text-utsav-maroon-950 cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>[ MY QR PASS ]</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    navigate(`/dashboard?tab=my-events`);
                  }}
                  className="px-4 py-2.5 rounded-xl maroon-gradient-btn text-xs font-bold shadow-md flex items-center justify-center space-x-1.5 text-utsav-gold cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  <span>[ MY EVENTS ]</span>
                </button>

                <button
                  onClick={handleAddToCalendar}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-utsav-maroon-800 border border-utsav-gold/40 text-xs font-bold hover:bg-utsav-gold hover:text-utsav-maroon-950 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Add to Calendar</span>
                </button>

                <button
                  onClick={handleShare}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-utsav-maroon-800 border border-utsav-gold/40 text-xs font-bold hover:bg-utsav-gold hover:text-utsav-maroon-950 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Event</span>
                </button>
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* TICKET SELECTION & RESERVATION FORM                          */
            /* ============================================================ */
            <form onSubmit={handleBooking} className="space-y-5">
              {error && (
                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/80 border border-red-400 text-red-700 dark:text-red-300 text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Event Quick Summary Banner */}
              <div className="p-3.5 rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-950 border border-utsav-gold/30 flex items-center space-x-3">
                <img
                  src={event.bannerImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80'}
                  alt={event.name}
                  className="w-16 h-16 rounded-xl object-cover border border-utsav-gold/40 shrink-0"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <h4 className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold truncate">
                    {event.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-utsav-saffron shrink-0" />
                    <span>{event.date} {event.startTime ? `• ${event.startTime}` : ''}</span>
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-utsav-saffron shrink-0" />
                    <span className="truncate">{event.location?.address || event.location?.city}</span>
                  </p>
                </div>
              </div>

              {/* Ticket Type Selection (if paid) */}
              {!isFree ? (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider">
                    Select Ticket Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['General', 'VIP', 'Premium'] as const).map((tier) => {
                      const price = getTierPrice(tier);
                      const isSelected = selectedTier === tier;
                      return (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => setSelectedTier(tier)}
                          className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-utsav-maroon-800 text-utsav-gold border-utsav-gold shadow-md scale-105'
                              : 'bg-white dark:bg-utsav-maroon-950/60 border-utsav-gold/30 hover:border-utsav-gold text-utsav-brown dark:text-utsav-ivory'
                          }`}
                        >
                          <span className="block text-xs font-bold">{tier}</span>
                          <span className="block text-sm font-extrabold text-utsav-saffron mt-0.5">₹{price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Free Community / Educational Registration</span>
                  </div>
                  <span className="font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px]">
                    ₹0 FREE
                  </span>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30">
                <div>
                  <span className="text-xs font-bold block">Number of Attendees / Tickets</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    {event.availableSeats || 500} seats left in venue
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-lg bg-utsav-beige-200 dark:bg-utsav-maroon-800 text-utsav-maroon-950 dark:text-utsav-gold font-bold text-base disabled:opacity-40 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono font-extrabold text-sm w-4 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.min(10, prev + 1))}
                    disabled={quantity >= 10}
                    className="w-8 h-8 rounded-lg bg-utsav-beige-200 dark:bg-utsav-maroon-800 text-utsav-maroon-950 dark:text-utsav-gold font-bold text-base disabled:opacity-40 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Attendee Details */}
              <div className="space-y-3 pt-1">
                <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider">
                  Attendee Information
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Full Name of Primary Attendee"
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs focus:outline-none focus:border-utsav-gold"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={attendeeEmail}
                      onChange={(e) => setAttendeeEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs focus:outline-none focus:border-utsav-gold"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={attendeePhone}
                      onChange={(e) => setAttendeePhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs focus:outline-none focus:border-utsav-gold"
                    />
                  </div>
                </div>
              </div>

              {/* Price Breakdown (for paid tickets) */}
              {!isFree && (
                <div className="p-3.5 rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-950 border border-utsav-gold/30 text-xs space-y-1.5">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Ticket Price ({selectedTier} × {quantity}):</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Platform Convenience Fee:</span>
                    <span>₹{platformFee}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Taxes (18% GST on Fee):</span>
                    <span>₹{taxAmount}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm text-utsav-maroon-800 dark:text-utsav-gold pt-1.5 border-t border-utsav-gold/20">
                    <span>Total Payable:</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl gold-gradient-btn text-xs sm:text-sm font-bold shadow-xl flex items-center justify-center space-x-2 text-utsav-maroon-950 hover:scale-[1.02] transition-transform cursor-pointer disabled:opacity-60"
              >
                <Lock className="w-4 h-4 text-utsav-maroon-950" />
                <span>
                  {isProcessing
                    ? 'Confirming Registration...'
                    : isFree
                    ? '[ REGISTER NOW – FREE ]'
                    : `[ PROCEED TO PAYMENT – ₹${totalAmount} ]`}
                </span>
              </button>

              <p className="text-[10px] text-center text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant cryptographic QR entry pass generated on confirmation</span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
