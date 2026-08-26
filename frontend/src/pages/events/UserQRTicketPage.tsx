import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { DiyaIcon, MandalaCorner } from '../../components/layout/IndianMotifs';
import {
  Download,
  Share2,
  Copy,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  User as UserIcon,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Utensils,
  Armchair,
  AlertCircle,
} from 'lucide-react';

export const UserQRTicketPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const ticketRef = useRef<HTMLDivElement>(null);

  const [ticketData, setTicketData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!eventId) return;
      setIsLoading(true);
      setErrorMessage('');

      try {
        const res = await api.get(`/events/${eventId}/my-qr`);
        if (res.success) {
          setTicketData(res);
        } else {
          setErrorMessage(res.message || 'Could not load your event QR ticket.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to load your personal QR ticket.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();
  }, [eventId]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = `${ticketData?.event?.name || 'Event'} - Digital Invitation Pass`;
    const shareText = `Here is the digital entry pass for ${user?.name || 'Guest'} to attend ${ticketData?.event?.name || 'UtsavMitra Celebration'}.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadTicket = () => {
    if (!ticketData) return;
    setIsDownloading(true);

    try {
      // Create a dedicated offline high-resolution canvas ticket
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 1100;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 1100);
      grad.addColorStop(0, '#7A1F2B');
      grad.addColorStop(0.5, '#4A0E17');
      grad.addColorStop(1, '#2B080D');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 1100);

      // Gold Outer Border
      ctx.strokeStyle = '#C9A227';
      ctx.lineWidth = 6;
      ctx.strokeRect(20, 20, 760, 1060);

      ctx.strokeStyle = 'rgba(201, 162, 39, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, 740, 1040);

      // Header Branding
      ctx.fillStyle = '#C9A227';
      ctx.font = 'bold 22px serif';
      ctx.textAlign = 'center';
      ctx.fillText('UTSAVMITRA – ROYAL CELEBRATION PASS', 400, 75);

      // Event Name
      ctx.fillStyle = '#FFF8EC';
      ctx.font = 'bold 30px serif';
      const eventTitle = (ticketData.event?.name || 'Grand Celebration').toUpperCase();
      ctx.fillText(eventTitle, 400, 130);

      // Cultural Tradition Badge
      ctx.fillStyle = '#F4A340';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(
        `★ ${ticketData.event?.culturalTradition || 'Cultural'} Tradition • ${ticketData.event?.type || 'Event'} ★`,
        400,
        170
      );

      // White QR Box
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(240, 210, 320, 320, 20);
      ctx.fill();
      ctx.strokeStyle = '#C9A227';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw QR Image inside
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.src = ticketData.qrDataUrl;
      qrImg.onload = () => {
        ctx.drawImage(qrImg, 260, 230, 280, 280);

        // Guest Card Container
        ctx.fillStyle = 'rgba(255, 248, 236, 0.12)';
        ctx.beginPath();
        ctx.roundRect(80, 560, 640, 380, 20);
        ctx.fill();
        ctx.strokeStyle = 'rgba(201, 162, 39, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.textAlign = 'left';

        // Guest Name
        ctx.fillStyle = '#C9A227';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('INVITED GUEST', 120, 610);
        ctx.fillStyle = '#FFF8EC';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(ticketData.guest?.name || user?.name || 'Guest of Honor', 120, 645);

        // Date & Time
        ctx.fillStyle = '#C9A227';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('DATE & TIME', 120, 710);
        ctx.fillStyle = '#FFF8EC';
        ctx.font = '18px sans-serif';
        ctx.fillText(`${ticketData.event?.date || 'Upcoming'} • ${ticketData.event?.startTime || '10:00 AM'}`, 120, 740);

        // Venue
        ctx.fillStyle = '#C9A227';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('AUSPICIOUS VENUE', 120, 805);
        ctx.fillStyle = '#FFF8EC';
        ctx.font = '18px sans-serif';
        ctx.fillText(
          `${ticketData.event?.location?.address || 'Palace Grounds'}, ${ticketData.event?.location?.city || 'Jaipur'}`,
          120,
          835
        );

        // Table & Meal
        ctx.fillStyle = '#C9A227';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('SEATING & FEAST', 120, 900);
        ctx.fillStyle = '#FFF8EC';
        ctx.font = '18px sans-serif';
        ctx.fillText(
          `Table: ${ticketData.guest?.assignedTable || 'Royal Open Seating'} • ${ticketData.guest?.mealPreference || 'Veg'}`,
          120,
          930
        );

        // Security Footer
        ctx.fillStyle = 'rgba(255, 248, 236, 0.6)';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Cryptographically Signed Digital Pass • Please present this QR code at the entrance gate.', 400, 1020);
        ctx.fillText('UtsavMitra – AI-Powered Indian Event Management Platform', 400, 1045);

        // Download trigger
        const link = document.createElement('a');
        link.download = `UtsavMitra_Pass_${(ticketData.event?.name || 'Event').replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        setIsDownloading(false);
      };
    } catch (e) {
      setIsDownloading(false);
      alert('Could not download pass image. You can take a screenshot or share link.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-utsav-gold border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-heading text-base font-bold text-utsav-maroon-900 dark:text-utsav-gold">
          Preparing your Cryptographically Signed Digital Pass...
        </p>
      </div>
    );
  }

  if (errorMessage || !ticketData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="p-8 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-2xl text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-utsav-saffron mx-auto" />
          <h2 className="font-heading text-xl font-bold text-utsav-maroon-900 dark:text-utsav-gold">
            Unable to Load QR Ticket
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            {errorMessage || 'Your personal QR pass could not be retrieved. Please ensure you are logged in.'}
          </p>
          <div className="pt-2 flex justify-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2 rounded-xl gold-gradient-btn text-xs font-bold text-utsav-brown-950"
            >
              Go Back
            </button>
            <Link
              to="/dashboard"
              className="px-5 py-2 rounded-xl maroon-gradient-btn text-xs font-bold text-utsav-gold"
            >
              My Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { event, guest } = ticketData;
  const isCheckedIn = guest?.checkInStatus || ticketData.status === 'USED';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-xs font-bold text-utsav-maroon-900 dark:text-utsav-gold hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Event</span>
        </button>

        <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-500/40">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Signed Gate Pass</span>
        </span>
      </div>

      {/* Royal Auspicious Event Ticket Card */}
      <div
        ref={ticketRef}
        className="rounded-3xl bg-gradient-to-b from-utsav-maroon-900 via-utsav-maroon-800 to-utsav-maroon-950 text-utsav-ivory border-4 border-utsav-gold shadow-2xl overflow-hidden relative"
      >
        {/* Top & Bottom Mandala Accents */}
        <div className="absolute top-0 right-0 pointer-events-none opacity-20">
          <MandalaCorner className="w-32 h-32" />
        </div>
        <div className="absolute bottom-0 left-0 pointer-events-none opacity-20 rotate-180">
          <MandalaCorner className="w-32 h-32" />
        </div>

        {/* Ticket Header */}
        <div className="p-6 sm:p-8 text-center space-y-2 border-b-2 border-dashed border-utsav-gold/40 relative z-10">
          <div className="flex items-center justify-center space-x-2">
            <DiyaIcon className="w-6 h-6" />
            <span className="text-[11px] uppercase tracking-widest font-bold text-utsav-gold">
              UTSAVMITRA • OFFICIAL INVITATION PASS
            </span>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-utsav-ivory tracking-wide">
            {event?.name}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-utsav-gold text-utsav-maroon-950 shadow">
              {event?.culturalTradition || 'Cultural'} Tradition
            </span>
            <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-black/40 text-utsav-gold border border-utsav-gold/40">
              {event?.type || 'Celebration'}
            </span>
          </div>
        </div>

        {/* High-Contrast Scannable QR Core */}
        <div className="p-6 sm:p-8 flex flex-col items-center justify-center space-y-4 relative z-10">
          <div className="p-4 rounded-3xl bg-white shadow-2xl border-4 border-utsav-gold relative group">
            <img
              src={ticketData.qrDataUrl}
              alt="Event Entry Gate QR Code"
              className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-2xl"
            />

            {isCheckedIn && (
              <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-center p-4 animate-in fade-in">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2" />
                <span className="font-heading text-base font-bold text-emerald-200">
                  CHECKED IN AT GATE
                </span>
                <span className="text-[11px] text-emerald-300">
                  {guest?.checkInTime || 'Verified Today'}
                </span>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="text-center">
            {isCheckedIn ? (
              <span className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500 text-white shadow-lg">
                <CheckCircle2 className="w-4 h-4" />
                <span>ENTRY GRANTED • ENJOY THE UTSAV</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold bg-utsav-gold text-utsav-maroon-950 shadow-lg animate-pulse">
                <Sparkles className="w-4 h-4" />
                <span>ACTIVE PASS • SHOW AT ENTRANCE GATE</span>
              </span>
            )}
          </div>
        </div>

        {/* Detailed Guest & Venue Info Grid */}
        <div className="p-6 sm:p-8 bg-black/20 border-t-2 border-dashed border-utsav-gold/40 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs relative z-10">
          {/* Guest Identity */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-utsav-gold tracking-wider flex items-center space-x-1">
              <UserIcon className="w-3.5 h-3.5 text-utsav-gold" />
              <span>Guest of Honor</span>
            </span>
            <p className="font-heading text-base font-bold text-utsav-ivory">
              {guest?.name || user?.name || 'Invited Guest'}
            </p>
            <p className="text-[11px] text-utsav-ivory/70">
              {guest?.relationship ? `${guest.relationship} • ` : ''}
              RSVP: {guest?.rsvpStatus || 'CONFIRMED'}
            </p>
          </div>

          {/* Date & Time */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-utsav-gold tracking-wider flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-utsav-gold" />
              <span>Auspicious Schedule</span>
            </span>
            <p className="font-semibold text-utsav-ivory">
              {event?.date || 'Upcoming Celebration'}
            </p>
            <p className="text-[11px] text-utsav-ivory/70 flex items-center space-x-1">
              <Clock className="w-3 h-3 text-utsav-gold" />
              <span>{event?.startTime || '10:00 AM'} onwards</span>
            </p>
          </div>

          {/* Venue & Location */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-utsav-gold tracking-wider flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-utsav-gold" />
              <span>Venue Destination</span>
            </span>
            <p className="font-semibold text-utsav-ivory">
              {event?.location?.address || 'Palace Grounds'}
            </p>
            <p className="text-[11px] text-utsav-ivory/70">
              {event?.location?.city || 'Jaipur'}, {event?.location?.state || 'Rajasthan'}
            </p>
          </div>

          {/* Seating & Dining */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-utsav-gold tracking-wider flex items-center space-x-1">
              <Armchair className="w-3.5 h-3.5 text-utsav-gold" />
              <span>Seating & Feast</span>
            </span>
            <p className="font-semibold text-utsav-ivory">
              {guest?.assignedTable || 'Royal Seating Area'}
            </p>
            <p className="text-[11px] text-utsav-ivory/70 flex items-center space-x-1">
              <Utensils className="w-3 h-3 text-utsav-gold" />
              <span>{guest?.mealPreference || 'Pure Vegetarian'} Feast</span>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-4 bg-black/40 text-center border-t border-utsav-gold/30">
          <p className="text-[11px] text-utsav-ivory/80">
            🔒 Gate scanners verify encrypted digital signatures to ensure safe and duplicate-free event entry.
          </p>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handleDownloadTicket}
          disabled={isDownloading}
          className="flex items-center space-x-2 px-6 py-3 rounded-2xl gold-gradient-btn text-xs font-bold text-utsav-brown-950 shadow-xl hover:scale-105 transition-all cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'Generating High-Res Pass...' : 'Download QR Pass Image'}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center space-x-2 px-6 py-3 rounded-2xl maroon-gradient-btn text-xs font-bold text-utsav-gold shadow-xl hover:scale-105 transition-all border border-utsav-gold/40 cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Invitation Pass</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="flex items-center space-x-2 px-4 py-3 rounded-2xl bg-white dark:bg-utsav-maroon-900 text-xs font-bold text-utsav-maroon-900 dark:text-utsav-ivory border border-utsav-gold/40 shadow hover:border-utsav-gold transition-colors cursor-pointer"
        >
          <Copy className="w-4 h-4 text-utsav-gold" />
          <span>{copied ? 'Pass Link Copied!' : 'Copy Link'}</span>
        </button>
      </div>
    </div>
  );
};
