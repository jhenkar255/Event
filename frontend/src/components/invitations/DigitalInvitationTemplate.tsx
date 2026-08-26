import React, { useState } from 'react';
import { IInvitation } from '@shared/types';
import { DiyaIcon, MandalaCorner, MarigoldGarland, KalashIcon } from '../layout/IndianMotifs';
import { Calendar, Clock, MapPin, Music, Volume2, VolumeX, Send, CheckCircle2, QrCode, Download, Share2 } from 'lucide-react';

import confetti from 'canvas-confetti';
import { api } from '../../api/client';

interface DigitalInvitationTemplateProps {
  invitation: IInvitation;
  qrDataUrl?: string;
  isPublic?: boolean;
  onRsvpSuccess?: (guest: any) => void;
}

export const DigitalInvitationTemplate: React.FC<DigitalInvitationTemplateProps> = ({
  invitation,
  qrDataUrl,
  isPublic = false,
  onRsvpSuccess,
}) => {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [mealPref, setMealPref] = useState<'Veg' | 'Non-Veg' | 'Jain' | 'Vegan'>('Veg');
  const [plusGuests, setPlusGuests] = useState(0);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestQrUrl, setGuestQrUrl] = useState<string | null>(null);

  const toggleMusic = () => {
    setIsPlayingMusic(!isPlayingMusic);
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post(`/invitations/public/${invitation.shareUrlToken}/rsvp`, {
        name: rsvpName,
        email: rsvpEmail,
        phone: rsvpPhone,
        rsvpStatus: 'ACCEPTED',
        mealPreference: mealPref,
        plusGuests,
      });

      if (res.success) {
        setRsvpSubmitted(true);
        if (res.guestQrDataUrl) setGuestQrUrl(res.guestQrDataUrl);
        if (onRsvpSuccess) onRsvpSuccess(res.guest);

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C9A227', '#F4A340', '#7A1F2B'],
        });
      }
    } catch (err: any) {
      alert(err.message || 'Could not record RSVP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto rounded-3xl bg-gradient-to-b from-utsav-maroon-900 via-utsav-maroon-800 to-utsav-maroon-950 text-utsav-ivory p-6 sm:p-10 border-4 border-utsav-gold shadow-2xl relative overflow-hidden">
      {/* Mandala Corners */}
      <div className="absolute top-0 left-0 pointer-events-none">
        <MandalaCorner className="w-20 h-20" />
      </div>
      <div className="absolute top-0 right-0 pointer-events-none scale-x-[-1]">
        <MandalaCorner className="w-20 h-20" />
      </div>
      <div className="absolute bottom-0 left-0 pointer-events-none scale-y-[-1]">
        <MandalaCorner className="w-20 h-20" />
      </div>
      <div className="absolute bottom-0 right-0 pointer-events-none scale-[-1]">
        <MandalaCorner className="w-20 h-20" />
      </div>

      {/* Background Audio Toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleMusic}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-utsav-gold/20 text-utsav-gold text-xs font-bold border border-utsav-gold/40 hover:bg-utsav-gold/30 transition-colors"
        >
          {isPlayingMusic ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span>{isPlayingMusic ? 'Mute Shehnai' : 'Play Auspicious Music'}</span>
        </button>
      </div>

      <div className="text-center space-y-6 relative z-10">
        {/* Kalash & Diya Embellishment */}
        <div className="flex items-center justify-center space-x-3">
          <DiyaIcon className="w-7 h-7" />
          <KalashIcon className="w-8 h-8" />
          <DiyaIcon className="w-7 h-7" />
        </div>

        {/* Sanskrit Shloka */}
        <div className="space-y-1">
          <p className="font-serif italic text-xs sm:text-sm text-utsav-gold tracking-widest">
            {invitation.shlokaOrQuote || '|| श्री गणेशाय नमः ||'}
          </p>
          <MarigoldGarland className="w-48 mx-auto py-1" />
        </div>

        {/* Host Family Greeting */}
        <p className="text-xs sm:text-sm uppercase tracking-widest text-utsav-ivory/80 font-semibold">
          {invitation.hostNames}
        </p>

        {/* Event Title */}
        <h1 className="font-heading text-2xl sm:text-4xl font-bold gold-gradient-text tracking-tight drop-shadow-md">
          {invitation.title}
        </h1>

        {/* Custom Message */}
        <p className="text-xs sm:text-sm text-utsav-ivory/90 leading-relaxed max-w-lg mx-auto font-light">
          {invitation.customMessage}
        </p>

        {/* Date, Time & Venue Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-black/30 border border-utsav-gold/40 text-left">
          <div className="flex items-center space-x-3 p-2">
            <Calendar className="w-5 h-5 text-utsav-saffron shrink-0" />
            <div>
              <span className="text-[10px] text-utsav-gold block font-bold uppercase">Date & Time</span>
              <span className="text-xs font-semibold">{invitation.eventDate} • {invitation.eventTime}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2">
            <MapPin className="w-5 h-5 text-utsav-saffron shrink-0" />
            <div>
              <span className="text-[10px] text-utsav-gold block font-bold uppercase">Auspicious Venue</span>
              <span className="text-xs font-semibold line-clamp-1">{invitation.venueName}</span>
              <span className="text-[11px] text-utsav-ivory/70 block line-clamp-1">{invitation.venueAddress}</span>
            </div>
          </div>
        </div>

        {/* QR Code Pass for Gate Entry - ALWAYS PRESENT IN DIGITAL INVITATION */}
        <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border-2 border-utsav-gold/60 flex flex-col items-center space-y-3 max-w-sm mx-auto shadow-xl relative overflow-hidden backdrop-blur-sm">
          <div className="flex items-center justify-between w-full border-b border-utsav-gold/30 pb-2">
            <span className="text-xs font-bold text-utsav-gold flex items-center space-x-1.5 uppercase tracking-wider">
              <QrCode className="w-4 h-4 text-utsav-saffron" />
              <span>Digital Gate Pass QR</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
              Verified Entry
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white border-2 border-utsav-gold shadow-md">
            <img
              src={
                guestQrUrl ||
                qrDataUrl ||
                `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                  typeof window !== 'undefined'
                    ? window.location.origin + '/invite/' + (invitation.shareUrlToken || 'utsav-pass')
                    : 'https://utsavmitra.in/pass'
                )}&color=7A1F2B&bgcolor=FFFFFF`
              }
              alt="Gate Entry QR Code Pass"
              className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded-lg"
            />
          </div>

          <div className="text-center space-y-1">
            <p className="text-[11px] font-semibold text-utsav-gold">
              {rsvpSubmitted ? `Personalized Entry Pass for ${rsvpName}` : 'Official Auspicious Invitation Pass'}
            </p>
            <p className="text-[10px] text-utsav-ivory/80 max-w-xs">
              Present this signed QR pass at the venue entrance gate for verified staff check-in.
            </p>
          </div>

          {/* Download and Share Pass Actions */}
          <div className="flex items-center gap-2 pt-1 w-full justify-center">
            <a
              href={
                guestQrUrl ||
                qrDataUrl ||
                `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                  typeof window !== 'undefined'
                    ? window.location.origin + '/invite/' + (invitation.shareUrlToken || 'utsav-pass')
                    : 'https://utsavmitra.in/pass'
                )}&color=7A1F2B&bgcolor=FFFFFF`
              }
              download={`UtsavMitra_Pass_${invitation.title.replace(/\s+/g, '_')}.png`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl gold-gradient-btn text-xs font-bold shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Pass</span>
            </a>

            <button
              type="button"
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Invitation link copied to clipboard!');
                }
              }}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-utsav-ivory border border-utsav-gold/40 text-xs font-bold transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-utsav-gold" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Interactive RSVP Form if Public Invitation */}
        {isPublic && (
          <div className="pt-6 border-t border-utsav-gold/30">
            {rsvpSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-400 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-heading text-sm font-bold text-emerald-300">
                  Dhanyawad! Your RSVP is Confirmed.
                </h4>
                <p className="text-xs text-emerald-200">
                  We eagerly await your blessings and presence. Your gate QR pass is generated above.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="space-y-3 text-left max-w-md mx-auto">
                <h4 className="font-heading text-sm font-bold text-utsav-gold text-center uppercase tracking-wider">
                  Will You Grace Us With Your Presence?
                </h4>

                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    placeholder="Your Full Name *"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-utsav-gold/40 text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:border-utsav-gold"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="email"
                      value={rsvpEmail}
                      onChange={(e) => setRsvpEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-utsav-gold/40 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-utsav-gold"
                    />
                    <input
                      type="tel"
                      value={rsvpPhone}
                      onChange={(e) => setRsvpPhone(e.target.value)}
                      placeholder="Phone Number"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-utsav-gold/40 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-utsav-gold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-utsav-gold uppercase font-bold mb-1">
                        Meal Preference
                      </label>
                      <select
                        value={mealPref}
                        onChange={(e) => setMealPref(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-utsav-gold/40 text-xs text-white focus:outline-none"
                      >
                        <option value="Veg">Pure Vegetarian</option>
                        <option value="Jain">Jain Satvik (No Onion/Garlic)</option>
                        <option value="Non-Veg">Non-Vegetarian</option>
                        <option value="Vegan">Vegan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-utsav-gold uppercase font-bold mb-1">
                        Additional Guests (+Pax)
                      </label>
                      <select
                        value={plusGuests}
                        onChange={(e) => setPlusGuests(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-utsav-gold/40 text-xs text-white focus:outline-none"
                      >
                        <option value={0}>Just Myself (1)</option>
                        <option value={1}>+1 (Family / Partner)</option>
                        <option value={2}>+2 (Family of 3)</option>
                        <option value={3}>+3 (Family of 4)</option>
                        <option value={4}>+4 (Family of 5)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl gold-gradient-btn text-xs sm:text-sm font-bold shadow-xl flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Confirming...' : 'Accept Invitation & Confirm RSVP'}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
