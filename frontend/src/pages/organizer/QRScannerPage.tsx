import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { IEvent } from '@shared/types';
import { QREntryScanner } from '../../components/qr/QREntryScanner';
import { DiyaIcon, MandalaCorner } from '../../components/layout/IndianMotifs';
import { QrCode, ArrowLeft, Calendar, ShieldCheck, ChevronRight, UserCheck } from 'lucide-react';

export const QRScannerPage: React.FC = () => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  useEffect(() => {
    api
      .get<{ success: boolean; events: IEvent[] }>('/events')
      .then((res) => {
        if (res.success && res.events && res.events.length > 0) {
          setEvents(res.events);
          setSelectedEventId(res.events[0]._id);
        }
      })
      .catch((err) => console.error('Failed to load events for QR Scanner:', err))
      .finally(() => setLoading(false));
  }, []);

  const currentEvent = events.find((e) => e._id === selectedEventId);

  const handleScanSuccess = (guest: any) => {
    setRecentScans((prev) => [
      {
        ...guest,
        checkedInAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
      ...prev.slice(0, 9),
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-utsav-maroon-900 to-utsav-maroon-950 text-utsav-ivory border-2 border-utsav-gold/60 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 pointer-events-none opacity-20">
          <MandalaCorner className="w-40 h-40" />
        </div>

        <div className="flex items-center space-x-4 relative z-10">
          <Link
            to="/organizer/dashboard"
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-utsav-gold border border-utsav-gold/40 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Cryptographic HMAC Gate Verification</span>
              </span>
            </div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-utsav-gold flex items-center space-x-2 mt-1">
              <QrCode className="w-6 h-6 text-purple-400" />
              <span>Live Gate Access & Cryptographic QR Scanner</span>
            </h1>
            <p className="text-xs text-utsav-ivory/80">
              Scan guest QR pass codes using your webcam/camera or enter pass tokens manually.
            </p>
          </div>
        </div>

        {/* Event Selector Dropdown */}
        <div className="relative z-10 flex items-center space-x-2 bg-utsav-maroon-950/80 p-2 rounded-2xl border border-utsav-gold/40">
          <Calendar className="w-4 h-4 text-utsav-gold shrink-0 ml-1" />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-semibold uppercase">Scan for Celebration:</span>
            {loading ? (
              <span className="text-xs text-gray-400">Loading events...</span>
            ) : events.length === 0 ? (
              <span className="text-xs text-utsav-gold font-bold">Standard Demo Gate</span>
            ) : (
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="bg-transparent text-xs font-bold text-utsav-gold focus:outline-none cursor-pointer pr-4"
              >
                {events.map((ev) => (
                  <option key={ev._id} value={ev._id} className="bg-utsav-maroon-950 text-utsav-ivory">
                    {ev.name} ({ev.location?.city || 'Jaipur'})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Selected Event Context Bar */}
      {currentEvent && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-utsav-ivory dark:bg-utsav-maroon-900/60 border border-utsav-gold/30 text-xs">
          <div className="flex items-center space-x-3 text-utsav-brown dark:text-utsav-ivory">
            <span className="font-bold text-utsav-maroon-800 dark:text-utsav-gold">{currentEvent.name}</span>
            <span>•</span>
            <span className="text-gray-500">Date: {new Date(currentEvent.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>•</span>
            <span className="text-gray-500">Expected: {currentEvent.guestCount} Guests</span>
          </div>
          <Link
            to={`/events/${currentEvent._id}`}
            className="text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold hover:underline flex items-center space-x-1"
          >
            <span>Open Command Center</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* QR Scanner Component */}
      <QREntryScanner
        eventId={selectedEventId || 'demo_event'}
        onCheckInComplete={handleScanSuccess}
      />
    </div>
  );
};
